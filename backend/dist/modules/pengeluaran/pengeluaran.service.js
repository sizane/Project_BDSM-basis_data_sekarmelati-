import { p, runProc, runQuery } from '../../config/database';
import { AppError, ERRORS } from '../../constants/error-codes';
import { formatSqlDate, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import { Transaksi } from '../pesanan/pesanan.service';
import { AuditService, auditServiceInstance } from '../audit-log/audit.service';
import { SessionContext } from '../../middlewares/session-context';
// ===========================================================================
// 1. DOMAIN CLASS (OOP: POLIMORFISME, ENKAPSULASI, OVERRIDING)
// ===========================================================================
/**
 * Pengeluaran: Subclass dari Transaksi (POLIMORFISME).
 * - POLIMORFISME: Merupakan wujud konkret polimorfik lain dari Transaksi selain Pesanan.
 * - ENKAPSULASI: Properti privat (#kategori, #penanggungJawab) dengan getter dan setter.
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 */
export class Pengeluaran extends Transaksi {
    #kategori;
    #penanggungJawab;
    constructor(id, nominal, tanggal, kategori, penanggungJawab = 'Admin', keterangan = '') {
        super(id, nominal, tanggal, keterangan);
        this.#kategori = kategori;
        this.#penanggungJawab = penanggungJawab;
    }
    get kategori() {
        return this.#kategori;
    }
    set kategori(k) {
        this.#kategori = k;
    }
    get penanggungJawab() {
        return this.#penanggungJawab;
    }
    set penanggungJawab(pj) {
        this.#penanggungJawab = pj;
    }
    // --- OVERRIDING: Meng-override method hitungTotal dari Transaksi (POLIMORFISME) ---
    hitungTotal() {
        return this.nominal;
    }
    // --- OVERRIDING: Meng-override getJenisTransaksi ---
    getJenisTransaksi() {
        return 'PENGELUARAN_OPERASIONAL';
    }
    // --- OVERRIDING: Meng-override toJSON ---
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            kategori: this.#kategori,
            penanggungJawab: this.#penanggungJawab,
        };
    }
}
/**
 * PengeluaranService: Layanan bisnis berbasis OOP untuk modul Pengeluaran.
 * - AGREGASI: Menyimpan referensi AuditService yang diinjeksi melalui konstruktor.
 * - ASOSIASI: Menggunakan SessionContext untuk parameter operasional dan pencatatan audit.
 * - OVERLOADING: listPengeluaran() menerima query filter ATAU ID tunggal.
 * - ASYNC: Operasi I/O database berjalan secara asynchronous.
 */
export class PengeluaranService {
    audit;
    constructor(audit) {
        this.audit = audit ?? auditServiceInstance;
    }
    // Implementasi tunggal
    async listPengeluaran(arg) {
        if (typeof arg === 'string') {
            return await this.getPengeluaranModelById(arg);
        }
        return await this.getList(arg);
    }
    async getList(query) {
        const count = await runQuery('SELECT COUNT(*) AS total FROM dbo.pengeluaran');
        const rows = await runQuery(`SELECT pengeluaran_id, tanggal_pengeluaran, kategori_pengeluaran, jumlah, keterangan
         FROM dbo.pengeluaran
        ORDER BY tanggal_pengeluaran DESC, created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`, [p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)]);
        return {
            data: rows.recordset.map((r) => ({
                pengeluaran_id: r.pengeluaran_id,
                tanggal_pengeluaran: formatSqlDate(r.tanggal_pengeluaran),
                kategori_pengeluaran: r.kategori_pengeluaran,
                jumlah: Number(r.jumlah),
                keterangan: r.keterangan,
            })),
            meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
        };
    }
    async getPengeluaranModelById(id) {
        const rows = await runQuery(`SELECT pengeluaran_id, tanggal_pengeluaran, kategori_pengeluaran, jumlah, keterangan
         FROM dbo.pengeluaran
        WHERE pengeluaran_id = @id`, [p.uuid('id', id)]);
        const r = rows.recordset?.[0];
        if (!r)
            return null;
        return new Pengeluaran(r.pengeluaran_id, Number(r.jumlah), r.tanggal_pengeluaran, r.kategori_pengeluaran, 'Admin', r.keterangan ?? '');
    }
    // --- ASOSIASI: Menggunakan SessionContext (atau fallback string adminId & ip) ---
    async createPengeluaran(body, sessionOrAdminId, ipFallback) {
        let adminId;
        let ip;
        let sessionCtx;
        if (sessionOrAdminId instanceof SessionContext) {
            sessionCtx = sessionOrAdminId;
            adminId = sessionOrAdminId.adminId ?? '00000000-0000-0000-0000-000000000000';
            ip = sessionOrAdminId.ipAddress;
        }
        else {
            adminId = sessionOrAdminId;
            ip = ipFallback ?? '127.0.0.1';
        }
        const result = await runProc('sp_catat_pengeluaran', [
            p.uuid('admin_id', adminId),
            p.date('tanggal_pengeluaran', toSqlDate(body.tanggal_pengeluaran)),
            p.varchar('kategori_pengeluaran', body.kategori_pengeluaran, 20),
            p.decimal('jumlah', body.jumlah),
            p.varchar('keterangan', body.keterangan ?? null, 255),
            p.varchar('ip_address', ip, 45),
        ]);
        const row = result.recordset?.[0];
        if (!row)
            throw new AppError(ERRORS.SYS_DATABASE);
        if (row.result !== 'SUCCESS') {
            if (row.result === 'ERR_NOTES_REQUIRED')
                throw new AppError(ERRORS.VAL_NOTES_REQUIRED);
            throw new AppError(ERRORS.SYS_DATABASE);
        }
        let pengeluaranId = row.pengeluaran_id;
        if (!pengeluaranId) {
            const fallback = await runQuery(`SELECT TOP 1 pengeluaran_id
           FROM dbo.pengeluaran
          WHERE admin_id = @admin_id AND tanggal_pengeluaran = @tanggal AND jumlah = @jumlah
          ORDER BY created_at DESC`, [p.uuid('admin_id', adminId), p.date('tanggal', toSqlDate(body.tanggal_pengeluaran)), p.decimal('jumlah', body.jumlah)]);
            pengeluaranId = fallback.recordset[0]?.pengeluaran_id ?? null;
        }
        if (sessionCtx && pengeluaranId) {
            await this.audit.catat('Tambah', 'pengeluaran', pengeluaranId, `Mencatat pengeluaran ${body.kategori_pengeluaran} senilai Rp ${body.jumlah.toLocaleString('id-ID')}`, sessionCtx);
        }
        return {
            pengeluaran_id: pengeluaranId,
            tanggal_pengeluaran: body.tanggal_pengeluaran,
            kategori_pengeluaran: body.kategori_pengeluaran,
            jumlah: body.jumlah,
            keterangan: body.keterangan ?? null,
        };
    }
}
export const pengeluaranService = new PengeluaranService();
// Export fungsi standalone untuk kompatibilitas penuh
export const listPengeluaran = (query) => pengeluaranService.listPengeluaran(query);
export const createPengeluaran = (body, sessionOrAdminId, ip) => pengeluaranService.createPengeluaran(body, sessionOrAdminId, ip);
//# sourceMappingURL=pengeluaran.service.js.map