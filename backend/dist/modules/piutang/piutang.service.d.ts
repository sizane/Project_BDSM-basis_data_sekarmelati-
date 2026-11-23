import type { PaginationMeta } from '../../types/api-response';
import type { ListPiutangQuery } from './piutang.schema';
/** FSD-2.5: pesanan Belum Lunas dari view v_daftar_piutang. */
export declare function listPiutang(query: ListPiutangQuery): Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
//# sourceMappingURL=piutang.service.d.ts.map