/** Utilitas tanggal. Bisnis berjalan di WIB (UTC+7, tanpa DST). Kolom DATE dipertukarkan sebagai 'YYYY-MM-DD'. */
const WIB_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayWIB(now: Date = new Date()): string {
  return WIB_FORMAT.format(now);
}

export function currentPeriodWIB(now: Date = new Date()): { bulan: number; tahun: number } {
  const [year, month] = todayWIB(now).split('-').map(Number);
  return { bulan: month ?? 0, tahun: year ?? 1};
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** 'YYYY-MM-DD' -> Date UTC tengah malam (driver mssql memakai UTC, jadi tanggalnya tidak bergeser). */
export function toSqlDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatSqlDate(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

/** Awal bulan (inklusif) dan awal bulan berikutnya (eksklusif), keduanya sebagai Date UTC. */
export function monthRange(bulan: number, tahun: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(tahun, bulan - 1, 1)),
    end: new Date(Date.UTC(tahun, bulan, 1)),
  };
}

/** Awal hari WIB untuk 'YYYY-MM-DD' sebagai instant UTC (untuk filter kolom DATETIME2 UTC). */
export function wibDayStart(value: string): Date {
  return new Date(`${value}T00:00:00+07:00`);
}

export function wibNextDayStart(value: string): Date {
  return new Date(wibDayStart(value).getTime() + 24 * 60 * 60 * 1000);
}

export function formatWibDateTime(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')} WIB`;
}

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
