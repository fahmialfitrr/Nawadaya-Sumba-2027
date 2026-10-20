import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    {
      name: 'dev-api-health',
      configureServer(server) {
        server.middlewares.use('/api/health', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              status: 'healthy',
              uptime: process.uptime(),
              timestamp: new Date().toISOString(),
              service: 'kkn-nawadaya-frontend',
              env: 'development',
            })
          )
        })
      },
    },
    devtools(),
    nitro({
      routeRules: {
        '/assets/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
        '/images/**': { headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' } },
        '/source_image/**': { headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' } },
        '/api/health': { headers: { 'cache-control': 'no-cache, no-store' } },
      },
      compressPublicAssets: true,
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  build: {
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
  },
})

export default config
