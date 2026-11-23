import { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { LevelBadge } from '../../components/ui/Badges';
import { Pagination } from '../../components/ui/Pagination';
import { StateRow } from '../../components/ui/StateRow';
import { useApiGet } from '../../hooks/useApiGet';
import { downloadPdf } from '../../lib/download';
import { getErrorMessage } from '../../lib/errors';
import { formatRupiah } from '../../lib/format';
import type { LevelUtangItem } from '../../types/api';

const LEVELS = ['Kritis', 'Tinggi', 'Sedang', 'Rendah'] as const;

/** SCR-12 (khusus Pemilik): pelanggan berutang diurutkan dari Kritis ke Rendah. */
export function LevelUtangPage() {
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const { data, meta, loading, error, reload } = useApiGet<LevelUtangItem[]>('/laporan/level-utang', { level, page, per_page: 15 });
  const rows = data ?? [];

  const onExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      await downloadPdf('/laporan/level-utang/export', { level: level || undefined });
    } catch (err) {
      setExportError(getErrorMessage(err, 'Gagal membuat file dokumen laporan. Silakan coba kembali.'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Laporan Level Utang</h2>
        <button type="button" className="btn btn-secondary" onClick={onExport} disabled={exporting || loading || Boolean(error)}>
          {exporting ? 'Membuat PDF...' : 'Unduh PDF'}
        </button>
      </div>

      <div className="card filters">
        <label className="form-label" htmlFor="filter-level" style={{ margin: 0 }}>Level</label>
        <select id="filter-level" className="form-select filter-select" value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">Semua level</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {exportError && <Alert kind="error">{exportError}</Alert>}

      <div className="table-container card flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pelanggan</th><th className="num">Total piutang</th><th>Frekuensi utang</th>
              <th className="num">Terlambat (kali)</th><th className="num">Terlambat (hari)</th><th>Level</th><th>Prioritas penagihan</th>
            </tr>
          </thead>
          <tbody>
            <StateRow cols={7} loading={loading} error={error} onRetry={reload} isEmpty={rows.length === 0}
              emptyText={level ? `Tidak ada pelanggan dengan level ${level}.` : 'Belum ada data piutang pelanggan untuk dianalisis.'} />
            {!loading && !error && rows.map((r) => (
              <tr key={r.customer_id}>
                <td>{r.nama_customer}</td>
                <td className="num">{formatRupiah(r.total_piutang)}</td>
                <td>{r.frekuensi_utang_kategori}</td>
                <td className="num">{r.total_keterlambatan}</td>
                <td className="num">{r.hari_keterlambatan}</td>
                <td><LevelBadge level={r.level_utang} /></td>
                <td>{r.prioritas_penagihan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted small">Level dan prioritas dihitung otomatis oleh sistem dan tidak menggantikan keputusan pemilik.</p>
      <Pagination meta={meta} page={page} onPage={setPage} label="pelanggan" />
    </div>
  );
}
