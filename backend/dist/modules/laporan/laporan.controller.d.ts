import type { Request, Response } from 'express';
/**
 * LaporanController: Controller berbasis OOP untuk modul Laporan dan Ekspor PDF.
 */
export declare class LaporanController {
    labaRugi: (req: Request, res: Response) => Promise<void>;
    levelUtang: (req: Request, res: Response) => Promise<void>;
    exportPdf: (req: Request, res: Response) => Promise<void>;
}
export declare const laporanController: LaporanController;
export declare const labaRugi: (req: Request, res: Response) => Promise<void>;
export declare const levelUtang: (req: Request, res: Response) => Promise<void>;
export declare const exportPdf: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=laporan.controller.d.ts.map