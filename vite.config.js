import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all interfaces (not just localhost) so the dev server is
    // reachable from other devices on the same Wi-Fi via the machine's
    // LAN IP, e.g. http://192.168.x.x:5173 — shown in the "Network:" line
    // when the dev server starts.
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
