import { useEffect } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Role } from '../../types/api';

interface Props {
  allowedRoles?: Role[];
}

/**
 * Halaman khusus Pemilik (FSD-2.13 EF-2): Admin yang membuka URL-nya langsung melihat pesan
 * penolakan. Permintaan ke endpoint terlarang dikirim agar backend mencatat ACCESS_DENIED.
 */
function AccessDenied() {
  useEffect(() => {
    api.get('/audit-logs', { params: { per_page: 1 } }).catch(() => undefined);
  }, []);
  return (
    <div className="card" role="alert">
      <h2 className="card-title">Akses ditolak</h2>
      <p style={{ marginBottom: '1rem' }}>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link to="/dashboard" className="btn btn-primary">Kembali ke dashboard</Link>
    </div>
  );
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <AccessDenied />;
  return <Outlet />;
}
