import { runProc, runQuery, type ProcName, type SqlParam } from '../../config/database';
import { SessionContext } from '../domain/SessionContext';

/**
 * DatabaseService: Layanan akses database terenkapsulasi.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Menyembunyikan detail koneksi dan transaksi database.
 * - OVERLOADING: Method overloading pada query() dan proc() dengan signature berbeda.
 * - ASYNC: Seluruh operasi I/O database berjalan secara asynchronous (async/await, Promise).
 */
export class DatabaseService {
  private static instance: DatabaseService | null = null;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // --- OVERLOADING (Signature 1, 2, 3) ---
  public async query<T = unknown>(sqlText: string): Promise<T[]>;
  public async query<T = unknown>(sqlText: string, params: SqlParam[]): Promise<T[]>;
  public async query<T = unknown>(sqlText: string, params: SqlParam[], session: SessionContext): Promise<T[]>;
  // Implementasi tunggal untuk overloading di atas
  public async query<T = unknown>(
    sqlText: string,
    paramsOrSession?: SqlParam[] | SessionContext,
    session?: SessionContext,
  ): Promise<T[]> {
    let params: SqlParam[] = [];
    let dbCtx: { adminId: string | null; adminUsername: string | null; ipAddress: string } | undefined;

    if (Array.isArray(paramsOrSession)) {
      params = paramsOrSession;
      if (session) {
        dbCtx = session.toDbContext();
      }
    } else if (paramsOrSession instanceof SessionContext) {
      dbCtx = paramsOrSession.toDbContext();
    }

    const res = await runQuery<T>(sqlText, params, dbCtx);
    return res.recordset;
  }

  // --- OVERLOADING untuk Eksekusi Stored Procedure ---
  public async proc<T = unknown>(procName: ProcName): Promise<T[]>;
  public async proc<T = unknown>(procName: ProcName, params: SqlParam[]): Promise<T[]>;
  public async proc<T = unknown>(procName: ProcName, params: SqlParam[], session: SessionContext): Promise<T[]>;
  public async proc<T = unknown>(
    procName: ProcName,
    paramsOrSession?: SqlParam[] | SessionContext,
    session?: SessionContext,
  ): Promise<T[]> {
    let params: SqlParam[] = [];

    if (Array.isArray(paramsOrSession)) {
      params = paramsOrSession;
    }

    const res = await runProc<T>(procName, params);
    return res.recordset;
  }
}
