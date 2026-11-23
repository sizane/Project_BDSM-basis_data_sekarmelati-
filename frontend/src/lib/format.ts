const angka = new Intl.NumberFormat('id-ID');

export function formatRupiah(n: number): string {
  return `${n < 0 ? '-' : ''}Rp ${angka.format(Math.abs(n))}`;
}

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

/** Tanggal hari ini di WIB (UTC+7) format YYYY-MM-DD, sama dengan acuan backend. */
export function todayWIB(): string {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' -> '05 Nov 2026'. Diurai manual agar tidak bergeser oleh zona waktu. */
export function formatTanggal(ymd: string | null | undefined): string {
  if (!ymd) return '-';
  const [y, m, d] = ymd.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return ymd;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
}

export function formatWaktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Jakarta', hour12: false,
  }).format(new Date(iso));
}

/** Teks angka bebas ("1.500.000", "Rp 1500000") -> bilangan bulat, atau null bila kosong. */
export function parseAngka(text: string): number | null {
  const digits = text.replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
}

/** Bulan dan tahun berjalan menurut WIB. */
export function periodeSekarang(): { bulan: number; tahun: number } {
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  return { bulan: now.getUTCMonth() + 1, tahun: now.getUTCFullYear() };
}
