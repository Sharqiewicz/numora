import { createFileRoute } from '@tanstack/react-router'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/numora-react/features/scientific-notation')({
  head: () => ({
    meta: [
      { title: 'Scientific Notation Input (1e-18) | numora-react' },
      { name: 'description', content: 'Handle scientific notation input using the NumoraInput React component. Prevent 1e-18 issues and preserve full expanded decimal strings for token amounts.' },
      { property: 'og:title', content: 'Scientific Notation Input (1e-18) | numora-react' },
      { property: 'og:description', content: 'Handle scientific notation input using the NumoraInput React component. Prevent 1e-18 issues for DeFi token amounts.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/features/scientific-notation' },
      { name: 'twitter:title', content: 'Scientific Notation Input (1e-18) | numora-react' },
      { name: 'twitter:description', content: 'Handle scientific notation (1e-18) using the NumoraInput React component.' },
    ],
  }),
  component: ScientificNotation,
})

function ScientificNotation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Scientific Notation</h1>
      <p className="text-lg text-muted-foreground">
        Numora always expands scientific notation to decimal notation. This is automatic and cannot
        be disabled. Expansion uses string arithmetic, so there is no floating-point precision loss.
      </p>

      <ExampleWithDemo
        description={'Try pasting "1.5e-7", "2e+5", or "1.5e-18" - all are expanded automatically'}
        language="tsx"
        code={`<NumoraInput maxDecimals={18} />`}
        config={{ maxDecimals: 18 }}
      />

      <p>
        Both <code>e</code> and <code>E</code> are supported. The expanded value is then processed
        through the rest of the sanitization pipeline and formatted according to your configuration.
      </p>
    </div>
  )
}
