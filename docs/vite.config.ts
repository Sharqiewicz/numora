import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import netlify from '@netlify/vite-plugin-tanstack-start';
import viteReact from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

const config = defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    devtools(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        concurrency: 14,
        retryCount: 2,
        retryDelay: 1000,
        maxRedirects: 5,
        failOnError: true,
      },
    }),
    netlify(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    viteReact({
      // The Vite equivalent of Next's `transpilePackages`. numora-react is a
      // workspace symlink, so its dist lands outside node_modules and is served
      // as app source -- but plugin-react's default include is /\.[tj]sx?$/,
      // which skips the .mjs bundle. Adding it here gets Fast Refresh (and so
      // preserves input value + caret) instead of a full page reload on rebuild.
      include: [/\.[tj]sx?$/, /packages\/react\/dist\/index\.mjs$/],
    }),
  ],
});

export default config;
