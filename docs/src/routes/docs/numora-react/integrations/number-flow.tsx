import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { NumberFlowDemo } from '@/components/NumberFlowDemo'

export const Route = createFileRoute('/docs/numora-react/integrations/number-flow')({
  head: () => ({
    meta: [
      { title: 'NumberFlow Integration | numora-react' },
      { name: 'description', content: 'Compose NumoraInput with @number-flow/react to animate numeric displays without sacrificing input precision.' },
      { property: 'og:title', content: 'NumberFlow Integration | numora-react' },
      { property: 'og:description', content: 'Compose NumoraInput with @number-flow/react to animate numeric displays without sacrificing input precision.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/integrations/number-flow' },
      { name: 'twitter:title', content: 'NumberFlow Integration | numora-react' },
      { name: 'twitter:description', content: 'Compose NumoraInput with @number-flow/react to animate numeric displays without sacrificing input precision.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/integrations/number-flow' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "NumberFlow Integration - Animated numeric display alongside NumoraInput", "description": "Use NumoraInput for precision-critical numeric entry and @number-flow/react for animated digit transitions on read-only displays. Cleanly separates editable precision from display polish.", "url": "https://numeric-input.com/docs/numora-react/integrations/number-flow", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numeric-input.com/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "NumberFlow", "item": "https://numeric-input.com/docs/numora-react/integrations/number-flow" }] }]) },
    ],
  }),
  component: NumberFlowIntegration,
})

function NumberFlowIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>NumberFlow Integration</h1>
      <p className="text-lg text-muted-foreground">
        Compose <code>NumoraInput</code> with{' '}
        <a href="https://number-flow.barvian.me/" target="_blank" rel="noreferrer noopener"><code>@number-flow/react</code></a>{' '}
        to add animated digit transitions to numeric displays - without compromising the precision guarantees of your editable field.
      </p>

      <NumberFlowDemo />

      <h2>Why compose, not replace</h2>
      <p>
        <code>NumoraInput</code> deliberately ships zero animation. The editable field manipulates values as strings only and updates synchronously
        on every keystroke. <code>@number-flow/react</code> is a display-only animator that takes a JavaScript <code>number</code> and tweens
        each digit between renders.
      </p>
      <p>
        Use them together: <strong>NumoraInput owns the editable string</strong>, <strong>NumberFlow renders the animated readout</strong>.
        The animation seam is the only place where you cross the string → number boundary, and only for display digits the user is reading
        (not editing).
      </p>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Precision boundary:</strong> <code>@number-flow/react</code> requires a <code>number</code> prop. Converting via{' '}
          <code>Number(rawValue)</code> is safe for values within the IEEE-754 safe range (≤ 15 significant digits) which covers the vast majority of UI
          read-outs. <strong>Do not round-trip back to a string</strong> for the editable field - keep the raw string as the source of truth and use it
          directly anywhere precision matters (balances, swaps, transfers).
        </p>
      </div>

      <h2>Installation</h2>
      <CodeBlock language="bash">
{`pnpm add numora-react @number-flow/react
# or
npm install numora-react @number-flow/react`}
      </CodeBlock>

      <h2>Pattern 1 - Display animation alongside the input</h2>
      <p>
        The recommended pattern. The user types into a <code>NumoraInput</code>; a separate <code>NumberFlow</code> elsewhere on the page (a converted
        amount, a running total, a portfolio balance) animates as the value changes. Both views share the same raw string state.
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react'
import { NumoraInput, NumoraInputChangeEvent } from 'numora-react'
import NumberFlow from '@number-flow/react'

