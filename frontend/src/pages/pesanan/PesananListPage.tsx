import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { ApiResponse, PesananSummary } from '../../types/api';

export const PesananListPage: React.FC = () => {
  const [items, setItems] = useState<PesananSummary[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);

  const fetchPesanan = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PesananSummary[]>>('/pesanan', {
        params: { search, status_pesanan: status || undefined, page, per_page: 15 },
      });
      setItems(res.data.data);
      if (res.data.meta) {
        setMeta({ total: res.data.meta.total, last_page: res.data.meta.last_page });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPesanan();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPesanan();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Daftar Pesanan & Piutang</h2>
        <Link to="/pesanan/baru" className="btn btn-primary">
          + Tambah Pesanan Baru
        </Link>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari pelanggan atau no. pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-select" style={{ width: '200px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="Belum Lunas">Belum Lunas</option>
            <option value="Lunas">Lunas</option>
          </select>
          <button type="submit" className="btn btn-secondary">Cari</button>
        </form>
      </div>

      <div className="table-container card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Pesanan</th>
              <th>Pelanggan</th>
              <th>Tenggat</th>
              <th>Harga Total</th>
              <th>Dibayar</th>
              <th>Sisa Piutang</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>Belum ada data pesanan.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.pesanan_id}>
                  <td><strong>{row.no_pesanan}</strong></td>
                  <td>{row.nama_customer}</td>
                  <td>{row.tenggat}</td>
                  <td>Rp {row.harga_total.toLocaleString('id-ID')}</td>
                  <td>Rp {row.total_dibayar.toLocaleString('id-ID')}</td>
                  <td style={{ color: row.sisa_piutang > 0 ? 'var(--danger-text)' : 'inherit', fontWeight: row.sisa_piutang > 0 ? 600 : 400 }}>
                    Rp {row.sisa_piutang.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className={`badge ${row.status_pesanan === 'Lunas' ? 'badge-lunas' : 'badge-belum-lunas'}`}>
                      {row.status_pesanan}
                    </span>
                  </td>
                  <td>
                    <Link to={`/pesanan/${row.pesanan_id}`} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Total: {meta.total} pesanan</span>
        <div>
          <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ marginRight: '0.5rem' }}>
            Sebelumnya
          </button>
          <span>{page} / {meta.last_page}</span>
          <button className="btn btn-secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} style={{ marginLeft: '0.5rem' }}>
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
};