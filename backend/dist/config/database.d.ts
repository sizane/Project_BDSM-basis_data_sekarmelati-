import sql from 'mssql';
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
export declare const p: {
    uuid: (name: string, value: string | null) => SqlParam;
    varchar: (name: string, value: string | null, length: number) => SqlParam;
    nvarchar: (name: string, value: string | null, length: number | typeof sql.MAX) => SqlParam;
    int: (name: string, value: number | null) => SqlParam;
    bit: (name: string, value: boolean) => SqlParam;
    decimal: (name: string, value: number | null) => SqlParam;
    date: (name: string, value: Date | null) => SqlParam;
    datetime2: (name: string, value: Date | null) => SqlParam;
};
/** Stored procedure yang dipanggil backend (TSD 5.1). */
export type ProcName = 'sp_catat_pesanan_baru' | 'sp_catat_pembayaran' | 'sp_catat_pengeluaran' | 'sp_catat_percobaan_login' | 'sp_tulis_audit_log';
export declare function connectDatabase(): Promise<sql.ConnectionPool>;
export declare function getPool(): sql.ConnectionPool;
export declare function closeDatabase(): Promise<void>;
/**
 * Menjalankan query parameterized (AC-06). Bila ctx diberikan, SESSION_CONTEXT
 * (admin_id, admin_username, ip_address) di-set pada batch yang sama sehingga
 * trigger audit membaca konteks di koneksi yang benar.
 */
export declare function runQuery<T = Record<string, any>>(text: string, params?: SqlParam[], ctx?: DbContext): Promise<sql.IResult<T>>;
/** Memanggil stored procedure lewat RPC (parameter terikat, output param didukung). */
export declare function runProc<T = Record<string, any>>(name: ProcName, inputs: SqlParam[], outputs?: Array<{
    name: string;
    type: SqlType;
}>): Promise<sql.IProcedureResult<T>>;
export { sql };
//# sourceMappingURL=database.d.ts.map