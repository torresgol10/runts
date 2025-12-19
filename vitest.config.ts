import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react() as any],
    test: {
        globals: true,
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [
                { browser: 'chromium' },
            ],
            headless: true,
        },
        setupFiles: './src/test/setup.ts',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
});
