/**
 * SessionContext: Kelas independen yang mewakili sesi pengguna aktif.
 * Digunakan untuk konsep ASOSIASI (Association / "uses-a"):
 * Kelas Service atau Controller menggunakan (uses) SessionContext sebagai parameter
 * method untuk mencatat log, audit, dan konteks DB tanpa menjadi pemilik dari SessionContext.
 */
export declare class SessionContext {
    #private;
    constructor(adminId?: string | null, adminUsername?: string | null, ipAddress?: string, role?: string | null);
    get adminId(): string | null;
    get adminUsername(): string | null;
    get ipAddress(): string;
    get role(): string | null;
    isAuthenticated(): boolean;
    toDbContext(): {
        adminId: string | null;
        adminUsername: string | null;
        ipAddress: string;
    };
}
//# sourceMappingURL=SessionContext.d.ts.map