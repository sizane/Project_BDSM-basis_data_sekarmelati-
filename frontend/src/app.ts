import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { sessionContext } from './middlewares/session-context';
import routes from './routes';

const app = express();

app.set('trust proxy', env.TRUST_PROXY); // IP klien benar di belakang Nginx
app.disable('x-powered-by');

// Swagger UI memakai skrip inline, jadi dipasang sebelum helmet (CSP).
if (env.ENABLE_SWAGGER) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['Content-Disposition'],
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(sessionContext);

// Liveness untuk Nginx / monitoring; tidak menyentuh database dan tidak membuka data apa pun.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
