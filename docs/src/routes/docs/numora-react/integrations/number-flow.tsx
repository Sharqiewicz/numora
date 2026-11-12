import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { NumberFlowCaveats } from '@/components/docs/NumberFlowCaveats';
import { OverlayExplainer } from '@/components/docs/OverlayExplainer';
import { NumberFlowLocalePlayground } from '@/components/NumberFlowLocalePlayground';
import { NumberFlowOverlayDemo } from '@/components/NumberFlowOverlayDemo';

const PAGE_URL = 'https://numeric-input.com/docs/numora-react/integrations/number-flow';
const LIB_URL = 'https://number-flow.barvian.me/';
const AUTHOR_URL = 'https://barvian.me/';

const META_TITLE = 'NumberFlow integration | Numora React';
const META_DESCRIPTION =
  'Use NumberFlow by Maxwell Barvian with Numora React to animate each digit while the real input keeps handling the keyboard, IME and string precision.';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'NumberFlow integration: animated digits on a real numeric input',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'NumberFlow',
        alternateName: ['@number-flow/react', 'number-flow'],
        description:
          'Animated number transition library by Maxwell Barvian, with a React component (@number-flow/react) and a vanilla web component (number-flow).',
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Numora React',
        item: 'https://numeric-input.com/docs/numora-react',
      },
      { '@type': 'ListItem', position: 3, name: 'NumberFlow integration', item: PAGE_URL },
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
          text: 'NumberFlow is an animated number transition library by Maxwell Barvian. It tweens between two numeric values by morphing each digit and supports Intl.NumberFormat options for currency and grouping. It has a React component (@number-flow/react) and a vanilla web component (number-flow).',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use NumberFlow with React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Import NumberFlow from @number-flow/react and render it as the visible layer of a transparent-text NumoraInput overlay. Convert the raw string via Number(rawValue) for the value prop, and mirror the number of typed decimals through minimumFractionDigits so trailing zeros stay aligned with the cursor.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does NumberFlow respect prefers-reduced-motion?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. NumberFlow respects the OS-level prefers-reduced-motion setting by default. If the user opts out, the digit morph becomes an instant swap. You need no extra code.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I install NumberFlow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `NumberFlow lives at ${LIB_URL} and is published on npm as @number-flow/react (React) and number-flow (vanilla web component). Install with npm install numora-react @number-flow/react.`,
        },
      },
    ],
  },
];

export const Route = createFileRoute('/docs/numora-react/integrations/number-flow')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'NumberFlow, NumberFlow React, @number-flow/react, animated numeric input React, Numora React, digit animation, number animation, Maxwell Barvian',
      },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: PAGE_URL }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(JSON_LD) }],
  }),
  component: NumberFlowIntegration,
});

