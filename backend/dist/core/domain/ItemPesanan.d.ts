/**
 * ItemPesanan: Bagian dari relasi KOMPOSISI di dalam kelas Pesanan.
 * Objek ItemPesanan tidak memiliki identitas independen di luar Pesanan;
 * siklus hidupnya sepenuhnya dikelola oleh Pesanan induknya.
 */
export declare class ItemPesanan {
    #private;
    constructor(nama: string, kuantitas: number, hargaSatuan: number);
    get nama(): string;
    get kuantitas(): number;
    get hargaSatuan(): number;
    hitungSubtotal(): number;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=ItemPesanan.d.ts.map