import { Transaksi } from '../domain/Transaksi';
/**
 * TransaksiService: Layanan yang mendemonstrasikan POLIMORFISME di level proses bisnis.
 * Menerima instance Transaksi (bisa berupa Pesanan atau Pengeluaran).
 * Memanggil method hitungTotal() dan getJenisTransaksi() secara polimorfik tanpa perlu
 * mengetahui implementasi detail di balik masing-masing kelas.
 */
export declare class TransaksiService {
    /**
     * POLIMORFISME: Parameter transaksi bertipe kelas dasar abstrak Transaksi.
     * Pada saat runtime, pemanggilan transaksi.hitungTotal() dan transaksi.getJenisTransaksi()
     * akan mengeksekusi implementasi spesifik dari subclass (Pesanan atau Pengeluaran).
     */
    prosesTransaksiPolimorfik(transaksi: Transaksi): {
        id: string;
        jenis: string;
        total: number;
        tanggal: string;
        statusSummary: string;
    };
    /**
     * Menghitung total akumulasi dari sekumpulan transaksi campuran (Pesanan & Pengeluaran) secara polimorfik.
     */
    hitungTotalAkumulasi(daftarTransaksi: Transaksi[]): {
        totalPemasukan: number;
        totalPengeluaran: number;
        saldoBersih: number;
    };
}
//# sourceMappingURL=TransaksiService.d.ts.map