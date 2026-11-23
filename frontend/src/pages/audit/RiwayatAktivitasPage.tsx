import { Fragment, useState, type FormEvent } from 'react';
import { Pagination } from '../../components/ui/Pagination';
import { StateRow } from '../../components/ui/StateRow';
import { useApiGet } from '../../hooks/useApiGet';
import { formatWaktu } from '../../lib/format';
import type { AuditLogItem } from '../../types/api';

const JENIS = [
  ['Tambah', 'Tambah'], ['Edit', 'Edit'], ['Hapus', 'Hapus'],
  ['Login', 'Login'], ['Logout', 'Logout'], ['AksesDitolak', 'Akses ditolak'],
] as const;

const LABEL_TINDAKAN: Record<string, string> = {
  ORDER_CREATED: 'Pesanan dibuat',
  ORDER_UPDATED: 'Pesanan diperbarui',
  PAYMENT_CREATED: 'Pembayaran dicatat',
  EXPENSE_CREATED: 'Pengeluaran dicatat',
  LOGIN_SUCCESS: 'Login berhasil',
  LOGIN_FAILED: 'Login gagal',
  LOGIN_LOCKED: 'Akun terkunci',
  LOGOUT: 'Logout',
  ACCESS_DENIED: 'Akses ditolak',
  ADMIN_CREATED: 'Akun admin dibuat',
  ROLE_CHANGED: 'Peran admin diubah',
};

/** SCR-13 (khusus Pemilik): audit log hanya-baca, terbaru lebih dulu. */
export function RiwayatAktivitasPage() {
  const [awal, setAwal] = useState('');
  const [akhir, setAkhir] = useState('');
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState('');
  const [filter, setFilter] = useState({ rentang: '', nama: '', jenis: '' });
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);

  const { data, meta, loading, error, reload } = useApiGet<AuditLogItem[]>('/audit-logs', {
    rentang_tanggal: filter.rentang, nama_pengguna: filter.nama, jenis_tindakan: filter.jenis, page, per_page: 20,
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
    setOpen(null);
    setFilter({ rentang: awal || akhir ? `${awal},${akhir}` : '', nama: nama.trim(), jenis });
  };

  return (
    <div>
      <div className="page-header"><h2>Riwayat Aktivitas</h2></div>

      <form className="card form-card" onSubmit={onSearch} role="search" noValidate>
        <div className="form-row four">
          <div className="form-group">
            <label className="form-label" htmlFor="au-awal">Tanggal awal</label>
            <input id="au-awal" type="date" className="form-input" value={awal} onChange={(e) => setAwal(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="au-akhir">Tanggal akhir</label>
            <input id="au-akhir" type="date" className="form-input" value={akhir} onChange={(e) => setAkhir(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="au-nama">Nama pengguna</label>
            <input id="au-nama" className="form-input" maxLength={50} value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="au-jenis">Jenis tindakan</label>
            <select id="au-jenis" className="form-select" value={jenis} onChange={(e) => setJenis(e.target.value)}>
              <option value="">Semua tindakan</option>
              {JENIS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
        </div>
        {rangeError && <div className="form-error" role="alert" style={{ marginBottom: '0.75rem' }}>{rangeError}</div>}
        <button type="submit" className="btn btn-primary">Terapkan filter</button>
      </form>

      <div className="table-container card flush">
        <table className="data-table">
          <thead>
            <tr><th>Waktu (WIB)</th><th>Pengguna</th><th>Tindakan</th><th>Modul</th><th>IP</th><th><span className="sr-only">Detail</span></th></tr>
          </thead>
          <tbody>
            <StateRow cols={6} loading={loading} error={error} onRetry={reload} isEmpty={rows.length === 0}
              emptyText="Tidak ada riwayat aktivitas yang ditemukan pada kriteria tersebut." />
            {!loading && !error && rows.map((r) => {
              const hasDetail = r.old_values !== null || r.new_values !== null;
              return (
                <Fragment key={r.log_id}>
                  <tr>
                    <td>{formatWaktu(r.created_at)}</td>
                    <td>{r.nama_pengguna}</td>
                    <td>{LABEL_TINDAKAN[r.action_type] ?? r.action_type}</td>
                    <td>{r.resource_type ?? '-'}</td>
                    <td>{r.ip_address}</td>
                    <td>
                      {hasDetail && (
                        <button type="button" className="btn btn-secondary btn-sm" aria-expanded={open === r.log_id}
                          onClick={() => setOpen(open === r.log_id ? null : r.log_id)}>
                          {open === r.log_id ? 'Tutup' : 'Detail'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {open === r.log_id && (
                    <tr className="detail-row">
                      <td colSpan={6}>
                        {r.old_values !== null && (<><strong>Sebelum</strong><pre>{JSON.stringify(r.old_values, null, 2)}</pre></>)}
                        {r.new_values !== null && (<><strong>Sesudah</strong><pre>{JSON.stringify(r.new_values, null, 2)}</pre></>)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} page={page} onPage={setPage} label="aktivitas" />
    </div>
  );
}
