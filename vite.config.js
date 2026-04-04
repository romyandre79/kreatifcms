import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: [
                'resources/routes/**',
                'routes/**',
                'resources/views/**',
                'resources/js/Pages/**',
                'Modules/*/resources/js/Pages/**/*.jsx'
            ],
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('lucide-react')) return 'icons';
                        if (id.includes('react-player')) return 'player';
                        if (id.includes('summernote') || id.includes('jquery')) return 'editor';
                        if (id.includes('recharts')) return 'charts';
                        if (id.includes('@dnd-kit')) return 'dnd';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
});
