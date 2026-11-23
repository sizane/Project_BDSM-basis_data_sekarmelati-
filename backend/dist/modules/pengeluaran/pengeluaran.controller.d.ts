import type { Request, Response } from 'express';
import { PengeluaranService } from './pengeluaran.service';
/**
 * PengeluaranController: Controller berbasis OOP untuk modul Pengeluaran.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan PengeluaranService.
 * - ASOSIASI: Menggunakan SessionContext.
 * - ASYNC: Asynchronous request handling.
 */
export declare class PengeluaranController {
    private readonly service;
    constructor(service?: PengeluaranService);
    private extractSession;
    list: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
}
export declare const pengeluaranController: PengeluaranController;
export declare const list: (req: Request, res: Response) => Promise<void>;
export declare const create: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=pengeluaran.controller.d.ts.map