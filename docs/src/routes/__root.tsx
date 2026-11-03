import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';

import type { QueryClient } from '@tanstack/react-query';
import type { TRPCRouter } from '@/integrations/trpc/router';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';

import stylesCss from '../styles.css?url';
import { CORE_SIZE_GZIP } from '@/lib/constants/package';

interface MyRouterContext {
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      // --background (oklch(0.147 0.004 277)) in hex; the site is dark-only.
      { name: 'theme-color', content: '#0a0a0c' },
      { name: 'color-scheme', content: 'only dark' },
      { title: 'Numeric input library for JavaScript and React | Numora' },
      {
        name: 'description',
        content:
          'A framework-agnostic numeric input library for financial apps. Format numbers as you type, with thousand separators, decimal limits and cursor management. Works with Vanilla JS, React, Vue, Svelte, Angular, and Solid.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Numora' },
      { property: 'og:title', content: 'Numeric input library for JavaScript and React | Numora' },
      {
        property: 'og:description',
        content:
          'A framework-agnostic numeric input library for financial apps. Format numbers as you type, with thousand separators, decimal limits and cursor management. Works with Vanilla JS, React, Vue, Svelte, Angular, and Solid.',
      },
      { property: 'og:url', content: 'https://numeric-input.com' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@sharqiewicz' },
      { property: 'og:image', content: 'https://numeric-input.com/og-image.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content:
          `Numora, a numeric input library. Zero dependencies, ${CORE_SIZE_GZIP} gzipped, works with any framework.`,
      },
      { name: 'twitter:image', content: 'https://numeric-input.com/og-image.png' },
      {
        name: 'twitter:image:alt',
        content:
          `Numora, a numeric input library. Zero dependencies, ${CORE_SIZE_GZIP} gzipped, works with any framework.`,
      },
    ],
    links: [
      // Fonts load from <link> rather than CSS @import, so the browser can fetch
      // them in parallel with the app stylesheet instead of after it.
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://api.fontshare.com' },
      { rel: 'preconnect', href: 'https://cdn.fontshare.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700&display=swap',
      },
      { rel: 'stylesheet', href: stylesCss },
      { rel: 'icon', href: '/favicon.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
