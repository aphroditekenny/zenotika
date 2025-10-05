
import { defineConfig, type PluginOption, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// PWA and Sentry build plugins are intentionally omitted to avoid peer conflicts.

export default defineConfig(async ({ mode }) => {
  const analyze = mode === 'analyze' || process.env.BUNDLE_ANALYZE === 'true';
  const plugins: PluginOption[] = [react()];

  // Note: PWA plugin can be added later if needed with a compatible vite-plugin-pwa version.

  if (analyze) {
    const { visualizer } = (await import(
      'rollup-plugin-visualizer',
    )) as typeof import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'build/bundle-report.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
    );
  }

  const config: UserConfig = {
    plugins,
    base: process.env.VITE_BASE || undefined,
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      globals: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['e2e/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
      },
    },
  };
  // Note: Sentry upload plugin is disabled for now; app-level Sentry init is still active via flags.
  return config;
});