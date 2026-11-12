import { Link } from '@tanstack/react-router';
import { NumoraInput } from 'numora-react';
import { demoInputClass, demoInputLgClass } from '../kit';
import type { SectionProps } from './types';

export function Hero({ pkg }: SectionProps) {
  const installPath =
    pkg === 'numora-react' ? '/docs/numora-react/installation' : '/docs/numora/installation';

  return (
    <section className="not-prose mb-16 space-y-6">
      <h1 className="text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em]">
        How a numeric input works
      </h1>
      <div className="max-w-md">
        <NumoraInput
          formatOn="change"
          thousandSeparator=","
          groupingStyle="thousand"
          decimalMaxLength={2}
          defaultValue="1234567.89"
          aria-label="Try Numora: type a number"
          className={`${demoInputClass} ${demoInputLgClass}`}
        />
      </div>
      <p className="max-w-2xl text-lg text-muted-foreground">
        How the HTML <code className="font-mono text-base">&lt;input&gt;</code> handles numbers,
        where it breaks, and how{' '}
        <span className="text-foreground">
          {pkg === 'numora-react' ? 'numora-react' : 'numora'}
        </span>{' '}
        fixes it.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <a
          href="#sanitization"
          className="inline-flex min-h-9 items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-[transform,background-color] duration-150 ease-out-expo active:scale-[0.96] [@media(hover:hover)]:hover:bg-foreground/85 [@media(pointer:coarse)]:min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          See the pipeline
        </a>
        <Link
          to={installPath}
          className="inline-flex items-center rounded-sm text-foreground underline [@media(pointer:coarse)]:min-h-11 decoration-foreground/35 decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-150 ease-out-expo [@media(hover:hover)]:hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Install
        </Link>
      </div>
    </section>
  );
}
