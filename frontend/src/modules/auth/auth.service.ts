import { p, runProc, runQuery, sql } from '../../config/database';
import { AppError, ERRORS } from '../../constants/error-codes';
import type { Role } from '../../constants/roles';
import { signToken } from '../../utils/jwt';
import { compareAgainstDummy, comparePassword } from '../../utils/password';
import type { AuthUser } from '../../types/express';
import { tulisAuditLog } from '../audit-log/audit.service';

interface LoginRow {
  admin_id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  is_locked: number;
}

const LOCK_CHECK_SQL = `CASE WHEN locked_until IS NOT NULL AND locked_until > SYSUTCDATETIME() THEN 1 ELSE 0 END`;

export interface LoginResult {
  token: string;
  expires_in: number;
  admin: { id: string; full_name: string; username: string; role: Role };
}

async function isLocked(adminId: string): Promise<boolean> {
  const r = await runQuery<{ is_locked: number }>(
    `SELECT ${LOCK_CHECK_SQL} AS is_locked FROM dbo.admins WHERE admin_id = @admin_id`,
    [p.uuid('admin_id', adminId)],
  );
  return r.recordset[0]?.is_locked === 1;
}

/**
 * FSD-2.1 Login.
 * - Verifikasi bcrypt dilakukan di sini; penghitung gagal & lockout 15 menit (3x gagal)
 *   dikelola sp_catat_percobaan_login. Trigger trg_audit_login mencatat hasilnya ke audit log.
 * - Akun yang masih terkunci ditolak SEBELUM memanggil SP agar masa kunci tidak diperpanjang.
 * - Pesan gagal selalu generik (ERR-AUTH-02), tidak membedakan username salah / password salah / akun nonaktif.
 */
export async function login(username: string, password: string, ip: string): Promise<LoginResult> {
  const found = await runQuery<LoginRow>(
    `SELECT admin_id, username, password_hash, full_name, role, is_active, ${LOCK_CHECK_SQL} AS is_locked
       FROM dbo.admins
      WHERE username = @username`,
    [p.varchar('username', username, 50)],
  );
  const admin = found.recordset[0];

  if (!admin) {
    // Username tidak dikenal: tidak ada baris admins untuk di-UPDATE, jadi dicatat langsung.
    await compareAgainstDummy(password);
    await tulisAuditLog({
      adminId: null,
      adminUsername: username,
      actionType: 'LOGIN_FAILED',
      resourceType: 'Autentikasi',
      newValues: { reason: 'username_tidak_dikenal' },
      ipAddress: ip,
    });
    throw new AppError(ERRORS.AUTH_INVALID);
  }

  if (admin.is_locked === 1) {
    await tulisAuditLog({
      adminId: admin.admin_id,
      adminUsername: admin.username,
      actionType: 'LOGIN_FAILED',
      resourceType: 'Autentikasi',
      newValues: { reason: 'akun_terkunci' },
      ipAddress: ip,
    });
    throw new AppError(ERRORS.LOCKED);
  }

  const passwordMatches = await comparePassword(password, admin.password_hash);

  if (!passwordMatches || !admin.is_active) {
    if (admin.is_active) {
      await runProc('sp_catat_percobaan_login', [
        p.varchar('username', admin.username, 50),
        p.bit('success', false),
        p.varchar('ip_address', ip, 45),
      ]);
      if (await isLocked(admin.admin_id)) throw new AppError(ERRORS.LOCKED);
    } else {
      await tulisAuditLog({
        adminId: admin.admin_id,
        adminUsername: admin.username,
        actionType: 'LOGIN_FAILED',
        resourceType: 'Autentikasi',
        newValues: { reason: 'akun_nonaktif' },
        ipAddress: ip,
      });
    }
    throw new AppError(ERRORS.AUTH_INVALID);
  }

  await runProc('sp_catat_percobaan_login', [
    p.varchar('username', admin.username, 50),
    p.bit('success', true),
    p.varchar('ip_address', ip, 45),
  ]);

  const { token, expiresIn } = signToken({ adminId: admin.admin_id, role: admin.role, username: admin.username });
  return {
    token,
    expires_in: expiresIn,
    admin: { id: admin.admin_id, full_name: admin.full_name, username: admin.username, role: admin.role },
  };
}

/**
 * Logout: jti token dicatat ke revoked_tokens (dicek authenticate sampai token kedaluwarsa)
 * dan LOGOUT ditulis ke audit log. Token yang sudah lewat masa berlakunya dibersihkan sekalian.
 */
export async function logout(user: AuthUser, ip: string): Promise<void> {
  await runQuery(
    `BEGIN TRY
       IF NOT EXISTS (SELECT 1 FROM dbo.revoked_tokens WHERE jti = @jti)
         INSERT INTO dbo.revoked_tokens (jti, admin_id, expires_at) VALUES (@jti, @admin_id, @expires_at);
     END TRY
     BEGIN CATCH
       IF ERROR_NUMBER() NOT IN (2627, 2601) THROW;  -- logout ganda bersamaan: abaikan duplikat
     END CATCH;
     DELETE FROM dbo.revoked_tokens WHERE expires_at < SYSUTCDATETIME();`,
    [
      p.varchar('jti', user.jti, 64),
      p.uuid('admin_id', user.adminId),
      { name: 'expires_at', type: sql.DateTime2(7), value: new Date(user.exp * 1000) },
    ],
  );

  await tulisAuditLog({
    adminId: user.adminId,
    adminUsername: user.username,
    actionType: 'LOGOUT',
    resourceType: 'Autentikasi',
    ipAddress: ip,
  });
}
