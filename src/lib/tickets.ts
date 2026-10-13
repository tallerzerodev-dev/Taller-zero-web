import crypto from 'crypto';
import type { Prisma, TicketType } from '@prisma/client';
import { prisma } from './prisma';
import { isCardPayment, type MercadoPagoPayment } from './mercadopago';

// Prefijo de la referencia externa en Mercado Pago: distingue una orden de entradas de una de la tienda
export const TICKET_ORDER_REF_PREFIX = 'tk_';
export const TICKET_CODE_PATTERN = /^tz-tk-[a-f0-9]{32}$/;
export const MAX_PENDING_ORDERS_PER_EMAIL = 2;

// Margen antes de liberar una reserva vencida, para no pisar un pago que se está aprobando justo al límite
const RELEASE_GRACE_MS = 2 * 60 * 1000;

export function getReservationMinutes(): number {
    const configured = Number(process.env.TICKET_RESERVATION_MINUTES);
    return configured > 0 ? configured : 10;
}

function randomToken(): string {
    return crypto.randomBytes(16).toString('hex'); // 128 bits
}

export class TicketPurchaseError extends Error {
    constructor(message: string, public status: number = 400) {
        super(message);
    }
}

// ---------------------------------------------------------------------------
// Estado de los tramos
// ---------------------------------------------------------------------------

export type TierState =
    | 'AVAILABLE'
    | 'HELD'      // Queda cupo, pero todo está apartado por compras en curso
    | 'SOLD_OUT'
    | 'UPCOMING'
    | 'CLOSED'
    | 'INFO';     // Solo informativo (ej: Puerta)

type TierFields = Pick<TicketType, 'capacity' | 'sold' | 'reserved' | 'salesStart' | 'salesEnd' | 'isActive' | 'isInfoOnly'>;

// Si el tramo no define cierre, la venta online termina cuando empieza el evento
export function getTierState(tier: TierFields, eventStartsAt: Date, now: Date = new Date()): TierState {
    if (tier.isInfoOnly) return 'INFO';
    if (!tier.isActive) return 'CLOSED';
    if (tier.salesStart && tier.salesStart > now) return 'UPCOMING';
    if ((tier.salesEnd ?? eventStartsAt) <= now) return 'CLOSED';
    if (tier.sold >= tier.capacity) return 'SOLD_OUT';
    if (tier.capacity - tier.sold - tier.reserved <= 0) return 'HELD';
    return 'AVAILABLE';
}

// Lo único que se envía al navegador sobre un tramo: nunca los contadores de vendidas ni el cupo.
export interface TierView {
    id: string;
    name: string;
    price: number;
    state: TierState;
    percentSold: number;
    maxSelectable: number;
}

export function toTierView(
    tier: TierFields & Pick<TicketType, 'id' | 'name' | 'price'>,
    event: { startsAt: Date; maxPerOrder: number },
    now: Date = new Date()
): TierView {
    const state = getTierState(tier, event.startsAt, now);
    const available = Math.max(0, tier.capacity - tier.sold - tier.reserved);
    return {
        id: tier.id,
        name: tier.name,
        price: tier.price,
        state,
        percentSold: tier.isInfoOnly || tier.capacity <= 0 ? 0 : Math.min(100, Math.round((tier.sold / tier.capacity) * 100)),
        maxSelectable: state === 'AVAILABLE' ? Math.min(event.maxPerOrder, available) : 0,
    };
}

// ---------------------------------------------------------------------------
// Cupo: todas las modificaciones de los contadores pasan por estas funciones
// ---------------------------------------------------------------------------

type Tx = Prisma.TransactionClient;

// Aparta cupo solo si alcanza. Es un único UPDATE, así dos compras simultáneas no pueden sobrevender.
async function reserveCapacity(tx: Tx, ticketTypeId: string, eventId: string, quantity: number): Promise<boolean> {
    const updated = await tx.$executeRaw`
        UPDATE "TicketType"
        SET "reserved" = "reserved" + ${quantity}
        WHERE "id" = ${ticketTypeId}
          AND "eventId" = ${eventId}
          AND "isActive" = true
          AND "isInfoOnly" = false
          AND "sold" + "reserved" + ${quantity} <= "capacity"`;
    return updated === 1;
}

