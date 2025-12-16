import { HeroBadges } from '@/components/hero-badges'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export function Hero() {

    return (
        <>
          <p className="animate-fade-in-out text-center opacity-0 absolute top-14 sm:top-1/12 left-1/2 -translate-x-1/2 text-lg">Stop reinventing the wheel.</p>
          <p className="animate-fade-in-out delay-[1.2s] text-center opacity-0 absolute top-14  sm:top-1/12  left-1/2 -translate-x-1/2 text-lg">just use...</p>
          <h1 className="font-numora text-5xl text-white animate-fade-in delay-[2.4s] opacity-0 absolute top-14  sm:top-1/12  left-1/2 -translate-x-1/2">numora.</h1>
          <h2 className="delay-[3s] animate-fade-in opacity-0 text-3xl sm:text-4xl text-center">The Standard for <br className="block sm:hidden" /> <strong className="text-secondary">DeFi Numeric Inputs</strong></h2>
          <p className="text-center delay-[3s] animate-fade-in opacity-0 mt-8"> Native inputs destroy precision. Regex is fragile. <br/>
            <strong className="font-numora">numora</strong> solves the nightmares of building all financial inputs validation, formatting and sanitization.
          </p>
          <div className="delay-[3s] animate-fade-in opacity-0 mb-8"> <HeroBadges /></div>
          <div className="delay-[3s] animate-fade-in opacity-0 gap-4 flex">
            <Link to="/docs/numora"><Button className="min-w-[150px]" >Get Started</Button></Link>
          <a href="#tamper-proof-section"><Button variant="secondary" className="min-w-[150px]" >Try it</Button></a></div>
        </>
    )
}