import { DatabaseService } from './DatabaseService';

/**
 * BaseService: Kelas dasar abstrak untuk semua Service.
 * Memenuhi kriteria:
 * - AGREGASI (Aggregation / Weak "has-a"):
 *   BaseService menerima objek DatabaseService dari luar melalui konstruktor (Dependency Injection).
 *   Siklus hidup DatabaseService tidak terikat pada BaseService dan dapat digunakan bersama layanan lain.
 */
export abstract class BaseService {
  // --- AGREGASI: Menyimpan referensi ke instance DatabaseService yang diinjeksi ---
  protected readonly db: DatabaseService;

  constructor(db?: DatabaseService) {
    // Jika tidak diberikan dari luar, gunakan shared singleton
    this.db = db ?? DatabaseService.getInstance();
  }

  /**
   * Method abstrak yang wajib di-OVERRIDE oleh setiap service turunan.
   */
  public abstract getServiceName(): string;
}