async function releaseReserved(tx: Tx, items: { ticketTypeId: string; quantity: number }[]) {
    for (const item of items) {
        await tx.$executeRaw`
            UPDATE "TicketType"
            SET "reserved" = GREATEST("reserved" - ${item.quantity}, 0)
            WHERE "id" = ${item.ticketTypeId}`;
    }
}

async function moveReservedToSold(tx: Tx, items: { ticketTypeId: string; quantity: number }[]) {
    for (const item of items) {
        await tx.$executeRaw`
            UPDATE "TicketType"
            SET "reserved" = GREATEST("reserved" - ${item.quantity}, 0),
                "sold" = "sold" + ${item.quantity}
            WHERE "id" = ${item.ticketTypeId}`;
    }
}

// Para un pago que llega con la reserva ya liberada: toma cupo directo a vendidas, solo si queda.
async function takeSoldCapacity(tx: Tx, ticketTypeId: string, quantity: number): Promise<boolean> {
    const updated = await tx.$executeRaw`
        UPDATE "TicketType"
        SET "sold" = "sold" + ${quantity}
        WHERE "id" = ${ticketTypeId}
          AND "sold" + "reserved" + ${quantity} <= "capacity"`;
    return updated === 1;
}

async function returnSold(tx: Tx, items: { ticketTypeId: string; quantity: number }[]) {
    for (const item of items) {
        await tx.$executeRaw`
            UPDATE "TicketType"
            SET "sold" = GREATEST("sold" - ${item.quantity}, 0)
            WHERE "id" = ${item.ticketTypeId}`;
    }
}

// Devuelve al cupo lo apartado por órdenes que no se pagaron a tiempo.
// No hay cron: se llama antes de mostrar disponibilidad y antes de reservar.
export async function releaseExpiredReservations(eventId?: string): Promise<void> {
    const expired = await prisma.ticketOrder.findMany({
        where: {
            status: 'PENDING',
            expiresAt: { lt: new Date(Date.now() - RELEASE_GRACE_MS) },
            ...(eventId ? { eventId } : {}),
        },
        select: { id: true, items: { select: { ticketTypeId: true, quantity: true } } },
        take: 100,
    });

    for (const order of expired) {
        await prisma.$transaction(async (tx) => {
            // Si justo se pagó, la orden ya no está PENDING y no se libera nada
            const updated = await tx.ticketOrder.updateMany({
                where: { id: order.id, status: 'PENDING' },
                data: { status: 'EXPIRED' },
            });
            if (updated.count === 1) await releaseReserved(tx, order.items);
        });
    }
}

// ---------------------------------------------------------------------------
// Compra
// ---------------------------------------------------------------------------

interface CreateTicketOrderInput {
    eventSlug: string;
    items: { ticketTypeId: string; quantity: number }[];
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    userEmail?: string | null;
}

