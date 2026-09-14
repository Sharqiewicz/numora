import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/svelte';
const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora/integrations/torph';

const META_TITLE = 'Svelte Numeric Input – Format Numbers in Svelte with Numora';
const META_DESCRIPTION =
  'Svelte numeric input library with thousand separators, decimal limits, paste sanitisation and cursor preservation. Drop Numora into Svelte or SvelteKit with a 10-line use:numora action – framework-agnostic core, zero dependencies, 6.4 kb gzipped.';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Svelte Numeric Input – Format Numbers in Svelte with a use:numora Action',
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Numora',
        item: 'https://numeric-input.com/docs/numora',
      },
      { '@type': 'ListItem', position: 3, name: 'Svelte', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best Svelte numeric input library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Numora is the recommended Svelte numeric input library: it is framework-agnostic vanilla TypeScript, weighs 6.4 kb gzipped, has zero runtime dependencies, and ships with thousand separators, decimal limits, paste sanitisation and cursor preservation out of the box. In Svelte you wrap NumoraInput in a tiny use:numora action and mount it directly on an <input> – no wrapping container required.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I add thousand separators to a number input in Svelte?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pass thousandStyle: ThousandStyle.Thousand to the use:numora action. Numora formats as the user types, repositions the caret through the inserted comma, and emits the raw separator-free string from onChange so your Svelte store stays clean.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a dedicated numora-svelte package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No – and you do not need one. Numora is intentionally a thin layer over <input>. A 10-line Svelte action is the entire adapter; there is nothing a numora-svelte package could meaningfully add.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Numora work with SvelteKit and SSR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. NumoraInput touches the DOM, so initialise it inside a use: action or onMount – both only run in the browser. SvelteKit renders an empty host element on the server, and Numora mounts the formatted <input> on hydration. No SSR-specific configuration is required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it support i18n decimal commas and currency formatting in Svelte?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Pass decimalSeparator: "," and thousandSeparator: "." (or use the locale option) for European locales. Numora keeps the raw value as a string internally, so currency math stays precise – feed the raw value straight into your pricing logic without parseFloat rounding errors.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate digits in Svelte?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph integration is also framework-agnostic – the same vanilla TextMorph overlay pattern works inside a Svelte component and respects prefers-reduced-motion by default.',
        },
      },
    ],
  },
];

export const Route = createFileRoute('/docs/numora/frameworks/svelte')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'svelte numeric input, svelte number input, svelte input formatting, svelte number format, svelte input mask, sveltekit numeric input, svelte thousand separator, svelte currency input, svelte decimal input, numora svelte',
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
  component: SvelteIntegration,
});

