import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Límites compartidos entre todas las instancias serverless (un Map en memoria no sirve en Vercel).
// Compatible con el runtime edge: lo usa también el middleware.
const LIMITS = {
    checkout: { requests: 5, window: '5 m' },
    apply: { requests: 3, window: '1 h' },
    subscribe: { requests: 5, window: '1 h' },
    token: { requests: 30, window: '1 m' },
} as const;

export type RateLimitName = keyof typeof LIMITS;

const limiters = new Map<RateLimitName, Ratelimit>();
let warnedMissingConfig = false;

// Acepta los nombres de Upstash (UPSTASH_REDIS_REST_*) y los que crea la integración de Redis/KV de Vercel (KV_REST_API_*)
function getRedisConfig(): { url: string; token: string } | null {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    return url && token ? { url, token } : null;
}

function getLimiter(name: RateLimitName): Ratelimit | null {
    const config = getRedisConfig();
    if (!config) {
        if (!warnedMissingConfig) {
            console.warn('Rate limit desactivado: faltan UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (o KV_REST_API_URL / KV_REST_API_TOKEN)');
            warnedMissingConfig = true;
        }
        return null;
    }

    let limiter = limiters.get(name);
    if (!limiter) {
        const { requests, window } = LIMITS[name];
        limiter = new Ratelimit({
            redis: new Redis(config),
            limiter: Ratelimit.slidingWindow(requests, window),
            prefix: `tz:${name}`,
        });
        limiters.set(name, limiter);
    }
    return limiter;
}

// En Vercel estas cabeceras las fija la plataforma, no el cliente.
export function getClientIp(headers: Headers): string {
    return headers.get('x-real-ip')
        || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || 'unknown';
}

// Devuelve true si la petición puede continuar. Si Upstash no está configurado o no responde,
// deja pasar: el límite no debe tumbar el sitio.
export async function checkRateLimit(name: RateLimitName, headers: Headers): Promise<boolean> {
    const limiter = getLimiter(name);
    if (!limiter) return true;

    try {
        const { success } = await limiter.limit(getClientIp(headers));
        return success;
    } catch (error) {
        console.error('Rate limit no disponible:', error);
        return true;
    }
}
