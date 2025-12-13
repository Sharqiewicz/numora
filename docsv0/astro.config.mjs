import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    vite: {
      ssr: {
          noExternal: ['numora', 'numora-react', '@reown/appkit', '@reown/appkit-adapter-wagmi']
      },

      build: {
          commonjsOptions: {
              include: [/numora-react/, /@reown\/appkit/, /@reown\/appkit-adapter-wagmi/, /node_modules/]
          }
      },

      plugins: [tailwindcss()],
    },
    integrations: [starlight({
        title: 'numora',
        customCss: ['./src/styles/global.css'],
        favicon: '/favicon.png',
        social: [
           { icon: 'github', href: 'https://github.com/Sharqiewicz/numora', label: 'GitHub'}
        ],
        sidebar: [
            {
                label: 'General',
                autogenerate: { directory: 'general' },
            },
            {
                label: 'React',
                badge: { text: 'React', variant: 'note' },
                autogenerate: { directory: 'react' },
            },
            {
                label: 'Vue',
                badge: { text: 'Vue', variant: 'success' },
                autogenerate: { directory: 'vue' },
            },
            {
                label: 'Svelte',
                badge: { text: 'Svelte', variant: 'caution' },
                autogenerate: { directory: 'svelte' },
            },
            {
                label: 'Vanilla',
                badge: { text: 'Vanilla', variant: 'tip' },
                autogenerate: { directory: 'vanilla' },
            },
        ],
        }), svelte()],
});
