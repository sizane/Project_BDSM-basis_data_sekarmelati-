import { z } from 'zod';

/** POST /auth/login (TSD 3.3a): username wajib, password wajib min 8. */
export const loginBody = z.object({
  username: z
    .string({ required_error: 'Username wajib diisi', invalid_type_error: 'Username wajib diisi' })
    .trim()
    .min(1, 'Username wajib diisi')
    .max(50, 'Username maksimal 50 karakter'),
  password: z
    .string({ required_error: 'Password wajib diisi', invalid_type_error: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password terlalu panjang'),
});

export type LoginBody = z.infer<typeof loginBody>;
