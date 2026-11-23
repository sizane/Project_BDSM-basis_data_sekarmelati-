/** Utilitas tanggal. Bisnis berjalan di WIB (UTC+7, tanpa DST). Kolom DATE dipertukarkan sebagai 'YYYY-MM-DD'. */
const WIB_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
export function todayWIB(now = new Date()) {
    return WIB_FORMAT.format(now);
}
export function currentPeriodWIB(now = new Date()) {
    const [year, month] = todayWIB(now).split('-').map(Number);
    return { bulan: month ?? 0, tahun: year ?? 1 };
}
export function isValidDateString(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const d = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
/** 'YYYY-MM-DD' -> Date UTC tengah malam (driver mssql memakai UTC, jadi tanggalnya tidak bergeser). */
export function toSqlDate(value) {
    return new Date(`${value}T00:00:00.000Z`);
}
export function formatSqlDate(value) {
    if (value === null || value === undefined)
        return null;
    return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}
/** Awal bulan (inklusif) dan awal bulan berikutnya (eksklusif), keduanya sebagai Date UTC. */
export function monthRange(bulan, tahun) {
    return {
        start: new Date(Date.UTC(tahun, bulan - 1, 1)),
        end: new Date(Date.UTC(tahun, bulan, 1)),
    };
}
/** Awal hari WIB untuk 'YYYY-MM-DD' sebagai instant UTC (untuk filter kolom DATETIME2 UTC). */
export function wibDayStart(value) {
    return new Date(`${value}T00:00:00+07:00`);
}
export function wibNextDayStart(value) {
    return new Date(wibDayStart(value).getTime() + 24 * 60 * 60 * 1000);
}
export function formatWibDateTime(date = new Date()) {
    const parts = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
    return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')} WIB`;
}
export const NAMA_BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
//# sourceMappingURL=date.js.map