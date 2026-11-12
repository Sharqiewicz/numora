import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { CORE_SIZE_GZIP } from '@/lib/constants/package';

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/svelte';

const META_TITLE = 'Svelte numeric input | Numora';
const META_DESCRIPTION = `Svelte numeric input library with thousand separators, decimal limits, paste sanitization and cursor preservation. Use Numora in Svelte or SvelteKit through a use:numora action. It is a framework-agnostic vanilla package with zero dependencies, ${CORE_SIZE_GZIP} gzipped.`;

// Single source for the visible FAQ and the JSON-LD FAQPage. Backticks mark inline code.
const FAQ = [
  {
    question: 'What is the best Svelte numeric input library?',
    answer: `Numora is framework-agnostic TypeScript, ${CORE_SIZE_GZIP} gzipped, with no runtime dependencies. In Svelte you wrap \`NumoraInput\` in a small \`use:numora\` action and mount it directly on an \`<input>\`.`,
  },
  {
    question: 'Is there a numora-svelte package?',
    answer: 'No, and you do not need one. The Svelte action is the entire adapter.',
  },
  {
    question: 'Does Numora work with SvelteKit and SSR?',
    answer:
      'Yes. `NumoraInput` touches the DOM, so initialize it inside an action or `onMount`. Both only run in the browser. SvelteKit renders the empty `<input>` on the server and the action adopts it in the browser. You need no SSR-specific configuration.',
  },
  {
    question: 'How do I add thousand separators to a Svelte number input?',
    answer:
      'Pass `groupingStyle: "thousand"` and `formatOn: "change"` to the `use:numora` action. Numora formats as the user types and keeps the cursor between the same two digits when it inserts a comma. `onValueChange` receives `{ value, formattedValue }`, where `value` is the raw value without separators, which you can store in a Svelte store or pass to a form library.',
  },
  {
    question: 'Does it support i18n (decimal commas, currency formatting) in Svelte?',
    answer:
      "Yes. Set `decimalSeparator: ','` and `thousandSeparator: '.'` (or use the `locale` option) for European locales. The raw `value` is a plain dot-decimal string in every locale.",
  },
  {
    question: 'Why not use a normal <input> with bind:value?',
    answer:
      'A plain `bind:value` has no thousand separators, decimal limits or paste sanitization, and you would have to write the cursor-positioning logic yourself. Numora handles all of it.',
  },
  {
    question: 'Can I animate digits in Svelte?',
    answer:
      'Yes. The Torph integration is also framework-agnostic. The same vanilla `TextMorph` overlay pattern works inside a Svelte component, and Torph respects prefers-reduced-motion by default.',
  },
];

