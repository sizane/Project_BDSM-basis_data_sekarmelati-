/**
 * BaseEntity: Kelas dasar abstrak untuk semua entitas domain.
 * Menerapkan ENKAPSULASI melalui private fields (#id, #createdAt)
 * dan method akses publik (getter / setter) dengan validasi data.
 */
export class BaseEntity {
    #id;
    #createdAt;
    #updatedAt;
    constructor(id, createdAt = new Date(), updatedAt = new Date()) {
        if (!id || id.trim() === '') {
            throw new Error('ID entitas tidak boleh kosong.');
        }
        this.#id = id.trim();
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
    }
    // --- ENKAPSULASI: Getter untuk mengakses properti privat ---
    get id() {
        return this.#id;
    }
    get createdAt() {
        return new Date(this.#createdAt.getTime());
    }
    get updatedAt() {
        return new Date(this.#updatedAt.getTime());
    }
    // --- ENKAPSULASI: Setter dengan validasi internal ---
    set updatedAt(date) {
        if (date < this.#createdAt) {
            throw new Error('Tanggal pembaruan tidak boleh lebih awal dari tanggal pembuatan.');
        }
        this.#updatedAt = date;
    }
    touch() {
        this.#updatedAt = new Date();
    }
}
//# sourceMappingURL=BaseEntity.js.map