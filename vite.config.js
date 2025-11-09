import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@config': path.resolve(__dirname, './src/config'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  optimizeDeps: {
    include: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom'],
          // React Router
          'router-vendor': ['react-router-dom'],
          // React Icons (large library, split separately)
          'icons-vendor': ['react-icons'],
          // State management
          'state-vendor': ['zustand'],
          // PDF generation
          'pdf-vendor': ['pdfmake'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
  server: {
    proxy: {
      '/api/provinces': {
        target: 'https://provinces.open-api.vn',
        changeOrigin: true,
        rewrite: (path) => {
          // Handle different endpoints
          if (path.includes('/districts/')) {
            return path.replace('/api/provinces/districts', '/api/districts');
          } else if (path.includes('/wards/')) {
            return path.replace('/api/provinces/wards', '/api/wards');
          } else {
            // For provinces list: /api/provinces/?depth=3 -> /api/v1/?depth=3
            return path.replace('/api/provinces', '/api/v1');
          }
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url);
          });
        },
      },
    },
  },
})
