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
});
