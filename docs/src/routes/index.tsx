
import { createFileRoute, Link } from '@tanstack/react-router'
import jsLogo from '@/assets/frameworks/js.svg'
import reactLogo from '@/assets/frameworks/react.svg'
import svelteLogo from '@/assets/frameworks/svelte.svg'
import vueLogo from '@/assets/frameworks/vue.svg'
import { Hero, ScrollIndicator } from '@/components/hero'
import { HeroBadges } from '@/components/hero-badges'
import LightRays from '@/components/LightRays'
import { NumoraDemo } from '@/components/NumoraDemo'
import { SwapPlayground } from '@/components/SwapPlayground'
import { SocialProof } from '@/components/social-proof'
import { Socials } from '@/components/socials'
import { Button } from '@/components/ui/button'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

const frameworks = [
  { name: 'React', note: 'numora-react', logo: reactLogo },
  { name: 'Vue', note: 'numora', logo: vueLogo },
  { name: 'Svelte', note: 'numora', logo: svelteLogo },
  { name: 'Vanilla JS', note: 'numora', logo: jsLogo },
]

function InstallCTA() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 })

  return (
    <div ref={ref} className="py-8 px-4 w-full max-w-2xl mx-auto">
      <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 scroll-reveal ${isVisible ? 'is-visible' : ''}`}>
        <code className="px-5 py-3 rounded-lg bg-[#181a1b] border border-[#23272b] text-sm font-mono text-muted-foreground">
          npm install numora
        </code>
        <Link to="/docs/numora">
          <Button className="min-w-[150px] relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow duration-300">
            <span className="relative z-10">Get Started →</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-500" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function FrameworkSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 })

  return (
    <div ref={ref} className="py-16 px-4 w-full max-w-4xl mx-auto">
      <div className={`text-center mb-10 scroll-reveal ${isVisible ? 'is-visible' : ''}`}>
        <p className="text-xs text-secondary uppercase tracking-widest font-semibold mb-3">
          The only framework-agnostic numeric input library
        </p>
        <h2 className="text-3xl mb-4">
          Every framework. One library.
        </h2>
        <p className="text-muted-foreground">
          Every alternative is React-only.{' '}
          <strong className="text-foreground">numora</strong> is the first numeric input library
          with a zero-dependency core that runs anywhere - and first-class React bindings when you need them.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {frameworks.map(({ name, note, logo }, i) => (
          <div
            key={name}
            className={`
              scroll-reveal ${isVisible ? 'is-visible' : ''}
              rounded-xl border border-[#23272b] bg-[#181a1b] p-5 text-center
              hover:border-secondary/40 transition-all duration-300
            `}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <img src={logo} alt={name} className="h-8 w-8 mx-auto mb-3" />
            <div className="text-sm font-semibold text-foreground">{name}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
  <div className="min-h-screen animated-gradient-bg relative overflow-x-hidden">
    <LightRays />
    <Socials className="bg-gray-900/60 border border-gray-900 rounded-full px-8 py-2 animate-fade-in delay-[3s] opacity-0 fixed z-90 bottom-2 left-1/2 -translate-x-1/2 sm:top-4 sm:right-8 sm:translate-x-0 sm:bottom-auto sm:left-auto z-[8]"  />
    <main className="flex justify-center items-center flex-col z-[5] relative">
      <section className="relative container mx-auto flex flex-col items-center pt-36 sm:pt-40 pb-8 px-4 sm:px-8">
        <Hero />
        <NumoraDemo />


      <div
        className="
           animate-fade-in opacity-0 mb-4
        "
      >
        <HeroBadges />
      </div>


        <div className="animate-fade-in opacity-0 gap-4 flex">
        <Link to="/docs/numora">
          <Button
            className="
              min-w-[150px]
              relative overflow-hidden
              group
              hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]
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
                hover:shadow-[0_0_25px_rgba(167,139,250,0.3)]
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
  )
}
