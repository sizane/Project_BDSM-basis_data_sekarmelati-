/**
 * Katalog error (FSD Bagian 6) + class AppError.
 * Kode ERR-VAL-05 s.d. ERR-VAL-10, ERR-REQ-01, ERR-CONFLICT-* dan ERR-NOTFOUND-02/03
 * adalah perluasan katalog FSD untuk aturan bisnis yang di FSD belum punya kode sendiri.
 */
export interface ErrorDef {
  readonly code: string;
  readonly message: string;
  readonly status: number;
}

const def = (code: string, message: string, status: number): ErrorDef => ({ code, message, status });

export const ERRORS = {
  // --- Validasi input (422) ---
  VAL_REQUIRED: def('ERR-VAL-01', 'Field wajib belum diisi', 422),
  VAL_NEGATIVE: def('ERR-VAL-02', 'Nominal harga atau DP tidak boleh negatif.', 422),
  VAL_OVERPAYMENT: def('ERR-VAL-03', 'Jumlah pembayaran melebihi sisa piutang tagihan.', 422),
  VAL_NOMINAL: def('ERR-VAL-04', 'Nominal harus lebih besar dari Rp 0.', 422),
  VAL_DP_EXCEEDS: def('ERR-VAL-05', 'DP tidak boleh melebihi total harga.', 422),
  VAL_DUE_DATE: def('ERR-VAL-06', 'Tenggat tidak boleh sebelum tanggal masuk.', 422),
  VAL_QTY: def('ERR-VAL-07', 'Kuantitas harus berupa bilangan bulat lebih dari 0.', 422),
  VAL_NOTES_REQUIRED: def('ERR-VAL-08', 'Keterangan wajib diisi untuk kategori Lain-lain.', 422),
  VAL_DATE_RANGE: def('ERR-VAL-09', 'Rentang tanggal tidak valid.', 422),
  VAL_TOO_LARGE: def('ERR-VAL-10', 'Nominal melebihi batas yang diizinkan.', 422),

  // --- Request rusak (400) ---
  REQ_MALFORMED: def('ERR-REQ-01', 'Format permintaan tidak valid.', 400),

  // --- Autentikasi & otorisasi ---
  AUTH_REQUIRED: def('ERR-AUTH-01', 'Anda harus login untuk mengakses halaman ini', 401),
  AUTH_INVALID: def('ERR-AUTH-02', 'Username atau password tidak valid', 401),
  AUTH_FORBIDDEN: def('ERR-AUTH-03', 'Anda tidak memiliki izin untuk mengakses halaman ini.', 403),
  LOCKED: def('ERR-LOCK-01', 'Akun dikunci sementara. Coba lagi dalam 15 menit.', 403),

  // --- Tidak ditemukan (404) ---
  NOT_FOUND_PESANAN: def('ERR-NOTFOUND-01', 'Data pesanan tidak ditemukan', 404),
  NOT_FOUND_ROUTE: def('ERR-NOTFOUND-02', 'Endpoint tidak ditemukan.', 404),
  NOT_FOUND_ADMIN: def('ERR-NOTFOUND-03', 'Data admin tidak ditemukan.', 404),

  // --- Konflik (409) ---
  CONFLICT_USERNAME: def('ERR-CONFLICT-01', 'Username sudah digunakan.', 409),
  CONFLICT_LAST_OWNER: def('ERR-CONFLICT-02', 'Role Pemilik terakhir tidak dapat diubah.', 409),

  // --- Sistem ---
  SYS_DATABASE: def('ERR-SYS-01', 'Gagal memuat data. Silakan coba beberapa saat lagi.', 503),
  SYS_PDF: def('ERR-SYS-01', 'Gagal membuat file dokumen laporan. Silakan coba kembali.', 500),
  SYS_UNEXPECTED: def('ERR-SYS-01', 'Terjadi kesalahan pada sistem. Silakan coba kembali.', 500),
} as const;

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(error: ErrorDef, message?: string, options?: { details?: unknown; cause?: unknown }) {
    super(message ?? error.message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'AppError';
    this.status = error.status;
    this.code = error.code;
    this.details = options?.details;
  }
}

const DB_ERROR_NAMES = new Set(['RequestError', 'ConnectionError', 'TransactionError', 'PreparedStatementError']);

/** Error dari driver mssql (koneksi putus, timeout, error query). */
export function isDatabaseError(err: unknown): boolean {
  return err instanceof Error && DB_ERROR_NAMES.has(err.name);
}

/** SQL Server error 2627 / 2601 = pelanggaran UNIQUE / PRIMARY KEY. */
export function isUniqueViolation(err: unknown): boolean {
  const number = (err as { number?: number } | null)?.number;
  return number === 2627 || number === 2601;
}
