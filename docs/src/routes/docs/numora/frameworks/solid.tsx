import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/solid'

const META_TITLE = 'Numora + SolidJS - Numeric Input Library for Solid'
const META_DESCRIPTION = 'Use Numora in SolidJS with a tiny onMount wrapper. Format numbers as you type, thousand separators, decimal limits, string precision. Framework-agnostic core, zero dependencies, 6.4kb gzipped.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Numora + Solid - Numeric input formatting with a Solid onMount wrapper',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      { '@type': 'SoftwareSourceCode', name: 'Numora', url: 'https://numeric-input.com/' },
      { '@type': 'SoftwareSourceCode', name: 'SolidJS', url: 'https://www.solidjs.com/' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
      { '@type': 'ListItem', position: 2, name: 'Numora', item: 'https://numeric-input.com/docs/numora' },
      { '@type': 'ListItem', position: 3, name: 'Solid', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Numora work with SolidJS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The numora core package is framework-agnostic vanilla TypeScript. In Solid you wire NumoraInput up inside onMount with a ref-bound host element and write its raw value into a signal.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a numora-solid package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No - and you do not need one. Numora is a thin layer over <input>. A short onMount block is the entire Solid adapter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate digits in Solid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Solid component.',
        },
      },
    ],
  },
]

export const Route = createFileRoute('/docs/numora/frameworks/solid')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'Numora Solid, SolidJS numeric input, Solid number input, Solid input formatting, framework-agnostic numeric input, Solid signal numora' },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: PAGE_URL }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(JSON_LD) }],
  }),
  component: SolidIntegration,
})

function SolidIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Numora + SolidJS</h1>
      <p className="text-lg text-muted-foreground">
        Solid&apos;s <code>onMount</code> runs once after the component is in the DOM, and refs are
        non-reactive - both are exactly what an imperative DOM library like Numora needs. Write the
        input&apos;s value into a signal in <code>onChange</code>, and Solid&apos;s fine-grained reactivity
        handles the rest. No <code>numora-solid</code> wrapper; the core package is framework-agnostic
        vanilla TypeScript.
      </p>

      <h2>Install</h2>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2>Solid component</h2>
      <p>
        <code>NumoraInput</code> takes a container element and creates a properly-wired{' '}
        <code>&lt;input&gt;</code> inside it. In Solid, bind a <code>ref</code> to the host element and
        initialise inside <code>onMount</code>:
      </p>

      <CodeBlock language="tsx">
{`import { createSignal, onMount } from 'solid-js';
import { NumoraInput, ThousandStyle } from 'numora';

export function AmountInput() {
  const [value, setValue] = createSignal('');
  let host!: HTMLDivElement;

  onMount(() => {
    new NumoraInput(host, {
      thousandStyle: ThousandStyle.Thousand,
      decimalMaxLength: 2,
      onChange: (v) => setValue(v),
    });
  });

  return (
    <label>
      Amount
      <div ref={host} />
      <p>Raw value: {value()}</p>
    </label>
  );
}`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        <code>onChange</code> receives the raw, separator-free string - safe to write straight into a
        signal or your store. Solid removes the host element on cleanup; the created{' '}
        <code>&lt;input&gt;</code> goes with it. No manual teardown needed.
      </p>

      <p className="text-sm text-muted-foreground">
        The <code>&lt;label&gt;</code> associates with the <code>&lt;input&gt;</code> Numora creates on
        mount - modern browsers handle the late-arriving descendant correctly. To set attributes like{' '}
        <code>aria-label</code> programmatically, keep the <code>NumoraInput</code> instance in a local
        variable inside <code>onMount</code> and call{' '}
        <code>instance.getElement().setAttribute(&apos;aria-label&apos;, &apos;Amount&apos;)</code>.
      </p>

      <h2>Animate digits with Torph</h2>
      <p>
        For animated digit transitions, the{' '}
        <Link to="/docs/numora/integrations/torph">Torph + Numora overlay</Link>{' '}
        is framework-agnostic - the same vanilla pattern slots into a Solid component. Render the
        overlay markup in your JSX and run the bridge code in <code>onMount</code>. Torph respects{' '}
        <code>prefers-reduced-motion</code> automatically.
      </p>

      <h2>FAQ</h2>

      <h3>Is there a numora-solid package?</h3>
      <p>
        No. Numora is intentionally a thin layer over the native <code>&lt;input&gt;</code>. A short{' '}
        <code>onMount</code> block is the entire Solid adapter.
      </p>

      <h3>Does it work with SolidStart?</h3>
      <p>
        Yes. <code>NumoraInput</code> touches the DOM, so initialise it inside <code>onMount</code> -
        that path only runs in the browser. No SSR work beyond rendering an empty host element on the
        server.
      </p>

      <h3>Why not a plain signal-bound <code>&lt;input&gt;</code>?</h3>
      <p>
        Numora handles thousand separators, decimal limits, scientific notation, paste sanitisation,
        cursor preservation through formatting, and mobile keyboard hints (<code>inputmode=&quot;decimal&quot;</code>).
        Doing all of that on a plain signal-bound input means re-implementing the cursor-positioning logic
        by hand - that&apos;s the part Numora exists to solve.
      </p>
    </div>
  )
}
