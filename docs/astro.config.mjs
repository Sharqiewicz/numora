import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import svelte from '@astrojs/svelte';

export default defineConfig({
    integrations: [starlight({
        title: 'Numora Docs',
        social: {
            github: 'https://github.com/Sharqiewicz/numora',
        },
		sidebar: [
            {
                label: 'Guides',
                items: [

                    { label: 'Getting Started', link: '/guides/getting-started/' },
                    { label: 'Examples', link: '/guides/example/' },
                    { label: 'Svelte/Pure JS Demo', link: '/guides/svelte/' },
                ],
            },
		]
        }), svelte(), react(), vue()],
});