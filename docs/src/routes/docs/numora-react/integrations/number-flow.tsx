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
          text: 'Import NumberFlow from @number-flow/react and render it as a readout next to a NumoraInput, fed from the same raw value. To animate the field itself, render NumberFlow under a transparent-text NumoraInput, pass it the raw string as the value prop, and mirror the number of typed decimals through minimumFractionDigits so trailing zeros stay aligned with the caret.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does NumberFlow respect prefers-reduced-motion?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. NumberFlow respects the OS-level prefers-reduced-motion setting by default. If the user opts out, the digits swap without animating. You need no extra code.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I install NumberFlow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `NumberFlow's docs are at ${LIB_URL}. It is published on npm as @number-flow/react (React) and number-flow (vanilla web component). Install with npm install numora-react @number-flow/react.`,
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
        is an animated number transition library. This guide pairs it with Numora React's{' '}
        <code>NumoraInput</code> in two ways. The <a href="#readout">readout</a> animates a number
        next to the field and is the recommended one. The <a href="#overlay">overlay</a> draws a{' '}
        <code>&lt;NumberFlow&gt;</code> under a transparent-text input, so the field itself appears
        animated. It is experimental.
      </p>

      <NumberFlowOverlayDemo />
      <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
        The overlay. With <code>'change'</code>, digits animate on every keystroke.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash">
        {`pnpm add numora-react @number-flow/react
# or
npm install numora-react @number-flow/react`}
      </CodeBlock>
      {/* biome-ignore lint/correctness/useUniqueElementIds: explicit heading id keeps a stable, shareable URL anchor (ArticleHeadings would otherwise slugify the text) */}
      <h2 id="readout">Animate a readout next to the input</h2>
      <p>
        The user types into a plain <code>NumoraInput</code>. A separate <code>NumberFlow</code>{' '}
        elsewhere on the page, such as a converted amount or a running total, animates as the value
        changes. Both read the same raw value from state. The input has no transparent text and no
        caret drift, and NumberFlow cannot change the raw value.
      </p>

      <CodeBlock language="tsx">
        {`import NumberFlow from '@number-flow/react'
import { NumoraInput } from 'numora-react'
import { useState } from 'react'

