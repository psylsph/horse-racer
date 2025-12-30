import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { PluginOption } from 'vite';

export default defineConfig({
    plugins: [react()] as PluginOption[],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/unit/**/*.test.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
