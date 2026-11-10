// --- backend/src/routes/index.ts ---
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';

const router = Router();

router.use('/auth', authRoutes);
// Daftarkan route modul lainnya di sini setelah dibuat:
// router.use('/dashboard', dashboardRoutes);
// router.use('/pesanan', pesananRoutes);
// router.use('/piutang', piutangRoutes);
// router.use('/riwayat-transaksi', transaksiRoutes);
// router.use('/pengeluaran', pengeluaranRoutes);
// router.use('/laporan', laporanRoutes);
// router.use('/audit-logs', auditRoutes);

export default router;