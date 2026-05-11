import { Link } from '@tanstack/react-router'
import type { SectionProps } from './types'

export function Hero({ pkg }: SectionProps) {
  const installPath = pkg === 'numora-react' ? '/docs/numora-react/installation' : '/docs/numora/installation'

  return (
    <section className="not-prose mb-16 space-y-6 border-b border-border/40 pb-12">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        How a numeric input actually works.
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        We'll dissect the HTML <code className="rounded bg-muted px-1 py-0.5 font-mono text-base">&lt;input&gt;</code>{' '}
        element, watch the four events that fire on every keystroke, see what breaks when
        users paste real-world numbers, and rebuild it with{' '}
        <span className="text-foreground">{pkg === 'numora-react' ? 'numora-react' : 'numora'}</span> step by step.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href="#sanitization"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          See the pipeline →
        </a>
        <Link
          to={installPath}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
        >
          Install
        </Link>
      </div>
    </section>
  )
}
