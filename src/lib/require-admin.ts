import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from './auth';
import { isAdminEmail } from './admin';

type AdminCheck =
    | { session: Session; response?: undefined }
    | { session?: undefined; response: NextResponse };

// Primera línea de cada handler de admin:
//   const auth = await requireAdmin(); if (auth.response) return auth.response;
export async function requireAdmin(): Promise<AdminCheck> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
    }
    if (!isAdminEmail(session.user.email)) {
        return { response: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) };
    }
    return { session };
}
