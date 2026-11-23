import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Port 5173 = nilai CORS_ORIGIN bawaan backend (.env.example).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
