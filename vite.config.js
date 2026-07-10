import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
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
      // Handles both Latin 'c' and Cyrillic 'с' (lower and upper case)
      '^/[cC\u0441\u0421]/': {
        target: 'https://polygon.codeforces.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});
