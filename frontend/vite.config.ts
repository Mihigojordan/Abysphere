import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'safari-pinned-tab.svg',
        'mstile-144x144.png'
      ],
      manifest: {
        name: 'Aby Sphere',
        short_name: 'AbySphere',
        description: 'Aby Sphere – Modern platform for intelligent management and collaboration.',
        theme_color: '#0ea5e9',
        background_color: '#f0f9ff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['productivity', 'business', 'utilities'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          { src: '/pwa-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/pwa-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/pwa-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/pwa-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/pwa-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          // Maskable icons
          { src: '/maskable-icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          // Any-purpose icons
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Aby Sphere – Desktop View'
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '375x812',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Aby Sphere – Mobile View'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          // Example: Cache your API or static assets here
          // {
          //   urlPattern: /^https:\/\/api\.abysphere\.com\//,
          //   handler: 'NetworkFirst',
          //   options: {
          //     cacheName: 'api-cache',
          //     expiration: {
          //       maxEntries: 50,
          //       maxAgeSeconds: 60 * 60 * 24 // 24 hours
          //     },
          //     networkTimeoutSeconds: 10
          //   }
          // }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  optimizeDeps: {
    exclude: ['axios'],
    include: ['react', 'react-dom', 'lucide-react']
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: { manualChunks: undefined }
    }
  },
  server: {
    host: true, // Allows mobile device testing on the same network
    port: 5173
  }
})
