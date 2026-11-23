import type { PaginationMeta } from '../../types/api-response';
import type { ListTransaksiQuery } from './transaksi.schema';
/** FSD-2.6: pencarian riwayat transaksi lewat view v_riwayat_transaksi (read-only, BR-17). */
export declare function listRiwayatTransaksi(query: ListTransaksiQuery): Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
//# sourceMappingURL=transaksi.service.d.ts.map