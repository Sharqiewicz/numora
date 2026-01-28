import { Swap } from './Swap';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface AnnotationProps {
  side: 'left' | 'right';
  title: string;
  description: string;
  delay: number;
  topOffset: string;
}

function Annotation({ side, title, description, delay, topOffset }: AnnotationProps) {
  const isLeft = side === 'left';

  return (
    <div
      className={`
        hidden md:block absolute w-44
        ${isLeft ? '-left-52 text-right' : '-right-52 text-left'}
        opacity-0
        ${isLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'}
      `}
      style={{
        top: topOffset,
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Connector line */}
      <div
        className={`
          absolute top-2 w-6 h-[2px] bg-gradient-to-r
          ${isLeft
            ? '-right-8 from-transparent to-secondary animate-draw-line-right'
            : '-left-8 from-secondary to-transparent animate-draw-line'
          }
        `}
        style={{
          animationDelay: `${delay + 200}ms`,
          animationFillMode: 'forwards',
          opacity: 0
        }}
      />

      {/* Dot connector */}
      <div
        className={`
          absolute top-1 w-2 h-2 rounded-full bg-secondary
          ${isLeft ? '-right-10' : '-left-10'}
          opacity-0 animate-fade-in
        `}
        style={{
          animationDelay: `${delay + 400}ms`,
          animationDuration: '0.3s',
          animationFillMode: 'forwards'
        }}
      />

      {/* Content */}
      <div className="animate-float-gentle" style={{ animationDelay: `${delay + 600}ms` }}>
        <div className="text-secondary font-semibold text-sm mb-1 tracking-tight">
          {title}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
}

export function SwapPlayground() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="pb-16 relative bg-radial-[at_50%_60%] from-white/10 via-transparent to-transparent"
    >
      <div
        className={`
          text-center mb-12 max-w-3xl mx-auto px-6
          scroll-reveal ${isVisible ? 'is-visible' : ''}
        `}
      >
        <h2 className="text-4xl mb-4">
          Built for the <br className="block sm:hidden" />
          <span className="text-secondary">Swap Interface</span>
        </h2>
        <p className="text-muted-foreground">
          Handling numeric state in DeFi is deceptively hard. You need to sanitize "bad" keystrokes,
          handle scientific notation, calculate the caret position and more...
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        {isVisible && (
          <>
            <Annotation
              side="left"
              title="Real-time Formatting"
              description="Auto-formats with commas as you type. Cursor stays in place."
              delay={300}
              topOffset="1.25rem"
            />

            <Annotation
              side="left"
              title="Compact Notation"
              description="Type 1k, 1m, 1b... Or paste scientific like 1e-5."
              delay={500}
              topOffset="10rem"
            />

            <Annotation
              side="right"
              title="Precision Control"
              description="Prevents overflow beyond 18 decimals automatically."
              delay={400}
              topOffset="5rem"
            />

            <Annotation
              side="right"
              title="Sanitization"
              description="All inputs are sanitized instantly. No bad data gets through."
              delay={600}
              topOffset="14rem"
            />
          </>
        )}

        <div
          className={`
            scroll-reveal ${isVisible ? 'is-visible' : ''}
          `}
          style={{ transitionDelay: '0.1s' }}
        >
          <Swap />
        </div>
      </div>
    </div>
  );
}
