import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { isRole } from '../constants/roles';
export function signToken(input) {
    const jti = randomUUID();
    const token = jwt.sign({ admin_id: input.adminId, role: input.role, username: input.username }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN_SECONDS, jwtid: jti });
    return { token, jti, expiresIn: env.JWT_EXPIRES_IN_SECONDS };
}
/** Melempar error bila token tidak valid / kedaluwarsa. Hanya HS256 yang diterima. */
export function verifyToken(token) {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof decoded === 'string')
        throw new Error('Payload token tidak valid');
    const { admin_id, role, username, jti, iat, exp } = decoded;
    if (typeof admin_id !== 'string' ||
        typeof username !== 'string' ||
        typeof jti !== 'string' ||
        typeof iat !== 'number' ||
        typeof exp !== 'number' ||
        !isRole(role)) {
        throw new Error('Payload token tidak lengkap');
    }
    return { admin_id, role, username, jti, iat, exp };
}
//# sourceMappingURL=jwt.js.map