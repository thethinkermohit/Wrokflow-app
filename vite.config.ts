import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['lucide-react'],
          pdf: ['html2canvas', 'jspdf']
        }
      },
      external: (id) => {
        // Exclude LICENSE directory files and Supabase functions from build
        return id.includes('/LICENSE/') || id.startsWith('LICENSE/') || 
               id.includes('/supabase/') || id.startsWith('supabase/');
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: true,
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'recharts']
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: ['console', 'debugger']
  }
})