import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { NumberFlowVanillaOverlayDemo } from '@/components/NumberFlowVanillaOverlayDemo'

const PAGE_URL = 'https://numeric-input.com/docs/numora/integrations/number-flow'
const LIB_URL = 'https://number-flow.barvian.me/vanilla'
const AUTHOR_URL = 'https://barvian.me/'

const META_TITLE = 'NumberFlow Vanilla Integration - Animated Numeric Input with Numora'
const META_DESCRIPTION = 'Integrate the vanilla NumberFlow web component by Maxwell Barvian with a vanilla Numora numeric input to animate each digit while the real input keeps owning the keyboard, undo, IME, and string precision.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'NumberFlow Vanilla Integration with Numora - Animated digits on a vanilla numeric input',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'NumberFlow',
        alternateName: ['number-flow', 'NumberFlow vanilla', 'NumberFlow web component'],
        description: 'Animated number transition web component by Maxwell Barvian, published on npm as `number-flow`. Registers a `<number-flow>` custom element.',
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
      { '@type': 'ListItem', position: 2, name: 'Numora', item: 'https://numeric-input.com/docs/numora' },
      { '@type': 'ListItem', position: 3, name: 'NumberFlow', item: PAGE_URL },
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
          text: 'Yes. This guide uses the `<number-flow>` web component from the `number-flow` package together with the vanilla NumoraInput class - no React in the runtime. The custom element is a standard browser primitive.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the NumberFlow + Numora overlay work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A transparent-text NumoraInput sits on top of a `<number-flow>` element. The input owns the keyboard, undo, IME, and mobile inputmode. A beforeinput microtask sync plus an input listener converts numora.value to a Number, sets flow.format with matching minimumFractionDigits, and calls flow.update() so NumberFlow animates the visible digits.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I find NumberFlow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `NumberFlow lives at ${LIB_URL} and is published on npm as \`number-flow\` (vanilla web component) and \`@number-flow/react\` (React).`,
        },
      },
    ],
  },
]

