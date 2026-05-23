import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/svelte'
const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora/integrations/torph'

const META_TITLE = 'Numora + Svelte - Numeric Input Library for Svelte'
const META_DESCRIPTION = 'Use Numora in Svelte with a tiny use:numora action. Format numbers as you type, thousand separators, decimal limits, string precision. Framework-agnostic core, zero dependencies, 6.4kb gzipped.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Numora + Svelte - Numeric input formatting with a Svelte action',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      { '@type': 'SoftwareSourceCode', name: 'Numora', url: 'https://numeric-input.com/' },
      { '@type': 'SoftwareSourceCode', name: 'Svelte', url: 'https://svelte.dev/' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
      { '@type': 'ListItem', position: 2, name: 'Numora', item: 'https://numeric-input.com/docs/numora' },
      { '@type': 'ListItem', position: 3, name: 'Svelte', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Numora work with Svelte?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The numora core package is framework-agnostic vanilla TypeScript. In Svelte you wrap the NumoraInput class in a small use:numora action that initialises it on mount and lets Svelte clean it up on destroy.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a dedicated numora-svelte package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No - and you do not need one. Numora is intentionally a thin layer over <input>. A 10-line Svelte action is the entire adapter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate the digits in Svelte?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph integration is also framework-agnostic - the same vanilla TextMorph overlay pattern works inside a Svelte component.',
        },
      },
    ],
  },
]

export const Route = createFileRoute('/docs/numora/frameworks/svelte')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'Numora Svelte, Svelte numeric input, Svelte number input, Svelte input formatting, framework-agnostic numeric input, Svelte action numora' },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: PAGE_URL }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(JSON_LD) }],
  }),
  component: SvelteIntegration,
})

function SvelteIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Numora + Svelte</h1>
      <p className="text-lg text-muted-foreground">
        Svelte&apos;s <code>use:</code> actions are designed for libraries that own a DOM node and need
        cleanup on unmount - which is exactly what <code>NumoraInput</code> does. A ten-line action gives
        you the full lifecycle: instantiate on attach, drop the rendered <code>&lt;input&gt;</code>{' '}
        on <code>destroy</code>. No <code>numora-svelte</code> wrapper, no peer deps, no SSR
        special-casing - Numora&apos;s core is framework-agnostic vanilla TypeScript.
      </p>

      <h2>Install</h2>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2>Svelte action</h2>
      <p>
        <code>NumoraInput</code> takes a container element and creates a properly-wired{' '}
        <code>&lt;input&gt;</code> inside it. A Svelte action is the idiomatic way to bind that lifecycle
        to a DOM node:
      </p>

      <CodeBlock language="svelte">
{`<script lang="ts">
  import { NumoraInput, ThousandStyle, type NumoraInputOptions } from 'numora';

  function numora(node: HTMLElement, options: NumoraInputOptions) {
    const instance = new NumoraInput(node, options);
    return {
      // The created <input> is removed when Svelte tears down the host node.
      destroy: () => instance.getElement().remove(),
    };
  }

  let value = $state('');
</script>

<label>
  Amount
  <div
    use:numora={{
      thousandStyle: ThousandStyle.Thousand,
      decimalMaxLength: 2,
      onChange: (v) => (value = v),
    }}
  />
</label>

<p>Raw value: {value}</p>`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        The action receives the host element, calls <code>new NumoraInput(node, options)</code>, and
        returns a <code>destroy</code> hook that runs when Svelte unmounts. <code>onChange</code> receives
        the raw, separator-free string - safe to feed into your store or form library.
      </p>

      <p className="text-sm text-muted-foreground">
        The <code>&lt;label&gt;</code> associates with the <code>&lt;input&gt;</code> Numora creates on
        mount - modern browsers handle the late-arriving descendant correctly. To set attributes like{' '}
        <code>aria-label</code> programmatically, keep a reference to the <code>NumoraInput</code>{' '}
        instance and call <code>instance.getElement().setAttribute(&apos;aria-label&apos;, &apos;Amount&apos;)</code>.
      </p>

      <h2>Animate digits with Torph</h2>
      <p>
        Want animated digit transitions? The{' '}
        <Link to="/docs/numora/integrations/torph">Torph + Numora overlay</Link>{' '}
        is framework-agnostic - the same vanilla pattern slots directly into a Svelte component. Render
        the overlay markup in your template and run the bridge code in <code>onMount</code> (or inside
        a Svelte action). Torph itself respects <code>prefers-reduced-motion</code> by default.
      </p>

      <h2>FAQ</h2>

      <h3>Is there a numora-svelte package?</h3>
      <p>
        No - and there does not need to be. Numora is intentionally a thin layer over the native{' '}
        <code>&lt;input&gt;</code>. A ten-line action is the entire Svelte adapter.
      </p>

      <h3>Does it work with SvelteKit?</h3>
      <p>
        Yes. <code>NumoraInput</code> touches the DOM, so initialise it inside an action or{' '}
        <code>onMount</code> - both only run in the browser. No SSR work needed beyond rendering an empty
        host element on the server.
      </p>

      <h3>Why not use a normal <code>&lt;input&gt;</code> with <code>bind:value</code>?</h3>
      <p>
        Numora handles thousand separators, decimal limits, scientific notation, paste sanitisation,
        cursor preservation through formatting, and mobile keyboard hints (<code>inputmode=&quot;decimal&quot;</code>).
        Doing all of that on a plain <code>bind:value</code> means re-implementing the cursor-positioning
        logic by hand - that&apos;s the part Numora exists to solve.
      </p>
    </div>
  )
}