function NumberFlowIntegration() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>NumberFlow integration</h1>
      <p>
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener">
          <strong>NumberFlow</strong> by Maxwell Barvian
        </a>{' '}
        is an animated number transition library. This guide layers a{' '}
        <code>&lt;NumberFlow&gt;</code> on top of a transparent-text Numora React{' '}
        <code>NumoraInput</code>, so the editable surface itself appears animated. The real{' '}
        <code>&lt;input&gt;</code> still handles every keystroke, and NumberFlow renders what the
        user sees.
      </p>
      <p>
        Not using React? See the{' '}
        <Link to="/docs/numora/integrations/number-flow">
          Numora (vanilla) NumberFlow integration
        </Link>
        .
      </p>

      <NumberFlowOverlayDemo />
      <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
        With <code>'change'</code>, digits animate on every keystroke.
      </p>

      <OverlayExplainer
        visibleLayer={
          <>
            a <code>&lt;NumberFlow&gt;</code> that animates the formatted display number.
          </>
        }
        input={
          <>
            the real <code>NumoraInput</code>
          </>
        }
      >
        <p>
          Both layers render the same formatted number. As the user types, Numora React's{' '}
          <code>onValueChange</code> fires. Your handler converts the raw value to a{' '}
          <code>Number</code> and passes it to <code>&lt;NumberFlow&gt;</code>, which tweens each
          digit into place. The input itself never animates, and because its text is transparent,
          you only see the NumberFlow layer.
        </p>
      </OverlayExplainer>

      <div className="bg-signal-amber/10 border border-signal-amber/30 rounded-lg p-4 my-4">
        <p className="m-0">
          <strong>Caution:</strong> this pattern is experimental. Torph animates strings. NumberFlow
          animates numbers. That crosses the string → number boundary at the display layer, which
          causes precision caveats with trailing decimals, partial input states and very large
          values. They are listed below.
        </p>
      </div>

      <h2>Installation</h2>
      <CodeBlock language="bash">
        {`pnpm add numora-react @number-flow/react
# or
npm install numora-react @number-flow/react`}
      </CodeBlock>
      <h2 id="overlay">Building the overlay</h2>

      <CodeBlock language="tsx">
        {`import NumberFlow from '@number-flow/react'
import { NumoraInput } from 'numora-react'
import { useEffect, useState } from 'react'

function AnimatedInput() {
  const [value, setValue] = useState('')
  const [mounted, setMounted] = useState(false)

  // NumberFlow is client-only (uses ResizeObserver). Defer until hydration.
  useEffect(() => { setMounted(true) }, [])

  const decimals = value.includes('.') ? value.split('.')[1].length : 0
  const numericValue = Number(value) || 0

  return (
    <label className="relative inline-flex items-center text-4xl font-mono leading-none text-white">
      {/* Visible layer: NumberFlow animates the digits. aria-hidden: screen readers announce the input. */}
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
        onValueChange={({ value }) => setValue(value)}
        formatOn="change"
        decimalMaxLength={2}
        aria-label="Amount"
        // m-0 p-0 border-0: same text origin as the overlay
        // text-transparent + caret-white: hide the text, keep the cursor
        // placeholder-transparent: hide the input's own placeholder
        // selection:bg-white/25: an opaque selection would cover NumberFlow
        // text-4xl font-mono leading-none: must match the overlay, or the cursor drifts
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
        <li>
          <strong>
            <code>
              formatOn={'{'}'change'{'}'}
            </code>
          </strong>{' '}
          keeps the input's display as the formatted string at all times, matching what NumberFlow
          shows.
        </li>
        <li>
          <strong>
            <code>Number(value)</code> suits fiat-sized amounts only.
          </strong>{' '}
          NumberFlow takes a JavaScript number, so the overlay is exact up to about 15 significant
          digits. Past that, for example an 18-decimal token amount, the animated digits can differ
          from what the input holds. Keep the string from <code>onValueChange</code> as the value
          you store and send. For long amounts use the{' '}
          <a href="/docs/numora-react/integrations/torph">Torph</a> overlay, which animates the
          display string and never converts it.
        </li>
        <li>
          <strong>
            Dynamic <code>minimumFractionDigits</code>
          </strong>{' '}
          matters because <code>Number("1.20") = 1.2</code>, so without it NumberFlow renders{' '}
          <code>"1.2"</code> while the input contains <code>"1.20"</code>. Computing{' '}
          <code>decimals</code> from the raw value and passing it to NumberFlow keeps the visible
          width and the cursor aligned.
        </li>
        <li>
          <strong>
            <code>useGrouping: true</code>
          </strong>{' '}
          makes NumberFlow's grouping match the input's thousand separator. The default en-US locale
          uses <code>","</code>, the same as Numora React's default.
        </li>
        <li>
          <strong>
            <code>mounted</code> gate
          </strong>{' '}
          is needed because <code>@number-flow/react</code> is a client component (it uses DOM APIs
          and <code>ResizeObserver</code>). Render a plain string at SSR; mount NumberFlow after
          hydration. In Next.js App Router, mark the page with <code>'use client'</code> instead.
        </li>
        <li>
          <strong>
            Matching typography on both layers (<code>text-4xl font-mono leading-none</code>)
          </strong>{' '}
          matters because the browser computes the cursor position from the input's text layout. If
          the fonts differ, the cursor drifts.
        </li>
        <li>
          <strong>
            <code>tabular-nums</code> on the overlay
          </strong>{' '}
          keeps digit widths stable while NumberFlow animates, which reduces layout shift during
          transitions.
        </li>
      </ul>

      <NumberFlowCaveats />

      <h2>Try it with any locale</h2>
      <p>
        Pass NumberFlow the same <code>locale</code> as the input (its <code>locales</code> prop).
        Switch the locale below, then type or paste. The playground also passes{' '}
        <code>useGrouping: 'always'</code>, so the two agree in every locale except Arabic and
        Persian, where NumberFlow prints native digits.
      </p>
      <NumberFlowLocalePlayground />

      <h2 id="readout">Display animation alongside the input</h2>
      <p>
        This is the conservative pattern. The user types into a plain <code>NumoraInput</code>, and
        a separate <code>NumberFlow</code> elsewhere on the page (a converted amount or a running
        total, say) animates as the value changes. Both views share the same raw value in state. The
        input has no transparent text and no cursor drift, and the display layer doesn't affect the
        raw value.
      </p>

      <CodeBlock language="tsx">
        {`import NumberFlow from '@number-flow/react'
import { NumoraInput } from 'numora-react'
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
          onValueChange={({ value }) => setAmount(value)}
          decimalMaxLength={6}
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
        The input itself snaps with no animation, so typing latency is unchanged. Only the
        converted-amount readout animates. This is the cheapest integration path, and the editable
        string never round-trips through <code>Number</code>.
      </p>

      <h2>Read-only animated totals</h2>
      <p>
        For read-only sections such as a portfolio summary fed by live prices, skip{' '}
        <code>NumoraInput</code> and use <code>NumberFlow</code> directly. See the{' '}
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener">
          NumberFlow docs
        </a>
        .
      </p>

      <h2>Reducing motion</h2>
      <p>
        NumberFlow respects <code>prefers-reduced-motion</code> by default. If a user opts out of
        animations at the OS level, the digit morph becomes an instant swap. You need no extra code.
      </p>

      <h2>FAQ</h2>

      <h3>What is NumberFlow?</h3>
      <p>
        NumberFlow is an animated number transition library by{' '}
        <a href={AUTHOR_URL} target="_blank" rel="noreferrer noopener">
          Maxwell Barvian
        </a>
        . It tweens between two numeric values by morphing each digit and supports{' '}
        <code>Intl.NumberFormat</code> options for currency and grouping. It has a React component (
        <code>@number-flow/react</code>) and a vanilla web component (<code>number-flow</code>).
      </p>

      <h3>How do I use NumberFlow with React?</h3>
      <p>
        Import <code>NumberFlow</code> from <code>@number-flow/react</code> and render it as the
        visible layer of a transparent-text <code>NumoraInput</code> overlay. Convert the raw string
        via <code>Number(rawValue)</code> for the <code>value</code> prop, and mirror the number of
        typed decimals through <code>minimumFractionDigits</code> so trailing zeros stay aligned
        with the cursor.
      </p>

      <h3>Where can I install NumberFlow?</h3>
      <p>
        NumberFlow lives at{' '}
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener">
          number-flow.barvian.me
        </a>{' '}
        and is published on npm as <code>@number-flow/react</code> (React) and{' '}
        <code>number-flow</code> (vanilla web component). Install with{' '}
        <code>npm install numora-react @number-flow/react</code>.
      </p>
    </div>
  );
}
