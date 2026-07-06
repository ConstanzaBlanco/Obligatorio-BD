import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Docker Desktop on Windows doesn't reliably forward native fs
      // change events through bind mounts, so chokidar's default
      // watcher silently never fires. Polling makes HMR actually work
      // when running inside the frontend container.
      usePolling: true,
      interval: 300,
    },
  },
})
