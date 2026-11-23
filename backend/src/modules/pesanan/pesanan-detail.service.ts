import { AppError, ERRORS } from '../../constants/error-codes';
import { formatSqlDate } from '../../utils/date';
import {
  SqlPesananDetailRepository,
  type PesananDetailRepository,
} from './pesanan-detail.repository';

/**
 * =========================================================================
 * [OOP: KOMPOSISI (COMPOSITION)]
 * Class internal helper untuk kalkulasi pesanan.
 * Class ini diinstansiasi langsung di dalam PesananDetailService (lifecycle
 * terikat erat dengan service - hubungan "part-of").
 * =========================================================================
 */
export class PesananCalculator {
  // [OOP: ENKAPSULASI] - Property private disembunyikan dari akses luar
  private readonly minVal: number = 0;

  // [OOP: OVERLOADING] - Signature 1: hitung dari kuantitas dan harga satuan
  hitungSubtotal(kuantitas: number, hargaPerItem: number): number;
  // [OOP: OVERLOADING] - Signature 2: hitung akumulasi dari array item
  hitungSubtotal(items: Array<{ jumlah: number; harga_per_item: number | string }>): number;
  // Implementasi tunggal yang menangani kedua signature overload
  hitungSubtotal(
    arg1: number | Array<{ jumlah: number; harga_per_item: number | string }>,
    arg2?: number,
  ): number {
    if (Array.isArray(arg1)) {
      return arg1.reduce(
        (sum, item) => sum + item.jumlah * Number(item.harga_per_item),
        this.minVal,
      );
    }
    return Math.max(this.minVal, arg1 * (arg2 ?? 0));
  }

  // [OOP: ENKAPSULASI LOGIKA]
  hitungSisaPiutang(hargaTotal: number, totalDibayar: number): number {
    return Math.max(this.minVal, hargaTotal - totalDibayar);
  }
}

/**
 * =========================================================================
 * [OOP: ASOSIASI (ASSOCIATION)]
 * Class notifier audit independen.
 * Berhubungan dengan PesananDetailService melalui asosiasi "uses-a"
 * tanpa kepemilikan daur hidup (lifecycle).
 * =========================================================================
 */
export class PesananAuditNotifier {
  notifyAccess(pesananId: string, action: string): void {
    // Asosiasi: mencatat aktivitas pemanggilan pesanan
  }
}

export interface PesananDetailOptions {
  includePaymentHistory?: boolean;
}

export class PesananDetailService {
  // [OOP: ENKAPSULASI] - Field-field private terlindungi
  private readonly repository: PesananDetailRepository;
  private readonly calculator: PesananCalculator;
  private readonly notifier: PesananAuditNotifier;

  /**
   * [OOP: AGREGASI (AGGREGATION)]
   * Repository & Notifier diinjeksi via constructor (Dependency Injection).
   * Objek repository dan notifier dapat eksis secara independen di luar class ini.
   *
   * [OOP: KOMPOSISI (COMPOSITION)]
   * this.calculator diinstansiasi secara internal di dalam constructor.
   */
  constructor(
    repository: PesananDetailRepository = new SqlPesananDetailRepository(),
    notifier: PesananAuditNotifier = new PesananAuditNotifier(),
  ) {
    // 7. AGREGASI (has-a mandiri)
    this.repository = repository;
    this.notifier = notifier;

    // 6. KOMPOSISI (part-of terikat erat)
    this.calculator = new PesananCalculator();
  }

  // [OOP: ENKAPSULASI] - Private helper method
  private formatItem(item: {
    item_id: string;
    rincian_pesanan: string;
    jumlah: number;
    harga_per_item: number | string;
  }) {
    const kuantitas = item.jumlah;
    const hargaPerItem = Number(item.harga_per_item);
    return {
      item_id: item.item_id,
      rincian_pesanan: item.rincian_pesanan,
      kuantitas,
      harga_per_item: hargaPerItem,
      subtotal: this.calculator.hitungSubtotal(kuantitas, hargaPerItem),
    };
  }

  // [OOP: OVERLOADING] - Signature 1: pemanggilan standar dengan pesananId saja
  getPesananDetail(pesananId: string): Promise<Record<string, unknown>>;
  // [OOP: OVERLOADING] - Signature 2: pemanggilan dengan opsi tambahan
  getPesananDetail(
    pesananId: string,
    options: PesananDetailOptions,
  ): Promise<Record<string, unknown>>;
  /**
   * [OOP: ASYNCHRONOUS (ASYNC / AWAIT)]
   * [OOP: POLIMORFISME] - Memanggil this.repository.findDetail() secara polimorfis
   * baik terhadap SqlPesananDetailRepository maupun InMemoryPesananDetailRepository.
   * [OOP: ASOSIASI] - Memanggil this.notifier.notifyAccess()
   */
  async getPesananDetail(
    pesananId: string,
    options?: PesananDetailOptions,
  ): Promise<Record<string, unknown>> {
    // 8. ASOSIASI (uses-a)
    this.notifier.notifyAccess(pesananId, 'GET_DETAIL');

    // 2. POLIMORFISME & 5. ASYNC
    const { pesanan, items, pembayaran } =
      await this.repository.findDetail(pesananId);

    if (!pesanan) {
      throw new AppError(ERRORS.NOT_FOUND_PESANAN);
    }

    const totalDibayar = pembayaran.reduce(
      (sum, row) => sum + Number(row.jumlah),
      0,
    );
    const hargaTotal = Number(pesanan.harga_total);

    const includePayment = options?.includePaymentHistory ?? true;
    const paymentHistory = includePayment
      ? pembayaran.map((row) => ({
          pembayaran_id: row.pembayaran_id,
          tanggal_bayar: formatSqlDate(row.tanggal_bayar),
          jenis_pembayaran: row.jenis_pembayaran,
          jumlah: Number(row.jumlah),
        }))
      : [];

    return {
      pesanan_id: pesanan.pesanan_id,
      no_pesanan: pesanan.no_pesanan,
      tanggal_masuk: formatSqlDate(pesanan.tanggal_masuk),
      tenggat: formatSqlDate(pesanan.tenggat),
      tanggal_lunas: formatSqlDate(pesanan.tanggal_lunas),
      nama_customer: pesanan.nama_customer,
      customer: {
        customer_id: pesanan.customer_id,
        nama_customer: pesanan.nama_customer,
        no_kontak: pesanan.no_kontak,
      },
      dicatat_oleh: pesanan.dicatat_oleh,
      items: items.map((item) => this.formatItem(item)),
      harga_total: hargaTotal,
      total_dibayar: totalDibayar,
      // Menggunakan kalkulator terenkapsulasi
      sisa_piutang: this.calculator.hitungSisaPiutang(hargaTotal, totalDibayar),
      status_pesanan: pesanan.status_pesanan,
      riwayat_pembayaran: paymentHistory,
    };
  }
}
