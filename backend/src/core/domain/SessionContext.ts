/**
 * SessionContext: Kelas independen yang mewakili sesi pengguna aktif.
 * Digunakan untuk konsep ASOSIASI (Association / "uses-a"):
 * Kelas Service atau Controller menggunakan (uses) SessionContext sebagai parameter
 * method untuk mencatat log, audit, dan konteks DB tanpa menjadi pemilik dari SessionContext.
 */
export class SessionContext {
  #adminId: string | null;
  #adminUsername: string | null;
  #ipAddress: string;
  #role: string | null;

  constructor(
    adminId: string | null = null,
    adminUsername: string | null = null,
    ipAddress: string = '127.0.0.1',
    role: string | null = null,
  ) {
    this.#adminId = adminId;
    this.#adminUsername = adminUsername;
    this.#ipAddress = ipAddress;
    this.#role = role;
  }

  // --- ENKAPSULASI: Getters ---
  public get adminId(): string | null {
    return this.#adminId;
  }

  public get adminUsername(): string | null {
    return this.#adminUsername;
  }

  public get ipAddress(): string {
    return this.#ipAddress;
  }

  public get role(): string | null {
    return this.#role;
  }

  public isAuthenticated(): boolean {
    return this.#adminId !== null && this.#adminUsername !== null;
  }

  public toDbContext(): { adminId: string | null; adminUsername: string | null; ipAddress: string } {
    return {
      adminId: this.#adminId,
      adminUsername: this.#adminUsername,
      ipAddress: this.#ipAddress,
    };
  }
}

