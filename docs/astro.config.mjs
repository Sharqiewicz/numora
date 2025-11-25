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
        title: 'Numora',
        favicon: '/favicon.png',
        social: [
           { icon: 'github', href: 'https://github.com/Sharqiewicz/numora', label: 'GitHub'}
        ],
        sidebar: [
            {
                label: 'Guides',
                items: [
                    { label: 'Swap', link: '/guides/swap/' },
                    { label: 'Getting Started', link: '/guides/getting-started/' },
                    { label: 'Examples', link: '/guides/example/' },
                    { label: 'Svelte/Pure JS Demo', link: '/guides/svelte/' },
                ],
            },
        ],
        }), svelte()],
});