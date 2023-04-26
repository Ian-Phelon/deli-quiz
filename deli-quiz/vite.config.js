import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
export default defineConfig({
    //@ts-expect-error not my problem
    plugins: [sveltekit()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    server: {
        open: true,
        host: '0.0.0.0',
    }
});
//# sourceMappingURL=vite.config.js.map