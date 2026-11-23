import { Transaksi } from '../domain/Transaksi';
/**
 * TransaksiService: Layanan yang mendemonstrasikan POLIMORFISME di level proses bisnis.
 * Menerima instance Transaksi (bisa berupa Pesanan atau Pengeluaran).
 * Memanggil method hitungTotal() dan getJenisTransaksi() secara polimorfik tanpa perlu
 * mengetahui implementasi detail di balik masing-masing kelas.
 */
export class TransaksiService {
    /**
     * POLIMORFISME: Parameter transaksi bertipe kelas dasar abstrak Transaksi.
     * Pada saat runtime, pemanggilan transaksi.hitungTotal() dan transaksi.getJenisTransaksi()
     * akan mengeksekusi implementasi spesifik dari subclass (Pesanan atau Pengeluaran).
     */
    prosesTransaksiPolimorfik(transaksi) {
        const total = transaksi.hitungTotal(); // Panggilan polimorfik
        const jenis = transaksi.getJenisTransaksi(); // Panggilan polimorfik
        return {
            id: transaksi.id,
            jenis,
            total,
            tanggal: transaksi.tanggal.toISOString(),
            statusSummary: `Transaksi ${jenis} senilai Rp ${total.toLocaleString('id-ID')} berhasil diproses secara polimorfik.`,
        };
    }
    /**
     * Menghitung total akumulasi dari sekumpulan transaksi campuran (Pesanan & Pengeluaran) secara polimorfik.
     */
    hitungTotalAkumulasi(daftarTransaksi) {
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        for (const tx of daftarTransaksi) {
            const nominal = tx.hitungTotal(); // POLIMORFISME
            if (tx.getJenisTransaksi() === 'PEMASUKAN_PESANAN') {
                totalPemasukan += nominal;
            }
            else {
                totalPengeluaran += nominal;
            }
        }
        return {
            totalPemasukan,
            totalPengeluaran,
            saldoBersih: totalPemasukan - totalPengeluaran,
        };
    }
}
//# sourceMappingURL=TransaksiService.js.map