function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text
        .split('`')
        .map((part, i) => (i % 2 === 1 ? <code key={`${i}-${part}`}>{part}</code> : part))}
    </>
  );
}

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Svelte numeric input: format numbers in Svelte with a use:numora action',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: {
      '@type': 'Person',
      name: 'Kacper Szarkiewicz',
      url: 'https://x.com/sharqiewicz',
    },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'Numora',
        url: 'https://numeric-input.com/',
      },
      {
        '@type': 'SoftwareSourceCode',
        name: 'Svelte',
        url: 'https://svelte.dev/',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://numeric-input.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Numora',
        item: 'https://numeric-input.com/docs/numora',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Svelte numeric input',
        item: PAGE_URL,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question.replaceAll('`', ''),
      acceptedAnswer: { '@type': 'Answer', text: answer.replaceAll('`', '') },
    })),
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Svelte numeric input</h1>
      <p>
        <strong className="font-numora">Numora</strong> is a precision-first{' '}
        <strong>Svelte numeric input</strong> library. It handles thousand separators, decimal
        limits, paste sanitization, scientific-notation expansion and cursor preservation through a{' '}
        <code>use:numora</code> action. Svelte&apos;s <code>use:</code> actions suit libraries that
        own a DOM node, as <code>NumoraInput</code> does. You need no <code>numora-svelte</code>{' '}
        wrapper, no peer dependencies and no SSR special-casing. The vanilla package is
        framework-agnostic TypeScript, {CORE_SIZE_GZIP} gzipped, with zero runtime dependencies.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash">{`pnpm add numora`}</CodeBlock>

      <h2>Svelte action</h2>
      <p>
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code>{' '}
        element. A Svelte action binds that lifecycle to a DOM node. Add this helper to your project
        once and reuse it everywhere.
      </p>

      <p>
        <code>src/lib/numora.ts</code>:
      </p>
      <CodeBlock language="ts">
        {`import { NumoraInput, type NumoraInputOptions } from 'numora';

export function numora(node: HTMLInputElement, options: NumoraInputOptions) {
  new NumoraInput(node, options);
  // No destroy hook needed: the listeners are bound to the <input>,
  // so they are released when Svelte removes it.
}`}
      </CodeBlock>

      <p>
        Component <code>&lt;script lang=&quot;ts&quot;&gt;</code>:
      </p>
      <CodeBlock language="ts">
        {`import { numora } from '$lib/numora';

let value = $state('');`}
      </CodeBlock>

      <p>Component markup:</p>
      <CodeBlock language="html">
        {`<label>
  Amount
  <input
    use:numora={{
      formatOn: 'change',
      groupingStyle: 'thousand',
      decimalMaxLength: 2,
      onValueChange: ({ value: v }) => (value = v),
    }}
  />
</label>

<p>Raw value: {value}</p>`}
      </CodeBlock>

      <p>
        Numora adopts the <code>&lt;input&gt;</code> and sets the attributes it needs.{' '}
        <code>onValueChange</code> receives <code>{`{ value, formattedValue }`}</code>, where{' '}
        <code>value</code> is the raw string (see{' '}
        <Link to="/docs/numora/features/value-types">value types</Link>).{' '}
        <code>'change'</code> formats on every keystroke (see{' '}
        <Link to="/docs/numora/features/formatting">formatting</Link>).
      </p>

      <p>
        Read the value from <code>onValueChange</code>, not from <code>bind:value</code>: the
        element's own
        <code>value</code> is the display string (<code>"1,234.56"</code>), while
        <code>onValueChange</code> gives you the raw value (<code>"1234.56"</code>).
      </p>

      <h2>Animated example: Numora + Torph in Svelte</h2>
      <p>
        Stack a Torph <code>TextMorph</code> over a transparent-text <code>NumoraInput</code>. The{' '}
        <Link to="/docs/numora/integrations/torph">Torph integration</Link> explains the overlay and
        has the shared CSS and install steps. Below is the Svelte 5 action.
      </p>
      <p>
        <code>src/lib/numora-torph.ts</code> is an action that mounts <code>NumoraInput</code> and{' '}
        <code>TextMorph</code> in the same wrapper. It returns a <code>destroy</code> hook because
        it also owns a <code>TextMorph</code>:
      </p>
      <CodeBlock language="ts">
        {`import { NumoraInput, type NumoraInputOptions } from 'numora';
import { TextMorph } from 'torph';

export function numoraTorph(node: HTMLElement, options: NumoraInputOptions) {
  const display = node.querySelector<HTMLElement>('.numora-overlay-display')!;
  const host = node.querySelector<HTMLElement>('.numora-overlay-host')!;

  // SSR placeholder is a text node; Torph only animates element children.
  display.textContent = '';

  const morph = new TextMorph({
    element: display,
    ease: { stiffness: 400, damping: 30 },
  });
  morph.update('0');

  // 'change': onValueChange fires on every edit. In Blur mode also sync on focus and blur.
  const numora = new NumoraInput(host, {
    formatOn: 'change',
    groupingStyle: 'thousand',
    ...options,
    onValueChange: (values) => {
      morph.update(values.formattedValue || '0');
      options.onValueChange?.(values);
    },
  });
  const input = numora.element;
  input.setAttribute('aria-label', 'Amount');

  return {
    destroy: () => {
      morph.destroy();
      input.remove();
    },
  };
}`}
      </CodeBlock>

      <p>
        Component <code>&lt;script lang=&quot;ts&quot;&gt;</code>:
      </p>
      <CodeBlock language="ts">{`import { numoraTorph } from '$lib/numora-torph';`}</CodeBlock>

      <p>Markup:</p>
      <CodeBlock language="html">
        {`<label
  class="numora-overlay"
  use:numoraTorph={{ decimalMaxLength: 2 }}
>
  <span class="numora-overlay-display" aria-hidden="true">0</span>
  <div class="numora-overlay-host" />
</label>`}
      </CodeBlock>

      <p>
        Use the overlay CSS from the Torph page in the component&apos;s <code>&lt;style&gt;</code>{' '}
        block. Wrap selectors that target the runtime-created <code>&lt;input&gt;</code> in{' '}
        <code>:global()</code>, because Svelte&apos;s scoped styles cannot reach it otherwise:
      </p>
      <CodeBlock language="css">{`.numora-overlay-host :global(input) { /* ... */ }`}</CodeBlock>

      <h2>FAQ</h2>
      {FAQ.map(({ question, answer }) => (
        <div key={question}>
          <h3>
            <InlineCode text={question} />
          </h3>
          <p>
            <InlineCode text={answer} />
          </p>
        </div>
      ))}
    </div>
  );
}
