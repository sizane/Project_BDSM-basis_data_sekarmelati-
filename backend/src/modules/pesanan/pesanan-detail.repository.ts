import { p, runQuery } from '../../config/database';

interface PesananRow {
  pesanan_id: string;
  no_pesanan: string;
  tanggal_masuk: Date;
  tenggat: Date;
  tanggal_lunas: Date | null;
  harga_total: number | string;
  status_pesanan: string;
  created_at: Date;
  customer_id: string;
  nama_customer: string;
  no_kontak: string;
  dicatat_oleh: string;
}

interface ItemPesananRow {
  item_id: string;
  rincian_pesanan: string;
  jumlah: number;
  harga_per_item: number | string;
}

interface PembayaranRow {
  pembayaran_id: string;
  tanggal_bayar: Date;
  jenis_pembayaran: string;
  jumlah: number | string;
}

export interface PesananDetailData {
  pesanan: PesananRow | null;
  items: ItemPesananRow[];
  pembayaran: PembayaranRow[];
}

export interface PesananDetailRepository {
  findDetail(pesananId: string): Promise<PesananDetailData>;
}

type PesananDetailRecordsets = [
  PesananRow[] | undefined,
  ItemPesananRow[] | undefined,
  PembayaranRow[] | undefined,
];

export class SqlPesananDetailRepository implements PesananDetailRepository {
  async findDetail(pesananId: string): Promise<PesananDetailData> {
    const result = await runQuery<PesananRow | ItemPesananRow | PembayaranRow>(
      `SELECT p.pesanan_id, p.no_pesanan, p.tanggal_masuk, p.tenggat, p.tanggal_lunas, p.harga_total,
              p.status_pesanan, p.created_at,
              c.customer_id, c.nama_customer, c.no_kontak,
              a.full_name AS dicatat_oleh
         FROM dbo.pesanan p
         JOIN dbo.customers c ON c.customer_id = p.customer_id
         JOIN dbo.admins a ON a.admin_id = p.admin_id
        WHERE p.pesanan_id = @id;

       SELECT item_id, rincian_pesanan, jumlah, harga_per_item
         FROM dbo.item_pesanan
        WHERE pesanan_id = @id
        ORDER BY rincian_pesanan;

       SELECT pembayaran_id, tanggal_bayar, jenis_pembayaran, jumlah
         FROM dbo.pembayaran
        WHERE pesanan_id = @id
        ORDER BY tanggal_bayar DESC, created_at DESC;`,
      [p.uuid('id', pesananId)],
    );

    // SQL Server mengembalikan tiga recordset dengan bentuk baris berbeda.
    const [pesananRows, items, pembayaran] =
      result.recordsets as unknown as PesananDetailRecordsets;

    return {
      pesanan: pesananRows?.[0] ?? null,
      items: items ?? [],
      pembayaran: pembayaran ?? [],
    };
  }
}