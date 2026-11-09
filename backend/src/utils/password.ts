// --- backend/src/utils/password.ts ---
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Wajib cost >= 12 (AC-05)

export const hashPassword = (plain: string): Promise<string> => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};