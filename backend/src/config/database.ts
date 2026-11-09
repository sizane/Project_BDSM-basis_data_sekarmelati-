import sql from 'mssql';
import { env } from './env';

const dbConfig: sql.config = {
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  server: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  options: {
    encrypt: false, // Set true if using Azure / TLS on SQL Server
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log('Connected to Microsoft SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('Database Connection Failed:', err);
    process.exit(1);
  });

export { sql };