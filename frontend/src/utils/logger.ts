/**
 * Logger server (ERR-SYS-01, BR-24, BR-29). Stack trace hanya ke log server,
 * tidak pernah ke respons. Password/token/secret disamarkan.
 */
type Level = 'info' | 'warn' | 'error';

const SENSITIVE_KEY = /pass|token|secret|authorization|hash|cookie/i;

function redact(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (depth > 4) return '[...]';
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(v, depth + 1);
  }
  return out;
}

function serializeError(err: unknown): Record<string, unknown> | undefined {
  if (err === undefined) return undefined;
  if (err instanceof Error) {
    const extra = err as Error & { code?: unknown; number?: unknown };
    return { name: err.name, message: err.message, code: extra.code, number: extra.number, stack: err.stack };
  }
  return { message: String(err) };
}

function write(level: Level, message: string, err?: unknown, meta?: Record<string, unknown>): void {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: redact(meta) } : {}),
    ...(err !== undefined ? { error: serializeError(err) } : {}),
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, undefined, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, undefined, meta),
  error: (message: string, err?: unknown, meta?: Record<string, unknown>) => write('error', message, err, meta),
};
