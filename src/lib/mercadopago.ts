import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const PRODUCTION_URL = 'https://www.taller-zero.cl';

// Tipos de pago cuyo comprobante vale como boleta (Res. Ex. SII N°176/2020). El resto exige boleta manual.
export const CARD_PAYMENT_TYPES = ['credit_card', 'debit_card', 'prepaid_card'];

export function getMercadoPagoAccessToken(): string {
    return process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN_TEST || '';
}

export function getSiteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL).replace(/\/$/, '');
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
}

// Única forma de crear un cobro: solo tarjeta, URLs del propio sitio y aviso al webhook.
export async function createCardOnlyPreference(input: PreferenceInput): Promise<string> {
    const siteUrl = getSiteUrl();
    // Mercado Pago bloquea explícitamente "localhost" en las back_urls y lanza el error "back_url.success must be defined".
    // Para desarrollo local, usaremos el dominio de producción como un parche.
    const isLocal = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
    const publicUrl = isLocal ? PRODUCTION_URL : siteUrl;
    const resultUrl = `${publicUrl}${input.resultPath}`;

    const response = await new Preference(getClient()).create({
        body: {
            items: input.items.map(item => ({ ...item, currency_id: 'CLP' })),
            payer: input.payer,
            back_urls: {
                success: resultUrl,
                failure: resultUrl,
                pending: resultUrl,
            },
            auto_return: 'approved',
            // Solo tarjetas: el comprobante de pago con tarjeta vale como boleta ante el SII
            // (Res. Ex. SII N°176/2020). Efectivo, transferencias y cajeros exigirían boleta manual.
            payment_methods: {
                excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }, { id: 'bank_transfer' }],
            },
            external_reference: input.externalReference,
            statement_descriptor: 'TALLER ZERO',
            ...(input.expiresAt ? { expires: true, expiration_date_to: input.expiresAt.toISOString() } : {}),
            ...(isLocal ? {} : { notification_url: `${siteUrl}/api/webhooks/mercadopago` }),
        },
    });

    if (!response.id) throw new Error('Mercado Pago no devolvió una preferencia');
    return response.id;
}
