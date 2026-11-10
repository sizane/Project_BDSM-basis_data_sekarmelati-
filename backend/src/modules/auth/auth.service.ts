import { poolPromise, sql } from '../../config/database';
import { comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { ERROR_CODES } from '../../constants/error-codes';

export const loginUser = async (username: string, password: string, ipAddress: string) => {
  const pool = await poolPromise;

  const userResult = await pool
    .request()
    .input('username', sql.VarChar(50), username)
    .query(`
      SELECT admin_id, username, password_hash, full_name, role, is_active, failed_login_count, locked_until
      FROM admins
      WHERE username = @username
    `);

  const admin = userResult.recordset[0];

  // Jika user tidak ditemukan, catat ke audit log tanpa membocorkan eksistensi akun
  if (!admin || !admin.is_active) {
    await pool
      .request()
      .input('admin_id', sql.UniqueIdentifier, null)
      .input('admin_username', sql.VarChar(50), username)
      .input('action_type', sql.VarChar(50), 'LOGIN_FAILED')
      .input('resource_type', sql.VarChar(50), 'Autentikasi')
      .input('new_values', sql.NVarChar(sql.MAX), JSON.stringify({ reason: 'User not found or inactive' }))
      .input('ip_address', sql.VarChar(45), ipAddress)
      .execute('sp_tulis_audit_log');

    return { error: { code: ERROR_CODES.AUTH_INVALID_CREDENTIALS, message: 'Username atau password tidak valid', status: 401 } };
  }

  // Cek apakah akun masih dalam masa lockout 15 menit (TSD 5.1)
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    return {
      error: {
        code: ERROR_CODES.AUTH_LOCKED,
        message: 'Akun dikunci sementara. Coba lagi dalam 15 menit.',
        status: 403,
      },
    };
  }

  const isPasswordMatch = await comparePassword(password, admin.password_hash);

  // Panggil SP untuk update counter / reset lockout & memicu trg_audit_login
  await pool
    .request()
    .input('username', sql.VarChar(50), username)
    .input('success', sql.Bit, isPasswordMatch ? 1 : 0)
    .input('ip_address', sql.VarChar(45), ipAddress)
    .execute('sp_catat_percobaan_login');

  if (!isPasswordMatch) {
    // Cek ulang apakah percobaan ini baru saja memicu lockout ke-3
    const updatedUser = await pool
      .request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT locked_until FROM admins WHERE username = @username');

    if (updatedUser.recordset[0]?.locked_until && new Date(updatedUser.recordset[0].locked_until) > new Date()) {
      return {
        error: {
          code: ERROR_CODES.AUTH_LOCKED,
          message: 'Akun dikunci sementara. Coba lagi dalam 15 menit.',
          status: 403,
        },
      };
    }

    return { error: { code: ERROR_CODES.AUTH_INVALID_CREDENTIALS, message: 'Username atau password tidak valid', status: 401 } };
  }

  const tokenData = signToken({
    admin_id: admin.admin_id,
    username: admin.username,
    role: admin.role,
  });

  return {
    data: {
      ...tokenData,
      admin: {
        id: admin.admin_id,
        full_name: admin.full_name,
        username: admin.username,
        role: admin.role,
      },
    },
  };
};

export const logoutUser = async (adminId: string, username: string, jti: string, expUnix: number, ipAddress: string) => {
  const pool = await poolPromise;

  await pool
    .request()
    .input('jti', sql.VarChar(100), jti)
    .input('expires_at', sql.DateTime2, new Date(expUnix * 1000))
    .query('INSERT INTO revoked_tokens (jti, expires_at) VALUES (@jti, @expires_at)');

  await pool
    .request()
    .input('admin_id', sql.UniqueIdentifier, adminId)
    .input('admin_username', sql.VarChar(50), username)
    .input('action_type', sql.VarChar(50), 'LOGOUT')
    .input('resource_type', sql.VarChar(50), 'Autentikasi')
    .input('ip_address', sql.VarChar(45), ipAddress)
    .execute('sp_tulis_audit_log');
};