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
    : { animationDelay: `${delay + 400}ms`, animationDuration: '0.3s', animationFillMode: 'forwards' };

  return (
    <div
      className={`
        hidden md:block absolute w-44
        ${isLeft ? '-left-52 text-right' : '-right-52 text-left'}
        opacity-0
        ${isLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'}
      `}
      style={{ top: topOffset, ...slideStyle }}
    >
      <div
        className={`
          absolute top-2 w-6 h-[2px] bg-gradient-to-r
          ${isLeft
            ? '-right-8 from-transparent to-secondary animate-draw-line-right'
            : '-left-8 from-secondary to-transparent animate-draw-line'
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
      <span className="text-secondary">DeFi Swap Interface</span>
    </>
  );

  const defaultDescription =
    'One example of where numora shines. Handling numeric state in DeFi is deceptively hard - sanitize keystrokes, expand scientific notation, preserve cursor position, and more.';

  return (
    <div className="relative bg-radial-[at_50%_60%] from-white/10 via-transparent to-transparent">
      <div className="flex flex-col items-center gap-3 text-center animate-fade-in opacity-0" style={d(0)}>
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
              bg-gradient-to-r from-transparent via-secondary to-transparent
              animate-expand-line
            "
            style={underlineStyle}
          />
        </div>
      </div>

      <div className="text-center mb-12 mt-8 max-w-3xl mx-auto px-6 animate-fade-in opacity-0" style={d(150)}>
        <h2 className="[text-wrap:balance] text-4xl mb-4">
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
          title="Real-time Formatting"
          description="Auto-formats with commas as you type. Cursor stays in place. (on blur or on change)"
          delay={100}
          topOffset="1.25rem"
          skip={skipIntro}
        />

        <Annotation
          side="left"
          title="Compact Notation"
          description="Type 1k, 1m, 1b... Or paste scientific like 1e-5."
          delay={500}
          topOffset="10rem"
          skip={skipIntro}
        />

        <Annotation
          side="right"
          title="Cursor control"
          description="No cursor jumping when typing/removing characters."
          delay={800}
          topOffset="5rem"
          skip={skipIntro}
        />

        <Annotation
          side="right"
          title="Sanitization"
          description="All inputs are sanitized instantly. No bad data gets through."
          delay={1100}
          topOffset="14rem"
          skip={skipIntro}
        />

        <div className="animate-fade-in opacity-0" style={d(250)}>
          <Swap />
        </div>
      </div>
    </div>
  );
}
