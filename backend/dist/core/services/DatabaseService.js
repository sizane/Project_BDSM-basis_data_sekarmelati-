import { runProc, runQuery } from '../../config/database';
import { SessionContext } from '../domain/SessionContext';
/**
 * DatabaseService: Layanan akses database terenkapsulasi.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Menyembunyikan detail koneksi dan transaksi database.
 * - OVERLOADING: Method overloading pada query() dan proc() dengan signature berbeda.
 * - ASYNC: Seluruh operasi I/O database berjalan secara asynchronous (async/await, Promise).
 */
export class DatabaseService {
    static instance = null;
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    // Implementasi tunggal untuk overloading di atas
    async query(sqlText, paramsOrSession, session) {
        let params = [];
        let dbCtx;
        if (Array.isArray(paramsOrSession)) {
            params = paramsOrSession;
            if (session) {
                dbCtx = session.toDbContext();
            }
        }
        else if (paramsOrSession instanceof SessionContext) {
            dbCtx = paramsOrSession.toDbContext();
        }
        const res = await runQuery(sqlText, params, dbCtx);
        return res.recordset;
    }
    async proc(procName, paramsOrSession, session) {
        let params = [];
        if (Array.isArray(paramsOrSession)) {
            params = paramsOrSession;
        }
        const res = await runProc(procName, params);
        return res.recordset;
    }
}
//# sourceMappingURL=DatabaseService.js.map