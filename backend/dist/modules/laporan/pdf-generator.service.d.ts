import type { LabaRugi, LevelUtangItem } from './laporan.service';
/** Nominal Rupiah dengan pemisah titik ribuan, contoh: Rp 150.000 (BR-25). */
export declare function formatRupiah(value: number): string;
export declare function generateLabaRugiPdf(data: LabaRugi, printedBy: string): Promise<Buffer>;
export declare function generateLevelUtangPdf(rows: LevelUtangItem[], printedBy: string, filterLevel?: string): Promise<Buffer>;
//# sourceMappingURL=pdf-generator.service.d.ts.map