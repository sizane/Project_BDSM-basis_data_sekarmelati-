import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/Badges';
import { StateRow } from '../../components/ui/StateRow';
import { useApiGet } from '../../hooks/useApiGet';
import { formatRupiah, formatTanggal } from '../../lib/format';
import type { PesananSummary } from '../../types/api';

export function PesananListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, meta, loading, error, reload } = useApiGet<PesananSummary[]>('/pesanan', {
    search, status_pesanan: status, page, per_page: 15,
  });
  const rows = data ?? [];

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <div className="page-header">
        <h2>Daftar Pesanan</h2>
        <Link to="/pesanan/tambah" className="btn btn-primary">Tambah pesanan</Link>
      </div>

      <form className="card filters" onSubmit={onSearch} role="search">
        <input type="search" className="form-input" placeholder="Cari nama pelanggan atau no. pesanan"
          aria-label="Cari pesanan" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className="form-select filter-select" aria-label="Filter status" value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Semua status</option>
          <option value="Belum Lunas">Belum Lunas</option>
          <option value="Lunas">Lunas</option>
        </select>
        <button type="submit" className="btn btn-secondary">Cari</button>
      </form>

      <div className="table-container card flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. pesanan</th><th>Pelanggan</th><th>Tanggal masuk</th><th>Tenggat</th>
              <th className="num">Total</th><th className="num">Dibayar</th><th className="num">Sisa</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <StateRow cols={8} loading={loading} error={error} onRetry={reload}
              isEmpty={rows.length === 0} emptyText="Belum ada data pesanan." />
            {!loading && !error && rows.map((row) => (
              <tr key={row.pesanan_id} className="row-link" onClick={() => navigate(`/pesanan/${row.pesanan_id}`)}>
                <td><Link to={`/pesanan/${row.pesanan_id}`} onClick={(e) => e.stopPropagation()}><strong>{row.no_pesanan}</strong></Link></td>
                <td>{row.nama_customer}</td>
                <td>{formatTanggal(row.tanggal_masuk)}</td>
                <td>{formatTanggal(row.tenggat)}</td>
                <td className="num">{formatRupiah(row.harga_total)}</td>
                <td className="num">{formatRupiah(row.total_dibayar)}</td>
                <td className={`num ${row.sisa_piutang > 0 ? 'text-danger' : ''}`}>{formatRupiah(row.sisa_piutang)}</td>
                <td><StatusBadge status={row.status_pesanan} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} page={page} onPage={setPage} label="pesanan" />
    </div>
  );
}
