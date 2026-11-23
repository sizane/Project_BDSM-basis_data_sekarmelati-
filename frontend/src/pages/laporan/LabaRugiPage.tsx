import { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { PeriodSelect } from '../../components/ui/PeriodSelect';
import { useApiGet } from '../../hooks/useApiGet';
import { downloadPdf } from '../../lib/download';
import { getErrorMessage } from '../../lib/errors';
import { formatRupiah, NAMA_BULAN, periodeSekarang } from '../../lib/format';
import type { LabaRugi } from '../../types/api';

/** SCR-11: laba/rugi bulanan = pembayaran diterima - pengeluaran pada bulan itu. */
export function LabaRugiPage() {
  const [periode, setPeriode] = useState(periodeSekarang);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const { data, loading, error, reload } = useApiGet<LabaRugi>('/laporan/laba-rugi', periode);

  const kosong = data !== null && data.total_pemasukan === 0 && data.total_pengeluaran === 0;
  const rugi = (data?.laba_rugi_bersih ?? 0) < 0;

  const onExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      await downloadPdf('/laporan/laba-rugi/export', periode);
    } catch (err) {
      setExportError(getErrorMessage(err, 'Gagal membuat file dokumen laporan. Silakan coba kembali.'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Laporan Laba/Rugi</h2>
        <button type="button" className="btn btn-secondary" onClick={onExport} disabled={exporting || loading || Boolean(error)}>
          {exporting ? 'Membuat PDF...' : 'Unduh PDF'}
        </button>
      </div>

      <div className="card form-card">
        <div className="form-row">
          <PeriodSelect {...periode} onChange={setPeriode} />
        </div>
      </div>

      {error && <Alert kind="error" onRetry={reload}>{error}</Alert>}
      {exportError && <Alert kind="error">{exportError}</Alert>}
      {kosong && <Alert kind="info">Belum ada transaksi tercatat pada {NAMA_BULAN[periode.bulan - 1]} {periode.tahun}.</Alert>}

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Total pemasukan</div>
          <div className="stat-value">{loading ? '...' : formatRupiah(data?.total_pemasukan ?? 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total pengeluaran</div>
          <div className="stat-value">{loading ? '...' : formatRupiah(data?.total_pengeluaran ?? 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{rugi ? 'Rugi bersih' : 'Laba bersih'}</div>
          <div className="stat-value" style={{ color: rugi ? 'var(--danger-text)' : 'var(--status-lunas-text)' }}>
            {loading ? '...' : formatRupiah(data?.laba_rugi_bersih ?? 0)}
          </div>
        </div>
      </div>
      <p className="muted small">Pemasukan dihitung dari pembayaran yang diterima pada bulan tersebut, bukan dari harga total pesanan.</p>
    </div>
  );
}
