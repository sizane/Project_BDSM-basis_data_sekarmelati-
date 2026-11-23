import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { render } from '@testing-library/react';
import { AppRoutes } from '../src/routes/AppRoutes';
import { api } from '../src/services/api';

export interface Call { key: string; params?: Record<string, unknown>; body?: any }
export const calls: Call[] = [];
type Out = { status?: number; body: unknown } | ((cfg: InternalAxiosRequestConfig) => { status?: number; body: unknown });

export const ok = (data: unknown, meta?: unknown) => ({ body: { status: 'success', data, message: 'ok', errors: null, ...(meta ? { meta } : {}) } });
export const fail = (status: number, message: string, details?: unknown) => ({ status, body: { status: 'error', data: null, message, errors: { code: 'X', details } } });
export const page = (total = 1) => ({ current_page: 1, per_page: 15, total, last_page: 1 });

export function mockApi(routes: Record<string, Out>) {
  calls.length = 0;
  const adapter: AxiosAdapter = async (config) => {
    const key = `${(config.method ?? 'get').toUpperCase()} ${config.url}`;
    calls.push({ key, params: config.params, body: config.data ? JSON.parse(config.data as string) : undefined });
    const h = routes[key];
    const out = h ? (typeof h === 'function' ? h(config) : h) : fail(404, `tidak ada mock: ${key}`);
    const res = { data: out.body, status: out.status ?? 200, statusText: '', headers: {}, config, request: {} };
    if (res.status >= 200 && res.status < 300) return res;
    throw new AxiosError('gagal', 'ERR_BAD_REQUEST', config, {}, res as never);
  };
  api.defaults.adapter = adapter;
}

export function loginAs(role: 'Pemilik' | 'Admin') {
  localStorage.setItem('token', 't');
  localStorage.setItem('user', JSON.stringify({ admin_id: 'a1', username: role === 'Pemilik' ? 'sukamto' : 'emy', full_name: role === 'Pemilik' ? 'Sukamto' : 'Emy', role }));
}

export function renderAt(path: string) {
  window.history.pushState({}, '', path);
  return render(<AppRoutes />);
}
