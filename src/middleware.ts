import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    // Rutas que queremos proteger a partir de /admin/dashboard o /api/admin
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/admin/dashboard')
    const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin')
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
    matcher: ['/admin/dashboard/:path*', '/api/admin/:path*'],
}