import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Field } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/errors';
import { api } from '../../services/api';
import type { ApiResponse, LoginResult } from '../../types/api';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<LoginResult>>('/auth/login', { username: username.trim(), password });
      login(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Username atau password tidak valid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1 className="login-title">CV Sekar Melati</h1>
        <p className="login-subtitle">Masuk untuk mengakses sistem keuangan</p>

        {error && <Alert kind="error">{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Username">
            {(id) => (
              <input id={id} type="text" className="form-input" autoComplete="username" autoFocus
                value={username} onChange={(e) => setUsername(e.target.value)} required />
            )}
          </Field>
          <Field label="Password">
            {(id) => (
              <input id={id} type="password" className="form-input" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            )}
          </Field>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading || !username.trim() || !password}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
