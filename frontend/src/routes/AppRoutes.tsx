import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/routes/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { PesananListPage } from '../pages/pesanan/PesananListPage';
import { DetailPesananPage } from '../pages/pesanan/DetailPesananPage';

export const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<div><h2>Dashboard Keuangan</h2><p>Selamat datang di sistem CV Sekar Melati.</p></div>} />
              <Route path="/pesanan" element={<PesananListPage />} />
              <Route path="/pesanan/:id" element={<DetailPesananPage />} />
              <Route path="/piutang" element={<div><h2>Laporan Piutang & Level Utang</h2></div>} />
              <Route path="/pengeluaran" element={<div><h2>Pencatatan Pengeluaran</h2></div>} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Pemilik']} />}>
            <Route element={<MainLayout />}>
              <Route path="/laporan" element={<div><h2>Laporan Keuangan Eksekutif</h2></div>} />
              <Route path="/audit-logs" element={<div><h2>Audit Log Sistem</h2></div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};