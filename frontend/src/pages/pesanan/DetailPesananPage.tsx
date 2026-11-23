import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { ApiResponse, PesananDetail } from '../../types/api';

export const DetailPesananPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<PesananDetail | null>(null);
  const [jumlahBayar, setJumlahBayar] = useState<number>(0);
  const [jenisBayar, setJenisBayar] = useState<'Cicilan' | 'Pelunasan'>('Cicilan');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadDetail = async () => {
    try {
      const res = await api.get<ApiResponse<PesananDetail>>(`/pesanan/${id}`);
      setDetail(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleBayarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const todayStr = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      await api.post(`/pesanan/${id}/pembayaran`, {
        tanggal_bayar: todayStr,
        jumlah: jumlahBayar,
        jenis_pembayaran: jenisBayar,
      });

      setSuccessMsg('Pembayaran berhasil dicatat!');
      setJumlahBayar(0);
      loadDetail();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Gagal mencatat pembayaran');
      }
    }
  };

  if (!detail) return <div>Memuat detail pesanan...</div>;

  return (
    <div>
      <h2>Nota Pesanan: {detail.no_pesanan}</h2>
      
      <div className="grid-3" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <div className="stat-label">Pelanggan</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{detail.customer.nama_customer}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No: {detail.customer.no_kontak}</div>
        </div>

        <div className="card">
          <div className="stat-label">Ringkasan Tagihan</div>
          <div>Total: <strong>Rp {detail.harga_total.toLocaleString('id-ID')}</strong></div>
          <div>Dibayar: <strong style={{ color: 'var(--primary)' }}>Rp {detail.total_dibayar.toLocaleString('id-ID')}</strong></div>
          <div>Sisa Piutang: <strong style={{ color: 'var(--danger-text)' }}>Rp {detail.sisa_piutang.toLocaleString('id-ID')}</strong></div>
        </div>

        <div className="card">
          <div className="stat-label">Status & Tenggat</div>
          <div style={{ margin: '0.4rem 0' }}>
            <span className={`badge ${detail.status_pesanan === 'Lunas' ? 'badge-lunas' : 'badge-belum-lunas'}`}>
              {detail.status_pesanan}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem' }}>Tenggat: {detail.tenggat}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Rincian Barang / Jahit</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rincian Barang</th>
              <th>Qty</th>
              <th>Harga / Item</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detail.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.rincian_pesanan}</td>
                <td>{item.kuantitas}</td>
                <td>Rp {item.harga_per_item.toLocaleString('id-ID')}</td>
                <td>Rp {((item.subtotal ?? (item.kuantitas * item.harga_per_item))).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title">Riwayat Pembayaran</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {detail.riwayat_pembayaran.map((p) => (
                <tr key={p.pembayaran_id}>
                  <td>{p.tanggal_bayar}</td>
                  <td><span className="badge badge-rendah">{p.jenis_pembayaran}</span></td>
                  <td>Rp {p.jumlah.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detail.status_pesanan === 'Belum Lunas' && (
          <div className="card">
            <h3 className="card-title">Catat Pembayaran</h3>
            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert" style={{ background: 'var(--status-lunas-bg)', color: 'var(--status-lunas-text)' }}>{successMsg}</div>}

            <form onSubmit={handleBayarSubmit}>
              <div className="form-group">
                <label className="form-label">Jenis Pembayaran</label>
                <select className="form-select" value={jenisBayar} onChange={(e) => setJenisBayar(e.target.value as 'Cicilan' | 'Pelunasan')}>
                  <option value="Cicilan">Cicilan</option>
                  <option value="Pelunasan">Pelunasan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nominal Pembayaran (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  value={jumlahBayar}
                  max={detail.sisa_piutang}
                  onChange={(e) => setJumlahBayar(Number(e.target.value))}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Simpan Pembayaran
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};