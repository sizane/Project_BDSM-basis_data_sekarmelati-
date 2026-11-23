import sql from 'mssql';
import { env } from './env';
import { logger } from '../utils/logger';
/** Pembuat parameter bertipe. Kolom VARCHAR memakai sql.VarChar agar index tetap bisa di-seek. */
export const p = {
    uuid: (name, value) => ({ name, type: sql.UniqueIdentifier, value }),
    varchar: (name, value, length) => ({
        name,
        type: sql.VarChar(length),
        value,
    }),
    nvarchar: (name, value, length) => ({
        name,
        type: sql.NVarChar(length),
        value,
    }),
    int: (name, value) => ({ name, type: sql.Int, value }),
    bit: (name, value) => ({ name, type: sql.Bit, value }),
    decimal: (name, value) => ({ name, type: sql.Decimal(12, 2), value }),
    date: (name, value) => ({ name, type: sql.Date, value }),
    datetime2: (name, value) => ({ name, type: sql.DateTime2(7), value }),
};
let pool = null;
const poolConfig = {
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
export async function connectDatabase() {
    if (pool?.connected)
        return pool;
    const next = new sql.ConnectionPool(poolConfig);
    next.on('error', (err) => logger.error('Kesalahan pada connection pool SQL Server', err));
    pool = await next.connect();
    logger.info('Koneksi SQL Server siap', { server: env.DB_SERVER, database: env.DB_NAME });
    return pool;
}
export function getPool() {
    if (!pool)
        throw new Error('Connection pool belum diinisialisasi');
    return pool;
}
export async function closeDatabase() {
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
export async function runQuery(text, params = [], ctx) {
    const request = getPool().request();
    for (const prm of params)
        request.input(prm.name, prm.type, prm.value);
    let batch = text;
    if (ctx) {
        request.input('__ctx_admin_id', sql.UniqueIdentifier, ctx.adminId);
        request.input('__ctx_admin_username', sql.VarChar(50), ctx.adminUsername);
        request.input('__ctx_ip_address', sql.VarChar(45), ctx.ipAddress);
        batch = SESSION_CONTEXT_SQL + text;
    }
    return request.query(batch);
}
/** Memanggil stored procedure lewat RPC (parameter terikat, output param didukung). */
export async function runProc(name, inputs, outputs = []) {
    const request = getPool().request();
    for (const prm of inputs)
        request.input(prm.name, prm.type, prm.value);
    for (const out of outputs)
        request.output(out.name, out.type);
    return request.execute(`dbo.${name}`);
}
export { sql };
//# sourceMappingURL=database.js.map