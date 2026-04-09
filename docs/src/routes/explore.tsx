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
      { title: 'Why Numeric Input & Number Input Break - Interactive Demos | Numora' },
      { name: 'description', content: 'See 7 ways <input type="number"> fails in production: cursor jumping, scientific notation paste, decimal dilemmas, mobile keyboard chaos, and more. Interactive live demos.' },
      { property: 'og:title', content: 'Why Numeric Input & Number Input Break - Interactive Demos | Numora' },
      { property: 'og:description', content: 'See 7 ways <input type="number"> fails in production: cursor jumping, scientific notation paste, decimal dilemmas, mobile keyboard chaos, and more.' },
      { property: 'og:url', content: 'https://numora.xyz/explore' },
      { name: 'twitter:title', content: 'Why Numeric Input & Number Input Break - Interactive Demos | Numora' },
      { name: 'twitter:description', content: 'See 7 ways <input type="number"> fails in production: cursor jumping, scientific notation paste, decimal dilemmas, and more.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/explore' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Why does pasting into a number input cause chaos?", "acceptedAnswer": { "@type": "Answer", "text": "When pasting formatted numbers (like '1,234.56' or numbers with currency symbols), <input type=\"number\"> strips the value entirely or shows NaN because it only accepts raw numeric strings. Numora sanitizes pasted content before it reaches the input, extracting the numeric value correctly." } }, { "@type": "Question", "name": "Why does the cursor jump when typing in a formatted number input?", "acceptedAnswer": { "@type": "Answer", "text": "When a numeric input reformats its value (e.g. adding thousand separators), the cursor position resets to the end. Numora tracks and restores the correct cursor position after every reformat, so the cursor stays exactly where you typed." } }, { "@type": "Question", "name": "Why does <input type=\"number\"> accept scientific notation like 1e5?", "acceptedAnswer": { "@type": "Answer", "text": "The HTML number input spec allows scientific notation (e.g. 1e5 = 100000) even when you only want plain integers. This can corrupt financial or form data. Numora blocks scientific notation characters unless you explicitly enable them." } }, { "@type": "Question", "name": "Why do mobile keyboards cause problems with number inputs?", "acceptedAnswer": { "@type": "Answer", "text": "Mobile keyboards on iOS and Android insert OS-specific characters, use different decimal separators, and sometimes send input events with unexpected key codes. Numora normalises all mobile keyboard input to ensure consistent numeric values across devices." } }, { "@type": "Question", "name": "What is the decimal dilemma with number inputs?", "acceptedAnswer": { "@type": "Answer", "text": "Different locales use different decimal separators — a period in the US (1.5) but a comma in Germany (1,5). <input type=\"number\"> ignores locale and always expects a period, breaking inputs for international users. Numora supports locale-aware decimal separators." } }, { "@type": "Question", "name": "Why do thousand separators make number inputs unreliable?", "acceptedAnswer": { "@type": "Answer", "text": "When you display '1,234' in an <input type=\"number\">, the browser treats the comma as invalid and clears the value. Numora uses a text input internally, formatting visually while exposing a clean raw numeric value." } }, { "@type": "Question", "name": "Why does <input type=\"number\"> lie about its value?", "acceptedAnswer": { "@type": "Answer", "text": "If the user types an invalid number, <input type=\"number\"> returns an empty string for .value instead of the actual text — silently hiding the bad input. Numora always gives you the real raw value so you can validate and handle it correctly." } }] }) },
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
