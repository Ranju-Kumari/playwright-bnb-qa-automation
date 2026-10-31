// Uses local date parts (not toISOString) so dates don't shift across time zones.

export function daysFromToday(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Format used by the site's date pickers, e.g. 27/10/2026 */
export function toUiDate(date: Date): string {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Format used in the site's URLs, e.g. 2026-10-27 */
export function toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
