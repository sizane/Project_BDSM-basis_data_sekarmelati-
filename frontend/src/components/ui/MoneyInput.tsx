import { formatRupiah, parseAngka } from '../../lib/format';

interface Props {
  id?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  invalid?: boolean;
}

/** Input Rupiah bilangan bulat: tampil "1.500.000", nilai yang dilaporkan berupa angka. */
export function MoneyInput({ id, value, onChange, placeholder = '0', invalid }: Props) {
  return (
    <div className="money-input">
      <span aria-hidden="true">Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="form-input"
        aria-invalid={invalid || undefined}
        placeholder={placeholder}
        value={value === null ? '' : formatRupiah(value).replace('Rp ', '')}
        onChange={(e) => onChange(parseAngka(e.target.value))}
      />
    </div>
  );
}
