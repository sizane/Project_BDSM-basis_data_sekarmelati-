import type { LevelUtang, StatusPesanan } from '../../types/api';

export function StatusBadge({ status }: { status: StatusPesanan }) {
  return <span className={`badge ${status === 'Lunas' ? 'badge-lunas' : 'badge-belum-lunas'}`}>{status}</span>;
}

export function LevelBadge({ level }: { level: LevelUtang }) {
  return <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>;
}
