import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

// https://vitest.dev/config/
export default defineConfig({
    test: {
        setupFiles: ['./src/tests/vitest.setup.ts'],
        // set-up for using dev environmental variables
        env: loadEnv("development", process.cwd(), ''),
    },
})
