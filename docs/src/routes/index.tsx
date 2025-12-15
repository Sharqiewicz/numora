import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/hero'
import LightRays from '@/components/LightRays'
import { SwapPlayground } from '@/components/SwapPlayground'
import { SocialProof } from '@/components/social-proof'
import { Socials } from '@/components/socials'

export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
  <div className="min-h-screen animated-gradient-bg relative overflow-x-hidden">
    <Socials className="bg-gray-900/60 border border-gray-900 rounded-full px-8 py-2 animate-fade-in delay-[3s] opacity-0 fixed z-90 bottom-2 left-1/2 -translate-x-1/2 sm:top-4 sm:right-8 sm:translate-x-0 sm:bottom-auto sm:left-auto"  />
    <main className="flex justify-center items-center flex-col">
      <LightRays />
      <section className="min-h-screen container mx-auto flex flex-col items-center justify-center px-4 sm:px-8">
        <Hero />
      </section>
      <section id="tamper-proof-section" className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-8 scroll-mt-8">
        <SwapPlayground  />
      </section>
      <section id="social-proof-section" className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-8 scroll-mt-8">
        <SocialProof />
      </section>
    </main>
    <footer className="mt-16 text-sm text-center pb-16">
        &copy; {new Date().getFullYear()} Numora. Built with  <span className="text-secondary">❤</span> by <a href="https://x.com/sharqiewicz" target="_blank" rel="noopener noreferrer" className="font-numora text-secondary">Kacper Szarkiewicz</a>.
    </footer>
  </div>
  )
}
