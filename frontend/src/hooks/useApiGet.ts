import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/errors';
import { api } from '../services/api';
import type { ApiResponse, Meta } from '../types/api';

type Params = Record<string, string | number | undefined>;

/** Parameter kosong ('' / undefined) tidak dikirim. */
function clean(params: Params): Params {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
}

/** GET dengan state loading/error, pembatalan saat parameter berubah, dan reload manual. */
export function useApiGet<T>(url: string, params: Params = {}, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(clean(params));

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api
      .get<ApiResponse<T>>(url, { params: JSON.parse(key) as Params, signal: controller.signal })
      .then((res) => {
        setData(res.data.data);
        setMeta(res.data.meta ?? null);
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return;
        setData(null);
        setMeta(null);
        setError(getErrorMessage(err, 'Gagal memuat data. Silakan coba beberapa saat lagi.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, key, enabled, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, meta, loading, error, reload };
}
