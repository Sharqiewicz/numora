
import { createFileRoute, Link } from '@tanstack/react-router'
import { type CSSProperties, useState } from 'react'
import { Hero } from '@/components/hero'
import { HeroBadges } from '@/components/hero-badges'
import LightRays from '@/components/LightRays'
import { NumoraDemo } from '@/components/NumoraDemo'
import { Socials } from '@/components/socials'
import { Button } from '@/components/ui/button'


export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Numora - Numeric Input & Number Input Library for JavaScript and React' },
      { name: 'description', content: 'Numora is the standard numeric input and number input library for JavaScript and React. Format numbers as you type, thousand separators, decimal limits, cursor management. Zero dependencies, 6.4kb gzipped.' },
      { property: 'og:title', content: 'Numora - Numeric Input & Number Input Library for JavaScript and React' },
      { property: 'og:description', content: 'The only framework-agnostic numeric input and number input library. Format numbers as you type, thousand separators, decimal limits, cursor management.' },
      { property: 'og:url', content: 'https://numora.xyz' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Numora", "applicationCategory": "DeveloperApplication", "operatingSystem": "Web", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "url": "https://numora.xyz", "downloadUrl": "https://www.npmjs.com/package/numora", "keywords": "numeric input, number input, javascript number input, react number input" }, { "@context": "https://schema.org", "@type": "WebSite", "name": "Numora", "url": "https://numora.xyz" }]) },
    ],
  }),
  component: App,
})

function App() {
  const [skipIntro] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    const seen = sessionStorage.getItem('numora_intro_v1');
    if (!seen) sessionStorage.setItem('numora_intro_v1', 'true');
    return !!seen;
  });

  const d = (ms: number): CSSProperties =>
    skipIntro ? { animation: 'none', opacity: 1 } : { animationDelay: `${ms}ms` };

  return (
  <div className="min-h-screen animated-gradient-bg relative overflow-x-hidden">
    <LightRays />
    <Socials
      className="bg-gray-900/60 border border-gray-900 rounded-full px-8 py-2 animate-fade-in opacity-0 fixed z-10 bottom-2 left-1/2 -translate-x-1/2 sm:top-4 sm:right-8 sm:translate-x-0 sm:bottom-auto sm:left-auto"
      style={d(800)}
    />
    <main className="flex justify-center items-center flex-col z-[5] relative">
      <section className="relative container mx-auto flex flex-col items-center pt-28 sm:pt-32 pb-8 px-4 sm:px-8">
        <Hero delay={0} skipIntro={skipIntro} />
        <NumoraDemo style={d(250)} />
        <div
          className="animate-fade-in opacity-0 mb-4"
          style={d(500)}
        >
          <HeroBadges />
        </div>
        <div className="animate-fade-in opacity-0 gap-4 flex" style={d(650)}>
          <Link to="/docs/numora">
            <Button
              className="
                min-w-[150px]
                relative overflow-hidden
                group
                hover:shadow-[0_0_30px_oklch(1_0_0_/_0.2)]
                transition-shadow duration-300
              "
            >
              <span className="relative z-10">Get Started</span>
              <span
                className="
                  absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  group-hover:translate-x-full
                  transition-transform duration-500
                "
              />
            </Button>
          </Link>
          <Link to="/swap">
            <Button
              variant="secondary"
              className="
                min-w-[150px]
                hover:shadow-[0_0_25px_oklch(0.694_0.131_276.5_/_0.3)]
                transition-shadow duration-300
              "
            >
              Try it
            </Button>
          </Link>
        </div>
      </section>
    </main>
    <footer className="mt-16 text-sm text-center pb-16">
        &copy; {new Date().getFullYear()} Numora. Built with  <span className="text-secondary">❤</span> by <a href="https://x.com/sharqiewicz" target="_blank" rel="noopener noreferrer" className="font-numora text-secondary">Kacper Szarkiewicz</a>.
    </footer>
  </div>
  );
}
