import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { AuditService } from './AuditService';
import { Pengeluaran } from '../domain/Pengeluaran';
import { SessionContext } from '../domain/SessionContext';
import { p } from '../../config/database';
import { formatSqlDate, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
/**
 * PengeluaranCoreService: Layanan bisnis berbasis OOP untuk domain Pengeluaran.
 * Memenuhi kriteria:
 * - AGREGASI: Menyimpan referensi DatabaseService dan AuditService.
 * - ASOSIASI: Menggunakan SessionContext untuk parameter operasional.
 * - OVERLOADING: cariPengeluaran() menerima ID tunggal ATAU query filter.
 * - POLIMORFISME & OVERRIDING: Menghasilkan objek domain Pengeluaran yang meng-override Transaksi.
 * - ASYNC: async/await pada seluruh interaksi I/O.
 */
export class PengeluaranCoreService extends BaseService {
    audit;
    constructor(db, audit) {
        super(db);
        this.audit = audit ?? new AuditService(this.db);
    }
    // --- OVERRIDING: Meng-override method getServiceName dari BaseService ---
    getServiceName() {
        return 'PengeluaranCoreService';
    }
    // Implementasi tunggal
    async cariPengeluaran(arg) {
        if (typeof arg === 'string') {
            return await this.getPengeluaranModelById(arg);
        }
        return await this.listPengeluaran(arg);
    }
    async listPengeluaran(query) {
        const count = await this.db.query('SELECT COUNT(*) AS total FROM dbo.pengeluaran');
        const rows = await this.db.query(`SELECT pengeluaran_id, tanggal_pengeluaran, kategori_pengeluaran AS kategori, jumlah AS nominal,
              keterangan, 'Admin' AS penanggung_jawab, created_at
         FROM dbo.pengeluaran
        ORDER BY tanggal_pengeluaran DESC, created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`, [
            p.int('offset', offsetOf(query.page, query.per_page)),
            p.int('limit', query.per_page),
        ]);
        const total = count[0]?.total ?? 0;
        const data = rows.map((r) => ({
            pengeluaran_id: r.pengeluaran_id,
            tanggal: formatSqlDate(r.tanggal_pengeluaran),
            kategori: r.kategori,
            nominal: Number(r.nominal),
            keterangan: r.keterangan,
            penanggung_jawab: r.penanggung_jawab,
        }));
        return { data, meta: buildMeta(query.page, query.per_page, total) };
    }
    async getPengeluaranModelById(id) {
        const rows = await this.db.query(`SELECT pengeluaran_id, tanggal_pengeluaran, kategori_pengeluaran AS kategori, jumlah AS nominal,
              keterangan, 'Admin' AS penanggung_jawab, created_at
         FROM dbo.pengeluaran
        WHERE pengeluaran_id = @id`, [p.uuid('id', id)]);
        const r = rows[0];
        if (!r)
            return null;
        return new Pengeluaran(r.pengeluaran_id, Number(r.nominal), r.tanggal_pengeluaran, r.kategori, r.penanggung_jawab, r.keterangan ?? '', r.created_at);
    }
    // --- ASOSIASI: Menggunakan SessionContext ---
    async createPengeluaran(body, session) {
        const adminId = session.adminId ?? '00000000-0000-0000-0000-000000000000';
        const rows = await this.db.proc('sp_catat_pengeluaran', [
            p.uuid('admin_id', adminId),
            p.date('tanggal_pengeluaran', toSqlDate(body.tanggal_pengeluaran)),
            p.varchar('kategori_pengeluaran', body.kategori_pengeluaran, 20),
            p.decimal('jumlah', body.jumlah),
            p.varchar('keterangan', body.keterangan ?? null, 255),
            p.varchar('ip_address', session.ipAddress, 45),
        ], session);
        let pengeluaranId = rows[0]?.pengeluaran_id;
        if (!pengeluaranId) {
            const fallback = await this.db.query(`SELECT TOP 1 pengeluaran_id FROM dbo.pengeluaran ORDER BY created_at DESC`);
            pengeluaranId = fallback[0]?.pengeluaran_id ?? 'unknown';
        }
        await this.audit.catat('Tambah', 'pengeluaran', pengeluaranId, `Mencatat pengeluaran ${body.kategori_pengeluaran} senilai Rp ${body.jumlah.toLocaleString('id-ID')}`, session);
        return {
            pengeluaran_id: pengeluaranId,
            tanggal: body.tanggal_pengeluaran,
            nominal: body.jumlah,
        };
    }
}
//# sourceMappingURL=PengeluaranCoreService.js.map