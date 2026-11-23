import { DatabaseService } from './DatabaseService';
/**
 * BaseService: Kelas dasar abstrak untuk semua Service.
 * Memenuhi kriteria:
 * - AGREGASI (Aggregation / Weak "has-a"):
 *   BaseService menerima objek DatabaseService dari luar melalui konstruktor (Dependency Injection).
 *   Siklus hidup DatabaseService tidak terikat pada BaseService dan dapat digunakan bersama layanan lain.
 */
export class BaseService {
    // --- AGREGASI: Menyimpan referensi ke instance DatabaseService yang diinjeksi ---
    db;
    constructor(db) {
        // Jika tidak diberikan dari luar, gunakan shared singleton
        this.db = db ?? DatabaseService.getInstance();
    }
}
//# sourceMappingURL=BaseService.js.map