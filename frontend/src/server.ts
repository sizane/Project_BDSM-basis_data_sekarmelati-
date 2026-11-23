import type { Server } from 'node:http';
import app from './app';
import { closeDatabase, connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

let server: Server | undefined;

async function start(): Promise<void> {
  await connectDatabase(); // gagal cepat bila database tidak bisa dihubungi
  server = app.listen(env.PORT, () => {
    logger.info(`API berjalan di port ${env.PORT}`, {
      env: env.NODE_ENV,
      docs: env.ENABLE_SWAGGER ? `/api-docs` : 'nonaktif',
    });
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`Menerima ${signal}, menutup server...`);
  const force = setTimeout(() => process.exit(1), 10_000);
  force.unref();
  try {
    if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
    await closeDatabase();
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => logger.error('unhandledRejection', reason));
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', err);
  process.exit(1);
});

start().catch((err) => {
  logger.error('Gagal menjalankan server', err);
  process.exit(1);
});
