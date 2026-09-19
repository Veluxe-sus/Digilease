import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port is fixed: API CORS, S3 CORS and the map key allow http://localhost:5173 only.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
