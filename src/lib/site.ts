// Dirección oficial del sitio: el único lugar donde está escrita. Todo lo que apunta al sitio real (avisos de
// pago de Mercado Pago, retornos, canonicals, sitemap, robots y enlaces de correos) sale de aquí.
//
// Es la versión CON www porque ahí el sitio responde directo: taller-zero.cl (sin www) redirige con un 307 y
// Mercado Pago no sigue redirecciones de forma fiable al enviar avisos. Para cambiarla, define NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taller-zero.cl').replace(/\/$/, '')
