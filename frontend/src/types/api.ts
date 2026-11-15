export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data: T;
  message: string;
  errors?: { code: string; details?: unknown } | null;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface User {
  admin_id: string;
  username: string;
  full_name: string;
  role: 'Pemilik' | 'Admin';
}

export interface PesananItem {
  item_id?: string;
  rincian_pesanan: string;
  kuantitas: number;
  harga_per_item: number;
  subtotal?: number;
}

export interface PembayaranItem {
  pembayaran_id: string;
  tanggal_bayar: string;
  jenis_pembayaran: 'DP' | 'Cicilan' | 'Pelunasan';
  jumlah: number;
  created_at?: string;
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
  status_pesanan: 'Belum Lunas' | 'Lunas';
}

export interface PesananDetail extends PesananSummary {
  customer: {
    customer_id: string;
    nama_customer: string;
    no_kontak: string;
  };
  items: PesananItem[];
  riwayat_pembayaran: PembayaranItem[];
}

export interface PiutangReportItem {
  customer_id: string;
  nama_customer: string;
  total_debt: number;
  freq_category: string;
  total_late: number;
  days_late: number;
  debt_level: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
}