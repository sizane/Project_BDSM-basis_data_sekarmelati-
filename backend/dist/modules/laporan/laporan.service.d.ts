import type { PaginationMeta } from '../../types/api-response';
import type { LevelUtang } from './laporan.schema';
export interface LabaRugi {
    bulan: number;
    tahun: number;
    total_pemasukan: number;
    total_pengeluaran: number;
    laba_rugi_bersih: number;
    ada_transaksi: boolean;
}
export declare function getLabaRugi(bulan: number, tahun: number): Promise<LabaRugi>;
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
export declare function listLevelUtang(level: LevelUtang | undefined, page: number, perPage: number): Promise<{
    data: LevelUtangItem[];
    meta: PaginationMeta;
}>;
/** Semua baris (tanpa pagination) untuk ekspor PDF. */
export declare function listAllLevelUtang(level?: LevelUtang): Promise<LevelUtangItem[]>;
//# sourceMappingURL=laporan.service.d.ts.map