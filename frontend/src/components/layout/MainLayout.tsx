import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sekar Melati</h2>
          <small style={{ color: '#94a3b8' }}>Keuangan & Konveksi</small>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/pesanan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Pesanan & Pembayaran
          </NavLink>
          <NavLink to="/piutang" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Laporan Piutang
          </NavLink>
          <NavLink to="/pengeluaran" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Pengeluaran
          </NavLink>
          {user?.role === 'Pemilik' && (
            <>
              <NavLink to="/laporan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                Laporan Keuangan
              </NavLink>
              <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                Audit Log
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Sistem Keuangan CV Sekar Melati
          </div>
          <div className="user-profile">
            <span>{user?.full_name}</span>
            <span className="role-badge">{user?.role}</span>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem' }}>
              Keluar
            </button>
          </div>
        </header>

        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};