import { createFileRoute, Link } from '@tanstack/react-router';
import LightRays from '@/components/LightRaysDeferred';
import { Socials } from '@/components/socials';
import {
  ExploreHero,
  SectionNav,
  PasteChaosDemo,
  CursorPositionDemo,
  ScientificNotationDemo,
  MobileKeyboardDemo,
  DecimalDilemmaDemo,
  ThousandSeparatorDemo,
  NumberTypeLieDemo,
} from '@/components/explore';

export const Route = createFileRoute('/explore')({
  head: () => ({
    meta: [
      { title: 'Why numeric inputs break | Numora' },
      {
        name: 'description',
        content:
          'Seven ways <input type="number"> fails in production, with live demos: cursor jumping, scientific notation paste, decimal separators and mobile keyboards.',
      },
      {
        property: 'og:title',
        content: 'Why numeric inputs break | Numora',
      },
      {
        property: 'og:description',
        content:
          'Seven ways <input type="number"> fails in production, with live demos: cursor jumping, scientific notation paste, decimal separators and mobile keyboards.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/explore' },
      {
        name: 'twitter:title',
        content: 'Why numeric inputs break | Numora',
      },
      {
        name: 'twitter:description',
        content:
          'Seven ways <input type="number"> fails in production: cursor jumping, scientific notation paste, decimal separators and more.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/explore' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Why numeric inputs break | Numora',
            description:
              'Seven ways input type=number fails in production: cursor jumping, scientific notation paste, decimal separators and mobile keyboards.',
            url: 'https://numeric-input.com/explore',
            isPartOf: { '@type': 'WebSite', name: 'Numora', url: 'https://numeric-input.com' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Explore',
                item: 'https://numeric-input.com/explore',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-x-hidden">
      <Socials className="bg-surface-3/60 border border-border rounded-full px-8 py-2 animate-fade-in delay-[1s] opacity-0 fixed z-90 bottom-2 left-1/2 -translate-x-1/2 sm:top-4 sm:right-8 sm:translate-x-0 sm:bottom-auto sm:left-auto" />

      <SectionNav />

      <main className="flex justify-center items-center flex-col">
        <LightRays />

        <ExploreHero />

        <div className="w-full bg-gradient-to-b from-background/0 via-background/50 to-background/0">
          <PasteChaosDemo />
          <CursorPositionDemo />
          <ScientificNotationDemo />
          <MobileKeyboardDemo />
          <DecimalDilemmaDemo />
          <ThousandSeparatorDemo />
          <NumberTypeLieDemo />
        </div>

        <section className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-8 py-24">
          <div className="text-center max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Fix these in your app
            </h2>
            <p className="text-muted-foreground mb-8">
              <strong className="font-numora text-secondary">Numora</strong> handles every case on
              this page. Values stay strings, so nothing loses precision, and the cursor stays where you left it.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/docs/numora"
                className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 active:scale-[0.96] transition-[opacity,scale] duration-150 ease-out-expo"
              >
                Get started
              </Link>
              <a
                href="https://github.com/sharqiewicz/numora"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted/50 active:scale-[0.96] transition-[background-color,scale] duration-150 ease-out-expo"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 text-sm text-center pb-16">
        &copy; {new Date().getFullYear()} Numora. Built with{' '}
        <span className="text-secondary">❤</span> by{' '}
        <a
          href="https://x.com/sharqiewicz"
          target="_blank"
          rel="noopener noreferrer"
          className="font-numora text-secondary"
        >
          Kacper Szarkiewicz
        </a>
        .
      </footer>
    </div>
  );
}
