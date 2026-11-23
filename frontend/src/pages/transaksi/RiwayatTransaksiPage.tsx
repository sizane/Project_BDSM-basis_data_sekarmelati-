import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/Badges';
import { StateRow } from '../../components/ui/StateRow';
import { useApiGet } from '../../hooks/useApiGet';
import { formatRupiah, formatTanggal } from '../../lib/format';
import type { RiwayatTransaksiRow } from '../../types/api';

/** SCR-08: pencarian riwayat transaksi (hanya baca). */
export function RiwayatTransaksiPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [awal, setAwal] = useState('');
  const [akhir, setAkhir] = useState('');
  const [filter, setFilter] = useState({ keyword: '', awal: '', akhir: '' });
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, meta, loading, error, reload } = useApiGet<RiwayatTransaksiRow[]>('/riwayat-transaksi', {
    keyword: filter.keyword, tanggal_awal: filter.awal, tanggal_akhir: filter.akhir, page, per_page: 15,
  });
  const rows = data ?? [];

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (awal && akhir && awal > akhir) {
      setRangeError('Tanggal awal tidak boleh melebihi tanggal akhir');
      return;
    }
    setRangeError(null);
    setPage(1);
    setFilter({ keyword: keyword.trim(), awal, akhir });
  };

  return (
    <div>
      <div className="page-header"><h2>Riwayat Transaksi</h2></div>

      <form className="card form-card" onSubmit={onSearch} role="search" noValidate>
        <div className="form-row three">
          <div className="form-group">
            <label className="form-label" htmlFor="rt-keyword">Kata kunci</label>
            <input id="rt-keyword" type="search" className="form-input" placeholder="Nama pelanggan atau no. pesanan"
              value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rt-awal">Tanggal awal</label>
            <input id="rt-awal" type="date" className="form-input" value={awal} onChange={(e) => setAwal(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rt-akhir">Tanggal akhir</label>
            <input id="rt-akhir" type="date" className="form-input" value={akhir} onChange={(e) => setAkhir(e.target.value)} />
          </div>
        </div>
        {rangeError && <div className="form-error" role="alert" style={{ marginBottom: '0.75rem' }}>{rangeError}</div>}
        <button type="submit" className="btn btn-primary">Cari</button>
      </form>

      <div className="table-container card flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th><th>No. pesanan</th><th>Pelanggan</th>
              <th className="num">Total</th><th className="num">Dibayar</th><th className="num">Sisa</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <StateRow cols={7} loading={loading} error={error} onRetry={reload}
              isEmpty={rows.length === 0} emptyText="Data riwayat transaksi tidak ditemukan." />
            {!loading && !error && rows.map((r) => (
              <tr key={r.pesanan_id} className="row-link" onClick={() => navigate(`/pesanan/${r.pesanan_id}`)}>
                <td>{formatTanggal(r.tanggal)}</td>
                <td><Link to={`/pesanan/${r.pesanan_id}`} onClick={(e) => e.stopPropagation()}><strong>{r.no_pesanan}</strong></Link></td>
                <td>{r.nama_customer}</td>
                <td className="num">{formatRupiah(r.total_harga)}</td>
                <td className="num">{formatRupiah(r.total_dibayar)}</td>
                <td className={`num ${r.sisa_piutang > 0 ? 'text-danger' : ''}`}>{formatRupiah(r.sisa_piutang)}</td>
                <td><StatusBadge status={r.status_pesanan} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} page={page} onPage={setPage} label="transaksi" />
    </div>
  );
}
