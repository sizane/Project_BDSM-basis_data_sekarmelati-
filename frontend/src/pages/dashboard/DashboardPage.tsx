import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { useApiGet } from '../../hooks/useApiGet';
import { formatRupiah, NAMA_BULAN } from '../../lib/format';
import type { DashboardSummary } from '../../types/api';

export function DashboardPage() {
  const { data, loading, error, reload } = useApiGet<DashboardSummary>('/dashboard/summary');
  const periode = data ? `${NAMA_BULAN[data.bulan - 1]} ${data.tahun}` : '';
  const rugi = (data?.total_laba_rugi_bulan_ini ?? 0) < 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          {periode && <p className="page-subtitle">Ringkasan bulan {periode}</p>}
        </div>
        <div className="toolbar">
          <Link to="/pesanan/tambah" className="btn btn-primary">Tambah pesanan</Link>
          <Link to="/pengeluaran/tambah" className="btn btn-secondary">Tambah pengeluaran</Link>
        </div>
      </div>

      {error && <Alert kind="error" onRetry={reload}>{error}</Alert>}

      <div className="grid-3">
        <Link to="/pesanan" className="stat-card stat-link">
          <div className="stat-label">Pesanan masuk bulan ini</div>
          <div className="stat-value">{loading ? '...' : (data?.total_pesanan_bulan_ini ?? 0)}</div>
        </Link>
        <Link to="/piutang" className="stat-card stat-link">
          <div className="stat-label">Total piutang aktif</div>
          <div className="stat-value">{loading ? '...' : formatRupiah(data?.total_piutang_aktif ?? 0)}</div>
        </Link>
        <Link to="/laporan/laba-rugi" className="stat-card stat-link">
          <div className="stat-label">{rugi ? 'Rugi bersih bulan ini' : 'Laba bersih bulan ini'}</div>
          <div className="stat-value" style={{ color: rugi ? 'var(--danger-text)' : 'var(--status-lunas-text)' }}>
            {loading ? '...' : formatRupiah(data?.total_laba_rugi_bulan_ini ?? 0)}
          </div>
        </Link>
      </div>
    </div>
  );
}
