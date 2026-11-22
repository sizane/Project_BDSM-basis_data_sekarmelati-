// Bentuk respons API backend (lihat backend/src/modules/*/*.service.ts).

export interface Meta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data: T;
  message: string;
  errors?: { code: string; details?: unknown } | null;
  meta?: Meta;
}

export type Role = 'Pemilik' | 'Admin';

export interface User {
  admin_id: string;
  username: string;
  full_name: string;
  role: Role;
}

/** Respons POST /auth/login */
export interface LoginResult {
  token: string;
  expires_in: number;
  admin: { id: string; full_name: string; username: string; role: Role };
}

export type StatusPesanan = 'Belum Lunas' | 'Lunas';
export type JenisPembayaran = 'DP' | 'Cicilan' | 'Pelunasan';
export type LevelUtang = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';

export interface DashboardSummary {
  bulan: number;
  tahun: number;
  total_pesanan_bulan_ini: number;
  total_piutang_aktif: number;
  total_laba_rugi_bulan_ini: number;
}

export interface PesananSummary {
  pesanan_id: string;
  no_pesanan: string;
  nama_customer: string;
  tanggal_masuk: string;
  tenggat: string;
  harga_total: number;
  total_dibayar: number;
  sisa_piutang: number;
  status_pesanan: StatusPesanan;
}

export interface PesananItem {
  item_id?: string;
  rincian_pesanan: string;
  kuantitas: number;
  harga_per_item: number;
  subtotal: number;
}

export interface PembayaranItem {
  pembayaran_id: string;
  tanggal_bayar: string;
  jenis_pembayaran: JenisPembayaran;
  jumlah: number;
}

export interface PesananDetail extends PesananSummary {
  tanggal_lunas: string | null;
  dicatat_oleh: string;
  customer: { customer_id: string; nama_customer: string; no_kontak: string };
  items: PesananItem[];
  riwayat_pembayaran: PembayaranItem[];
}

export interface CreatePesananPayload {
  nama_customer: string;
  no_kontak: string;
  items: { rincian_pesanan: string; kuantitas: number; harga_per_item: number }[];
  dp: number;
  tenggat: string;
}

export interface CreatePesananResult {
  pesanan_id: string;
  no_pesanan: string;
  harga_total: number;
  sisa_piutang: number;
  status_pesanan: StatusPesanan;
}

export interface CatatPembayaranPayload {
  tanggal_bayar: string;
  jumlah: number;
  jenis_pembayaran: JenisPembayaran;
}

export interface CatatPembayaranResult {
  pembayaran_id: string;
  sisa_piutang_baru: number;
  status_pesanan: StatusPesanan;
}

export interface PiutangRow {
  customer_id: string;
  nama_customer: string;
  pesanan_id: string;
  no_pesanan: string;
  total_tagihan: number;
  sisa_piutang: number;
  total_piutang_pelanggan: number;
  tenggat: string;
  status_pesanan: StatusPesanan;
}

export interface RiwayatTransaksiRow {
  pesanan_id: string;
  no_pesanan: string;
  nama_customer: string;
  tanggal: string;
  total_harga: number;
  total_dibayar: number;
  sisa_piutang: number;
  status_pesanan: StatusPesanan;
}

export type KategoriPengeluaran = 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain';

export interface PengeluaranRow {
  pengeluaran_id: string;
  tanggal_pengeluaran: string;
  kategori_pengeluaran: KategoriPengeluaran;
  jumlah: number;
  keterangan: string | null;
}

export interface CreatePengeluaranPayload {
  tanggal_pengeluaran: string;
  kategori_pengeluaran: KategoriPengeluaran;
  jumlah: number;
  keterangan?: string;
}

export interface LabaRugi {
  bulan: number;
  tahun: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  laba_rugi_bersih: number;
}

export interface LevelUtangItem {
  customer_id: string;
  nama_customer: string;
  total_piutang: number;
  frekuensi_utang_kategori: string;
  total_keterlambatan: number;
  hari_keterlambatan: number;
  level_utang: LevelUtang;
  prioritas_penagihan: string;
}

export interface AuditLogItem {
  log_id: string;
  nama_pengguna: string;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  old_values: unknown;
  new_values: unknown;
  ip_address: string;
  created_at: string;
}
