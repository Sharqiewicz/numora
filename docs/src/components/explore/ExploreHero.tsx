import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export function ExploreHero() {
  return (
    <section className="relative min-h-[70vh] container mx-auto flex flex-col items-center justify-center px-4 sm:px-8 py-16">
      <div className="animate-fade-in opacity-0 delay-[0.2s]">
        <Badge variant="blue" className="mb-6">
          Interactive Demo
        </Badge>
      </div>

      <h1
        className="
          animate-fade-in opacity-0 delay-[0.4s]
          text-4xl sm:text-5xl md:text-6xl text-center font-semibold
          leading-tight mb-6
        "
      >
        Explore{' '}
        <span className="text-secondary relative">
          Numeric Input Problems
          <span
            className="
              absolute -bottom-2 left-0 right-0 h-[3px]
              bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0
              animate-[shimmer_2s_ease-in-out_infinite]
              opacity-50
            "
          />
        </span>
      </h1>

      <p
        className="
          animate-fade-in opacity-0 delay-[0.6s]
          text-center text-muted-foreground max-w-2xl leading-relaxed mb-8
          text-lg
        "
      >
        See the 7 most painful problems with numeric inputs in web apps.
        Try each demo yourself to experience why{' '}
        <strong className="font-numora text-foreground">numora</strong> exists.
      </p>

      <div className="animate-fade-in opacity-0 delay-[0.8s] flex gap-4 flex-wrap justify-center">
        <a href="#paste-chaos">
          <Button
            className="
              min-w-[150px]
              relative overflow-hidden
              group
              hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]
              transition-shadow duration-300
            "
          >
            <span className="relative z-10">Start Exploring</span>
            <span
              className="
                absolute inset-0 -translate-x-full
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                group-hover:translate-x-full
                transition-transform duration-500
              "
            />
          </Button>
        </a>

        <Link to="/docs/numora">
          <Button
            variant="secondary"
            className="
              min-w-[150px]
              hover:shadow-[0_0_25px_rgba(167,139,250,0.3)]
              transition-shadow duration-300
            "
          >
            Read the Docs
          </Button>
        </Link>
      </div>

      <div
        className="
          absolute bottom-8 left-1/2 -translate-x-1/2
          animate-fade-in opacity-0 delay-[1s]
        "
      >
        <a
          href="#paste-chaos"
          className="
            flex flex-col items-center gap-2
            text-muted-foreground hover:text-foreground
            transition-colors duration-300
            group
          "
        >
          <span className="text-xs tracking-widest uppercase">7 Problems</span>
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
    </section>
  );
}
