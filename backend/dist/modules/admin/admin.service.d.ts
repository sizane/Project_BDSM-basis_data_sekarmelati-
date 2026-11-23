import type { Request } from 'express';
import { type AssignableRole } from '../../constants/roles';
import type { CreateAdminBody, ListAdminsQuery } from './admin.schema';
export declare function listAdmins(query: ListAdminsQuery): Promise<{
    data: {
        admin_id: string;
        username: string;
        full_name: string;
        role: "Admin" | "Pemilik";
        is_active: boolean;
        last_login_at: string | null;
        created_at: string;
    }[];
    meta: import("../../types/api-response").PaginationMeta;
}>;
/** Pemilik boleh melihat semua admin; Admin hanya dirinya sendiri (prinsip least privilege). */
export declare function getAdmin(req: Request, id: string): Promise<{
    admin_id: string;
    username: string;
    full_name: string;
    role: "Admin" | "Pemilik";
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}>;
export declare function createAdmin(req: Request, body: CreateAdminBody): Promise<{
    admin_id: string;
    username: string;
    full_name: string;
    role: string;
}>;
export declare function updateRole(req: Request, id: string, role: AssignableRole): Promise<{
    admin_id: string;
    username: string;
    full_name: string;
    role: "Admin" | "Pemilik";
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}>;
//# sourceMappingURL=admin.service.d.ts.map