import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      '^/archive': {
        target: 'https://web.archive.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/archive/, '')
      },
      '^/api': {
        target: 'https://polygon.codeforces.com',
        changeOrigin: true,
        secure: true,
      },
      // Match problem paths like /p85dIBF/...
      '^/p[a-zA-Z0-9]{4,}': {
        target: 'https://polygon.codeforces.com',
        changeOrigin: true,
        secure: true,
      },
      // Match contest paths like /c/50431a121273b7e31f4200e7/contest.xml
      '^/[cC\u0441\u0421]/': {
        target: 'https://polygon.codeforces.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});
