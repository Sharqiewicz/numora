import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';

import vue from '@astrojs/vue';

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
                    { label: 'Example Guide', slug: 'guides/example' },
                ],
            },
            {
                label: 'Reference',
                autogenerate: { directory: 'reference' },
            },
        ],
        }), react(), vue()],
});