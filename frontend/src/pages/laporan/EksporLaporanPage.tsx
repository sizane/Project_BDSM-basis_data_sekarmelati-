import { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { PeriodSelect } from '../../components/ui/PeriodSelect';
import { useAuth } from '../../context/AuthContext';
import { downloadPdf } from '../../lib/download';
import { getErrorMessage } from '../../lib/errors';
import { periodeSekarang } from '../../lib/format';

type Jenis = 'laba-rugi' | 'level-utang';

/** SCR-14: unduh laporan PDF. Laporan level utang hanya untuk Pemilik. */
export function EksporLaporanPage() {
  const { user } = useAuth();
  const pemilik = user?.role === 'Pemilik';
  const [jenis, setJenis] = useState<Jenis>('laba-rugi');
  const [periode, setPeriode] = useState(periodeSekarang);
  const [level, setLevel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onExport = async () => {
    setError(null);
    setDone(false);
    setBusy(true);
    try {
      if (jenis === 'laba-rugi') await downloadPdf('/laporan/laba-rugi/export', periode);
      else await downloadPdf('/laporan/level-utang/export', { level: level || undefined });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal membuat file dokumen laporan. Silakan coba kembali.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="page-header"><h2>Ekspor Laporan</h2></div>

      {error && <Alert kind="error">{error}</Alert>}
      {done && <Alert kind="success">Laporan berhasil dibuat dan diunduh.</Alert>}

      <div className="card form-card">
        <div className="form-group">
          <label className="form-label" htmlFor="ekspor-jenis">Jenis laporan</label>
          <select id="ekspor-jenis" className="form-select" value={jenis} onChange={(e) => setJenis(e.target.value as Jenis)}>
            <option value="laba-rugi">Laba/Rugi</option>
            {pemilik && <option value="level-utang">Level Utang</option>}
          </select>
        </div>

        {jenis === 'laba-rugi' ? (
          <div className="form-row"><PeriodSelect {...periode} onChange={setPeriode} /></div>
        ) : (
          <div className="form-group">
            <label className="form-label" htmlFor="ekspor-level">Level</label>
            <select id="ekspor-level" className="form-select" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">Semua level</option>
              {['Kritis', 'Tinggi', 'Sedang', 'Rendah'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}

        <button type="button" className="btn btn-primary" onClick={onExport} disabled={busy}>
          {busy ? 'Membuat PDF...' : 'Unduh PDF'}
        </button>
      </div>
    </div>
  );
}
