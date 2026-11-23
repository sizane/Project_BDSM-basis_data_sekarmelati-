import { z } from 'zod';
export declare const adminIdParams: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const listAdminsQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const createAdminBody: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    full_name: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    role: z.ZodEnum<{
        [x: string]: string;
    }>;
}, z.core.$strip>;
export declare const updateRoleBody: z.ZodObject<{
    role: z.ZodEnum<{
        [x: string]: string;
    }>;
}, z.core.$strip>;
export type CreateAdminBody = z.infer<typeof createAdminBody>;
export type UpdateRoleBody = z.infer<typeof updateRoleBody>;
export type ListAdminsQuery = z.infer<typeof listAdminsQuery>;
//# sourceMappingURL=admin.schema.d.ts.map