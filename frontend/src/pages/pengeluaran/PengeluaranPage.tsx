import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Pagination } from '../../components/ui/Pagination';
import { StateRow } from '../../components/ui/StateRow';
import { useApiGet } from '../../hooks/useApiGet';
import { formatRupiah, formatTanggal } from '../../lib/format';
import type { PengeluaranRow } from '../../types/api';

/** SCR-09: daftar pengeluaran operasional. */
export function PengeluaranPage() {
  const flash = (useLocation().state as { flash?: string } | null)?.flash;
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useApiGet<PengeluaranRow[]>('/pengeluaran', { page, per_page: 15 });
  const rows = data ?? [];

  return (
    <div>
      <div className="page-header">
        <h2>Pengeluaran Operasional</h2>
        <Link to="/pengeluaran/tambah" className="btn btn-primary">Tambah pengeluaran</Link>
      </div>

      {flash && <Alert kind="success">{flash}</Alert>}

      <div className="table-container card flush">
        <table className="data-table">
          <thead>
            <tr><th>Tanggal</th><th>Kategori</th><th className="num">Nominal</th><th>Keterangan</th></tr>
          </thead>
          <tbody>
            <StateRow cols={4} loading={loading} error={error} onRetry={reload}
              isEmpty={rows.length === 0} emptyText="Belum ada pengeluaran tercatat." />
            {!loading && !error && rows.map((r) => (
              <tr key={r.pengeluaran_id}>
                <td>{formatTanggal(r.tanggal_pengeluaran)}</td>
                <td>{r.kategori_pengeluaran}</td>
                <td className="num">{formatRupiah(r.jumlah)}</td>
                <td>{r.keterangan ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} page={page} onPage={setPage} label="pengeluaran" />
    </div>
  );
}
