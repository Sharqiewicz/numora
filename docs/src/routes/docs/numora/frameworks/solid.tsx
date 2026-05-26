import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/solid'

const META_TITLE = 'Solid Numeric Input – Format Numbers in SolidJS with Numora'
const META_DESCRIPTION = 'SolidJS numeric input library with thousand separators, decimal limits, paste sanitisation and cursor preservation. Drop Numora into Solid or SolidStart with a tiny use:numora directive – framework-agnostic core, zero dependencies, 6.4 kb gzipped.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Solid Numeric Input – Format Numbers in SolidJS with a use:numora Directive',
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
        name: 'What is the best SolidJS numeric input library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Numora is the recommended SolidJS numeric input library: framework-agnostic vanilla TypeScript, 6.4 kb gzipped, zero runtime dependencies, with thousand separators, decimal limits, paste sanitisation and cursor preservation built in. In Solid you write a tiny use:numora directive once, then use <input use:numora={opts} /> anywhere – no onMount or ref boilerplate.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I add thousand separators to a Solid number input?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pass thousandStyle: ThousandStyle.Thousand inside the use:numora binding. Numora formats as the user types, repositions the caret through the inserted comma, and emits the raw separator-free string from onChange – write it directly into a createSignal setter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a numora-solid package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No – and you do not need one. Numora is a thin layer over <input>. A four-line use:numora directive is the entire Solid adapter; there is nothing a numora-solid package could meaningfully add.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Numora work with SolidStart and SSR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The use:numora directive only runs on the client – SolidStart renders the empty <input> on the server, and Numora adopts it on hydration. No SolidStart-specific configuration is required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it support i18n decimal commas and currency in Solid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Pass decimalSeparator: "," and thousandSeparator: "." (or use the locale option) for European locales. Numora keeps the raw value as a string end-to-end, so currency math stays precise – no parseFloat rounding errors on amounts like 0.1 + 0.2.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate digits in Solid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Solid component and respects prefers-reduced-motion by default.',
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
      { name: 'keywords', content: 'solid numeric input, solidjs numeric input, solid number input, solid input formatting, solid number format, solid input mask, solidstart numeric input, solid thousand separator, solid currency input, solid decimal input, numora solid' },
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
      <h1>Solid Numeric Input</h1>
      <p className="text-lg text-muted-foreground">
        <strong className="font-numora">Numora</strong> is a precision-first <strong>SolidJS numeric input</strong>{' '}
        library: thousand separators, decimal limits, paste sanitisation, scientific-notation expansion
        and cursor preservation – driven by a four-line <code>use:numora</code> directive that mounts
        directly on an <code>&lt;input&gt;</code>. Write the raw value into a <code>createSignal</code>{' '}
        setter and Solid&apos;s fine-grained reactivity handles the rest. No <code>numora-solid</code>{' '}
        wrapper, no peer deps – the core is framework-agnostic vanilla TypeScript, 6.4 kb gzipped, with
        zero runtime dependencies.
      </p>

      <h2>Install</h2>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2>Solid directive</h2>
      <p>
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code> element.
        Solid's <code>use:</code> directives are the idiomatic way to bind that lifecycle to a DOM node –
        drop this helper into your project once and every <code>&lt;input use:numora={`{opts}`}&gt;</code>{' '}
        works.
      </p>

      <p className="text-sm text-muted-foreground">
        <code>src/directives/numora.ts</code>:
      </p>
      <CodeBlock language="ts">
{`import { NumoraInput, type NumoraInputOptions } from 'numora';

export function numora(el: HTMLInputElement, accessor: () => NumoraInputOptions) {
  new NumoraInput(el, accessor() ?? {});
  // No cleanup needed - listeners die with the <input> when Solid removes it.
}

// Tells Solid's JSX compiler that use:numora is a valid directive.
declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      numora: NumoraInputOptions;
    }
  }
}`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">Component:</p>
      <CodeBlock language="tsx">
{`import { createSignal } from 'solid-js';
import { ThousandStyle } from 'numora';
import { numora } from './directives/numora';
// Solid's compiler must see the 'numora' import to keep it - the directive
// looks unused otherwise and tree-shaking would drop it.
void numora;

export function AmountInput() {
  const [value, setValue] = createSignal('');

  return (
    <label>
      Amount
      <input
        use:numora={{
          thousandStyle: ThousandStyle.Thousand,
          decimalMaxLength: 2,
          onChange: (v) => setValue(v),
        }}
      />
      <p>Raw value: {value()}</p>
    </label>
  );
}`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        The directive receives the <code>&lt;input&gt;</code> Solid renders and an accessor for its
        options, then calls <code>new NumoraInput(el, accessor())</code>. Numora adopts the element,
        forces the required attributes (<code>type</code>, <code>inputmode</code>,{' '}
        <code>spellcheck</code>, <code>autocomplete</code>, <code>pattern</code>), and emits the raw,
        separator-free string from <code>onChange</code> – write it straight into a signal or store.
      </p>

      <p className="text-sm text-muted-foreground">
        Because the <code>&lt;input&gt;</code> is yours, set <code>placeholder</code>,{' '}
        <code>aria-label</code>, <code>name</code> or any other attribute on it directly in the JSX.
      </p>

      <h2>Animated example: Numora + Torph in SolidJS</h2>
      <p>
        For animated digit transitions, stack a{' '}
        <a href="https://torph.lochie.dev" target="_blank" rel="noopener noreferrer">Torph</a>{' '}
        <code>TextMorph</code> on top of a transparent-text <code>NumoraInput</code>. The input owns the
        keyboard, undo and IME; Torph animates the visible characters. The{' '}
        <Link to="/docs/numora/integrations/torph">vanilla overlay guide</Link> covers the pattern in
        depth - below is the idiomatic SolidJS adapter.
      </p>

      <CodeBlock language="bash">
{`pnpm add numora torph`}
      </CodeBlock>

      <CodeBlock language="tsx">
{`import { onCleanup, onMount } from 'solid-js';
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';
import { TextMorph } from 'torph';
import './numora-overlay.css';

export function AnimatedAmountInput() {
  let display!: HTMLSpanElement;
  let host!: HTMLDivElement;

  onMount(() => {
    // SSR placeholder is a text node; Torph only animates element children.
    display.textContent = '';

    const numora = new NumoraInput(host, {
      formatOn: FormatOn.Change,
      thousandStyle: ThousandStyle.Thousand,
      decimalMaxLength: 2,
      thousandSeparator: ',',
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

    onCleanup(() => {
      input.removeEventListener('beforeinput', scheduleSync);
      input.removeEventListener('input', syncMorph);
    });
  });

  return (
    <label class="numora-overlay">
      <span ref={display} class="numora-overlay-display" aria-hidden="true">0</span>
      <div ref={host} class="numora-overlay-host" />
    </label>
  );
}`}
      </CodeBlock>

      <CodeBlock language="css">
{`/* numora-overlay.css */
.numora-overlay {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 2.25rem/1 ui-monospace, SFMono-Regular, monospace;
  color: white;
}
.numora-overlay-display { pointer-events: none; white-space: pre; }
.numora-overlay-host { position: absolute; inset: 0; }
.numora-overlay-host input {
  width: 100%; height: 100%;
  margin: 0; padding: 0; border: 0;
  background: transparent; color: transparent; caret-color: white;
  outline: none; font: inherit;
}
.numora-overlay-host input::selection { background: rgba(255, 255, 255, 0.25); }
.numora-overlay-host input::placeholder { color: transparent; }`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Solid doesn&apos;t scope CSS by default, so the input selectors work as-is - Numora creates the{' '}
        <code>&lt;input&gt;</code> at runtime inside the host <code>&lt;div&gt;</code>. The{' '}
        <code>beforeinput</code> microtask + <code>input</code> listener combination keeps Torph in sync
        across typing, paste, undo and redo. Torph respects <code>prefers-reduced-motion</code>{' '}
        automatically.
      </p>

      <h2>FAQ</h2>

      <h3>Is there a numora-solid package?</h3>
      <p>
        No. Numora is intentionally a thin layer over the native <code>&lt;input&gt;</code>. A four-line{' '}
        <code>use:numora</code> directive is the entire Solid adapter.
      </p>

      <h3>Does Numora work with SolidStart and SSR?</h3>
      <p>
        Yes. The <code>use:numora</code> directive only runs on the client – SolidStart renders the
        empty <code>&lt;input&gt;</code> on the server and Numora adopts it on hydration. No
        SolidStart-specific configuration needed.
      </p>

      <h3>How do I add thousand separators to a Solid number input?</h3>
      <p>
        Pass <code>thousandStyle: ThousandStyle.Thousand</code> inside the <code>use:numora</code>{' '}
        binding. Numora formats as the user types, keeps the caret stable through the inserted comma,
        and emits the raw separator-free string from <code>onChange</code> – write it straight into your{' '}
        <code>createSignal</code> setter.
      </p>

      <h3>Does it support i18n (decimal commas, currency formatting) in Solid?</h3>
      <p>
        Yes. Set <code>decimalSeparator: &apos;,&apos;</code> and{' '}
        <code>thousandSeparator: &apos;.&apos;</code> (or use the <code>locale</code> option) for European
        formats. Numora keeps the raw value as a string end-to-end, so currency math stays precise – no{' '}
        <code>parseFloat</code> rounding errors.
      </p>

      <h3>Why not a plain signal-bound <code>&lt;input&gt;</code>?</h3>
      <p>
        Numora handles thousand separators, decimal limits, scientific notation, paste sanitisation,
        cursor preservation through formatting, and mobile keyboard hints (<code>inputmode=&quot;decimal&quot;</code>).
        Doing all of that on a plain signal-bound input means re-implementing the cursor-positioning logic
        by hand - that&apos;s the part Numora exists to solve.
      </p>

      <h2>Numora in other frameworks</h2>
      <p>
        Numora&apos;s core is framework-agnostic. The same vanilla{' '}
        <code>NumoraInput</code> class powers the numeric input across every modern UI framework:
      </p>
      <ul className="list-disc list-inside">
        <li><Link to="/docs/numora/frameworks/svelte">Svelte numeric input</Link> – <code>use:numora</code> action for Svelte and SvelteKit</li>
        <li><Link to="/docs/numora/frameworks/vue">Vue numeric input</Link> – Vue 3 <code>v-numora</code> custom directive</li>
        <li><Link to="/docs/numora/frameworks/angular">Angular numeric input</Link> – standalone directive with <code>ControlValueAccessor</code></li>
        <li><Link to="/docs/numora-react">React numeric input</Link> – drop-in <code>&lt;NumoraInput /&gt;</code> component (<code>numora-react</code>)</li>
      </ul>
    </div>
  )
}
