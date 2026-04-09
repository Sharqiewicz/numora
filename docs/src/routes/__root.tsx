import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import type { QueryClient } from '@tanstack/react-query'
import type { TRPCRouter } from '@/integrations/trpc/router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'

import stylesCss from '../styles.css?url'

interface MyRouterContext {
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<TRPCRouter>
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'Numora - Numeric Input & Number Input Library' },
      { name: 'description', content: 'The only framework-agnostic numeric input library. Format numbers as you type, thousand separators, decimal limits, cursor management. Works with React, Vue, Svelte, and Vanilla JS.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Numora' },
      { property: 'og:title', content: 'Numora - Numeric Input & Number Input Library' },
      { property: 'og:description', content: 'The only framework-agnostic numeric input library. Format numbers as you type, thousand separators, decimal limits, cursor management. Works with React, Vue, Svelte, and Vanilla JS.' },
      { property: 'og:url', content: 'https://numora.xyz' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@sharqiewicz' },
    ],
    links: [
      { rel: 'stylesheet', href: stylesCss },
      { rel: 'icon', href: '/favicon.png' },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'preload', href: '/videos/scientific-notation.mp4', as: 'video', type: 'video/mp4' },
      { rel: 'prefetch', href: '/videos/cursor-jump.mp4', as: 'video', type: 'video/mp4' },
      { rel: 'prefetch', href: '/videos/paste.mp4', as: 'video', type: 'video/mp4' },
    ],
  }),
  component: RootDocument,
})

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
  )
}
