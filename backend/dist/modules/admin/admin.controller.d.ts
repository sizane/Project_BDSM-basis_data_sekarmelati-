import type { Request, Response } from 'express';
/**
 * AdminController: Controller berbasis OOP untuk modul Admin.
 */
export declare class AdminController {
    list: (req: Request, res: Response) => Promise<void>;
    detail: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    updateRole: (req: Request, res: Response) => Promise<void>;
}
export declare const adminController: AdminController;
export declare const list: (req: Request, res: Response) => Promise<void>;
export declare const detail: (req: Request, res: Response) => Promise<void>;
export declare const create: (req: Request, res: Response) => Promise<void>;
export declare const updateRole: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map