// Valida contra la base, aparta el cupo y crea la orden PENDING. Los precios salen de la base.
export async function createTicketOrder(input: CreateTicketOrderInput) {
    const event = await prisma.event.findUnique({
        where: { slug: input.eventSlug },
        include: { ticketTypes: true },
    });
    if (!event || event.status !== 'PUBLISHED') {
        throw new TicketPurchaseError('Este evento no está disponible.', 404);
    }

    await releaseExpiredReservations(event.id);

    const quantityByType = new Map<string, number>();
    for (const item of input.items) {
        quantityByType.set(item.ticketTypeId, (quantityByType.get(item.ticketTypeId) || 0) + item.quantity);
    }
    const items = Array.from(quantityByType, ([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
    if (totalQuantity < 1 || totalQuantity > event.maxPerOrder) {
        throw new TicketPurchaseError(`Puedes comprar hasta ${event.maxPerOrder} entradas por compra.`);
    }

    const now = new Date();
    const typesById = new Map(event.ticketTypes.map(t => [t.id, t]));
    for (const item of items) {
        const type = typesById.get(item.ticketTypeId);
        if (!type || getTierState(type, event.startsAt, now) !== 'AVAILABLE') {
            throw new TicketPurchaseError('Alguna de las entradas elegidas ya no está a la venta. Vuelve a la página del evento.', 409);
        }
    }

    const buyerEmail = input.buyerEmail.toLowerCase();
    const pendingOrders = await prisma.ticketOrder.count({
        where: { eventId: event.id, buyerEmail, status: 'PENDING', expiresAt: { gt: now } },
    });
    if (pendingOrders >= MAX_PENDING_ORDERS_PER_EMAIL) {
        throw new TicketPurchaseError('Ya tienes compras en curso para este evento. Termina el pago o espera unos minutos.', 429);
    }

    const totalAmount = items.reduce((acc, i) => acc + typesById.get(i.ticketTypeId)!.price * i.quantity, 0);
    if (totalAmount <= 0) {
        throw new TicketPurchaseError('El total de la compra no es válido.');
    }

    const expiresAt = new Date(now.getTime() + getReservationMinutes() * 60 * 1000);

    const order = await prisma.$transaction(async (tx) => {
        for (const item of items) {
            const reserved = await reserveCapacity(tx, item.ticketTypeId, event.id, item.quantity);
            if (!reserved) {
                // Al lanzar, la transacción deshace lo apartado para los tramos anteriores
                throw new TicketPurchaseError(`Ya no quedan suficientes entradas de ${typesById.get(item.ticketTypeId)!.name}.`, 409);
            }
        }
        return tx.ticketOrder.create({
            data: {
                eventId: event.id,
                buyerName: input.buyerName,
                buyerEmail,
                buyerPhone: input.buyerPhone,
                userEmail: input.userEmail?.toLowerCase() || null,
                status: 'PENDING',
                totalAmount,
                expiresAt,
                accessToken: randomToken(),
                items: {
                    create: items.map(i => ({
                        ticketTypeId: i.ticketTypeId,
                        quantity: i.quantity,
                        priceAtTime: typesById.get(i.ticketTypeId)!.price,
                    })),
                },
            },
            include: { items: true },
        });
    });

    return {
        order,
        event,
        lines: order.items.map(i => ({ item: i, type: typesById.get(i.ticketTypeId)! })),
    };
}

// Si no se pudo crear el cobro, la orden se anula y el cupo vuelve de inmediato.
export async function cancelPendingTicketOrder(orderId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const updated = await tx.ticketOrder.updateMany({
            where: { id: orderId, status: 'PENDING' },
            data: { status: 'CANCELLED' },
        });
        if (updated.count === 0) return;
        const items = await tx.ticketOrderItem.findMany({ where: { orderId }, select: { ticketTypeId: true, quantity: true } });
        await releaseReserved(tx, items);
    });
}

// ---------------------------------------------------------------------------
// Emisión de entradas
// ---------------------------------------------------------------------------

type OrderWithItems = Prisma.TicketOrderGetPayload<{ include: { items: true } }>;

async function issueTickets(tx: Tx, order: OrderWithItems) {
    const total = order.items.reduce((acc, i) => acc + i.quantity, 0);
    // El UPDATE bloquea la fila del evento: dos emisiones simultáneas no pueden repetir folio
    const event = await tx.event.update({
        where: { id: order.eventId },
        data: { ticketCounter: { increment: total } },
        select: { ticketCounter: true },
    });

    let folio = event.ticketCounter - total;
    const tickets = order.items.flatMap(item =>
        Array.from({ length: item.quantity }, () => ({
            code: `tz-tk-${randomToken()}`,
            orderId: order.id,
            eventId: order.eventId,
            ticketTypeId: item.ticketTypeId,
            holderName: order.buyerName,
            folio: ++folio,
        }))
    );
    await tx.ticket.createMany({ data: tickets });
}

class NoCapacityError extends Error {}

export type TicketSyncOutcome = 'paid' | 'already_processed' | 'cancelled' | 'pending' | 'amount_mismatch' | 'ignored';

// Equivalente a syncOrderFromPayment para órdenes de entradas. Idempotente:
// las entradas se crean en la misma transacción que pasa la orden a PAID, y solo una ejecución lo logra.
export async function syncTicketOrderFromPayment(payment: MercadoPagoPayment): Promise<{ outcome: TicketSyncOutcome; orderId?: string }> {
    const orderId = (payment.external_reference || '').slice(TICKET_ORDER_REF_PREFIX.length);
    const paymentId = String(payment.id);

    const order = await prisma.ticketOrder.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) {
        console.error(`Pago ${paymentId} referencia una orden de entradas inexistente`);
        return { outcome: 'ignored' };
    }

    const status = payment.status;

    if (status === 'approved') {
        if (payment.transaction_amount !== order.totalAmount || payment.currency_id !== 'CLP') {
            console.error(`Pago ${paymentId}: el monto no coincide con la orden de entradas ${orderId}`);
            await prisma.ticketOrder.update({
                where: { id: orderId },
                data: { reviewNote: `Pago ${paymentId} aprobado por un monto distinto al de la orden. No se emitieron entradas.` },
            });
            return { outcome: 'amount_mismatch', orderId };
        }

        const paidData = { status: 'PAID', paymentId, paidAt: new Date() };
        const cardNote = isCardPayment(payment)
            ? null
            : `Pagada con "${payment.payment_type_id ?? 'medio desconocido'}" (no es tarjeta): el comprobante de Mercado Pago NO vale como boleta. Emitir boleta manual.`;

        // 1) Caso normal: la orden sigue PENDING y su cupo está apartado
        const paidInTime = await prisma.$transaction(async (tx) => {
            const updated = await tx.ticketOrder.updateMany({
                where: { id: orderId, status: 'PENDING' },
                data: { ...paidData, reviewNote: cardNote },
            });
            if (updated.count === 0) return false;
            await moveReservedToSold(tx, order.items);
            await issueTickets(tx, order);
            return true;
        });

        if (paidInTime) {
            await deliverTickets(orderId);
            return { outcome: 'paid', orderId };
        }

        // 2) El pago llegó cuando la reserva ya se había liberado: se intenta tomar cupo de nuevo
        try {
            const paidLate = await prisma.$transaction(async (tx) => {
                const updated = await tx.ticketOrder.updateMany({
                    where: { id: orderId, status: 'EXPIRED' },
                    data: { ...paidData, reviewNote: cardNote },
                });
                if (updated.count === 0) return false;
                for (const item of order.items) {
                    if (!(await takeSoldCapacity(tx, item.ticketTypeId, item.quantity))) throw new NoCapacityError();
                }
                await issueTickets(tx, order);
                return true;
            });

            if (paidLate) {
                await deliverTickets(orderId);
                return { outcome: 'paid', orderId };
            }
        } catch (error) {
            if (!(error instanceof NoCapacityError)) throw error;
            // 3) Ya no hay cupo: queda pagada, sin entradas, y a la vista del admin para reembolsar
            await prisma.ticketOrder.updateMany({
                where: { id: orderId, status: 'EXPIRED' },
                data: {
                    ...paidData,
                    reviewNote: ['PAGADA SIN CUPO: el pago llegó con la reserva vencida y el tramo ya está agotado. No se emitieron entradas. Reembolsar en Mercado Pago.', cardNote].filter(Boolean).join(' | '),
                },
            });
            return { outcome: 'paid', orderId };
        }

        // 4) Pago aprobado para una orden anulada (por ejemplo, evento cancelado)
        await prisma.ticketOrder.updateMany({
            where: { id: orderId, status: 'CANCELLED', paymentId: null },
            data: { paymentId, paidAt: new Date(), reviewNote: 'Se recibió un pago para una orden anulada. No se emitieron entradas. Reembolsar en Mercado Pago.' },
        });
        return { outcome: 'already_processed', orderId };
    }

    if (status === 'refunded' || status === 'charged_back') {
        await prisma.$transaction(async (tx) => {
            const refunded = await tx.ticketOrder.updateMany({
                where: { id: orderId, status: 'PAID', paymentId },
                data: { status: 'REFUNDED' },
            });
            if (refunded.count === 0) return;
            // Las entradas ya usadas se conservan como registro; el resto deja de servir
            const cancelled = await tx.ticket.updateMany({
                where: { orderId, status: 'VALID' },
                data: { status: 'CANCELLED' },
            });
            if (cancelled.count > 0) await returnSold(tx, order.items);
        });
        return { outcome: 'cancelled', orderId };
    }

    // Un pago rechazado no anula la orden: el comprador puede reintentar con otra tarjeta
    // mientras dure la reserva. Si no paga, la orden vence sola.
    return { outcome: 'pending', orderId };
}

