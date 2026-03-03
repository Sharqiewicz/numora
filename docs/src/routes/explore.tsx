import { createFileRoute } from '@tanstack/react-router';
import LightRays from '@/components/LightRays';
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
      { title: 'Why Number Inputs Break - Interactive Demos | Numora' },
      { name: 'description', content: 'See 7 ways <input type="number"> fails in production: cursor jumping, scientific notation paste, decimal dilemmas, mobile keyboard chaos, and more. Interactive live demos.' },
      { property: 'og:title', content: 'Why Number Inputs Break - Interactive Demos | Numora' },
      { property: 'og:description', content: 'See 7 ways <input type="number"> fails in production: cursor jumping, scientific notation paste, decimal dilemmas, mobile keyboard chaos, and more.' },
      { property: 'og:url', content: 'https://numora.xyz/explore' },
      { name: 'twitter:title', content: 'Why Number Inputs Break - Interactive Demos | Numora' },
      { name: 'twitter:description', content: 'See 7 ways <input type="number"> fails in production: cursor jumping, scientific notation paste, decimal dilemmas, and more.' },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-x-hidden">
      <Socials className="bg-gray-900/60 border border-gray-900 rounded-full px-8 py-2 animate-fade-in delay-[1s] opacity-0 fixed z-90 bottom-2 left-1/2 -translate-x-1/2 sm:top-4 sm:right-8 sm:translate-x-0 sm:bottom-auto sm:left-auto" />

      <SectionNav />

      <main className="flex justify-center items-center flex-col">
        <LightRays />

        <ExploreHero />

        <div className="w-full bg-gradient-to-b from-transparent via-background/50 to-transparent">
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
              Ready to solve these problems?
            </h2>
            <p className="text-muted-foreground mb-8">
              <strong className="font-numora text-secondary">numora</strong> handles all of this
              out of the box. No more regex nightmares, no more cursor jumping, no more
              precision loss.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/docs/numora"
                className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </a>
              <a
                href="https://github.com/sharqiewicz/numora"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted/50 transition-colors"
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
