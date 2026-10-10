import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/admin'
import { checkRateLimit } from '@/lib/ratelimit'

const BYPASS_COOKIE = 'maintenance_bypass'

async function sha256Hex(value: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl

    // 0. Páginas públicas que se abren con un token de invitación: frenar a quien pruebe tokens en masa.
    // /scan y /api/qr quedan fuera: no revelan nada sin sesión de staff y en la puerta comparten IP.
    const isTokenRoute = ['/vip/', '/winner/'].some(prefix => pathname.startsWith(prefix))
    if (isTokenRoute && !(await checkRateLimit('token', request.headers))) {
        return new NextResponse('Demasiados intentos, espera un minuto.', { status: 429 })
    }

    // 1. Lógica de Modo Mantenimiento (solo para la tienda)
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'
    const isCheckoutApi = pathname.startsWith('/api/mercadopago')
    const isStoreRoute = pathname.startsWith('/store') || pathname.startsWith('/cart') || pathname.startsWith('/checkout') || isCheckoutApi
    const isMaintenancePage = pathname === '/maintenance'

    // La clave de bypass vive en MAINTENANCE_BYPASS_TOKEN. Sin esa variable no hay bypass por URL.
    // La cookie guarda un hash de la clave y se compara su valor: no basta con que exista.
    const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN
    const bypassHash = bypassToken ? await sha256Hex(bypassToken) : null

    // Configurar cookie de bypass si se visita la URL secreta: /store?bypass=<clave>
    if (bypassHash && searchParams.get('bypass') === bypassToken) {
        const response = NextResponse.redirect(new URL(pathname, request.url))
        response.cookies.set(BYPASS_COOKIE, bypassHash, {
            path: '/',
            maxAge: 60 * 60 * 24,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
        return response
    }

    // Rutas que queremos proteger a partir de /admin/dashboard o /api/admin
    const isDashboardRoute = pathname.startsWith('/admin/dashboard')
    const isApiAdminRoute = pathname.startsWith('/api/admin')
    const isAdminRoute = isDashboardRoute || isApiAdminRoute

    const needsSession = isAdminRoute || (isMaintenanceMode && (isStoreRoute || isMaintenancePage))
    const token = needsSession ? await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }) : null
    const isAdmin = isAdminEmail(token?.email)

    // Los administradores ven la tienda aunque esté en mantenimiento
    const hasBypass = isAdmin || (bypassHash !== null && request.cookies.get(BYPASS_COOKIE)?.value === bypassHash)

    // Solo redirigir a mantenimiento si es ruta de tienda
    if (isMaintenanceMode && !hasBypass && isStoreRoute) {
        if (isCheckoutApi) {
            return NextResponse.json({ error: 'La tienda está en mantenimiento' }, { status: 503 })
        }
        return NextResponse.redirect(new URL('/maintenance', request.url))
    }

    // Si NO está en mantenimiento pero intenta ir a /maintenance -> Redirigir al home
    if ((!isMaintenanceMode || hasBypass) && isMaintenancePage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 2. Lógica de Autenticación de Admin
    if (isAdminRoute) {
        // Si no hay token de usuario -> Fallo de autenticación
        if (!token) {
            if (isApiAdminRoute) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Verificar si el usuario autenticado es admin
        if (!isAdmin) {
            // Usuario conectado pero NO es admin, redirigir o devolver error
            if (isApiAdminRoute) {
                return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
            }
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // CSRF & Header protection is managed in next.config.mjs
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth endpoints need to be accessible)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images/ (public images)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
    ],
}
