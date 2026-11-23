import type { PaginationMeta } from '../../types/api-response';
import type { CreatePengeluaranBody, ListPengeluaranQuery } from './pengeluaran.schema';
/** SCR-09: daftar pengeluaran, terbaru dulu. */
export declare function listPengeluaran(query: ListPengeluaranQuery): Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
/**
 * FSD-2.4: sp_catat_pengeluaran. Spesifikasi TSD hanya mengembalikan `result`; bila SP
 * tidak menyertakan kolom pengeluaran_id, id dicari dari baris yang baru saja dicatat.
 */
export declare function createPengeluaran(body: CreatePengeluaranBody, adminId: string, ip: string): Promise<{
    pengeluaran_id: string | null;
}>;
//# sourceMappingURL=pengeluaran.service.d.ts.map