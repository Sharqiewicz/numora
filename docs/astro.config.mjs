import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import svelte from '@astrojs/svelte';

export default defineConfig({
    vite: {
        ssr: {
            noExternal: ['numora-react']
        },
        build: {
            commonjsOptions: {
                include: [/numora-react/, /node_modules/]
            }
        }
    },
    integrations: [starlight({
        title: 'Numora lib',
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
		]
        }), svelte(), react(), vue()],
});