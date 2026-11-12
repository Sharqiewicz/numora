import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { NumberFlowCaveats } from '@/components/docs/NumberFlowCaveats';
import { OverlayExplainer } from '@/components/docs/OverlayExplainer';
import { NumberFlowVanillaOverlayDemo } from '@/components/NumberFlowVanillaOverlayDemo';

const PAGE_URL = 'https://numeric-input.com/docs/numora/integrations/number-flow';
const LIB_URL = 'https://number-flow.barvian.me/vanilla';
const AUTHOR_URL = 'https://barvian.me/';

const META_TITLE = 'NumberFlow integration | Numora';
const META_DESCRIPTION =
  'Use the vanilla NumberFlow web component by Maxwell Barvian with a vanilla Numora numeric input to animate each digit while the real input keeps handling the keyboard, IME and string precision.';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'NumberFlow integration: animated digits on a vanilla numeric input',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'NumberFlow',
        alternateName: ['number-flow', 'NumberFlow vanilla', 'NumberFlow web component'],
        description:
          'Animated number transition web component by Maxwell Barvian, published on npm as `number-flow`. Registers a `<number-flow>` custom element.',
        url: LIB_URL,
        author: { '@type': 'Person', name: 'Maxwell Barvian', url: AUTHOR_URL },
      },
      {
        '@type': 'SoftwareSourceCode',
        name: 'Numora',
        alternateName: 'numora',
        url: 'https://numeric-input.com/',
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
        name: 'Numora',
        item: 'https://numeric-input.com/docs/numora',
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
        name: 'What is the NumberFlow vanilla web component?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NumberFlow is an animated number transition library by Maxwell Barvian. The vanilla `number-flow` package registers a `<number-flow>` custom element that tweens between two numeric values by morphing each digit, with `Intl.NumberFormat` options for currency and grouping. No framework required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does NumberFlow work without React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. This guide uses the `<number-flow>` web component from the `number-flow` package together with the vanilla NumoraInput class, with no React in the runtime. Custom elements are a browser standard, so it works in any framework or none.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the NumberFlow + Numora overlay work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A transparent-text NumoraInput sits on top of a `<number-flow>` element. The input owns the keyboard, IME, and mobile inputmode. The onValueChange option receives the raw value, converts it to a Number, sets flow.format with a matching minimumFractionDigits, and calls flow.update() so NumberFlow animates the visible digits.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I install NumberFlow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `NumberFlow lives at ${LIB_URL} and is published on npm as \`number-flow\` (vanilla web component) and \`@number-flow/react\` (React). Install the vanilla pair with \`npm install numora number-flow\`.`,
        },
      },
    ],
  },
];

