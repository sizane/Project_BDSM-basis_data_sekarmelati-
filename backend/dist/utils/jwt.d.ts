import { type Role } from '../constants/roles';
/** Payload JWT (TSD 6.2): admin_id, role, username, jti, iat, exp (iat + 86400). */
export interface TokenPayload {
    admin_id: string;
    role: Role;
    username: string;
    jti: string;
    iat: number;
    exp: number;
}
export declare function signToken(input: {
    adminId: string;
    role: Role;
    username: string;
}): {
    token: string;
    jti: string;
    expiresIn: number;
};
/** Melempar error bila token tidak valid / kedaluwarsa. Hanya HS256 yang diterima. */
export declare function verifyToken(token: string): TokenPayload;
//# sourceMappingURL=jwt.d.ts.map