import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error-handler';
import { poolPromise } from './config/database';
import { sendSuccess, sendError } from './utils/response';
import { ERROR_CODES } from './constants/error-codes';
import { swaggerDocument } from './config/swagger';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Tangkap IP address client untuk keperluan Audit Log (TSD 6.3)[cite: 3]
app.use((req, _res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  req.clientIp =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || '127.0.0.1';
  next();
});

// Health Check Endpoint (Public)
app.get('/health', async (_req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().query('SELECT 1 AS ok');

    return sendSuccess(
      res,
      {
        server: 'up',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      'Sistem dan database berjalan normal',
      200
    );
  } catch (err) {
    console.error('[HEALTH CHECK ERROR]:', err);
    return sendError(
      res,
      'Koneksi database terputus',
      ERROR_CODES.SYSTEM_ERROR,
      503
    );
  }
});

// Swagger UI Placeholder di /api-docs (TSD 1.2)[cite: 3]
// const swaggerDocument = {
//   openapi: '3.0.0',
//   info: { title: 'API Sistem Pencatatan Keuangan CV Sekar Melati', version: '1.0.0' },
//   servers: [{ url: '/api/v1' }],
// };
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Swagger UI di /api-docs (TSD 1.2)[cite: 3]
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Base API Route /api/v1[cite: 3]
app.use('/api/v1', apiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;