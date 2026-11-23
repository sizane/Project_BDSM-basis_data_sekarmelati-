import type { Request, Response } from 'express';
import { PesananCoreService } from '../../core/services/PesananCoreService';
/**
 * PesananController: Controller berbasis OOP untuk modul Pesanan.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan PesananCoreService via konstruktor / dependency injection.
 * - ASOSIASI: Mengonversi request Express menjadi SessionContext dan meneruskannya ke Service.
 * - ASYNC: Seluruh handler request bersifat asynchronous.
 */
export declare class PesananController {
    private readonly pesananService;
    constructor(service?: PesananCoreService);
    private extractSession;
    list: (req: Request, res: Response) => Promise<void>;
    detail: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    catatPembayaran: (req: Request, res: Response) => Promise<void>;
}
export declare const pesananController: PesananController;
export declare const list: (req: Request, res: Response) => Promise<void>;
export declare const detail: (req: Request, res: Response) => Promise<void>;
export declare const create: (req: Request, res: Response) => Promise<void>;
export declare const catatPembayaran: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=pesanan.controller.d.ts.map