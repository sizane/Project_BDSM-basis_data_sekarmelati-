import { type ProcName, type SqlParam } from '../../config/database';
import { SessionContext } from '../domain/SessionContext';
/**
 * DatabaseService: Layanan akses database terenkapsulasi.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Menyembunyikan detail koneksi dan transaksi database.
 * - OVERLOADING: Method overloading pada query() dan proc() dengan signature berbeda.
 * - ASYNC: Seluruh operasi I/O database berjalan secara asynchronous (async/await, Promise).
 */
export declare class DatabaseService {
    private static instance;
    static getInstance(): DatabaseService;
    query<T = unknown>(sqlText: string): Promise<T[]>;
    query<T = unknown>(sqlText: string, params: SqlParam[]): Promise<T[]>;
    query<T = unknown>(sqlText: string, params: SqlParam[], session: SessionContext): Promise<T[]>;
    proc<T = unknown>(procName: ProcName): Promise<T[]>;
    proc<T = unknown>(procName: ProcName, params: SqlParam[]): Promise<T[]>;
    proc<T = unknown>(procName: ProcName, params: SqlParam[], session: SessionContext): Promise<T[]>;
}
//# sourceMappingURL=DatabaseService.d.ts.map