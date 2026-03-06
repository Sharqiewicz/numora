import { createFileRoute, Link } from '@tanstack/react-router'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import { FormatOn } from 'numora'

export const Route = createFileRoute('/docs/numora-react/features/decimals')({
  head: () => ({
    meta: [
      { title: 'Decimal Input Validation & Limits | numora-react' },
      { name: 'description', content: 'Validate decimal inputs and enforce limits using the NumoraInput React component. Set max/min decimal places with full TypeScript support.' },
      { property: 'og:title', content: 'Decimal Input Validation & Limits | numora-react' },
      { property: 'og:description', content: 'Validate decimal inputs and enforce limits using the NumoraInput React component. Set max/min decimal places with TypeScript support.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/features/decimals' },
      { name: 'twitter:title', content: 'Decimal Input Validation & Limits | numora-react' },
      { name: 'twitter:description', content: 'Validate decimal inputs and enforce limits using the NumoraInput React component.' },
    ],
  }),
  component: Decimals,
})

function Decimals() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Decimals</h1>
      <p className="text-lg text-muted-foreground">
        Control decimal precision, separators, and locale-aware formatting.
      </p>

      <h2>Precision limits</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Max decimal places"
          description="Try typing more than 2 decimal places - extra digits are truncated"
          language="tsx"
          code={`<NumoraInput maxDecimals={2} />`}
          config={{ maxDecimals: 2 }}
        />
        <ExampleWithDemo
          title="Min decimal places"
          description={'Type "1" and blur - it becomes "1.00"'}
          language="tsx"
          code={`<NumoraInput decimalMinLength={2} maxDecimals={18} />`}
          config={{ decimalMinLength: 2, maxDecimals: 18 }}
        />
      </div>

      <h2>Separators</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="European format"
          description='Type a number - displayed as "1.234,56"'
          language="tsx"
          code={`<NumoraInput decimalSeparator="," thousandSeparator="." formatOn={FormatOn.Change} />`}
          config={{ decimalSeparator: ',', thousandSeparator: '.', formatOn: FormatOn.Change }}
        />
      </div>

      <p>
        For locale-aware separator detection, see{' '}
        <Link to="/docs/numora-react/features/locale" className="text-primary underline">
          Locale
        </Link>
        .
      </p>

      <h2>Automatic behaviors</h2>
      <ul>
        <li><strong>Comma/dot conversion</strong> - when no thousand separator is set, both <code>,</code> and <code>.</code> keystrokes map to the configured decimal separator</li>
        <li><strong>Duplicate prevention</strong> - typing a second decimal separator is blocked</li>
        <li><strong>Paste cleanup</strong> - if multiple separators appear (e.g. <code>"12.34.56"</code>), all but the first are removed (<code>"12.3456"</code>)</li>
      </ul>
    </div>
  )
}
