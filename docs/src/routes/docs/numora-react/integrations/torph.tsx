import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { TorphBlurDemo } from '@/components/TorphBlurDemo'
import { TorphDemo } from '@/components/TorphDemo'

const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora-react/integrations/torph'
const TORPH_LIB_URL = 'https://torph.lochie.me/'
const LOCHIE_URL = 'https://lochie.me/'

const META_TITLE = 'Torph Library Integration - Animated Numeric Input with Numora React'
const META_DESCRIPTION = 'Integrate the Torph library by Lochie Axon with Numora React to animate each digit while the real input keeps owning the keyboard, undo, IME, and string precision.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Torph Library Integration with Numora React - Animated digits on a real numeric input',
    description: META_DESCRIPTION,
    url: TORPH_PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'Torph',
        alternateName: ['Torph library', 'torph', 'torph/react'],
        description: 'Animated text-morphing library by Lochie Axon, with a React component (torph/react) and a vanilla TextMorph class.',
        url: TORPH_LIB_URL,
        author: { '@type': 'Person', name: 'Lochie Axon', url: LOCHIE_URL },
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
      { '@type': 'ListItem', position: 2, name: 'Numora React', item: 'https://numeric-input.com/docs/numora-react' },
      { '@type': 'ListItem', position: 3, name: 'Torph', item: TORPH_PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Torph library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Torph is an animated text-morphing library by Lochie Axon. It diffs an old string and a new string and animates each character between them. Torph ships a React component at `torph/react` and a vanilla TextMorph class.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use Torph with React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Import TextMorph from `torph/react` and render it inside the children of a transparent-text NumoraInput overlay. Pass formattedValue from Numora as the TextMorph child and the digits animate on every keystroke.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Torph respect prefers-reduced-motion?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Torph respects the OS-level prefers-reduced-motion setting by default. If the user opts out of animations, TextMorph becomes an instant swap - no extra code needed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I find the Torph library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The Torph library by Lochie Axon lives at ${TORPH_LIB_URL} and is published on npm as \`torph\`.`,
        },
      },
    ],
  },
]

export const Route = createFileRoute('/docs/numora-react/integrations/torph')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'Torph library, Torph by Lochie Axon, Torph React, torph/react, TextMorph, animated numeric input React, Numora React, digit animation, number animation' },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: TORPH_PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [
      { rel: 'canonical', href: TORPH_PAGE_URL },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify(JSON_LD) },
    ],
  }),
  component: TorphIntegration,
})

function TorphIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Torph Library Integration with Numora React</h1>
      <p className="text-lg text-muted-foreground">
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener"><strong>Torph</strong> by Lochie Axon</a>{' '}
        is an animated text-morphing library. This guide layers a Torph <code>TextMorph</code> on top of a transparent-text Numora React{' '}
        <code>NumoraInput</code> so the editable surface itself appears animated. The real{' '}
        <code>&lt;input&gt;</code> still handles every keystroke; Torph just renders what the user sees.
      </p>
      <p className="text-sm text-muted-foreground">
        Using vanilla JS? See the{' '}
        <Link to="/docs/numora/integrations/torph">core Numora Torph integration</Link> — it uses{' '}
        <code>NumoraInput</code> and <code>TextMorph</code> directly with a DOM event bridge.
      </p>

      <TorphDemo />
      <p className="text-center text-sm text-muted-foreground -mt-12 mb-12">
        <code>FormatOn.Change</code> - separators animate on every keystroke.
      </p>

      <TorphBlurDemo />
      <p className="text-center text-sm text-muted-foreground -mt-12 mb-12">
        <code>FormatOn.Blur</code> - separators animate out on focus, back in on blur.
      </p>

      <h2>How the overlay works</h2>
      <p>
        Native <code>&lt;input&gt;</code> elements render their <code>value</code> as a string with no child DOM, so animation libraries
        can't inject animated spans into them directly. The overlay sidesteps that constraint by stacking two layers in the same box:
      </p>
      <ul>
        <li><strong>Visible layer:</strong> a <code>&lt;TextMorph&gt;</code> that animates the formatted display string.</li>
        <li><strong>Keyboard layer:</strong> the real <code>NumoraInput</code> positioned on top with <code>color: transparent</code> and a visible caret. It still owns focus, keystrokes, selection, undo, IME, and mobile <code>inputmode</code>.</li>
      </ul>
      <p>
        Both layers render the same formatted string. As the user types, numora's <code>onChange</code> fires; the formatted value flows
        into the TextMorph; Torph diffs the old and new strings and animates each digit / separator into place. The input itself never
        animates - but because its text is transparent, you only see the Torph layer.
      </p>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Experimental pattern.</strong> This works well for short, append-mostly numeric fields (swap amounts, donation amounts,
          single-line entry). It has known caveats around caret precision, mid-string editing, and mobile selection handles - documented
          below.
        </p>
      </div>

      <h2>Installation</h2>
      <CodeBlock language="bash">
{`pnpm add numora-react torph
# or
npm install numora-react torph`}
      </CodeBlock>

      <h2 id="pattern-1-overlay">Pattern 1 - Overlay (animated input surface)</h2>
      <p>
        Implementation is short. The key constraints: identical typography on both layers, <code>FormatOn.Change</code> so the
        input's text matches the morph's text on every keystroke, and zero padding/border on the input so its text origin lines up
        with the overlay span.
      </p>

      <CodeBlock language="tsx">
{`import { FormatOn } from 'numora'
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react'
import { useState } from 'react'
import { TextMorph } from 'torph/react'

function AnimatedInput() {
  const [value, setValue] = useState('')
  const [formatted, setFormatted] = useState('')

  return (
    <label className="relative inline-flex items-center text-4xl font-mono leading-none text-white">
      {/* Visible layer: Torph renders the animated text */}
      <span aria-hidden="true" className="pointer-events-none whitespace-pre">
        <TextMorph ease={{ stiffness: 400, damping: 30 }}>
          {formatted || '0'}
        </TextMorph>
      </span>

      {/* Invisible layer: real input owns the keyboard */}
      <NumoraInput
        value={value}
        onChange={(e: NumoraInputChangeEvent) => {
          setValue(e.target.value)
          setFormatted(e.target.formattedValue || '')
        }}
        formatOn={FormatOn.Change}
        decimalMaxLength={2}
        thousandSeparator=","
        aria-label="Amount"
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
        <li><strong><code>formatOn: FormatOn.Change</code></strong> (used here) - keeps the input's display as the formatted string at all times, so passing <code>formattedValue</code> to Torph on every <code>onChange</code> is enough. <code>FormatOn.Blur</code> also works, but the focus event silently strips separators (no <code>onChange</code> fires for it) - to use Blur mode add <code>onFocus={'{(e) => setFormatted(e.target.value)}'}</code> so Torph stays in sync.</li>
        <li><strong><code>text-transparent</code> + <code>caret-white</code></strong> - hides the input's text but keeps the browser-rendered caret. The caret is the only thing the user sees from the real input.</li>
        <li><strong>Matching typography on both layers (<code>text-4xl font-mono leading-none</code>)</strong> - the caret position is computed from the input's text layout. If fonts differ, the caret drifts away from where the visible character renders.</li>
        <li><strong><code>m-0 p-0 border-0</code></strong> - browser default input padding shifts the text origin. Zero padding aligns the input's text rendering with the overlay span's text rendering.</li>
        <li><strong><code>selection:bg-white/25</code></strong> - the input's text is transparent, so a default opaque selection rect would obscure the morph layer below. A translucent selection lets the morph text show through while still signaling that text is selected.</li>
        <li><strong><code>placeholder-transparent</code></strong> - the input's own placeholder would otherwise be visible. The overlay shows <code>"0"</code> as a fallback instead.</li>
        <li><strong><code>aria-hidden</code> on the overlay span</strong> - screen readers should announce the <code>&lt;input&gt;</code>, not the visible decoration. The input has <code>aria-label</code>.</li>
      </ul>


      <h2>Caveats</h2>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Caret drift during animation.</strong> The caret's pixel position is computed from the input's invisible text layout,
          which jumps to the new value instantly. Torph animates characters into that final position over ~150ms. Mid-flight, the caret
          briefly floats next to characters that haven't arrived yet. With a high-stiffness spring (as in the demo) it's barely noticeable;
          with slow easings it becomes obvious.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Mid-string editing is limited.</strong> Clicking the overlay span doesn't directly position the caret - clicks pass
          through to the input, but the browser's hit-test runs against the input's invisible text. If the visible character widths in
          the overlay differ from the input's (during Torph's mid-animation width transitions), the click-to-caret position lands on the
          wrong character. For append-only fields this doesn't matter; for fields where users edit mid-number, this pattern isn't a fit.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>Mobile selection handles.</strong> iOS draws magnifier loupes and selection handles anchored to the input's text. With
          the text invisible, the loupe shows transparent characters. Not a blocker for short numeric entry, but test on real devices.
        </p>
      </div>

      <h2>Pattern 2 - Morph a live read-only value</h2>
      <p>
        For dashboards or oracle-fed prices that update outside the input, format with <code>formatValueForDisplay</code> and pass to{' '}
        <code>&lt;TextMorph&gt;</code>:
      </p>

      <CodeBlock language="tsx">
{`import { formatValueForDisplay, ThousandStyle } from 'numora'
import { TextMorph } from 'torph/react'

function LiveBalance({ rawBalance }: { rawBalance: string }) {
  const formatted = formatValueForDisplay(rawBalance, {
    thousandSeparator: ',',
    decimalSeparator: '.',
    thousandStyle: ThousandStyle.Thousand,
  })

  return (
    <div>
      Balance:{' '}
      <TextMorph ease={{ stiffness: 180, damping: 18 }}>
        {formatted}
      </TextMorph>
    </div>
  )
}`}
      </CodeBlock>

      <h2>Reducing motion</h2>
      <p>
        Torph respects <code>prefers-reduced-motion</code> by default. If a user opts out of animations at the OS level the morph
        becomes an instant swap - no extra code needed.
      </p>

      <h2>Key points</h2>
      <ul>
        <li>
          <strong>No precision boundary.</strong> Torph operates on strings; numora hands you the formatted string. Pipe it through
          without ever calling <code>Number()</code>.
        </li>
        <li>
          <strong>The input still owns the keyboard.</strong> Undo, redo, IME, paste, mobile <code>inputmode="decimal"</code>, native
          form submission all keep working. The overlay is a display layer only.
        </li>
        <li>
          <strong>Pass <code>formattedValue</code> to Torph.</strong> That value always equals the input's current display string.
          With <code>FormatOn.Change</code> no extra wiring is needed. With <code>FormatOn.Blur</code>, add an <code>onFocus</code> handler
          to mirror the silent focus-strip - the blur reformat itself fires <code>onChange</code> and needs nothing.
        </li>
        <li>
          <strong>Match typography.</strong> Font family, size, line-height, letter-spacing, and zero padding/border on the input - the
          caret is computed from the input's text layout, so any difference shows up as caret drift.
        </li>
        <li>
          <strong>Not a free upgrade.</strong> The overlay trades caret precision and mid-string editing fidelity for an animated surface.
          For append-only inputs the trade is reasonable; for general numeric fields, weigh the caveats above against the visual payoff.
        </li>
      </ul>

      <h2>FAQ</h2>

      <h3>What is the Torph library?</h3>
      <p>
        Torph is an animated text-morphing library by{' '}
        <a href={LOCHIE_URL} target="_blank" rel="noreferrer noopener">Lochie Axon</a>. It diffs an old string and a new
        string and animates each character between them. Torph ships a React component at <code>torph/react</code> and
        a vanilla <code>TextMorph</code> class - this page uses the React component.
      </p>

      <h3>How do I use Torph with React?</h3>
      <p>
        Import <code>TextMorph</code> from <code>torph/react</code> and render it as the visible layer of a
        transparent-text <code>NumoraInput</code> overlay. Pass <code>formattedValue</code> from Numora's{' '}
        <code>onChange</code> as the <code>TextMorph</code> child and the digits animate on every keystroke.
      </p>

      <h3>Does Torph respect <code>prefers-reduced-motion</code>?</h3>
      <p>
        Yes. Torph respects the OS-level <code>prefers-reduced-motion</code> setting by default. If the user opts out of
        animations, <code>TextMorph</code> becomes an instant swap - no extra code needed.
      </p>

      <h3>Where can I install the Torph library?</h3>
      <p>
        The Torph library lives at{' '}
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener">torph.lochie.me</a>{' '}
        and is published on npm as <code>torph</code>. Install both packages with{' '}
        <code>npm install numora-react torph</code>.
      </p>
    </div>
  )
}
