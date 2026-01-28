import { HeroBadges } from '@/components/hero-badges';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export function Hero() {
  return (
    <>
      {/* Intro text sequence - refined timing */}
      <p
        className="
          animate-fade-in-out text-center opacity-0 absolute top-14 sm:top-1/12
          left-1/2 -translate-x-1/2 text-lg text-muted-foreground
          tracking-wide
        "
      >
        Stop reinventing the wheel.
      </p>

      <p
        className="
          animate-fade-in-out delay-[1.2s] text-center opacity-0 absolute top-14 sm:top-1/12
          left-1/2 -translate-x-1/2 text-lg text-muted-foreground
          tracking-wide
        "
      >
        just use...
      </p>

      {/* Brand reveal with subtle glow */}
      <div
        className="
          absolute top-14 sm:top-1/12 left-1/2 -translate-x-1/2
          animate-fade-in delay-[2.4s] opacity-0
        "
      >
        <h1
          className="
            font-numora text-5xl text-white
            drop-shadow-[0_0_30px_rgba(167,139,250,0.4)]
          "
        >
          numora.
        </h1>
        {/* Subtle underline accent */}
        <div
          className="
            h-[2px] w-0 mx-auto mt-1
            bg-gradient-to-r from-transparent via-secondary to-transparent
            animate-[expand_0.6s_ease-out_3s_forwards]
          "
        />
      </div>

      {/* Main headline */}
      <h2
        className="
          delay-[3s] animate-fade-in opacity-0
          text-3xl sm:text-4xl text-center
          leading-tight
        "
      >
        The Standard for <br className="block sm:hidden" />
        <strong className="text-secondary relative">
          DeFi Numeric Inputs
          {/* Animated highlight underline */}
          <span
            className="
              absolute -bottom-1 left-0 right-0 h-[3px]
              bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0
              animate-[shimmer_2s_ease-in-out_infinite]
              opacity-50
            "
          />
        </strong>
      </h2>

      {/* Description */}
      <p
        className="
          text-center delay-[3s] animate-fade-in opacity-0 mt-8
          text-muted-foreground max-w-xl leading-relaxed
        "
      >
        Native inputs destroy precision. Regex is fragile.
        <br />
        <strong className="font-numora text-foreground">numora</strong> solves the nightmares of
        building all financial inputs validation, formatting and sanitization.
      </p>

      {/* Badges with staggered entrance */}
      <div
        className="
          delay-[3.2s] animate-fade-in opacity-0 mb-8
        "
      >
        <HeroBadges />
      </div>

      {/* CTA Buttons with hover effects */}
      <div className="delay-[3.4s] animate-fade-in opacity-0 gap-4 flex">
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
            {/* Shine effect on hover */}
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

        <a href="#tamper-proof-section">
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
        </a>
      </div>

    </>
  );
}

export function ScrollIndicator() {
  return (
    <div
      className="
        absolute bottom-8 left-1/2 -translate-x-1/2
        delay-[4s] animate-fade-in opacity-0
      "
    >
      <a
        href="#tamper-proof-section"
        className="
          flex flex-col items-center gap-2
          text-muted-foreground hover:text-foreground
          transition-colors duration-300
          group
        "
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg
          className="
            w-5 h-5
            animate-[bounce_1.5s_ease-in-out_infinite]
            group-hover:text-secondary
            transition-colors duration-300
          "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </a>
    </div>
  );
}
