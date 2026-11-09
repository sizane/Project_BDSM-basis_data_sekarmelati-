import { UserRole } from '../constants/roles';

export interface AuthUserPayload {
  admin_id: string;
  username: string;
  role: UserRole;
  jti: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      clientIp: string;
    }
  }
}