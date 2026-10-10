// Sin dependencias de Node ni Prisma: este archivo también lo importa el middleware (edge).

function parseEmailList(value: string | undefined): string[] {
    return (value || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
}

// Si ADMIN_EMAILS no está definida nadie es admin: no hay correo por defecto.
export function getAdminEmails(): string[] {
    return parseEmailList(process.env.ADMIN_EMAILS);
}

export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return getAdminEmails().includes(email.toLowerCase());
}

// Personal de puerta: puede validar entradas pero no entra al panel admin.
export function isStaffEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return isAdminEmail(email) || parseEmailList(process.env.STAFF_EMAILS).includes(email.toLowerCase());
}
