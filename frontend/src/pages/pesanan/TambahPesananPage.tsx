import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Field } from '../../components/ui/Field';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { getErrorMessage, getFieldErrors } from '../../lib/errors';
import { formatRupiah, todayWIB } from '../../lib/format';
import { api } from '../../services/api';
import type { ApiResponse, CreatePesananPayload, CreatePesananResult } from '../../types/api';

const MAX_RUPIAH = 9_999_999_999;
type Errors = Partial<Record<'nama_customer' | 'no_kontak' | 'rincian_pesanan' | 'kuantitas' | 'harga_per_item' | 'dp' | 'tenggat', string>>;

/** SCR-04. Satu pesanan = satu item (sp_catat_pesanan_baru baru menerima satu item). */
export function TambahPesananPage() {
  const navigate = useNavigate();
  const today = todayWIB();
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [rincian, setRincian] = useState('');
  const [kuantitas, setKuantitas] = useState('');
  const [harga, setHarga] = useState<number | null>(null);
  const [dp, setDp] = useState<number | null>(null);
  const [tenggat, setTenggat] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const qty = Number(kuantitas);
  const total = Number.isInteger(qty) && qty > 0 && harga ? qty * harga : 0;
  const sisa = Math.max(0, total - (dp ?? 0));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!nama.trim() || nama.trim().length > 100) e.nama_customer = 'Nama pelanggan wajib diisi (maks. 100 karakter)';
    if (!/^\+?[0-9]{8,15}$/.test(kontak.replace(/[\s\-().]/g, ''))) e.no_kontak = 'Nomor kontak wajib diisi dengan benar';
    if (!rincian.trim() || rincian.trim().length > 200) e.rincian_pesanan = 'Rincian pesanan wajib diisi (maks. 200 karakter)';
    if (!Number.isInteger(qty) || qty <= 0) e.kuantitas = 'Kuantitas harus lebih dari 0';
    if (!harga || harga <= 0) e.harga_per_item = 'Harga per item harus lebih dari Rp 0';
    else if (total > MAX_RUPIAH) e.harga_per_item = 'Nominal melebihi batas yang diizinkan.';
    if (dp !== null && dp > total && total > 0) e.dp = 'DP tidak boleh negatif atau melebihi total harga';
    if (!tenggat) e.tenggat = 'Tenggat pesanan wajib diisi';
    else if (tenggat < today) e.tenggat = 'Tenggat tidak boleh sebelum tanggal masuk';
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (saving) return;
    setServerError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: CreatePesananPayload = {
      nama_customer: nama.trim(),
      no_kontak: kontak.trim(),
      items: [{ rincian_pesanan: rincian.trim(), kuantitas: qty, harga_per_item: harga ?? 0 }],
      dp: dp ?? 0,
      tenggat,
    };
    setSaving(true);
    try {
      const res = await api.post<ApiResponse<CreatePesananResult>>('/pesanan', payload);
      const hasil = res.data.data;
      navigate(`/pesanan/${hasil.pesanan_id}`, {
        state: { flash: `Pesanan ${hasil.no_pesanan} berhasil disimpan.` },
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
        <h2>Tambah Pesanan</h2>
        <Link to="/pesanan" className="btn btn-secondary">Kembali</Link>
      </div>

      {serverError && <Alert kind="error">{serverError}</Alert>}

      <form className="card form-card" onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <Field label="Nama pelanggan" error={errors.nama_customer}>
            {(id) => <input id={id} className="form-input" maxLength={100} value={nama} onChange={(e) => setNama(e.target.value)} />}
          </Field>
          <Field label="Nomor kontak" error={errors.no_kontak} hint="Contoh: 081234567890">
            {(id) => <input id={id} className="form-input" type="tel" inputMode="tel" value={kontak} onChange={(e) => setKontak(e.target.value)} />}
          </Field>
        </div>

        <Field label="Rincian pesanan" error={errors.rincian_pesanan}>
          {(id) => <textarea id={id} className="form-textarea" rows={3} maxLength={200} value={rincian} onChange={(e) => setRincian(e.target.value)} />}
        </Field>

        <div className="form-row">
          <Field label="Kuantitas" error={errors.kuantitas}>
            {(id) => <input id={id} className="form-input" type="number" min={1} step={1} value={kuantitas} onChange={(e) => setKuantitas(e.target.value)} />}
          </Field>
          <Field label="Harga per item" error={errors.harga_per_item}>
            {(id) => <MoneyInput id={id} value={harga} onChange={setHarga} invalid={Boolean(errors.harga_per_item)} />}
          </Field>
        </div>

        <div className="form-row">
          <Field label="DP (opsional)" error={errors.dp}>
            {(id) => <MoneyInput id={id} value={dp} onChange={setDp} invalid={Boolean(errors.dp)} />}
          </Field>
          <Field label="Tenggat pesanan" error={errors.tenggat}>
            {(id) => <input id={id} className="form-input" type="date" min={today} value={tenggat} onChange={(e) => setTenggat(e.target.value)} />}
          </Field>
        </div>

        <dl className="summary-box" aria-live="polite">
          <div><dt>Total harga</dt><dd>{formatRupiah(total)}</dd></div>
          <div><dt>Sisa piutang</dt><dd>{formatRupiah(sisa)}</dd></div>
        </dl>

        <div className="toolbar">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan pesanan'}</button>
          <Link to="/pesanan" className="btn btn-secondary">Batal</Link>
        </div>
      </form>
    </div>
  );
}
