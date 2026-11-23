import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Field } from '../../components/ui/Field';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { getErrorMessage, getFieldErrors } from '../../lib/errors';
import { formatRupiah, todayWIB } from '../../lib/format';
import { api } from '../../services/api';
import type { ApiResponse, CreatePengeluaranPayload, KategoriPengeluaran } from '../../types/api';

const KATEGORI: KategoriPengeluaran[] = ['Bahan Baku', 'Upah Jahit', 'Listrik', 'Lain-lain'];
const MAX_RUPIAH = 9_999_999_999;
type Errors = Partial<Record<'tanggal_pengeluaran' | 'kategori_pengeluaran' | 'jumlah' | 'keterangan', string>>;

/** SCR-10: tambah pengeluaran. Keterangan wajib bila kategori Lain-lain. */
export function TambahPengeluaranPage() {
  const navigate = useNavigate();
  const [tanggal, setTanggal] = useState(todayWIB());
  const [kategori, setKategori] = useState<KategoriPengeluaran | ''>('');
  const [jumlah, setJumlah] = useState<number | null>(null);
  const [keterangan, setKeterangan] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!tanggal) e.tanggal_pengeluaran = 'Tanggal pengeluaran wajib diisi';
    if (!kategori) e.kategori_pengeluaran = 'Pilih kategori biaya';
    if (!jumlah || jumlah <= 0) e.jumlah = 'Nominal pengeluaran wajib diisi dengan angka lebih dari 0';
    else if (jumlah > MAX_RUPIAH) e.jumlah = 'Nominal melebihi batas yang diizinkan.';
    if (kategori === 'Lain-lain' && !keterangan.trim()) e.keterangan = 'Keterangan wajib diisi untuk kategori Lain-lain';
    else if (keterangan.trim().length > 255) e.keterangan = 'Keterangan maksimal 255 karakter';
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (saving) return;
    setServerError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !kategori || !jumlah) return;

    const payload: CreatePengeluaranPayload = {
      tanggal_pengeluaran: tanggal,
      kategori_pengeluaran: kategori,
      jumlah,
      ...(keterangan.trim() ? { keterangan: keterangan.trim() } : {}),
    };
    setSaving(true);
    try {
      await api.post<ApiResponse<{ pengeluaran_id: string | null }>>('/pengeluaran', payload);
      navigate('/pengeluaran', { state: { flash: `Pengeluaran ${kategori} sebesar ${formatRupiah(jumlah)} berhasil disimpan.` } });
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
        <h2>Tambah Pengeluaran</h2>
        <Link to="/pengeluaran" className="btn btn-secondary">Kembali</Link>
      </div>

      {serverError && <Alert kind="error">{serverError}</Alert>}

      <form className="card form-card" onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <Field label="Tanggal pengeluaran" error={errors.tanggal_pengeluaran}>
            {(id) => <input id={id} type="date" className="form-input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />}
          </Field>
          <Field label="Kategori biaya" error={errors.kategori_pengeluaran}>
            {(id) => (
              <select id={id} className="form-select" value={kategori} onChange={(e) => setKategori(e.target.value as KategoriPengeluaran | '')}>
                <option value="">Pilih kategori</option>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            )}
          </Field>
        </div>
        <Field label="Nominal" error={errors.jumlah}>
          {(id) => <MoneyInput id={id} value={jumlah} onChange={setJumlah} invalid={Boolean(errors.jumlah)} />}
        </Field>
        <Field label={kategori === 'Lain-lain' ? 'Keterangan' : 'Keterangan (opsional)'} error={errors.keterangan}>
          {(id) => <textarea id={id} className="form-textarea" rows={3} maxLength={255} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />}
        </Field>

        <div className="toolbar">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan pengeluaran'}</button>
          <Link to="/pengeluaran" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </div>
  );
}
