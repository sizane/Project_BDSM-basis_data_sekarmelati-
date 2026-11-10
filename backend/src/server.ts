import app from './app';
import { env } from './config/env';
import { poolPromise } from './config/database';

const startServer = async () => {
  await poolPromise;
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${env.PORT}/api-docs`);
  });
};

startServer();