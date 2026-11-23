/**
 * Role aplikasi. Nilai string sama persis dengan kolom admins.role dan payload JWT.
 *   Pemilik = tier SuperAdmin, Admin = tier Admin, User = tier User (belum punya akses).
 * CHECK constraint di tabel admins hanya mengizinkan 'Pemilik' dan 'Admin'.
 */
export const ROLES = {
  PEMILIK: 'Pemilik',
  ADMIN: 'Admin',
  USER: 'User',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Role yang boleh tersimpan di tabel admins. */
export const ASSIGNABLE_ROLES = [ROLES.PEMILIK, ROLES.ADMIN] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ROLE_TIER: Record<Role, 'SuperAdmin' | 'Admin' | 'User'> = {
  Pemilik: 'SuperAdmin',
  Admin: 'Admin',
  User: 'User',
};

export function isRole(value: unknown): value is Role {
  return value === ROLES.PEMILIK || value === ROLES.ADMIN || value === ROLES.USER;
}