export const Route = createFileRoute('/docs/numora/integrations/number-flow')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'NumberFlow, NumberFlow vanilla, number-flow web component, animated numeric input, Numora, Maxwell Barvian, number animation, digit morph',
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
        has a vanilla <code>&lt;number-flow&gt;</code> custom element alongside its React wrapper.
        This guide layers it on top of a transparent-text vanilla <code>NumoraInput</code>, so the
        editable surface itself appears animated. The real <code>&lt;input&gt;</code> still handles
        every keystroke, and NumberFlow renders what the user sees.
      </p>
      <p>
        Using React? See the{' '}
        <Link to="/docs/numora-react/integrations/number-flow">
          Numora React NumberFlow integration
        </Link>
        .
      </p>

      <NumberFlowVanillaOverlayDemo />
      <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
        With <code>'change'</code>, digits animate on every keystroke.
      </p>

      <OverlayExplainer
        visibleLayer={
          <>
            a <code>&lt;number-flow&gt;</code> custom element that animates the formatted display
            number.
          </>
        }
        input={
          <>
            the vanilla <code>NumoraInput</code>
          </>
        }
      >
        <p>
          Both layers render the same formatted number. The vanilla <code>NumoraInput</code> class
          calls its <code>onValueChange</code> option on every logical value change: typing, paste,
          the focus-strip and blur reformatting. It receives{' '}
          <code>{'{ value, formattedValue }'}</code>. <code>value</code> is the raw string without
          separators, which <code>Number()</code> can parse. The callback sets{' '}
          <code>flow.format</code> and calls <code>flow.update()</code>, and NumberFlow tweens each
          digit into place. The input itself never animates, and because its text is transparent,
          you only see the NumberFlow layer.
        </p>
      </OverlayExplainer>

      <div className="bg-signal-amber/10 border border-signal-amber/30 rounded-lg p-4 my-4">
        <p className="m-0">
          <strong>Caution:</strong> this pattern is experimental. It suits short, append-mostly
          numeric fields. Torph animates strings. NumberFlow animates numbers, which causes
          precision caveats with trailing decimals, partial input states and very large values. They
          are listed below.
        </p>
      </div>

      <h2>Installation</h2>
      <CodeBlock language="bash">
        {`pnpm add numora number-flow
# or
npm install numora number-flow`}
      </CodeBlock>

      <h2 id="overlay">Building the overlay</h2>

      <CodeBlock language="html">
        {`<!-- aria-hidden: screen readers announce the <input> (it has an aria-label), not the decoration -->
<label class="numora-overlay">
  <span class="numora-overlay-display" aria-hidden="true"></span>
  <div class="numora-overlay-host"></div>
</label>`}
      </CodeBlock>

      <CodeBlock language="css">
        {`.numora-overlay {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 2.25rem/1 ui-monospace, SFMono-Regular, monospace;
  color: white;
}

.numora-overlay-display {
  pointer-events: none;
  white-space: pre;
  /* Stable digit widths while NumberFlow animates, so less layout shift */
  font-variant-numeric: tabular-nums;
}

.numora-overlay-host {
  position: absolute;
  inset: 0;
}

/* Style the <input> that NumoraInput creates inside the host */
.numora-overlay-host input {
  width: 100%;
  height: 100%;
  /* Zero margin/padding/border so the input's text origin matches the overlay's */
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  /* Hide the input's text, keep the cursor */
  color: transparent;
  caret-color: white;
  outline: none;
  /* Same font on both layers, or the cursor drifts */
  font: inherit;
}

/* Translucent: an opaque selection would hide the NumberFlow layer */
.numora-overlay-host input::selection {
  background: rgba(255, 255, 255, 0.25);
}

/* Hide the input's own placeholder */
.numora-overlay-host input::placeholder {
  color: transparent;
}`}
      </CodeBlock>

      <CodeBlock language="ts">
        {`import { NumoraInput } from 'numora'
import 'number-flow' // registers the <number-flow> custom element

const display = document.querySelector<HTMLSpanElement>('.numora-overlay-display')!
const host = document.querySelector<HTMLDivElement>('.numora-overlay-host')!

const flow = document.createElement('number-flow')
display.appendChild(flow)

function syncFlow(raw: string) {
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  flow.format = {
    useGrouping: true,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }
  flow.update(Number(raw) || 0)
}

const numora = new NumoraInput(host, {
  formatOn: 'change',
  decimalMaxLength: 2,
  defaultValue: '1234567',
  groupingStyle: 'thousand',
  // onValueChange receives { value, formattedValue }; value is raw ("1234567"), safe for Number().
  onValueChange: ({ value }) => syncFlow(value),
})
const input = numora.element
input.setAttribute('aria-label', 'Amount')

// The initial value does not fire onValueChange, so prime the display.
syncFlow(numora.rawValue)`}
      </CodeBlock>

      <h3>Why each line matters</h3>
      <ul>
        <li>
          <strong>
            <code>import 'number-flow'</code>
          </strong>{' '}
          is a side-effect import that registers <code>&lt;number-flow&gt;</code> as a custom
          element on <code>customElements</code>. The library guards the registration call, so it's
          safe to import in SSR bundles.
        </li>
        <li>
          <strong>
            <code>formatOn: 'change'</code>
          </strong>{' '}
          keeps the input's display as the formatted string at all times, matching what NumberFlow
          shows.
        </li>
        <li>
          <strong>
            <code>onValueChange: ({'{ value }'})</code>
          </strong>{' '}
          reads the raw value (for example <code>"1234567.5"</code>) rather than{' '}
          <code>formattedValue</code>. <code>Number("1,234,567")</code> is <code>NaN</code>, so the
          callback needs the raw value.
        </li>
        <li>
          <strong>
            <code>Number(value)</code> suits fiat-sized amounts only.
          </strong>{' '}
          NumberFlow takes a JavaScript number, so the overlay is exact up to about 15 significant
          digits. Past that, for example an 18-decimal token amount, the animated digits can differ
          from what the input holds. Keep the string from <code>onValueChange</code> as the value
          you store and send. For long amounts use the{' '}
          <a href="/docs/numora/integrations/torph">Torph</a> overlay, which animates the display
          string and never converts it.
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
          is needed because NumberFlow's grouping must match the input's thousand separator. The
          default en-US locale uses <code>","</code>, which matches the default{' '}
          <code>thousandSeparator</code> and <code>'thousand'</code>.
        </li>
        <li>
          <strong>
            <code>onValueChange</code> callback
          </strong>{' '}
          fires for typing, paste, the focus-strip and blur reformatting, so you need no DOM{' '}
          <code>beforeinput</code> or <code>input</code> listeners. It does not fire for the initial{' '}
          <code>value</code>, so the code calls <code>syncFlow(numora.rawValue)</code> explicitly.
        </li>
      </ul>

      <NumberFlowCaveats />

      <h2>Read-only animated values</h2>
      <p>
        For dashboards or oracle-fed prices that update outside the input, skip{' '}
        <code>NumoraInput</code> and update <code>&lt;number-flow&gt;</code> directly. See the{' '}
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

      <h2>Cleanup</h2>
      <p>
        The vanilla <code>NumoraInput</code> class has no destroy method; its listeners are bound to
        the input it created. On teardown remove the <code>&lt;number-flow&gt;</code> element, then
        the input element.
      </p>

      <CodeBlock language="ts">
        {`flow.remove()
input.remove()`}
      </CodeBlock>

      <h2>FAQ</h2>

      <h3>What is the NumberFlow vanilla web component?</h3>
      <p>
        NumberFlow is an animated number transition library by{' '}
        <a href={AUTHOR_URL} target="_blank" rel="noreferrer noopener">
          Maxwell Barvian
        </a>
        . The vanilla <code>number-flow</code> package registers a <code>&lt;number-flow&gt;</code>{' '}
        custom element that tweens between two numeric values by morphing each digit, with{' '}
        <code>Intl.NumberFormat</code> options for currency and grouping. No framework required.
      </p>

      <h3>Does NumberFlow work without React?</h3>
      <p>
        Yes. This guide uses the <code>&lt;number-flow&gt;</code> web component from the{' '}
        <code>number-flow</code> package together with the vanilla <code>NumoraInput</code> class,
        with no React in the runtime. Custom elements are a browser standard, so it works in any
        framework or none.
      </p>

      <h3>Where can I install NumberFlow?</h3>
      <p>
        NumberFlow lives at{' '}
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener">
          number-flow.barvian.me/vanilla
        </a>{' '}
        and is published on npm as <code>number-flow</code> (vanilla web component) and{' '}
        <code>@number-flow/react</code> (React). Install the vanilla pair with{' '}
        <code>npm install numora number-flow</code>.
      </p>
    </div>
  );
}
