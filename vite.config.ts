import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    ["babel-plugin-react-compiler", {}]
                ],
            },
        }),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            scope: '/playground',
            workbox: {
                maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB
            },
            manifest: {
                name: 'RunTS - TypeScript Playground',
                short_name: 'RunTS',
                description: 'A secure, local-first TypeScript playground powered by WebContainers.',
                theme_color: '#3178C6',
                background_color: '#3178C6',
                display: 'standalone',
                scope: '/playground',
                start_url: '/playground',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        },
    },
    preview: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        },
    },
});
