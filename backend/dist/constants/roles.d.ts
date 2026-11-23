/**
 * Role aplikasi. Nilai string sama persis dengan kolom admins.role dan payload JWT.
 *   Pemilik = tier SuperAdmin, Admin = tier Admin, User = tier User (belum punya akses).
 * CHECK constraint di tabel admins hanya mengizinkan 'Pemilik' dan 'Admin'.
 */
export declare const ROLES: {
    readonly PEMILIK: 'Pemilik';
    readonly ADMIN: 'Admin';
    readonly USER: 'User';
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
/** Role yang boleh tersimpan di tabel admins. */
export declare const ASSIGNABLE_ROLES: readonly ["Pemilik", "Admin"];
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
export declare const ROLE_TIER: Record<Role, 'SuperAdmin' | 'Admin' | 'User'>;
export declare function isRole(value: unknown): value is Role;
//# sourceMappingURL=roles.d.ts.map