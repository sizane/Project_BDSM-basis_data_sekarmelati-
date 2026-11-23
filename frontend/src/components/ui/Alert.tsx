import type { ReactNode } from 'react';

interface Props {
  kind?: 'error' | 'success' | 'info';
  children: ReactNode;
  onRetry?: () => void;
}

export function Alert({ kind = 'info', children, onRetry }: Props) {
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginLeft: '0.75rem' }}>
          Coba lagi
        </button>
      )}
    </div>
  );
}
