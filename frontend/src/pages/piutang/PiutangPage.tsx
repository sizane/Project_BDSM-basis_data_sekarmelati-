import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/Badges';
import { StateRow } from '../../components/ui/StateRow';
import { useApiGet } from '../../hooks/useApiGet';
import { formatRupiah, formatTanggal, todayWIB } from '../../lib/format';
import type { PiutangRow } from '../../types/api';

/** SCR-07: pesanan berstatus Belum Lunas. */
export function PiutangPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('sisa_terbesar');
  const [page, setPage] = useState(1);
  const today = todayWIB();

  const { data, meta, loading, error, reload } = useApiGet<PiutangRow[]>('/piutang', { search, sort, page, per_page: 15 });
  const rows = data ?? [];

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <div className="page-header"><h2>Daftar Piutang</h2></div>

      <form className="card filters" onSubmit={onSearch} role="search">
        <input type="search" className="form-input" placeholder="Cari nama pelanggan atau no. pesanan"
          aria-label="Cari piutang" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className="form-select filter-select" aria-label="Urutkan" value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="sisa_terbesar">Sisa piutang terbesar</option>
          <option value="tenggat_terdekat">Tenggat terdekat</option>
        </select>
        <button type="submit" className="btn btn-secondary">Cari</button>
      </form>

      <div className="table-container card flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pelanggan</th><th>No. pesanan</th><th className="num">Total tagihan</th>
              <th className="num">Sisa piutang</th><th>Tenggat</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <StateRow cols={6} loading={loading} error={error} onRetry={reload}
              isEmpty={rows.length === 0} emptyText="Tidak ada piutang aktif saat ini." />
            {!loading && !error && rows.map((r) => {
              const lewat = r.tenggat < today;
              return (
                <tr key={r.pesanan_id} className="row-link" onClick={() => navigate(`/pesanan/${r.pesanan_id}`)}>
                  <td>
                    {r.nama_customer}
                    <div className="muted small">Total piutang pelanggan {formatRupiah(r.total_piutang_pelanggan)}</div>
                  </td>
                  <td><Link to={`/pesanan/${r.pesanan_id}`} onClick={(e) => e.stopPropagation()}><strong>{r.no_pesanan}</strong></Link></td>
                  <td className="num">{formatRupiah(r.total_tagihan)}</td>
                  <td className="num text-danger"><strong>{formatRupiah(r.sisa_piutang)}</strong></td>
                  <td>
                    {formatTanggal(r.tenggat)}
                    {lewat && <div className="text-danger small">Lewat tenggat</div>}
                  </td>
                  <td><StatusBadge status={r.status_pesanan} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} page={page} onPage={setPage} label="pesanan belum lunas" />
    </div>
  );
}
