import sql from 'mssql';
import { env } from './env';
import { logger } from '../utils/logger';

/** Konteks yang diteruskan ke SESSION_CONTEXT agar trigger audit tahu siapa pelakunya. */
export interface DbContext {
  adminId: string | null;
  adminUsername: string | null;
  ipAddress: string;
}

/** Tipe parameter mssql: instance (sql.VarChar(50)) atau factory tanpa argumen (sql.Int). */
export type SqlType = sql.ISqlType | (() => sql.ISqlType);

export interface SqlParam {
  name: string;
  type: SqlType;
  value: unknown;
}

/** Pembuat parameter bertipe. Kolom VARCHAR memakai sql.VarChar agar index tetap bisa di-seek. */
export const p = {
  uuid: (name: string, value: string | null): SqlParam => ({ name, type: sql.UniqueIdentifier, value }),
  varchar: (name: string, value: string | null, length: number): SqlParam => ({
    name,
    type: sql.VarChar(length),
    value,
  }),
  nvarchar: (name: string, value: string | null, length: number | typeof sql.MAX): SqlParam => ({
    name,
    type: sql.NVarChar(length),
    value,
  }),
  int: (name: string, value: number | null): SqlParam => ({ name, type: sql.Int, value }),
  bit: (name: string, value: boolean): SqlParam => ({ name, type: sql.Bit, value }),
  decimal: (name: string, value: number | null): SqlParam => ({ name, type: sql.Decimal(12, 2), value }),
  date: (name: string, value: Date | null): SqlParam => ({ name, type: sql.Date, value }),
  datetime2: (name: string, value: Date | null): SqlParam => ({ name, type: sql.DateTime2(7), value }),
};

/** Stored procedure yang dipanggil backend (TSD 5.1). */
export type ProcName =
  | 'sp_catat_pesanan_baru'
  | 'sp_catat_pembayaran'
  | 'sp_catat_pengeluaran'
  | 'sp_catat_percobaan_login'
  | 'sp_tulis_audit_log';

let pool: sql.ConnectionPool | null = null;

const poolConfig: sql.config = {
  server: env.DB_SERVER,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  options: {
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: env.DB_TRUST_SERVER_CERT,
    enableArithAbort: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30_000 },
  connectionTimeout: 15_000,
  requestTimeout: 15_000,
};

export async function connectDatabase(): Promise<sql.ConnectionPool> {
  if (pool?.connected) return pool;
  const next = new sql.ConnectionPool(poolConfig);
  next.on('error', (err) => logger.error('Kesalahan pada connection pool SQL Server', err));
  pool = await next.connect();
  logger.info('Koneksi SQL Server siap', { server: env.DB_SERVER, database: env.DB_NAME });
  return pool;
}

export function getPool(): sql.ConnectionPool {
  if (!pool) throw new Error('Connection pool belum diinisialisasi');
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

const SESSION_CONTEXT_SQL = `
EXEC sys.sp_set_session_context @key = N'admin_id',       @value = @__ctx_admin_id,       @read_only = 0;
EXEC sys.sp_set_session_context @key = N'admin_username', @value = @__ctx_admin_username, @read_only = 0;
EXEC sys.sp_set_session_context @key = N'ip_address',     @value = @__ctx_ip_address,     @read_only = 0;
`;

/**
 * Menjalankan query parameterized (AC-06). Bila ctx diberikan, SESSION_CONTEXT
 * (admin_id, admin_username, ip_address) di-set pada batch yang sama sehingga
 * trigger audit membaca konteks di koneksi yang benar.
 */
export async function runQuery<T = Record<string, any>>(
  text: string,
  params: SqlParam[] = [],
  ctx?: DbContext,
): Promise<sql.IResult<T>> {
  const request = getPool().request();
  for (const prm of params) request.input(prm.name, prm.type, prm.value);
  let batch = text;
  if (ctx) {
    request.input('__ctx_admin_id', sql.UniqueIdentifier, ctx.adminId);
    request.input('__ctx_admin_username', sql.VarChar(50), ctx.adminUsername);
    request.input('__ctx_ip_address', sql.VarChar(45), ctx.ipAddress);
    batch = SESSION_CONTEXT_SQL + text;
  }
  return request.query<T>(batch);
}

/** Memanggil stored procedure lewat RPC (parameter terikat, output param didukung). */
export async function runProc<T = Record<string, any>>(
  name: ProcName,
  inputs: SqlParam[],
  outputs: Array<{ name: string; type: SqlType }> = [],
): Promise<sql.IProcedureResult<T>> {
  const request = getPool().request();
  for (const prm of inputs) request.input(prm.name, prm.type, prm.value);
  for (const out of outputs) request.output(out.name, out.type);
  return request.execute<T>(`dbo.${name}`);
}

export { sql };
