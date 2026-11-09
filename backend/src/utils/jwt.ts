// --- backend/src/utils/jwt.ts ---
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import type { UserRole } from '../constants/roles';
import type { AuthUserPayload } from '../types/express';

export const signToken = (payload: { admin_id: string; username: string; role: UserRole }) => {
  const jti = uuidv4();
  const token = jwt.sign({ ...payload, jti }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });
  return { token, jti, expires_in: env.JWT_EXPIRES_IN };
};

export const verifyToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
};