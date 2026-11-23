import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import type { ApiResponse, LoginResult, User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** Simpan hasil POST /auth/login. */
  login: (result: LoginResult) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readUser(): User | null {
  try {
    const saved = localStorage.getItem('user');
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = (result: LoginResult) => {
    const next: User = {
      admin_id: result.admin.id,
      username: result.admin.username,
      full_name: result.admin.full_name,
      role: result.admin.role,
    };
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(next));
    setToken(result.token);
    setUser(next);
  };

  const logout = async () => {
    try {
      await api.post<ApiResponse>('/auth/logout');
    } catch {
      // Gagal jaringan saat logout diabaikan: sesi lokal tetap dihapus.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(token && user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
