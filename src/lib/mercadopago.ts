import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const PRODUCTION_URL = 'https://www.taller-zero.cl';

// Tipos de pago cuyo comprobante vale como boleta (Res. Ex. SII N°176/2020). El resto exige boleta manual.
export const CARD_PAYMENT_TYPES = ['credit_card', 'debit_card', 'prepaid_card'];

// En producción solo vale la credencial explícita MERCADOPAGO_ACCESS_TOKEN: así un valor "_TEST" olvidado en
// Vercel no puede cobrar sin que nadie lo note. El respaldo MERCADOPAGO_ACCESS_TOKEN_TEST es solo para desarrollo.
export function getMercadoPagoAccessToken(): string {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (token) return token;
    return process.env.NODE_ENV === 'production' ? '' : process.env.MERCADOPAGO_ACCESS_TOKEN_TEST || '';
}

// En producción manda NEXT_PUBLIC_SITE_URL (o el dominio oficial). En desarrollo (next dev) el sitio es
// el que corre en tu computador: se toma de la petición, para que Mercado Pago te devuelva a localhost
// y no a la página real. El origen de la petición solo se usa fuera de producción.
export function getSiteUrl(requestUrl?: string): string {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (configured) return configured.replace(/\/$/, '');
    if (process.env.NODE_ENV === 'production') return PRODUCTION_URL;
    return requestUrl ? new URL(requestUrl).origin : 'http://localhost:3000';
}

export function isLocalUrl(url: string): boolean {
    return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(url);
}

// Mercado Pago solo debe llevar al comprador a sus propios dominios
function isMercadoPagoUrl(value: string | undefined): value is string {
    if (!value) return false;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && /(^|\.)(mercadopago|mercadolibre)\.(cl|com|com\.ar|com\.mx|com\.co|com\.pe|com\.br|com\.uy)$/.test(url.hostname);
    } catch {
        return false;
    }
}

function getClient(): MercadoPagoConfig {
    const accessToken = getMercadoPagoAccessToken();
    if (!accessToken) throw new Error('Credenciales de Mercado Pago no configuradas');
    return new MercadoPagoConfig({ accessToken });
}

export function fetchPayment(paymentId: string) {
    return new Payment(getClient()).get({ id: paymentId });
}

export type MercadoPagoPayment = Awaited<ReturnType<typeof fetchPayment>>;

// Pagos asociados a una referencia propia (ej: "tk_<id de orden>"). Sirve para cuadrar una orden
// aunque el aviso (webhook) no haya llegado, por ejemplo en desarrollo o si Mercado Pago se demora.
export async function searchPaymentsByReference(externalReference: string): Promise<MercadoPagoPayment[]> {
    const result = await new Payment(getClient()).search({
        options: { external_reference: externalReference, sort: 'date_created', criteria: 'desc' },
    });
    return (result.results ?? []) as MercadoPagoPayment[];
}

export function isCardPayment(payment: MercadoPagoPayment): boolean {
    return !!payment.payment_type_id && CARD_PAYMENT_TYPES.includes(payment.payment_type_id);
}

interface PreferenceInput {
    items: { id: string; title: string; quantity: number; unit_price: number }[];
    payer: { name: string; email: string };
    externalReference: string;
    // Ruta del sitio a la que vuelve el comprador, ej: /checkout/result
    resultPath: string;
    // Si se indica, Mercado Pago deja de aceptar pagos para esta preferencia después de esa fecha
    expiresAt?: Date;
    // URL de la petición actual: en desarrollo define a qué sitio vuelve el comprador
    requestUrl?: string;
}

// Única forma de crear un cobro: solo tarjeta, URLs del propio sitio y aviso al webhook.
export async function createCardOnlyPreference(input: PreferenceInput): Promise<{ id: string; initPoint: string }> {
    const siteUrl = getSiteUrl(input.requestUrl);
    const isLocal = isLocalUrl(siteUrl);
    const resultUrl = `${siteUrl}${input.resultPath}`;

    const response = await new Preference(getClient()).create({
        body: {
            items: input.items.map(item => ({ ...item, currency_id: 'CLP' })),
            payer: input.payer,
            back_urls: {
                success: resultUrl,
                failure: resultUrl,
                pending: resultUrl,
            },
            // Mercado Pago rechaza el retorno automático con una URL local (400 "back_url.success must be defined").
            // En desarrollo el comprador vuelve con el botón "Volver al sitio" de la página de Mercado Pago.
            ...(isLocal ? {} : { auto_return: 'approved' }),
            // Solo tarjetas: el comprobante de pago con tarjeta vale como boleta ante el SII
            // (Res. Ex. SII N°176/2020). Efectivo, transferencias y cajeros exigirían boleta manual.
            payment_methods: {
                excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }, { id: 'bank_transfer' }],
            },
            external_reference: input.externalReference,
            statement_descriptor: 'TALLER ZERO',
            ...(input.expiresAt ? { expires: true, expiration_date_to: input.expiresAt.toISOString() } : {}),
            // Mercado Pago no puede avisar a localhost: en desarrollo la orden se cuadra al volver al sitio
            ...(isLocal ? {} : { notification_url: `${siteUrl}/api/webhooks/mercadopago` }),
        },
    });

    if (!response.id || !isMercadoPagoUrl(response.init_point)) {
        throw new Error('Mercado Pago no devolvió una preferencia válida');
    }
    return { id: response.id, initPoint: response.init_point };
}
