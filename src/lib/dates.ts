// Las fechas se guardan en UTC y siempre se muestran en hora de Chile,
// sin depender de la zona horaria del servidor ni del navegador.
const TIME_ZONE = 'America/Santiago';

export function formatEventDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CL', {
        timeZone: TIME_ZONE,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export function formatEventTime(date: Date): string {
    return new Intl.DateTimeFormat('es-CL', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

export function formatEventDateTime(date: Date): string {
    return `${formatEventDate(date)} · ${formatEventTime(date)} hrs`;
}

export function formatCLP(amount: number): string {
    return `$${amount.toLocaleString('es-CL')}`;
}
