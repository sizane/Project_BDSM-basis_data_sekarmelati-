import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/routes/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { RiwayatAktivitasPage } from '../pages/audit/RiwayatAktivitasPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { EksporLaporanPage } from '../pages/laporan/EksporLaporanPage';
import { LabaRugiPage } from '../pages/laporan/LabaRugiPage';
import { LevelUtangPage } from '../pages/laporan/LevelUtangPage';
import { CatatPembayaranPage } from '../pages/pesanan/CatatPembayaranPage';
import { DetailPesananPage } from '../pages/pesanan/DetailPesananPage';
import { PesananListPage } from '../pages/pesanan/PesananListPage';
import { TambahPesananPage } from '../pages/pesanan/TambahPesananPage';
import { PengeluaranPage } from '../pages/pengeluaran/PengeluaranPage';
import { TambahPengeluaranPage } from '../pages/pengeluaran/TambahPengeluaranPage';
import { PiutangPage } from '../pages/piutang/PiutangPage';
import { RiwayatTransaksiPage } from '../pages/transaksi/RiwayatTransaksiPage';

/** Rute mengikuti TSD 3.1 (Screen Inventory). */
export function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pesanan" element={<PesananListPage />} />
              <Route path="/pesanan/tambah" element={<TambahPesananPage />} />
              <Route path="/pesanan/:id" element={<DetailPesananPage />} />
              <Route path="/pesanan/:id/pembayaran" element={<CatatPembayaranPage />} />
              <Route path="/piutang" element={<PiutangPage />} />
              <Route path="/riwayat-transaksi" element={<RiwayatTransaksiPage />} />
              <Route path="/pengeluaran" element={<PengeluaranPage />} />
              <Route path="/pengeluaran/tambah" element={<TambahPengeluaranPage />} />
              <Route path="/laporan/laba-rugi" element={<LabaRugiPage />} />
              <Route path="/laporan/ekspor" element={<EksporLaporanPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Pemilik']} />}>
            <Route element={<MainLayout />}>
              <Route path="/laporan/level-utang" element={<LevelUtangPage />} />
              <Route path="/riwayat-aktivitas" element={<RiwayatAktivitasPage />} />
            </Route>
          </Route>

          {/* Alamat lama sebelum rute disamakan dengan TSD */}
          <Route path="/pesanan/baru" element={<Navigate to="/pesanan/tambah" replace />} />
          <Route path="/laporan" element={<Navigate to="/laporan/laba-rugi" replace />} />
          <Route path="/audit-logs" element={<Navigate to="/riwayat-aktivitas" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
