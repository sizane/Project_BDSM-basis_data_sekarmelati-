import 'dotenv/config';
import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((v): boolean | number => {
      if (/^\d+$/.test(v)) return Number(v);
      return v === 'true' ? 1 : false;
    }),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
  ENABLE_SWAGGER: booleanString.default('true'),

  DB_SERVER: z.string().min(1, 'DB_SERVER wajib diisi'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(1433),
  DB_NAME: z.string().min(1, 'DB_NAME wajib diisi'),
  DB_USER: z.string().min(1, 'DB_USER wajib diisi'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD wajib diisi'),
  DB_ENCRYPT: booleanString.default('false'),
  DB_TRUST_SERVER_CERT: booleanString.default('true'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().min(60).default(86400),
  BCRYPT_COST: z.coerce.number().int().min(12, 'BCRYPT_COST minimal 12 (AC-05)').max(15).default(12),
});

export type Env = z.infer<typeof schema>;

function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Hanya nama variabel dan alasan yang dicetak, nilai tidak pernah ditampilkan.
    const lines = parsed.error.issues.map((i) => ` - ${i.path.join('.') || '(env)'}: ${i.message}`);
    console.error(`Konfigurasi environment tidak valid:\n${lines.join('\n')}\nPeriksa file .env (lihat .env.example).`);
    process.exit(1);
  }
  return parsed.data;
}

export const env: Env = loadEnv();
