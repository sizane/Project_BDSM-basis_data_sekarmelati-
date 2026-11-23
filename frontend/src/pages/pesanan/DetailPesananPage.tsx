import { Link, useLocation, useParams } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badges';
import { useApiGet } from '../../hooks/useApiGet';
import { formatRupiah, formatTanggal } from '../../lib/format';
import type { PesananDetail } from '../../types/api';

/** SCR-05: nota pesanan (hanya baca). Pembayaran dicatat di SCR-06. */
export function DetailPesananPage() {
  const { id } = useParams<{ id: string }>();
  const flash = (useLocation().state as { flash?: string } | null)?.flash;
  const { data: d, loading, error, reload } = useApiGet<PesananDetail>(`/pesanan/${id}`);

  if (loading) return <div>Memuat detail pesanan...</div>;
  if (error || !d) {
    return (
      <div>
        <Alert kind="error" onRetry={reload}>{error ?? 'Pesanan tidak ditemukan.'}</Alert>
        <Link to="/pesanan" className="btn btn-secondary">Kembali ke daftar pesanan</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Nota Pesanan {d.no_pesanan}</h2>
          <p className="page-subtitle">Dicatat oleh {d.dicatat_oleh}</p>
        </div>
        <div className="toolbar no-print">
          {d.status_pesanan === 'Belum Lunas' && (
            <Link to={`/pesanan/${d.pesanan_id}/pembayaran`} className="btn btn-primary">Catat pembayaran</Link>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Cetak nota</button>
          <Link to="/pesanan" className="btn btn-secondary">Kembali</Link>
        </div>
      </div>

      {flash && <Alert kind="success">{flash}</Alert>}

      <div className="grid-3">
        <div className="card">
          <div className="stat-label">Pelanggan</div>
          <div className="stat-value stat-small">{d.customer.nama_customer}</div>
          <div className="muted">{d.customer.no_kontak}</div>
        </div>
        <div className="card">
          <div className="stat-label">Tagihan</div>
          <dl className="kv">
            <div><dt>Total</dt><dd>{formatRupiah(d.harga_total)}</dd></div>
            <div><dt>Dibayar</dt><dd>{formatRupiah(d.total_dibayar)}</dd></div>
            <div><dt>Sisa piutang</dt><dd className={d.sisa_piutang > 0 ? 'text-danger' : ''}>{formatRupiah(d.sisa_piutang)}</dd></div>
          </dl>
        </div>
        <div className="card">
          <div className="stat-label">Status</div>
          <div style={{ margin: '0.4rem 0' }}><StatusBadge status={d.status_pesanan} /></div>
          <dl className="kv">
            <div><dt>Tanggal masuk</dt><dd>{formatTanggal(d.tanggal_masuk)}</dd></div>
            <div><dt>Tenggat</dt><dd>{formatTanggal(d.tenggat)}</dd></div>
            {d.tanggal_lunas && <div><dt>Lunas pada</dt><dd>{formatTanggal(d.tanggal_lunas)}</dd></div>}
          </dl>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Rincian pesanan</h3>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Rincian</th><th className="num">Qty</th><th className="num">Harga per item</th><th className="num">Subtotal</th></tr></thead>
            <tbody>
              {d.items.map((item, i) => (
                <tr key={item.item_id ?? i}>
                  <td>{item.rincian_pesanan}</td>
                  <td className="num">{item.kuantitas}</td>
                  <td className="num">{formatRupiah(item.harga_per_item)}</td>
                  <td className="num">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Riwayat pembayaran</h3>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Tanggal</th><th>Jenis</th><th className="num">Nominal</th></tr></thead>
            <tbody>
              {d.riwayat_pembayaran.length === 0 ? (
                <tr><td colSpan={3} className="state-cell">Belum ada pembayaran tercatat.</td></tr>
              ) : (
                d.riwayat_pembayaran.map((p) => (
                  <tr key={p.pembayaran_id}>
                    <td>{formatTanggal(p.tanggal_bayar)}</td>
                    <td><span className="badge badge-rendah">{p.jenis_pembayaran}</span></td>
                    <td className="num">{formatRupiah(p.jumlah)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
