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
        name: 'ZubaSystem',
        short_name: 'ZubaSys',
        description:
          'ZubaSystem — Smart and efficient inventory management for modern companies. Manage employees, stock in/out, and reports with ease.',
        theme_color: '#0d6861', // Tailwind blue-700
        background_color: '#f9fafb', // light gray background
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['business', 'inventory', 'management', 'tools'],
        prefer_related_applications: false,
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: '/pwa-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/pwa-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/pwa-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/pwa-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/pwa-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          // Maskable icons for Android
          {
            src: '/maskable-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          // Any-purpose icons
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop view of ZubaSystem Dashboard'
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '375x812',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile view of ZubaSystem Interface'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        clientsClaim: true,
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot}'
        ],
        runtimeCaching: [
          // Cache API requests for inventory and employee data
          {
            urlPattern: /^https:\/\/api\.zubasystem\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'zubasystem-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          },
          // Cache images (like product or employee photos)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'zubasystem-image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
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
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    host: true, // allows LAN testing
    port: 5173
  }
})
