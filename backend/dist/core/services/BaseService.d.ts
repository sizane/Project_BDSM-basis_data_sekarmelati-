import { DatabaseService } from './DatabaseService';
/**
 * BaseService: Kelas dasar abstrak untuk semua Service.
 * Memenuhi kriteria:
 * - AGREGASI (Aggregation / Weak "has-a"):
 *   BaseService menerima objek DatabaseService dari luar melalui konstruktor (Dependency Injection).
 *   Siklus hidup DatabaseService tidak terikat pada BaseService dan dapat digunakan bersama layanan lain.
 */
export declare abstract class BaseService {
    protected readonly db: DatabaseService;
    constructor(db?: DatabaseService);
    /**
     * Method abstrak yang wajib di-OVERRIDE oleh setiap service turunan.
     */
    abstract getServiceName(): string;
}
//# sourceMappingURL=BaseService.d.ts.map