// ---------------------------------------------------------------------------
// Entrega por correo
// ---------------------------------------------------------------------------

// Envía (o reenvía) las entradas. Si falla, queda anotado en la orden para que el admin lo vea.
export async function deliverTickets(orderId: string): Promise<boolean> {
    const order = await prisma.ticketOrder.findUnique({
        where: { id: orderId },
        include: {
            event: true,
            tickets: { where: { status: { not: 'CANCELLED' } }, include: { ticketType: true }, orderBy: { folio: 'asc' } },
        },
    });
    if (!order || order.tickets.length === 0) return false;

    const { sendTicketsEmail } = await import('./email');
    const result = await sendTicketsEmail(order);

    if (result.success) {
        await prisma.ticketOrder.update({ where: { id: orderId }, data: { emailSentAt: new Date() } });
        return true;
    }
    const note = 'No se pudo enviar el correo con las entradas. Reenviar desde el panel.';
    if (!order.reviewNote?.includes(note)) {
        await prisma.ticketOrder.update({
            where: { id: orderId },
            data: { reviewNote: [order.reviewNote, note].filter(Boolean).join(' | ') },
        });
    }
    return false;
}

// ---------------------------------------------------------------------------
// Puerta
// ---------------------------------------------------------------------------

export type EntryResult = 'OK' | 'ALREADY_USED' | 'CANCELLED' | 'NOT_FOUND' | 'WRONG_EVENT';

