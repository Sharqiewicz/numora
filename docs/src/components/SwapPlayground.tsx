import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Swap } from './Swap';
import { Link } from '@tanstack/react-router';

interface SwapPlaygroundProps {
  heading?: string;
  description?: string;
}

interface AnnotationProps {
  side: 'left' | 'right';
  title: string;
  description: string;
  delay: number;
  topOffset: string;
  skip: boolean;
}

function Annotation({ side, title, description, delay, topOffset, skip }: AnnotationProps) {
  const isLeft = side === 'left';

  const slideStyle: CSSProperties = skip
    ? { opacity: 1, animation: 'none' }
    : { animationDelay: `${delay}ms`, animationFillMode: 'forwards' };

  const lineStyle: CSSProperties = skip
    ? { opacity: 1, animation: 'none' }
    : { animationDelay: `${delay + 200}ms`, animationFillMode: 'forwards', opacity: 0 };

  const dotStyle: CSSProperties = skip
    ? { opacity: 1, animation: 'none' }
    : {
        animationDelay: `${delay + 400}ms`,
        animationDuration: '0.3s',
        animationFillMode: 'forwards',
      };

  return (
    <div
      className={`
        hidden lg:block absolute w-48
        ${isLeft ? '-left-56 text-right' : '-right-56 text-left'}
        opacity-0
        ${isLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'}
      `}
      style={{ top: topOffset, ...slideStyle }}
    >
      <div
        className={`
          absolute top-2 w-6 h-[2px] bg-gradient-to-r
          ${
            isLeft
              ? '-right-8 from-secondary/0 to-secondary animate-draw-line-right'
              : '-left-8 from-secondary to-secondary/0 animate-draw-line'
          }
        `}
        style={lineStyle}
      />

      <div
        className={`
          absolute top-1 w-2 h-2 rounded-full bg-secondary
          ${isLeft ? '-right-10' : '-left-10'}
          opacity-0 animate-fade-in
        `}
        style={dotStyle}
      />

      <div>
        <div className="text-secondary font-semibold text-sm mb-1 tracking-tight">{title}</div>
        <div className="text-sm text-muted-foreground leading-snug">{description}</div>
      </div>
    </div>
  );
}

export function SwapPlayground({ heading, description }: SwapPlaygroundProps = {}) {
  const [skipIntro] = useState(() => {
    const seen = sessionStorage.getItem('numora_intro_v1');
    if (!seen) sessionStorage.setItem('numora_intro_v1', 'true');
    return !!seen;
  });

  const underlineStyle: CSSProperties = skipIntro
    ? { transform: 'scaleX(1)', transformOrigin: 'center' }
    : { animationDelay: '0.5s' };

  const d = (ms: number): CSSProperties =>
    skipIntro ? { animation: 'none', opacity: 1 } : { animationDelay: `${ms}ms` };

  const defaultHeading = (
    <>
      DeFi swap interface
    </>
  );

  const defaultDescription =
    'A swap form is a good test for a numeric input. It has to sanitize keystrokes, expand scientific notation and keep the cursor in place.';

  return (
    <div className="relative bg-radial-[at_50%_60%] from-white/10 via-white/0 to-white/0">
      <div
        className="flex flex-col items-center gap-3 text-center animate-fade-in opacity-0"
        style={d(0)}
      >
        <div>
          <Link to="/">
            <h1
              className="
                font-numora text-5xl text-white
                drop-shadow-[0_0_30px_oklch(0.694_0.131_276.5_/_0.4)]
              "
            >
              numora.
            </h1>
          </Link>
          <div
            className="
              h-[2px] w-full mx-auto mt-1
              bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0
              animate-expand-line
            "
            style={underlineStyle}
          />
        </div>
      </div>

      <div
        className="text-center mb-12 mt-8 max-w-3xl mx-auto px-6 animate-fade-in opacity-0"
        style={d(150)}
      >
        <h2 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
          {heading ? (
            <>
              Built for <br className="block sm:hidden" />
              <span className="text-secondary">{heading}</span>
            </>
          ) : (
            defaultHeading
          )}
        </h2>
        <p className="text-muted-foreground">{description ?? defaultDescription}</p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Annotation
          side="left"
          title="Real-time formatting"
          description="Separators appear as you type. Your state gets the raw value."
          delay={100}
          topOffset="2.75rem"
          skip={skipIntro}
        />

        <Annotation
          side="left"
          title="Compact notation"
          description="Type 1.5k or 2m, or paste scientific like 1e-7."
          delay={500}
          topOffset="8.875rem"
          skip={skipIntro}
        />

        <Annotation
          side="right"
          title="Cursor control"
          description="The cursor stays put when commas appear or disappear."
          delay={800}
          topOffset="2.75rem"
          skip={skipIntro}
        />

        <Annotation
          side="right"
          title="Sanitization"
          description="Letters, extra dots and stray symbols never reach your state."
          delay={1100}
          topOffset="8.875rem"
          skip={skipIntro}
        />

        <div className="animate-fade-in opacity-0" style={d(250)}>
          <Swap />
        </div>
      </div>
    </div>
  );
}