function SvelteIntegration() {
  return (
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-foreground">Svelte Numeric Input</h1>
      <p className="text-muted-foreground text-base leading-6">
        <strong className="font-numora">Numora</strong> is a precision-first{' '}
        <strong>Svelte numeric input</strong> library: thousand separators, decimal limits, paste
        sanitisation, scientific-notation expansion and cursor preservation – all driven by a
        10-line <code>use:numora</code> action. Svelte&apos;s <code>use:</code> actions are designed
        for libraries that own a DOM node and need cleanup on unmount, which is exactly what{' '}
        <code>NumoraInput</code> does. No <code>numora-svelte</code> wrapper, no peer deps, no SSR
        special-casing – the core is framework-agnostic vanilla TypeScript, 6.4 kb gzipped, with
        zero runtime dependencies.
      </p>

      <h2 className="text-foreground text-2xl">Install</h2>
      <CodeBlock language="bash">
        {`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2 className="text-foreground text-2xl">Svelte action</h2>
      <p className="text-muted-foreground text-base leading-6">
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code>{' '}
        element. A Svelte action is the idiomatic way to bind that lifecycle to a DOM node. Drop
        this five-line helper into your project once and reuse it everywhere.
      </p>

      <p className="text-muted-foreground text-base leading-6">
        <code>src/lib/numora.ts</code>:
      </p>
      <CodeBlock language="ts">
        {`import { NumoraInput, type NumoraInputOptions } from 'numora';

export function numora(node: HTMLInputElement, options: NumoraInputOptions) {
  new NumoraInput(node, options);
  // No destroy hook needed - listeners die with the <input> when Svelte unmounts it.
}`}
      </CodeBlock>

      <p className="text-muted-foreground text-base leading-6">
        Component <code>&lt;script lang=&quot;ts&quot;&gt;</code>:
      </p>
      <CodeBlock language="ts">
        {`import { numora } from '$lib/numora';
import { ThousandStyle } from 'numora';

let value = $state('');`}
      </CodeBlock>

      <p className="text-muted-foreground text-base leading-6">Component markup:</p>
      <CodeBlock language="html">
        {`<label>
  Amount
  <input
    use:numora={{
      thousandStyle: ThousandStyle.Thousand,
      maxDecimals: 2,
      onChange: (v) => (value = v),
    }}
  />
</label>

<p className="text-muted-foreground text-base leading-6">Raw value: {value}</p>`}
      </CodeBlock>

      <p className="text-muted-foreground text-base leading-6">
        The action receives the <code>&lt;input&gt;</code> Svelte renders and calls{' '}
        <code>new NumoraInput(node, options)</code> – Numora adopts the element, forces the required
        attributes (<code>type</code>, <code>inputmode</code>, <code>spellcheck</code>,{' '}
        <code>autocomplete</code>, <code>pattern</code>) and wires its listeners.{' '}
        <code>onChange</code> receives the raw, separator-free string – safe to feed into your store
        or form library.
      </p>

      <p className="text-muted-foreground text-base leading-6">
        Because the <code>&lt;input&gt;</code> is yours, set <code>placeholder</code>,{' '}
        <code>aria-label</code>, <code>name</code> or any other attribute on it directly in the
        markup.
      </p>

      <h2 className="text-foreground text-2xl">Animated example: Numora + Torph in Svelte</h2>
      <p className="text-muted-foreground text-base leading-6">
        For animated digit transitions, stack a{' '}
        <a href="https://torph.lochie.dev" target="_blank" rel="noopener noreferrer" className="underline link-underline hover:text-foreground transition-colors">
          Torph
        </a>{' '}
        <code>TextMorph</code> on top of a transparent-text <code>NumoraInput</code>. The input owns
        the keyboard, undo and IME; Torph animates the visible characters. The{' '}
        <Link to="/docs/numora/integrations/torph" className="underline link-underline hover:text-foreground transition-colors">vanilla overlay guide</Link> covers the pattern
        in depth - below is the idiomatic Svelte 5 adapter.
      </p>

      <CodeBlock language="bash">{`pnpm add numora torph`}</CodeBlock>

      <p className="text-muted-foreground text-base leading-6">
        Script block (inside <code>&lt;script lang=&quot;ts&quot;&gt;</code>):
      </p>
      <CodeBlock language="ts">
        {`import { NumoraInput, FormatOn, ThousandStyle, type NumoraInputOptions } from 'numora';
import { TextMorph } from 'torph';

// Action: mounts NumoraInput + TextMorph in the same wrapper and bridges them.
export function numoraTorph(node: HTMLElement, options: NumoraInputOptions) {
  const display = node.querySelector<HTMLElement>('.numora-overlay-display')!;
  const host = node.querySelector<HTMLElement>('.numora-overlay-host')!;

  // SSR placeholder is a text node; Torph only animates element children.
  display.textContent = '';

  const numora = new NumoraInput(host, {
    formatOn: FormatOn.Change,
    thousandStyle: ThousandStyle.Thousand,
    ...options,
  });
  const input = numora.getElement();

  const morph = new TextMorph({
    element: display,
    ease: { stiffness: 400, damping: 30 },
  });
  morph.update('0');

  const syncMorph = () => morph.update(numora.value || '0');
  // Numora writes the formatted value in beforeinput; sync after that handler runs.
  const scheduleSync = () => queueMicrotask(syncMorph);

  input.addEventListener('beforeinput', scheduleSync);
  input.addEventListener('input', syncMorph);

  return {
    destroy: () => {
      input.removeEventListener('beforeinput', scheduleSync);
      input.removeEventListener('input', syncMorph);
      input.remove();
    },
  };
}`}
      </CodeBlock>

      <p className="text-muted-foreground text-base leading-6">Markup:</p>
      <CodeBlock language="html">
        {`<label
  class="numora-overlay"
  use:numoraTorph={{ maxDecimals: 2, thousandSeparator: ',' }}
>
  <span class="numora-overlay-display" aria-hidden="true">0</span>
  <div class="numora-overlay-host" />
</label>`}
      </CodeBlock>

      <p className="text-muted-foreground text-base leading-6">
        Styles (inside the component&apos;s <code>&lt;style&gt;</code> block):
      </p>
      <CodeBlock language="css">
        {`.numora-overlay {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 2.25rem/1 ui-monospace, SFMono-Regular, monospace;
  color: white;
}
.numora-overlay-display { pointer-events: none; white-space: pre; }
.numora-overlay-host { position: absolute; inset: 0; }

/* :global(...) escapes Svelte's scoped-class hashing so the rule can reach
   the <input> NumoraInput creates at runtime. */
.numora-overlay-host :global(input) {
  width: 100%; height: 100%;
  margin: 0; padding: 0; border: 0;
  background: transparent; color: transparent; caret-color: white;
  outline: none; font: inherit;
}
.numora-overlay-host :global(input::selection) { background: rgba(255, 255, 255, 0.25); }
.numora-overlay-host :global(input::placeholder) { color: transparent; }`}
      </CodeBlock>

      <p className="text-muted-foreground text-base leading-6">
        The <code>beforeinput</code> microtask + <code>input</code> listener combination guarantees
        Torph stays in sync across typing, paste, undo and redo. Torph respects{' '}
        <code>prefers-reduced-motion</code> automatically.
      </p>

      <h2 className="text-foreground text-2xl">FAQ</h2>

      <h3 className="text-foreground">Is there a numora-svelte package?</h3>
      <p className="text-muted-foreground text-base leading-6">
        No - and there does not need to be. Numora is intentionally a thin layer over the native{' '}
        <code>&lt;input&gt;</code>. A ten-line action is the entire Svelte adapter.
      </p>

      <h3 className="text-foreground">Does Numora work with SvelteKit and SSR?</h3>
      <p className="text-muted-foreground text-base leading-6">
        Yes. <code>NumoraInput</code> touches the DOM, so initialise it inside an action or{' '}
        <code>onMount</code> - both only run in the browser. SvelteKit renders an empty host element
        on the server, and Numora mounts the formatted <code>&lt;input&gt;</code> on hydration. No
        SSR-specific configuration is needed.
      </p>

      <h3 className="text-foreground">How do I add thousand separators to a Svelte number input?</h3>
      <p className="text-muted-foreground text-base leading-6">
        Pass <code>thousandStyle: ThousandStyle.Thousand</code> to the <code>use:numora</code>{' '}
        action. Numora formats as the user types, repositions the caret through the inserted comma,
        and emits the raw separator-free string from <code>onChange</code> - safe to feed straight
        into a store or form library.
      </p>

      <h3 className="text-foreground">Does it support i18n (decimal commas, currency formatting) in Svelte?</h3>
      <p className="text-muted-foreground text-base leading-6">
        Yes. Set <code>decimalSeparator: &apos;,&apos;</code> and{' '}
        <code>thousandSeparator: &apos;.&apos;</code> (or use the <code>locale</code> option) for
        European locales. Numora keeps the raw value as a string end-to-end, so currency math stays
        precise - no <code>parseFloat</code> rounding errors on amounts like <code>0.1 + 0.2</code>.
      </p>

      <h3 className="text-foreground">
        Why not use a normal <code>&lt;input&gt;</code> with <code>bind:value</code>?
      </h3>
      <p className="text-muted-foreground text-base leading-6">
        Numora handles thousand separators, decimal limits, scientific notation, paste sanitisation,
        cursor preservation through formatting, and mobile keyboard hints (
        <code>inputmode=&quot;decimal&quot;</code>). Doing all of that on a plain{' '}
        <code>bind:value</code> means re-implementing the cursor-positioning logic by hand -
        that&apos;s the part Numora exists to solve.
      </p>

      <h2 className="text-foreground text-2xl">Numora in other frameworks</h2>
      <p className="text-muted-foreground text-base leading-6">
        Numora&apos;s core is framework-agnostic. The same vanilla <code>NumoraInput</code> class
        powers the numeric input across every modern UI framework:
      </p>
      <ul className="list-disc list-inside">
        <li>
          <Link to="/docs/numora/frameworks/vue" className="underline link-underline hover:text-foreground transition-colors">Vue numeric input</Link> – Vue 3{' '}
          <code>v-numora</code> custom directive
        </li>
        <li>
          <Link to="/docs/numora/frameworks/angular" className="underline link-underline hover:text-foreground transition-colors">Angular numeric input</Link> – standalone
          directive with <code>ControlValueAccessor</code>
        </li>
        <li>
          <Link to="/docs/numora/frameworks/solid" className="underline link-underline hover:text-foreground transition-colors">SolidJS numeric input</Link> – signal-bound{' '}
          <code>onMount</code> wrapper
        </li>
        <li>
          <Link to="/docs/numora-react" className="underline link-underline hover:text-foreground transition-colors">React numeric input</Link> – drop-in{' '}
          <code>&lt;NumoraInput /&gt;</code> component (<code>numora-react</code>)
        </li>
      </ul>
    </div>
  );
}
