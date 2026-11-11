import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import adminRoutes from '../modules/admin/admin.routes';
import authRoutes from '../modules/auth/auth.routes';
import pesananRoutes from '../modules/pesanan/pesanan.routes';
// import auditRoutes from '../modules/audit-log/audit.routes';
// import dashboardRoutes from '../modules/dashboard/dashboard.routes';
// import laporanRoutes from '../modules/laporan/laporan.routes';
// import pengeluaranRoutes from '../modules/pengeluaran/pengeluaran.routes';
// import piutangRoutes from '../modules/piutang/piutang.routes';
// import transaksiRoutes from '../modules/transaksi/transaksi.routes';

/**
 * Seluruh endpoint di bawah /api/v1.
 * AC-04: kecuali /auth/login (public) dan /auth/logout (authenticate dipasang di router auth),
 * semua modul dilindungi authenticate di sini sehingga tidak ada modul yang bisa lupa memasangnya.
 * Pembatasan role (RBAC, AC-07) dipasang per route lewat checkRole di masing-masing modul.
 */
const router = Router();

router.use('/auth', authRoutes);

router.use('/admins', authenticate, adminRoutes);
router.use('/pesanan', authenticate, pesananRoutes);
// router.use('/dashboard', authenticate, dashboardRoutes);
// router.use('/piutang', authenticate, piutangRoutes);
// router.use('/riwayat-transaksi', authenticate, transaksiRoutes);
// router.use('/pengeluaran', authenticate, pengeluaranRoutes);
// router.use('/laporan', authenticate, laporanRoutes);
// TSD 3.2 menulis /admin/audit-logs, TSD 3.3 menulis /audit-logs: keduanya masuk.
// router.use(['/audit-logs', '/admin/audit-logs'], authenticate, auditRoutes);

export default router;