export const Route = createFileRoute('/docs/numora/integrations/number-flow')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'NumberFlow, NumberFlow vanilla, number-flow web component, animated numeric input, Numora, Maxwell Barvian, number animation, digit morph' },
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
      <h1>NumberFlow Vanilla Integration with Numora</h1>
      <p className="text-lg text-muted-foreground">
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener"><strong>NumberFlow</strong> by Maxwell Barvian</a>{' '}
        ships a vanilla <code>&lt;number-flow&gt;</code> custom element alongside its React wrapper. This guide layers it on top of a
        transparent-text vanilla <code>NumoraInput</code> so the editable surface itself appears animated. The real{' '}
        <code>&lt;input&gt;</code> still handles every keystroke; NumberFlow just renders what the user sees.
      </p>
      <p className="text-sm text-muted-foreground">
        Using React? See the{' '}
        <Link to="/docs/numora-react/integrations/number-flow">Numora React NumberFlow integration</Link> — it wires the overlay through{' '}
        <code>onChange</code> instead of manual DOM listeners.
      </p>

      <NumberFlowVanillaOverlayDemo />
      <p className="text-center text-sm text-muted-foreground -mt-12 mb-12">
        <code>FormatOn.Change</code> - digits animate on every keystroke.
      </p>

      <p className="text-sm text-muted-foreground">
        The demo above is rendered inside this React docs site, but the code below is plain TypeScript - no React.
        It uses the vanilla <code>NumoraInput</code> class and the <code>&lt;number-flow&gt;</code> custom element directly.
      </p>

      <h2>How the overlay works</h2>
      <p>
        Native <code>&lt;input&gt;</code> elements render their <code>value</code> as a string with no child DOM, so animation primitives
        can't inject animated spans into them directly. The overlay sidesteps that by stacking two layers in the same box:
      </p>
      <ul>
        <li><strong>Visible layer:</strong> a <code>&lt;number-flow&gt;</code> custom element that animates the formatted display number.</li>
        <li><strong>Keyboard layer:</strong> the vanilla <code>NumoraInput</code> positioned on top with <code>color: transparent</code> and a visible caret. It still owns focus, keystrokes, undo, IME, and mobile <code>inputmode</code>.</li>
      </ul>
      <p>
        Both layers render the same formatted number. The vanilla <code>NumoraInput</code> class applies formatting in{' '}
        <code>beforeinput</code> via <code>setRangeText</code>, but only runs listeners when an <code>input</code> event follows -
        which is not guaranteed on every path. The bridge therefore syncs NumberFlow via a <code>beforeinput</code> microtask (typing) and
        an <code>input</code> listener (undo/redo; paste, since Numora's paste handler dispatches a synthetic <code>input</code> after
        sanitizing). Each call converts <code>numora.value</code> to a <code>Number</code>, sets <code>flow.format</code> with a matching{' '}
        <code>minimumFractionDigits</code> derived from the typed string, and calls <code>flow.update()</code>. NumberFlow tweens each
        digit into place. The input itself never animates - but because its text is transparent, you only see the NumberFlow layer.
      </p>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Experimental pattern.</strong> This works well for short, append-mostly numeric fields. Unlike string-based morph
          libraries, NumberFlow animates numbers, which introduces fidelity caveats around trailing decimals, partial input states, and
          very large values - documented below.
        </p>
      </div>

      <h2>Installation</h2>
      <CodeBlock language="bash">
{`pnpm add numora number-flow
# or
npm install numora number-flow`}
      </CodeBlock>

      <h2 id="pattern-1-overlay">Pattern 1 - Overlay (animated input surface)</h2>
      <p>
        Two DOM nodes in a relative-positioned wrapper, one stylesheet, and a small sync bridge between the two libraries.
      </p>

      <CodeBlock language="html">
{`<label class="numora-overlay">
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
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: transparent;
  caret-color: white;
  outline: none;
  font: inherit;
}

.numora-overlay-host input::selection {
  background: rgba(255, 255, 255, 0.25);
}

.numora-overlay-host input::placeholder {
  color: transparent;
}`}
      </CodeBlock>

      <CodeBlock language="ts">
{`import { FormatOn, NumoraInput, ThousandStyle } from 'numora'
import 'number-flow' // registers the <number-flow> custom element

const display = document.querySelector<HTMLSpanElement>('.numora-overlay-display')!
const host = document.querySelector<HTMLDivElement>('.numora-overlay-host')!

const flow = document.createElement('number-flow')
display.appendChild(flow)

const numora = new NumoraInput(host, {
  formatOn: FormatOn.Change,
  decimalMaxLength: 2,
  thousandSeparator: ',',
  value: '1234567',
  thousandStyle: ThousandStyle.Thousand,
})
const input = numora.getElement()
input.setAttribute('aria-label', 'Amount')

function syncFlow() {
  const raw = numora.value
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  // Mirror typed decimals so trailing zeros stay aligned with the caret.
  flow.format = {
    useGrouping: true,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }
  flow.update(raw === '' ? 0 : Number(raw))
}

syncFlow()

// Numora mutates via setRangeText in beforeinput; the input event isn't guaranteed
// on every path, so sync from both.
input.addEventListener('beforeinput', () => queueMicrotask(syncFlow))
input.addEventListener('input', syncFlow)`}
      </CodeBlock>

      <h3>Why each line matters</h3>
      <ul>
        <li><strong><code>import 'number-flow'</code></strong> - the side-effect import registers <code>&lt;number-flow&gt;</code> as a custom element on <code>customElements</code>. The library guards the registration call so it's safe to import in SSR bundles.</li>
        <li><strong><code>formatOn: FormatOn.Change</code></strong> - keeps the input's display as the formatted string at all times, matching what NumberFlow shows.</li>
        <li><strong>Dynamic <code>minimumFractionDigits</code></strong> - <code>Number("1.20") = 1.2</code>, so without this NumberFlow renders <code>"1.2"</code> while the input contains <code>"1.20"</code>. Computing <code>decimals</code> from the raw string and feeding it to NumberFlow keeps the visible width and the caret aligned.</li>
        <li><strong><code>useGrouping: true</code></strong> - NumberFlow's grouping must match the input's thousand separator. The default en-US locale uses <code>","</code>, lining up with <code>thousandSeparator=","</code> and <code>ThousandStyle.Thousand</code>.</li>
        <li><strong><code>beforeinput</code> microtask sync</strong> - numora applies its formatted value inside <code>beforeinput</code> via <code>setRangeText</code>. By the next microtask <code>numora.value</code> reflects the post-format string. An <code>input</code> listener alone misses some paths (notably native browser cancellation cases on certain devices).</li>
        <li><strong>Transparent text + visible caret on the input</strong> - hides the input's own rendering while letting the caret show. The caret is the only thing the user sees from the real input.</li>
        <li><strong>Matching typography on both layers</strong> - the caret position is computed from the input's text layout. If fonts differ between the input and the NumberFlow output, the caret drifts.</li>
        <li><strong><code>tabular-nums</code> on the overlay span</strong> - keeps digit widths stable while NumberFlow animates, reducing layout shift during transitions.</li>
        <li><strong><code>aria-hidden</code> on the overlay span</strong> - screen readers should announce the <code>&lt;input&gt;</code>, not the visible decoration. The input has <code>aria-label</code>.</li>
      </ul>

      <h2>Caveats</h2>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Partial-input states.</strong> NumberFlow takes a <code>number</code>. While the user is typing{' '}
          <code>"1."</code> (a digit then a dot, no decimals yet), <code>Number("1.")</code> is <code>1</code> and NumberFlow renders{' '}
          <code>"1"</code> with no dot. The caret hovers just past the (invisible) input's dot, which is one character beyond the visible{' '}
          <code>"1"</code>. Brief and self-correcting once a fractional digit is typed.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Precision ceiling.</strong> Numora handles strings of any length. <code>Number()</code> is safe up to 15 significant digits.
          For DeFi token amounts at 18-decimal precision the overlay loses tail digits at the display layer - but the editable string
          (<code>numora.value</code>, what you pass to your math and contracts) is untouched. The overlay is a display lie, not a state lie.
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

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Mobile selection handles.</strong> iOS draws magnifier loupes and selection handles anchored to the input's text. With
          the text invisible, the loupe shows transparent characters. Not a blocker for short numeric entry, but test on real devices.
        </p>
      </div>

      <h2 id="pattern-2-readonly">Pattern 2 - Read-only animated values</h2>
      <p>
        For dashboards or oracle-fed prices that update outside the input, skip <code>NumoraInput</code> entirely and update{' '}
        <code>&lt;number-flow&gt;</code> directly from your data source:
      </p>

      <CodeBlock language="ts">
{`import 'number-flow'

const flow = document.querySelector<HTMLElement & {
  format?: Intl.NumberFormatOptions
  update(value: number): void
}>('number-flow')!

flow.format = { style: 'currency', currency: 'USD' }

// Then whenever your data changes:
flow.update(newBalance)`}
      </CodeBlock>

      <p>
        This isn't really an integration - it's just the right tool for read-only animated numbers. Use it wherever the value is a number
        that already exists in your state and you don't need string-precision math at the display point.
      </p>

      <h2>Reducing motion</h2>
      <p>
        NumberFlow respects <code>prefers-reduced-motion</code> by default. If a user opts out of animations at the OS level the digit
        morph becomes an instant swap - no extra code needed.
      </p>

      <h2>Key points</h2>
      <ul>
        <li>
          <strong>NumoraInput stays the source of truth.</strong> Read <code>numora.value</code> for anything that needs precision
          (math libraries, API calls, blockchain transactions). The overlay's <code>Number()</code> conversion is for display only.
        </li>
        <li>
          <strong>The input still owns the keyboard.</strong> Undo, redo, IME, paste, mobile <code>inputmode="decimal"</code>, native form
          submission all keep working. The overlay is a display layer.
        </li>
        <li>
          <strong>Mirror typed decimals into <code>flow.format.minimumFractionDigits</code>.</strong> Without this NumberFlow drops trailing
          zeros and the caret drifts off the end of the rendered number.
        </li>
        <li>
          <strong>Sync from <code>beforeinput</code> via <code>queueMicrotask</code>.</strong> An <code>input</code> listener alone misses
          some paths in the vanilla pipeline; the microtask catches the post-<code>setRangeText</code> state.
        </li>
        <li>
          <strong>Not a free upgrade.</strong> The overlay trades caret precision and mid-string editing fidelity for an animated surface.
          For append-only inputs the trade is reasonable; for general numeric fields, weigh the caveats above against the visual payoff.
        </li>
      </ul>

      <h2>FAQ</h2>

      <h3>What is the NumberFlow vanilla web component?</h3>
      <p>
        NumberFlow is an animated number transition library by{' '}
        <a href={AUTHOR_URL} target="_blank" rel="noreferrer noopener">Maxwell Barvian</a>. The vanilla <code>number-flow</code> package
        registers a <code>&lt;number-flow&gt;</code> custom element that tweens between two numeric values by morphing each digit, with{' '}
        <code>Intl.NumberFormat</code> options for currency and grouping. No framework required.
      </p>

      <h3>Does NumberFlow work without React?</h3>
      <p>
        Yes. This guide uses the <code>&lt;number-flow&gt;</code> web component from the <code>number-flow</code> package together with
        the vanilla <code>NumoraInput</code> class - no React in the runtime. The custom element is a standard browser primitive and
        works in any framework or none at all.
      </p>

      <h3>How does the NumberFlow + Numora overlay work?</h3>
      <p>
        A transparent-text <code>NumoraInput</code> sits on top of a <code>&lt;number-flow&gt;</code> element. The input owns the keyboard,
        undo, IME, and mobile <code>inputmode</code>. A <code>beforeinput</code> microtask plus an <code>input</code> listener convert{' '}
        <code>numora.value</code> to a <code>Number</code>, set <code>flow.format</code> with a matching <code>minimumFractionDigits</code>,
        and call <code>flow.update()</code> so NumberFlow animates the visible digits.
      </p>

      <h3>Where can I install NumberFlow?</h3>
      <p>
        NumberFlow lives at{' '}
        <a href={LIB_URL} target="_blank" rel="noreferrer noopener">number-flow.barvian.me/vanilla</a>{' '}
        and is published on npm as <code>number-flow</code> (vanilla web component) and <code>@number-flow/react</code> (React). Install
        the vanilla pair with <code>npm install numora number-flow</code>.
      </p>
    </div>
  )
}
