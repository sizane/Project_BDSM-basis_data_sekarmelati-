import { z } from 'zod';
import { ASSIGNABLE_ROLES } from '../../constants/roles';
import { paginationShape, zText, zUuid } from '../../middlewares/validate';

const roleEnum = z.enum(ASSIGNABLE_ROLES, {
  errorMap: () => ({ message: 'Role harus Pemilik atau Admin' }),
});

export const adminIdParams = z.object({ id: zUuid('ID admin tidak valid') });

export const listAdminsQuery = z.object(paginationShape);

export const createAdminBody = z.object({
  username: z
    .string({ required_error: 'Username wajib diisi', invalid_type_error: 'Username wajib diisi' })
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[A-Za-z0-9._-]+$/, 'Username hanya boleh huruf, angka, titik, garis bawah, dan tanda hubung'),
  password: z
    .string({ required_error: 'Password wajib diisi', invalid_type_error: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    // bcrypt hanya memakai 72 byte pertama
    .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, { message: 'Password maksimal 72 byte' }),
  full_name: zText('Nama lengkap wajib diisi (maks. 100 karakter)', 100),
  role: roleEnum,
});

export const updateRoleBody = z.object({ role: roleEnum });

export type CreateAdminBody = z.infer<typeof createAdminBody>;
export type UpdateRoleBody = z.infer<typeof updateRoleBody>;
export type ListAdminsQuery = z.infer<typeof listAdminsQuery>;
