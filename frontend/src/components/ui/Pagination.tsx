import type { Meta } from '../../types/api';

interface Props {
  meta: Meta | null;
  page: number;
  onPage: (page: number) => void;
  label?: string;
}

export function Pagination({ meta, page, onPage, label = 'data' }: Props) {
  const last = meta?.last_page ?? 1;
  return (
    <div className="pagination no-print">
      <span>
        Total: {meta?.total ?? 0} {label}
      </span>
      <div>
        <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Sebelumnya
        </button>
        <span style={{ margin: '0 0.75rem' }}>
          {page} / {last}
        </span>
        <button type="button" className="btn btn-secondary" disabled={page >= last} onClick={() => onPage(page + 1)}>
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
