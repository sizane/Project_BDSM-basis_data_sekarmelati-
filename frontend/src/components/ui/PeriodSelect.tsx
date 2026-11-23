import { NAMA_BULAN } from '../../lib/format';

interface Props {
  bulan: number;
  tahun: number;
  onChange: (next: { bulan: number; tahun: number }) => void;
}

/** Pilihan bulan (1-12) dan tahun (5 tahun terakhir s.d. tahun ini) untuk laporan. */
export function PeriodSelect({ bulan, tahun, onChange }: Props) {
  const tahunIni = new Date(Date.now() + 7 * 3600 * 1000).getUTCFullYear();
  const daftarTahun = Array.from({ length: 6 }, (_, i) => tahunIni - i);
  if (!daftarTahun.includes(tahun)) daftarTahun.push(tahun);
  return (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="periode-bulan">Bulan</label>
        <select id="periode-bulan" className="form-select" value={bulan} onChange={(e) => onChange({ bulan: Number(e.target.value), tahun })}>
          {NAMA_BULAN.map((nama, i) => (
            <option key={nama} value={i + 1}>{nama}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="periode-tahun">Tahun</label>
        <select id="periode-tahun" className="form-select" value={tahun} onChange={(e) => onChange({ bulan, tahun: Number(e.target.value) })}>
          {daftarTahun.sort((a, b) => b - a).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </>
  );
}
