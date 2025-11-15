import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';

export default defineConfig({
    vite: {
        ssr: {
            noExternal: ['numora', 'numora-react', '@reown/appkit', '@reown/appkit-adapter-wagmi']
        },
        build: {
            commonjsOptions: {
                include: [/numora-react/, /@reown\/appkit/, /@reown\/appkit-adapter-wagmi/, /node_modules/]
            }
        }
    },
    integrations: [starlight({
        title: 'Numora',
        favicon: '/favicon.png',
        social: {
            github: 'https://github.com/Sharqiewicz/numora',
        },
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
