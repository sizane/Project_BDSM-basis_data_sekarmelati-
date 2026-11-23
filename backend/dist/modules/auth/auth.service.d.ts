import type { Role } from '../../constants/roles';
import type { AuthUser } from '../../types/express';
export interface LoginResult {
    token: string;
    expires_in: number;
    admin: {
        id: string;
        full_name: string;
        username: string;
        role: Role;
    };
}
/**
 * FSD-2.1 Login.
 * - Verifikasi bcrypt dilakukan di sini; penghitung gagal & lockout 15 menit (3x gagal)
 *   dikelola sp_catat_percobaan_login. Trigger trg_audit_login mencatat hasilnya ke audit log.
 * - Akun yang masih terkunci ditolak SEBELUM memanggil SP agar masa kunci tidak diperpanjang.
 * - Pesan gagal selalu generik (ERR-AUTH-02), tidak membedakan username salah / password salah / akun nonaktif.
 */
export declare function login(username: string, password: string, ip: string): Promise<LoginResult>;
/**
 * Logout: jti token dicatat ke revoked_tokens (dicek authenticate sampai token kedaluwarsa)
 * dan LOGOUT ditulis ke audit log. Token yang sudah lewat masa berlakunya dibersihkan sekalian.
 */
export declare function logout(user: AuthUser, ip: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map