function SwapForm() {
  const [amount, setAmount] = useState('')

  // A lone "." (or "-" with allowNegative) is a valid raw value but not a number, so fall back to 0.
  const displayValue = Number(amount) || 0
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
        The input does not animate. Only the converted amount does. NumberFlow gets a real number
        here, so none of the overlay's <a href="#caveats">caveats</a> apply, and the string the user
        edits never passes through <code>Number</code>.
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
          <code>onValueChange</code> fires. Your handler stores the raw value and passes it to{' '}
          <code>&lt;NumberFlow&gt;</code>, which formats it again and tweens each digit into place.
          The input never animates. Its text is transparent, so you only see the NumberFlow layer.
        </p>
      </OverlayExplainer>

      <div className="bg-signal-amber/10 border border-signal-amber/30 rounded-lg p-4 my-4">
        <p className="m-0">
          <strong>The overlay is experimental.</strong> It suits short fields where users mostly add
          digits at the end. NumberFlow formats the number a second time, so every option that
          changes what the field shows needs a matching NumberFlow setting. Even then the two layers
          differ in a few states, and the caret runs ahead of the animation. The{' '}
          <a href="#caveats">caveats</a> list them.{' '}
          <Link to="/docs/numora-react/integrations/torph">Torph</Link> animates the field's own
          string, so it has no second formatter to keep in step.
        </p>
      </div>

      {/* biome-ignore lint/correctness/useUniqueElementIds: explicit heading id keeps a stable, shareable URL anchor (ArticleHeadings would otherwise slugify the text) */}
      <h2 id="overlay">Building the overlay</h2>

      <CodeBlock language="tsx">
        {`import NumberFlow from '@number-flow/react'
import { NumoraInput } from 'numora-react'
import { useState } from 'react'

function AnimatedInput() {
  const [value, setValue] = useState('')

  const decimals = value.includes('.') ? value.split('.')[1].length : 0
  // The raw value itself, not Number(value). A raw value with no digit ("" or "-") draws 0.
  const number = (/\\d/.test(value) ? value : '0') as Intl.StringNumericLiteral

  return (
    <label className="relative inline-flex items-center text-4xl font-mono leading-none tabular-nums text-white">
      {/* Visible layer: NumberFlow animates the digits. aria-hidden: screen readers announce the input. */}
      <span aria-hidden="true" className="pointer-events-none whitespace-pre">
        <NumberFlow
          value={number}
          suffix={value.endsWith('.') ? '.' : undefined}
          locales="en-US"
          format={{
            useGrouping: true,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }}
        />
      </span>

      {/* Invisible layer: real input owns the keyboard */}
      <NumoraInput
        value={value}
        onValueChange={({ value }) => setValue(value)}
        decimalMaxLength={2}
        padLeadingZero
        aria-label="Amount"
        // m-0 p-0 border-0: same text origin as the overlay
        // text-transparent + caret-white: hide the text, keep the caret
        // placeholder-transparent: hide the input's own placeholder
        // selection:bg-white/25: an opaque selection would cover NumberFlow
        // [font:inherit]: the label's typography, so the caret cannot drift
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent
                   text-transparent placeholder-transparent caret-white
                   outline-none focus:outline-none selection:bg-white/25 [font:inherit]"
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
          is the default, written out because the overlay depends on it. With <code>'blur'</code> a
          focused field shows no grouping while NumberFlow does, and the caret drifts.
        </li>
        <li>
          <strong>
            The raw string as <code>value</code>
          </strong>{' '}
          keeps every digit. <code>Intl.NumberFormat</code> formats a numeric string digit for
          digit, so an 18-decimal token amount stays exact and <code>"-0."</code> keeps its sign.{' '}
          <code>Number(value) || 0</code> is exact only up to about 15 significant digits and turns{' '}
          <code>"-0."</code> into <code>0.</code>. The cast needs TypeScript's <code>ES2023</code>{' '}
          lib. With an older lib, write <code>as unknown as number</code>. Chrome 106, Safari 15.4,
          Firefox 116 and later format the string exactly. Older browsers read it as a{' '}
          <code>Number</code>. Either way, the string from <code>onValueChange</code> is the value
          you store and send.
        </li>
        <li>
          <strong>
            <code>suffix</code>
          </strong>{' '}
          draws the dot the user just typed. <code>"1."</code> is the number <code>1</code>, so
          without it NumberFlow shows <code>"1"</code> and the caret sits one character past the
          visible text until a fraction digit arrives.
        </li>
        <li>
          <strong>
            <code>padLeadingZero</code>
          </strong>{' '}
          turns a typed <code>"."</code> into <code>"0."</code>. NumberFlow always prints the
          leading zero (<code>"0.5"</code>), so the input has to hold it too.
        </li>
        <li>
          <strong>
            Dynamic <code>minimumFractionDigits</code>
          </strong>{' '}
          keeps trailing zeros. <code>Intl</code> drops them, so without it NumberFlow draws{' '}
          <code>"1.2"</code> while the input holds <code>"1.20"</code>, and the caret sits one
          character past the visible text. <code>decimals</code> counts the fraction digits in the
          raw value.
        </li>
        <li>
          <strong>
            <code>useGrouping: true</code>
          </strong>{' '}
          and <code>locales="en-US"</code> make NumberFlow group the way the input does. Without{' '}
          <code>locales</code>, NumberFlow formats in the visitor's browser locale, which may not
          use <code>","</code> and <code>"."</code>, Numora React's defaults.
        </li>
        <li>
          <strong>
            <code>[font:inherit]</code>
          </strong>{' '}
          gives the input the label's font, size and line height. The browser computes the caret
          position from the input's text layout, so if the fonts differ, the caret drifts.
        </li>
        <li>
          <strong>
            <code>tabular-nums</code> on the label
          </strong>{' '}
          keeps every digit the same width while NumberFlow animates. On the label it reaches both
          layers, so the input's digits are as wide as the overlay's.
        </li>
      </ul>

      <NumberFlowCaveats />

      <h2>Try it with any locale</h2>
      <p>
        Give NumberFlow's <code>locales</code> prop the same tag as the input's <code>locale</code>.
        The typed decimal mark is then the last character of <code>formattedValue</code>, so keep
        both strings in state:
      </p>
      <CodeBlock language="tsx">
        {`const [{ value, formattedValue }, setValues] = useState({ value: '', formattedValue: '' })

<NumberFlow
  value={number}
  // The raw value always uses ".", the field shows the locale's mark ("1," in de-DE).
  suffix={value.endsWith('.') ? formattedValue.slice(-1) : undefined}
  locales="de-DE"
  format={{ useGrouping: true, minimumFractionDigits: decimals, maximumFractionDigits: decimals }}
/>

<NumoraInput locale="de-DE" value={value} onValueChange={setValues} padLeadingZero />`}
      </CodeBlock>
      <p>
        Switch the locale below, then type or paste. The two layers agree in every locale listed.{' '}
        <code>ar-EG</code> and <code>fa-IR</code> are left out, because the overlay{' '}
        <a href="#caveats">does not support</a> locales whose digits are not ASCII. This playground
        allows eight decimals, and long amounts stay exact.
      </p>
      <NumberFlowLocalePlayground />

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
        animations at the OS level, the digits swap without animating. You need no extra code.
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
        Import <code>NumberFlow</code> from <code>@number-flow/react</code> and render it as a
        readout next to a <code>NumoraInput</code>, fed from the same raw value. To animate the
        field itself, render NumberFlow under a transparent-text <code>NumoraInput</code>, pass it
        the raw string as the <code>value</code> prop, and mirror the number of typed decimals
        through <code>minimumFractionDigits</code> so trailing zeros stay aligned with the caret.
      </p>

      <h3>Where can I install NumberFlow?</h3>
      <p>
        NumberFlow's docs are at{' '}
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener">
          number-flow.barvian.me
        </a>
        . It is published on npm as <code>@number-flow/react</code> (React) and{' '}
        <code>number-flow</code> (vanilla web component). Install with{' '}
        <code>npm install numora-react @number-flow/react</code>.
      </p>
    </div>
  );
}
