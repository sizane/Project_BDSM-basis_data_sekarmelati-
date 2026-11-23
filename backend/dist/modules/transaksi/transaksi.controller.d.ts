import type { Request, Response } from 'express';
import { TransaksiService } from './transaksi.service';
/**
 * TransaksiController: Controller berbasis OOP untuk modul Transaksi.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan TransaksiService via konstruktor.
 * - ASYNC: Asynchronous handler.
 */
export declare class TransaksiController {
    private readonly service;
    constructor(service?: TransaksiService);
    list: (req: Request, res: Response) => Promise<void>;
}
export declare const transaksiController: TransaksiController;
export declare const list: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=transaksi.controller.d.ts.map