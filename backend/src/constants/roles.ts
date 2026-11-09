export const ROLES = {
  PEMILIK: 'Pemilik', // SuperAdmin tier
  ADMIN: 'Admin',     // Admin tier
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];