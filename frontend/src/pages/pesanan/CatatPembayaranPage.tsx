import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badges';
import { Field } from '../../components/ui/Field';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { useApiGet } from '../../hooks/useApiGet';
import { getErrorMessage, getFieldErrors } from '../../lib/errors';
import { formatRupiah, todayWIB } from '../../lib/format';
import { api } from '../../services/api';
import type { ApiResponse, CatatPembayaranResult, JenisPembayaran, PesananDetail } from '../../types/api';

type Errors = Partial<Record<'tanggal_bayar' | 'jumlah' | 'jenis_pembayaran', string>>;

/** SCR-06: catat pembayaran untuk satu pesanan. Sisa dan status dihitung ulang oleh server. */
export function CatatPembayaranPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: d, loading, error, reload } = useApiGet<PesananDetail>(`/pesanan/${id}`);

  const [tanggal, setTanggal] = useState(todayWIB());
  const [jumlah, setJumlah] = useState<number | null>(null);
  const [jenis, setJenis] = useState<JenisPembayaran>('Cicilan');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <div>Memuat data pesanan...</div>;
  if (error || !d) {
    return (
      <div>
        <Alert kind="error" onRetry={reload}>{error ?? 'Pesanan tidak ditemukan.'}</Alert>
        <Link to="/pesanan" className="btn btn-secondary">Kembali ke daftar pesanan</Link>
      </div>
    );
  }

  if (d.status_pesanan === 'Lunas' || d.sisa_piutang <= 0) {
    return (
      <div>
        <h2>Catat Pembayaran</h2>
        <Alert kind="info">Pesanan {d.no_pesanan} sudah lunas, tidak ada piutang yang perlu dibayar.</Alert>
        <Link to={`/pesanan/${d.pesanan_id}`} className="btn btn-secondary">Lihat nota</Link>
      </div>
    );
  }

  const sisaBaru = d.sisa_piutang - (jumlah ?? 0);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!tanggal) e.tanggal_bayar = 'Tanggal bayar wajib diisi';
    if (!jumlah || jumlah <= 0) e.jumlah = 'Nominal pembayaran harus lebih besar dari Rp 0';
    else if (jumlah > d.sisa_piutang) e.jumlah = 'Nominal pembayaran tidak boleh melebihi sisa piutang';
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (saving) return;
    setServerError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !jumlah) return;

    setSaving(true);
    try {
      const res = await api.post<ApiResponse<CatatPembayaranResult>>(`/pesanan/${d.pesanan_id}/pembayaran`, {
        tanggal_bayar: tanggal,
        jumlah,
        jenis_pembayaran: jenis,
      });
      const hasil = res.data.data;
      navigate(`/pesanan/${d.pesanan_id}`, {
        state: {
          flash: hasil.status_pesanan === 'Lunas'
            ? `Pembayaran ${formatRupiah(jumlah)} berhasil dicatat. Pesanan sekarang lunas.`
            : `Pembayaran ${formatRupiah(jumlah)} berhasil dicatat. Sisa piutang ${formatRupiah(hasil.sisa_piutang_baru)}.`,
        },
      });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setServerError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Catat Pembayaran</h2>
        <Link to={`/pesanan/${d.pesanan_id}`} className="btn btn-secondary">Kembali ke nota</Link>
      </div>

      <div className="card">
        <dl className="kv">
          <div><dt>Pesanan</dt><dd>{d.no_pesanan} <StatusBadge status={d.status_pesanan} /></dd></div>
          <div><dt>Pelanggan</dt><dd>{d.customer.nama_customer}</dd></div>
          <div><dt>Sisa piutang saat ini</dt><dd className="text-danger">{formatRupiah(d.sisa_piutang)}</dd></div>
        </dl>
      </div>

      {serverError && <Alert kind="error">{serverError}</Alert>}

      <form className="card form-card" onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <Field label="Tanggal bayar" error={errors.tanggal_bayar}>
            {(fid) => <input id={fid} type="date" className="form-input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />}
          </Field>
          <Field label="Jenis pembayaran" error={errors.jenis_pembayaran}
            hint="Bila nominal sama dengan sisa piutang, sistem mencatatnya sebagai Pelunasan.">
            {(fid) => (
              <select id={fid} className="form-select" value={jenis} onChange={(e) => setJenis(e.target.value as JenisPembayaran)}>
                <option value="DP">DP</option>
                <option value="Cicilan">Cicilan</option>
                <option value="Pelunasan">Pelunasan</option>
              </select>
            )}
          </Field>
        </div>

        <Field label="Jumlah bayar" error={errors.jumlah}>
          {(fid) => (
            <div className="inline-field">
              <MoneyInput id={fid} value={jumlah} onChange={setJumlah} invalid={Boolean(errors.jumlah)} />
              <button type="button" className="btn btn-secondary" onClick={() => { setJumlah(d.sisa_piutang); setJenis('Pelunasan'); }}>
                Bayar sisa
              </button>
            </div>
          )}
        </Field>

        <dl className="summary-box" aria-live="polite">
          <div><dt>Sisa piutang baru</dt><dd className={sisaBaru < 0 ? 'text-danger' : ''}>{formatRupiah(sisaBaru)}</dd></div>
        </dl>

        <div className="toolbar">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan pembayaran'}</button>
          <Link to={`/pesanan/${d.pesanan_id}`} className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </div>
  );
}
