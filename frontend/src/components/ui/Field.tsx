import { useId, type ReactNode } from 'react';

interface Props {
  label: string;
  error?: string | undefined;
  hint?: string;
  children: (id: string) => ReactNode;
}

/** Label + kontrol + pesan galat, dihubungkan lewat id supaya terbaca pembaca layar. */
export function Field({ label, error, hint, children }: Props) {
  const id = useId();
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {children(id)}
      {hint && !error && <div className="form-hint">{hint}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
    </div>
  );
}
