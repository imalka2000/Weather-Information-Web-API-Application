import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Ensure the file exports a valid config object
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
  