import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    // Rutas que queremos proteger a partir de /admin/dashboard
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin/dashboard')

    if (isAdminRoute) {
        // Si no hay token de usuario -> Redirigir al panel de inicio de sesión
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Verificar si el usuario autenticado es admin
        const allowedAdmins = (process.env.ADMIN_EMAILS || 'admin@tallerzero.com').split(',').map(e => e.trim().toLowerCase());
        const userEmail = token.email?.toLowerCase();

        if (!userEmail || !allowedAdmins.includes(userEmail)) {
            // Usuario conectado pero NO es admin, redirigir
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/dashboard/:path*'],
}