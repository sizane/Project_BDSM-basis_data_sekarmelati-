import axios from 'axios';
import { api } from '../services/api';

/**
 * Unduh PDF dari backend. Backend membuat PDF penuh di memori dulu, sehingga kegagalan datang
 * sebagai JSON (bukan file rusak); body blob error dibaca ulang agar pesannya bisa ditampilkan.
 */
export async function downloadPdf(path: string, params: Record<string, string | number | undefined>): Promise<void> {
  try {
    const res = await api.get<Blob>(path, { params, responseType: 'blob' });
    const disposition = String(res.headers['content-disposition'] ?? '');
    const filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? 'laporan.pdf';
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
      try {
        const body = JSON.parse(await err.response.data.text()) as { message?: string };
        if (body.message) throw new Error(body.message);
      } catch (inner) {
        if (inner instanceof Error && !(inner instanceof SyntaxError)) throw inner;
      }
    }
    throw err;
  }
}
