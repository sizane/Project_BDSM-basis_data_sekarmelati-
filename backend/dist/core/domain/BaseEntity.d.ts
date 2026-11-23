/**
 * BaseEntity: Kelas dasar abstrak untuk semua entitas domain.
 * Menerapkan ENKAPSULASI melalui private fields (#id, #createdAt)
 * dan method akses publik (getter / setter) dengan validasi data.
 */
export declare abstract class BaseEntity {
    #private;
    constructor(id: string, createdAt?: Date, updatedAt?: Date);
    get id(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    protected set updatedAt(date: Date);
    protected touch(): void;
    /**
     * Method abstrak yang wajib diimplementasikan atau di-override oleh kelas turunan.
     */
    abstract toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=BaseEntity.d.ts.map