/** bcrypt cost >= 12 (AC-05). Password plaintext tidak pernah disimpan atau di-log. */
export declare function hashPassword(plain: string): Promise<string>;
export declare function comparePassword(plain: string, hash: string): Promise<boolean>;
/**
 * Dipanggil saat username tidak ditemukan agar waktu respons mirip login dengan
 * username valid (mencegah enumerasi username lewat timing).
 */
export declare function compareAgainstDummy(plain: string): Promise<void>;
//# sourceMappingURL=password.d.ts.map