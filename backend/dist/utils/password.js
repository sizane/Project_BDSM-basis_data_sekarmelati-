import bcrypt from 'bcrypt';
import { env } from '../config/env';
/** bcrypt cost >= 12 (AC-05). Password plaintext tidak pernah disimpan atau di-log. */
export function hashPassword(plain) {
    return bcrypt.hash(plain, env.BCRYPT_COST);
}
export function comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
let dummyHashPromise = null;
/**
 * Dipanggil saat username tidak ditemukan agar waktu respons mirip login dengan
 * username valid (mencegah enumerasi username lewat timing).
 */
export async function compareAgainstDummy(plain) {
    dummyHashPromise ??= bcrypt.hash('dummy-password-for-timing', env.BCRYPT_COST);
    await bcrypt.compare(plain, await dummyHashPromise);
}
//# sourceMappingURL=password.js.map