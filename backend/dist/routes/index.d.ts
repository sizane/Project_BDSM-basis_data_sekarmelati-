/**
 * Seluruh endpoint di bawah /api/v1.
 * AC-04: kecuali /auth/login (public) dan /auth/logout (authenticate dipasang di router auth),
 * semua modul dilindungi authenticate di sini sehingga tidak ada modul yang bisa lupa memasangnya.
 * Pembatasan role (RBAC, AC-07) dipasang per route lewat checkRole di masing-masing modul.
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=index.d.ts.map