/**
 * SessionContext: Kelas independen yang merepresentasikan konteks sesi admin yang sedang aktif.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Properti privat (#adminId, #adminUsername, #ipAddress, #role) dengan getter publik.
 * - ASOSIASI (Association / "uses-a"): Digunakan oleh service dan controller sebagai parameter
 *   tanpa adanya hubungan kepemilikan siklus hidup.
 */
export class SessionContext {
    #adminId;
    #adminUsername;
    #ipAddress;
    #role;
    constructor(adminId = null, adminUsername = null, ipAddress = '127.0.0.1', role = null) {
        this.#adminId = adminId;
        this.#adminUsername = adminUsername;
        this.#ipAddress = ipAddress;
        this.#role = role;
    }
    get adminId() {
        return this.#adminId;
    }
    get adminUsername() {
        return this.#adminUsername;
    }
    get ipAddress() {
        return this.#ipAddress;
    }
    get role() {
        return this.#role;
    }
    isAuthenticated() {
        return this.#adminId !== null && this.#adminUsername !== null;
    }
    toDbContext() {
        return {
            adminId: this.#adminId,
            adminUsername: this.#adminUsername,
            ipAddress: this.#ipAddress,
        };
    }
}
function normalizeIp(raw) {
    if (!raw)
        return 'unknown';
    const ip = raw.startsWith('::ffff:') ? raw.slice(7) : raw;
    return ip.slice(0, 45);
}
/** Susun konteks DB dari request saat ini (dipanggil ulang setelah authenticate). */
export function buildDbContext(req) {
    const session = new SessionContext(req.user?.adminId ?? null, req.user?.username ?? null, normalizeIp(req.ip), req.user?.role ?? null);
    return session.toDbContext();
}
/**
 * Menetapkan req.clientIp dan req.dbContext. Dipasang global; authenticate
 * memperbarui dbContext setelah identitas pengguna diketahui. Nilainya dikirim
 * ke SESSION_CONTEXT lewat runQuery(..., req.dbContext).
 */
export const sessionContext = (req, _res, next) => {
    req.clientIp = normalizeIp(req.ip);
    req.dbContext = buildDbContext(req);
    req.validated = {};
    next();
};
//# sourceMappingURL=session-context.js.map