export async function findTicketForEntry(code: string) {
    if (!TICKET_CODE_PATTERN.test(code)) return null;
    return prisma.ticket.findUnique({
        where: { code },
        include: {
            event: { select: { id: true, title: true, startsAt: true } },
            ticketType: { select: { name: true } },
            order: { select: { id: true, buyerEmail: true, status: true } },
        },
    });
}

// Marca el ingreso. Un solo UPDATE condicionado: si dos personas validan el mismo QR a la vez, solo una gana.
export async function admitTicket(code: string, staffEmail: string, expectedEventId?: string) {
    const ticket = await findTicketForEntry(code);
    if (!ticket) return { result: 'NOT_FOUND' as EntryResult, ticket: null };
    if (expectedEventId && ticket.eventId !== expectedEventId) return { result: 'WRONG_EVENT' as EntryResult, ticket };
    if (ticket.status === 'CANCELLED' || ticket.order.status !== 'PAID') return { result: 'CANCELLED' as EntryResult, ticket };

    const updated = await prisma.ticket.updateMany({
        where: { id: ticket.id, status: 'VALID' },
        data: { status: 'USED', usedAt: new Date(), usedBy: staffEmail },
    });
    if (updated.count === 1) return { result: 'OK' as EntryResult, ticket };

    // Ya estaba usada: se relee para mostrar cuándo y quién la validó
    const current = await findTicketForEntry(code);
    return { result: 'ALREADY_USED' as EntryResult, ticket: current };
}
