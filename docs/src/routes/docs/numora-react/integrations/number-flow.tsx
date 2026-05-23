import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { NumberFlowOverlayDemo } from '@/components/NumberFlowOverlayDemo'

const PAGE_URL = 'https://numeric-input.com/docs/numora-react/integrations/number-flow'
const LIB_URL = 'https://number-flow.barvian.me/'
const AUTHOR_URL = 'https://barvian.me/'

const META_TITLE = 'NumberFlow Integration - Animated Numeric Input with Numora React'
const META_DESCRIPTION = 'Integrate NumberFlow by Maxwell Barvian with Numora React to animate each digit while the real input keeps owning the keyboard, undo, IME, and string precision.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'NumberFlow Integration with Numora React - Animated digits on a real numeric input',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'NumberFlow',
        alternateName: ['@number-flow/react', 'number-flow'],
        description: 'Animated number transition library by Maxwell Barvian, with a React component (@number-flow/react) and a vanilla web component (number-flow).',
        url: LIB_URL,
        author: { '@type': 'Person', name: 'Maxwell Barvian', url: AUTHOR_URL },
      },
      {
        '@type': 'SoftwareSourceCode',
        name: 'Numora React',
        alternateName: ['numora-react', 'numora'],
        url: 'https://numeric-input.com/docs/numora-react',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
      { '@type': 'ListItem', position: 2, name: 'Numora React', item: 'https://numeric-input.com/docs/numora-react' },
      { '@type': 'ListItem', position: 3, name: 'NumberFlow', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is NumberFlow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NumberFlow is an animated number transition library by Maxwell Barvian. It tweens between two numeric values by morphing each digit, supports Intl.NumberFormat options for currency and grouping, and ships both a React component (@number-flow/react) and a vanilla web component (number-flow).',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use NumberFlow with React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Import NumberFlow from @number-flow/react and render it inside the visible layer of a transparent-text NumoraInput overlay. Convert the raw string to Number(rawValue) and pass it as the value prop. Mirror the number of typed decimals through minimumFractionDigits so trailing zeros stay aligned with the caret.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does NumberFlow respect prefers-reduced-motion?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. NumberFlow respects the OS-level prefers-reduced-motion setting by default. If the user opts out of animations, NumberFlow becomes an instant swap with no extra configuration.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I find NumberFlow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `NumberFlow lives at ${LIB_URL} and is published on npm as @number-flow/react (React) and number-flow (vanilla web component).`,
        },
      },
    ],
  },
]

export const Route = createFileRoute('/docs/numora-react/integrations/number-flow')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'NumberFlow, NumberFlow React, @number-flow/react, animated numeric input React, Numora React, digit animation, number animation, Maxwell Barvian' },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [
      { rel: 'canonical', href: PAGE_URL },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify(JSON_LD) },
    ],
  }),
  component: NumberFlowIntegration,
})

function NumberFlowIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>NumberFlow Integration with Numora React</h1>
      <p className="text-lg text-muted-foreground">
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener"><strong>NumberFlow</strong> by Maxwell Barvian</a>{' '}
        is an animated number transition library. This guide layers a{' '}
        <code>&lt;NumberFlow&gt;</code> on top of a transparent-text Numora React{' '}
        <code>NumoraInput</code> so the editable surface itself appears animated. The real{' '}
        <code>&lt;input&gt;</code> still handles every keystroke; NumberFlow just renders what the user sees.
      </p>

      <NumberFlowOverlayDemo />
      <p className="text-center text-sm text-muted-foreground -mt-12 mb-12">
        <code>FormatOn.Change</code> - digits animate on every keystroke.
      </p>

      <h2>How the overlay works</h2>
      <p>
        Native <code>&lt;input&gt;</code> elements render their <code>value</code> as a string with no child DOM, so animation libraries
        can't inject animated spans into them directly. The overlay sidesteps that constraint by stacking two layers in the same box:
      </p>
      <ul>
        <li><strong>Visible layer:</strong> a <code>&lt;NumberFlow&gt;</code> that animates the formatted display number.</li>
        <li><strong>Keyboard layer:</strong> the real <code>NumoraInput</code> positioned on top with <code>color: transparent</code> and a visible caret. It still owns focus, keystrokes, selection, undo, IME, and mobile <code>inputmode</code>.</li>
      </ul>
      <p>
        Both layers render the same formatted number. As the user types, numora's <code>onChange</code> fires; the raw string is converted to a{' '}
        <code>Number</code> and passed to <code>&lt;NumberFlow&gt;</code>; NumberFlow tweens each digit into place. The input itself never
        animates - but because its text is transparent, you only see the NumberFlow layer.
      </p>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Experimental pattern.</strong> Unlike Torph (which animates strings), NumberFlow animates numbers. That crosses the{' '}
          string → number boundary at the display seam and introduces fidelity caveats around trailing decimals, partial input states,
          and very large values. Documented below.
        </p>
      </div>

      <h2>Installation</h2>
      <CodeBlock language="bash">
{`pnpm add numora-react @number-flow/react
# or
npm install numora-react @number-flow/react`}
      </CodeBlock>

      <h2 id="pattern-1-overlay">Pattern 1 - Overlay (animated input surface)</h2>
      <p>
        Implementation is short. The key constraints: identical typography on both layers,{' '}
        <code>FormatOn.Change</code> on the input, and a dynamic <code>minimumFractionDigits</code> on NumberFlow so the
        visible width tracks what the user typed (including trailing zeros).
      </p>

      <CodeBlock language="tsx">
{`import NumberFlow from '@number-flow/react'
import { FormatOn } from 'numora'
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react'
import { useEffect, useState } from 'react'

function AnimatedInput() {
  const [value, setValue] = useState('')
  const [mounted, setMounted] = useState(false)

  // NumberFlow is client-only (uses ResizeObserver). Defer until hydration.
  useEffect(() => { setMounted(true) }, [])

  // Mirror the input's typed decimals so trailing zeros line up under the caret.
  const decimals = value.includes('.') ? value.split('.')[1].length : 0
  const numericValue = value === '' ? 0 : Number(value)

  return (
    <label className="relative inline-flex items-center text-4xl font-mono leading-none text-white">
      {/* Visible layer: NumberFlow animates the digits */}
      <span aria-hidden="true" className="pointer-events-none whitespace-pre tabular-nums">
        {mounted ? (
          <NumberFlow
            value={numericValue}
            format={{
              useGrouping: true,
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }}
          />
        ) : '0'}
      </span>

      {/* Invisible layer: real input owns the keyboard */}
      <NumoraInput
        value={value}
        onChange={(e: NumoraInputChangeEvent) => setValue(e.target.value)}
        formatOn={FormatOn.Change}
        maxDecimals={2}
        thousandSeparator=","
        aria-label="Amount"
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent
                   text-transparent placeholder-transparent caret-white
                   outline-none focus:outline-none selection:bg-white/25
                   text-4xl font-mono leading-none"
      />
    </label>
  )
}`}
      </CodeBlock>

      <h3>Why each line matters</h3>
      <ul>
        <li><strong><code>formatOn: FormatOn.Change</code></strong> - keeps the input's display as the formatted string at all times, matching what NumberFlow shows.</li>
        <li><strong>Dynamic <code>minimumFractionDigits</code></strong> - <code>Number("1.20") = 1.2</code>, so without this NumberFlow renders <code>"1.2"</code> while the input contains <code>"1.20"</code>. Computing <code>decimals</code> from the raw string and feeding it to NumberFlow keeps the visible width and the caret aligned.</li>
        <li><strong><code>useGrouping: true</code></strong> - NumberFlow's grouping must match the input's thousand separator. The default en-US locale uses <code>","</code>, which lines up with <code>thousandSeparator=","</code>.</li>
        <li><strong><code>mounted</code> gate</strong> - <code>@number-flow/react</code> is a client component (uses DOM APIs and <code>ResizeObserver</code>). Render a plain string at SSR; mount NumberFlow after hydration. In Next.js App Router, mark the page with <code>'use client'</code> instead.</li>
        <li><strong><code>text-transparent</code> + <code>caret-white</code></strong> - hides the input's text but keeps the browser-rendered caret. The caret is the only thing the user sees from the real input.</li>
        <li><strong>Matching typography on both layers (<code>text-4xl font-mono leading-none</code>)</strong> - the caret position is computed from the input's text layout. If fonts differ, the caret drifts.</li>
        <li><strong><code>tabular-nums</code> on the overlay</strong> - keeps digit widths stable while NumberFlow animates, reducing layout shift during transitions.</li>
        <li><strong><code>m-0 p-0 border-0</code></strong> - browser default input padding shifts the text origin. Zero padding aligns the input's text rendering with the overlay's text rendering.</li>
        <li><strong><code>selection:bg-white/25</code></strong> - the input's text is transparent, so a default opaque selection rect would obscure the NumberFlow layer. A translucent selection lets the animated text show through.</li>
        <li><strong><code>placeholder-transparent</code></strong> - the input's own placeholder would otherwise be visible. The overlay shows <code>"0"</code> as a fallback instead.</li>
        <li><strong><code>aria-hidden</code> on the overlay span</strong> - screen readers should announce the <code>&lt;input&gt;</code>, not the visible decoration. The input has <code>aria-label</code>.</li>
      </ul>

      <h2>Caveats</h2>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Partial-input states.</strong> NumberFlow takes a <code>number</code>. While the user is typing{' '}
          <code>"1."</code> (a digit then a dot, no decimals yet), <code>Number("1.")</code> is <code>1</code> and NumberFlow renders{' '}
          <code>"1"</code> with no dot. The caret hovers just past the (invisible) input's dot, which is one character beyond the visible{' '}
          <code>"1"</code>. This is unfixable without forking how NumberFlow renders. Brief and self-correcting once a fractional digit
          is typed.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Precision ceiling.</strong> Numora handles strings of any length. <code>Number()</code> is safe up to 15 significant digits.
          For DeFi token amounts at 18-decimal precision, the overlay loses tail digits at the display layer - but the editable string (passed
          to your math / contracts) is untouched. The overlay is a display lie, not a state lie.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Caret drift during animation.</strong> The caret's pixel position is computed from the input's invisible text layout,
          which jumps to the new value instantly. NumberFlow animates digits into that final position over ~150ms. Mid-flight, the caret
          briefly floats next to characters that haven't arrived yet.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Mid-string editing is limited.</strong> Clicking the overlay span passes the click through to the input, but the browser's
          hit-test runs against the input's invisible text. During NumberFlow's mid-animation width transitions, click-to-caret lands on
          the wrong character. For append-only fields this doesn't matter; for fields where users edit mid-number, this pattern isn't a fit.
        </p>
      </div>

      <h2 id="pattern-2-readout">Pattern 2 - Display animation alongside the input</h2>
      <p>
        The conservative pattern. The user types into a plain <code>NumoraInput</code>; a separate <code>NumberFlow</code> elsewhere on the
        page (a converted amount, a running total, a portfolio balance) animates as the value changes. Both views share the same raw string
        state. No transparent-text trickery, no caret drift, no precision lies at the display layer.
      </p>

      <CodeBlock language="tsx">
{`import NumberFlow from '@number-flow/react'
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react'
import { useState } from 'react'

function SwapForm() {
  const [amount, setAmount] = useState('')

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
          maxDecimals={6}
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

      <h2 id="pattern-3-blur">Pattern 3 - Blur-mode swap</h2>
      <p>
        If you want the editable field itself to look animated when the user isn't typing, swap the input out for a NumberFlow display on
        blur. On focus, swap back. Cleaner than the overlay (no caret drift, no transparent text) at the cost of a focus/blur context switch.
      </p>

      <CodeBlock language="tsx">
{`import NumberFlow from '@number-flow/react'
import { FormatOn } from 'numora'
import { NumoraInput } from 'numora-react'
import { useState } from 'react'

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
        maxDecimals={2}
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
          <strong>Tradeoff:</strong> the visual context-switch on focus/blur is more jarring than always-on display animation. Use{' '}
          <code>FormatOn.Blur</code> on the input so the value shown after editing matches what was just typed (separators applied on blur).
        </p>
      </div>

      <h2 id="pattern-4-readonly">Pattern 4 - Read-only animated totals</h2>
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

      <h2>Reducing motion</h2>
      <p>
        NumberFlow respects <code>prefers-reduced-motion</code> by default. If a user opts out of animations at the OS level the digit
        morph becomes an instant swap - no extra code needed.
      </p>

      <h2>Key points</h2>
      <ul>
        <li>
          <strong>NumoraInput stays the source of truth.</strong> Keep the raw string in state and pass it to anything that needs precision
          (math libraries, API calls, blockchain transactions). The overlay's <code>Number()</code> conversion is for display only.
        </li>
        <li>
          <strong>The input still owns the keyboard.</strong> Undo, redo, IME, paste, mobile <code>inputmode="decimal"</code>, native form
          submission all keep working in Pattern 1. The overlay is a display layer.
        </li>
        <li>
          <strong>Mirror typed decimals into <code>minimumFractionDigits</code>.</strong> Without this NumberFlow drops trailing zeros and the
          caret drifts off the end of the rendered number.
        </li>
        <li>
          <strong>Pattern 2 is the safe default.</strong> Animate readouts, not the editable field. No precision compromise, no caret drift.
          Pick Pattern 1 only when "the input itself animates" is the visual identity you want.
        </li>
        <li>
          <strong>RSC compatibility:</strong> <code>@number-flow/react</code> is a client component. Mark any Next.js App Router page using it
          with <code>'use client'</code>.
        </li>
      </ul>

      <h2>FAQ</h2>

      <h3>What is NumberFlow?</h3>
      <p>
        NumberFlow is an animated number transition library by{' '}
        <a href={AUTHOR_URL} target="_blank" rel="noreferrer noopener">Maxwell Barvian</a>. It tweens between two numeric values
        by morphing each digit, supports <code>Intl.NumberFormat</code> options for currency and grouping, and ships both a React
        component (<code>@number-flow/react</code>) and a vanilla web component (<code>number-flow</code>).
      </p>

      <h3>How do I use NumberFlow with React?</h3>
      <p>
        Import <code>NumberFlow</code> from <code>@number-flow/react</code> and render it as the visible layer of a transparent-text{' '}
        <code>NumoraInput</code> overlay. Convert the raw string via <code>Number(rawValue)</code> for the <code>value</code> prop, and
        mirror the number of typed decimals through <code>minimumFractionDigits</code> so trailing zeros stay aligned with the caret.
      </p>

      <h3>Does NumberFlow respect <code>prefers-reduced-motion</code>?</h3>
      <p>
        Yes. NumberFlow respects the OS-level <code>prefers-reduced-motion</code> setting by default. If the user opts out, NumberFlow
        becomes an instant swap - no extra code needed.
      </p>

      <h3>Where can I install NumberFlow?</h3>
      <p>
        NumberFlow lives at{' '}
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener">number-flow.barvian.me</a>{' '}
        and is published on npm as <code>@number-flow/react</code> (React) and <code>number-flow</code> (vanilla web component).
        Install with <code>npm install numora-react @number-flow/react</code>.
      </p>
    </div>
  )
}
