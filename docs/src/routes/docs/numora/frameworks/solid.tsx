import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { CORE_SIZE_GZIP } from '@/lib/constants/package';

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/solid';

const META_TITLE = 'Solid numeric input | Numora';
const META_DESCRIPTION =
  `Solid numeric input library with thousand separators, decimal limits, paste sanitization and cursor preservation. Use Numora in Solid or SolidStart through a use:numora directive. It is a framework-agnostic vanilla package with zero dependencies, ${CORE_SIZE_GZIP} gzipped.`;

// Single source for the visible FAQ and the JSON-LD FAQPage. Backticks mark inline code.
const FAQ = [
  {
    question: 'What is the best Solid numeric input library?',
    answer:
      `Numora is a Solid numeric input library: framework-agnostic TypeScript, ${CORE_SIZE_GZIP} gzipped, with no runtime dependencies. In Solid you write a \`use:numora\` directive once, then use \`<input use:numora={opts} />\` anywhere.`,
  },
  {
    question: 'Is there a numora-solid package?',
    answer:
      'No, and you do not need one. The `use:numora` directive is the entire Solid adapter.',
  },
  {
    question: 'Does Numora work with SolidStart and SSR?',
    answer:
      'Yes. The `use:numora` directive only runs on the client. SolidStart renders the empty `<input>` on the server and Numora adopts it on hydration. No SolidStart-specific configuration is needed.',
  },
  {
    question: 'How do I add thousand separators to a Solid number input?',
    answer:
      'Pass `thousandStyle: ThousandStyle.Thousand` and `formatOn: FormatOn.Change` inside the `use:numora` binding. Numora formats as the user types and keeps the cursor stable through the inserted comma. Add `rawValueMode: true` so `onChange` emits the raw value without separators, which you can write straight into a `createSignal` setter. Without `rawValueMode`, `onChange` receives the formatted value.',
  },
  {
    question: 'Does it support i18n (decimal commas, currency formatting) in Solid?',
    answer:
      "Yes. Set `decimalSeparator: ','` and `thousandSeparator: '.'` (or use the `locale` option) for European formats.",
  },
  {
    question: 'Why not a plain signal-bound <input>?',
    answer:
      'A plain signal-bound input has no thousand separators, decimal limits or paste sanitization, and you would have to write the cursor-positioning logic yourself. Numora handles all of it.',
  },
  {
    question: 'Can I animate digits in Solid?',
    answer:
      'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Solid component. Torph respects prefers-reduced-motion by default.',
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
    headline: 'Solid numeric input: format numbers in Solid with a use:numora directive',
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
        name: 'Solid',
        url: 'https://www.solidjs.com/',
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
        name: 'Solid numeric input',
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

export const Route = createFileRoute('/docs/numora/frameworks/solid')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'solid numeric input, solidjs numeric input, solid number input, solid input formatting, solid number format, solid input mask, solidstart numeric input, solid thousand separator, solid currency input, solid decimal input, numora solid',
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
  component: SolidIntegration,
});

function SolidIntegration() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Solid numeric input</h1>
      <p>
        <strong className="font-numora">Numora</strong> is a precision-first{' '}
        <strong>Solid numeric input</strong> library. It handles thousand separators, decimal
        limits, paste sanitization, scientific-notation expansion and cursor preservation through a{' '}
        <code>use:numora</code> directive that mounts directly on an <code>&lt;input&gt;</code>.
        Write the raw value into a <code>createSignal</code> setter, and Solid&apos;s fine-grained
        reactivity updates whatever reads the signal. You need no <code>numora-solid</code> wrapper
        and no peer dependencies. The vanilla package is framework-agnostic TypeScript, {CORE_SIZE_GZIP}
        gzipped, with zero runtime dependencies.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash">{`pnpm add numora`}</CodeBlock>

      <h2>Solid directive</h2>
      <p>
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code>{' '}
        element. Solid&apos;s <code>use:</code> directives bind that lifecycle to a DOM node. Add
        this helper to your project once, and every <code>&lt;input use:numora={`{opts}`}&gt;</code>{' '}
        works.
      </p>

      <p>
        <code>src/directives/numora.ts</code>:
      </p>
      <CodeBlock language="ts">
        {`import { NumoraInput, type NumoraInputOptions } from 'numora';

export function numora(el: HTMLInputElement, accessor: () => NumoraInputOptions) {
  new NumoraInput(el, accessor() ?? {});
  // No cleanup needed: listeners die with the <input> when Solid removes it.
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

      <p>Component:</p>
      <CodeBlock language="tsx">
        {`import { createSignal } from 'solid-js';
import { FormatOn, ThousandStyle } from 'numora';
import { numora } from './directives/numora';
// Solid's compiler must see the 'numora' import to keep it. The directive
// looks unused otherwise and tree-shaking would drop it.
void numora;

export function AmountInput() {
  const [value, setValue] = createSignal('');

  return (
    <>
      <label>
        Amount
        <input
          use:numora={{
            formatOn: FormatOn.Change,
            thousandStyle: ThousandStyle.Thousand,
            decimalMaxLength: 2,
            rawValueMode: true,
            onChange: (v) => setValue(v),
          }}
        />
      </label>
      <p>Raw value: {value()}</p>
    </>
  );
}`}
      </CodeBlock>

      <p>
        The directive gets the <code>&lt;input&gt;</code> and an accessor for its options. Numora
        adopts the input and sets the attributes it needs. With <code>rawValueMode: true</code>,{' '}
        <code>onChange</code> receives the raw string (see{' '}
        <Link to="/docs/numora/features/value-types">value types</Link>).{' '}
        <code>FormatOn.Change</code> formats on every keystroke (see{' '}
        <Link to="/docs/numora/features/formatting">formatting</Link>).
      </p>

      <h2>Animated example: Numora + Torph in Solid</h2>
      <p>
        Stack a Torph <code>TextMorph</code> over a transparent-text <code>NumoraInput</code>. The{' '}
        <Link to="/docs/numora/integrations/torph">Torph integration</Link> explains the overlay and
        has the shared CSS and install steps. Below is the Solid component.
      </p>
      <CodeBlock language="tsx">
        {`import { onCleanup, onMount } from 'solid-js';
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';
import { TextMorph } from 'torph';
import './numora-overlay.css'; // overlay CSS from the Torph page

export function AnimatedAmountInput() {
  let display!: HTMLSpanElement;
  let host!: HTMLDivElement;

  onMount(() => {
    // SSR placeholder is a text node; Torph only animates element children.
    display.textContent = '';

    const morph = new TextMorph({
      element: display,
      ease: { stiffness: 400, damping: 30 },
    });
    morph.update('0');

    const numora = new NumoraInput(host, {
      formatOn: FormatOn.Change,
      thousandStyle: ThousandStyle.Thousand,
      decimalMaxLength: 2,
      onChange: (value) => morph.update(value || '0'),
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount');

    onCleanup(() => {
      morph.destroy();
      input.remove();
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

      <p>
        Solid does not scope CSS by default, so the overlay selectors from the Torph page work
        as-is.
      </p>

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
