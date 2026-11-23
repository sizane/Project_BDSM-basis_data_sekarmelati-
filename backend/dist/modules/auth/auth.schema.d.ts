import { z } from 'zod';
/** POST /auth/login (TSD 3.3a): username wajib, password wajib min 8. */
export declare const loginBody: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginBody = z.infer<typeof loginBody>;
//# sourceMappingURL=auth.schema.d.ts.map