/**
 * SessionContext: Kelas independen yang mewakili sesi pengguna aktif.
 * Digunakan untuk konsep ASOSIASI (Association / "uses-a"):
 * Kelas Service atau Controller menggunakan (uses) SessionContext sebagai parameter
 * method untuk mencatat log, audit, dan konteks DB tanpa menjadi pemilik dari SessionContext.
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
    // --- ENKAPSULASI: Getters ---
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
//# sourceMappingURL=SessionContext.js.map