function SwapForm() {
  const [amount, setAmount] = useState('')

  // The animated readout reads a number, but the input keeps the raw string.
  const displayValue = amount === '' ? 0 : Number(amount)
  const exchangeRate = 1850.42
  const converted = displayValue * exchangeRate

  return (
    <div>
      <label>
        You pay (ETH)
        <NumoraInput
          value={amount}
          onChange={(e: NumoraInputChangeEvent) => setAmount(e.target.value)}
          decimalMaxLength={6}
          thousandSeparator=","
          placeholder="0.0"
        />
      </label>

      <div>
        You receive (USD):{' '}
        <NumberFlow
          value={converted}
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2 }}
        />
      </div>
    </div>
  )
}`}
      </CodeBlock>

      <p>
        The input itself snaps (no animation) - typing latency is unchanged. Only the converted-amount readout animates. This is the cheapest
        integration path and keeps the precision contract intact: the editable string never round-trips through <code>Number</code>.
      </p>

      <h2>Pattern 2 - Blur-mode swap (advanced)</h2>
      <p>
        If you want the editable field itself to look animated when the user isn't typing, swap the input out for an animated display on blur.
        On focus, swap back.
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react'
import { NumoraInput, FormatOn } from 'numora-react'
import NumberFlow from '@number-flow/react'

function AnimatedField() {
  const [amount, setAmount] = useState('')
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <NumoraInput
        autoFocus
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={() => setEditing(false)}
        formatOn={FormatOn.Blur}
        decimalMaxLength={2}
        thousandSeparator=","
      />
    )
  }

  return (
    <button type="button" onClick={() => setEditing(true)}>
      <NumberFlow
        value={amount === '' ? 0 : Number(amount)}
        format={{ minimumFractionDigits: 2 }}
      />
    </button>
  )
}`}
      </CodeBlock>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Tradeoff:</strong> the visual context-switch on focus/blur is more jarring than always-on display animation. The animated display
          also can't show partial states like a trailing decimal (<code>"1."</code>) - it animates to whatever number the string parses to. Use{' '}
          <code>FormatOn.Blur</code> on the input so the displayed value matches what was just typed.
        </p>
      </div>

      <h2>Pattern 3 - Read-only animated totals</h2>
      <p>
        For read-only sections of a page (a portfolio summary that updates from a live price feed, an aggregated total across several inputs),
        skip <code>NumoraInput</code> entirely and use <code>NumberFlow</code> directly.
      </p>

      <CodeBlock language="tsx">
{`import NumberFlow from '@number-flow/react'

function PortfolioTotal({ totalUsd }: { totalUsd: number }) {
  return (
    <div>
      Total balance:{' '}
      <NumberFlow
        value={totalUsd}
        format={{ style: 'currency', currency: 'USD' }}
      />
    </div>
  )
}`}
      </CodeBlock>

      <p>
        This isn't really an integration - it's just the right tool for read-only animated numbers. Use it wherever the value is a number that
        already exists in your state and you don't need string-precision math at the display point.
      </p>

      <h2>What about animating the input itself?</h2>
      <p>
        <code>NumoraInput</code> does <strong>not</strong> animate digits inside the editable field, by design. The two libraries it could
        compete with -{' '}
        <a href="https://github.com/daformat/react-number-flow-input" target="_blank" rel="noreferrer noopener"><code>@daformat/react-number-flow-input</code></a>{' '}
        - implement digit-roll animations directly on a <code>contenteditable</code> with absolutely-positioned overlay wheels. That approach
        adds roughly 3,500+ lines of animation-only code, requires switching off real <code>&lt;input&gt;</code> elements (losing native undo,
        IME, and accessibility primitives), and re-implements platform behaviour that numora delegates to the browser.
      </p>
      <p>
        Numora's position: keep the editable element a real <code>&lt;input&gt;</code>, keep typing snappy, and compose with{' '}
        <code>@number-flow/react</code> when display animation is wanted. Use Pattern 1 by default and Pattern 2 only when the visual identity
        of "everything animates" matters more than the focus/blur context-switch.
      </p>

      <h2>Key points</h2>
      <ul>
        <li>
          <strong>NumoraInput stays the source of truth.</strong> Keep the raw string in state and pass it to anything that needs precision
          (math libraries, API calls, blockchain transactions).
        </li>
        <li>
          <strong>Convert to <code>Number</code> only at the display seam.</strong>{' '}
          <code>Number(rawValue)</code> is safe for ≤ 15 significant digits - fine for human-readable readouts, not fine for token amounts with
          18 decimals at full precision.
        </li>
        <li>
          <strong>No peer dependency.</strong> <code>numora-react</code> doesn't require <code>@number-flow/react</code>. Install it only if you
          want animated displays.
        </li>
        <li>
          <strong>Pattern 1 is the default.</strong> Animate readouts, not the editable field. Cheapest, safest, no API change to numora.
        </li>
        <li>
          <strong>RSC compatibility:</strong> <code>@number-flow/react</code> is a client component (uses DOM APIs and ResizeObserver). Mark any
          page using it with <code>'use client'</code> in Next.js App Router.
        </li>
      </ul>
    </div>
  )
}
