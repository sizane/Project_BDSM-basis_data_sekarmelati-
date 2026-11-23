interface Props {
  cols: number;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyText: string;
  onRetry?: () => void;
}

/** Baris status untuk <tbody>: memuat, gagal, atau kosong. Tidak menampilkan apa pun bila ada data. */
export function StateRow({ cols, loading, error, isEmpty, emptyText, onRetry }: Props) {
  if (loading) {
    return (
      <tr>
        <td colSpan={cols} className="state-cell">Memuat data...</td>
      </tr>
    );
  }
  if (error) {
    return (
      <tr>
        <td colSpan={cols} className="state-cell state-error">
          {error}
          {onRetry && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginLeft: '0.75rem' }}>
              Coba lagi
            </button>
          )}
        </td>
      </tr>
    );
  }
  if (isEmpty) {
    return (
      <tr>
        <td colSpan={cols} className="state-cell">{emptyText}</td>
      </tr>
    );
  }
  return null;
}
