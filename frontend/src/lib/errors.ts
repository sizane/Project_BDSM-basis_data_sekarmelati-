import axios from 'axios';

const FALLBACK = 'Terjadi kesalahan pada sistem. Silakan coba kembali.';

/** Pesan untuk pengguna dari error axios; tidak pernah menampilkan detail teknis. */
export function getErrorMessage(err: unknown, fallback: string = FALLBACK): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.';
    const message = (err.response.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

/** Galat per field dari respons 422 backend ({ errors.details: [{ field, message }] }). */
export function getFieldErrors(err: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!axios.isAxiosError(err)) return out;
  const details = (err.response?.data as { errors?: { details?: unknown } } | undefined)?.errors?.details;
  if (!Array.isArray(details)) return out;
  for (const d of details as { field?: string; message?: string }[]) {
    const key = d.field?.split('.').pop();
    if (key && d.message && !(key in out)) out[key] = d.message;
  }
  return out;
}
