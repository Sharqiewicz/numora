import { Link } from '@tanstack/react-router';
import { FormatOn, ThousandStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { demoInputClass, demoInputLgClass } from '../kit';
import type { SectionProps } from './types';

export function Hero({ pkg }: SectionProps) {
  const installPath =
    pkg === 'numora-react' ? '/docs/numora-react/installation' : '/docs/numora/installation';

  return (
    <section className="not-prose mb-16 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        How a numeric input works
      </h1>
      <div className="max-w-md">
        <NumoraInput
          formatOn={FormatOn.Change}
          thousandSeparator=","
          thousandStyle={ThousandStyle.Thousand}
          maxDecimals={2}
          defaultValue="1234567.89"
          aria-label="Try Numora: type a number"
          className={`${demoInputClass} ${demoInputLgClass}`}
        />
      </div>
      <p className="max-w-2xl text-lg text-muted-foreground">
        How the HTML <code className="font-mono text-base">&lt;input&gt;</code> handles numbers, where
        it breaks, and how{' '}
        <span className="text-foreground">
          {pkg === 'numora-react' ? 'numora-react' : 'numora'}
        </span>{' '}
        fixes it.
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a
          href="#sanitization"
          className="text-muted-foreground underline-offset-4 transition-colors duration-150 ease-out-expo hover:text-foreground hover:underline"
        >
          See the pipeline
        </a>
        <Link
          to={installPath}
          className="text-muted-foreground underline-offset-4 transition-colors duration-150 ease-out-expo hover:text-foreground hover:underline"
        >
          Install
        </Link>
      </div>
    </section>
  );
}
