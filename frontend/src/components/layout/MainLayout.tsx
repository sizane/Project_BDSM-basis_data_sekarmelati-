import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`;

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside className="sidebar no-print">
        <div className="sidebar-header">
          <h2>Sekar Melati</h2>
          <small style={{ color: '#94a3b8' }}>Keuangan & Konveksi</small>
        </div>
        <nav className="sidebar-nav" aria-label="Menu utama">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/pesanan" className={linkClass}>Pesanan</NavLink>
          <NavLink to="/piutang" className={linkClass}>Daftar Piutang</NavLink>
          <NavLink to="/riwayat-transaksi" className={linkClass}>Riwayat Transaksi</NavLink>
          <NavLink to="/pengeluaran" className={linkClass}>Pengeluaran</NavLink>
          <NavLink to="/laporan/laba-rugi" className={linkClass}>Laporan Laba/Rugi</NavLink>
          {user?.role === 'Pemilik' && (
            <>
              <NavLink to="/laporan/level-utang" className={linkClass}>Laporan Level Utang</NavLink>
              <NavLink to="/riwayat-aktivitas" className={linkClass}>Riwayat Aktivitas</NavLink>
            </>
          )}
          <NavLink to="/laporan/ekspor" className={linkClass}>Ekspor Laporan</NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar no-print">
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Sistem Keuangan CV Sekar Melati</div>
          <div className="user-profile">
            <span>{user?.full_name}</span>
            <span className="role-badge">{user?.role}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>Keluar</button>
          </div>
        </header>
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
