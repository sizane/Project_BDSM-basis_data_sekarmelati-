/**
 * BaseEntity: Kelas dasar abstrak untuk semua entitas domain.
 * Menerapkan ENKAPSULASI melalui private fields (#id, #createdAt)
 * dan method akses publik (getter / setter) dengan validasi data.
 */
export abstract class BaseEntity {
  #id: string;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(id: string, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
    if (!id || id.trim() === '') {
      throw new Error('ID entitas tidak boleh kosong.');
    }
    this.#id = id.trim();
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  // --- ENKAPSULASI: Getter untuk mengakses properti privat ---
  public get id(): string {
    return this.#id;
  }

  public get createdAt(): Date {
    return new Date(this.#createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.#updatedAt.getTime());
  }

  // --- ENKAPSULASI: Setter dengan validasi internal ---
  protected set updatedAt(date: Date) {
    if (date < this.#createdAt) {
      throw new Error('Tanggal pembaruan tidak boleh lebih awal dari tanggal pembuatan.');
    }
    this.#updatedAt = date;
  }

  protected touch(): void {
    this.#updatedAt = new Date();
  }

  /**
   * Method abstrak yang wajib diimplementasikan atau di-override oleh kelas turunan.
   */
  public abstract toJSON(): Record<string, unknown>;
}

