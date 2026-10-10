// Única fuente de costos de envío: la usan el checkout (para mostrar) y el servidor (para cobrar).
export const SHIPPING_OPTIONS = {
    region: { cost: 0, label: 'Por pagar en destino (Starken)' },
    rm: { cost: 5000, label: 'BlueExpress (tarifa fija $5.000)' },
    retiro: { cost: 0, label: 'Retiro en Taller (gratis)' },
} as const;

export type ShippingType = keyof typeof SHIPPING_OPTIONS;

export const SHIPPING_TYPES = Object.keys(SHIPPING_OPTIONS) as [ShippingType, ...ShippingType[]];
