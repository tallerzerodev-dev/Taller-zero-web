import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl

    // 1. Lógica de Modo Mantenimiento
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'
    
    // Configurar cookie de bypass si se visita la URL secreta: /?bypass=tallerzero
    if (searchParams.get('bypass') === 'tallerzero') {
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.set('maintenance_bypass', 'true', { path: '/', maxAge: 60 * 60 * 24 })
        return response
    }

    const hasBypassCookie = request.cookies.has('maintenance_bypass')
    const isMaintenancePage = pathname === '/maintenance'

    // Si está en mantenimiento, no tiene la cookie y no está ya en la página de mantenimiento -> Redirigir
    if (isMaintenanceMode && !hasBypassCookie && !isMaintenancePage && !pathname.startsWith('/api/webhooks')) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
    }

    // Si NO está en mantenimiento (o tiene cookie) pero intenta ir a la página de mantenimiento -> Redirigir al home
    if ((!isMaintenanceMode || hasBypassCookie) && isMaintenancePage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 2. Lógica de Autenticación de Admin
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    // Rutas que queremos proteger a partir de /admin/dashboard o /api/admin
    const isDashboardRoute = pathname.startsWith('/admin/dashboard')
    const isApiAdminRoute = pathname.startsWith('/api/admin')
    const isAdminRoute = isDashboardRoute || isApiAdminRoute

    if (isAdminRoute) {
        // Si no hay token de usuario -> Fallo de autenticación
        if (!token) {
            if (isApiAdminRoute) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Verificar si el usuario autenticado es admin
        const allowedAdmins = (process.env.ADMIN_EMAILS || 'admin@tallerzero.com').split(',').map(e => e.trim().toLowerCase());
        const userEmail = token.email?.toLowerCase();

        if (!userEmail || !allowedAdmins.includes(userEmail)) {
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