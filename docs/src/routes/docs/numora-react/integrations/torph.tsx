import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CodeBlock } from '@/components/CodeBlock';
import { InstallTabs } from '@/components/InstallTabs';
import { TorphBlurDemo } from '@/components/TorphBlurDemo';
import { TorphBlurMinimal } from '@/components/TorphBlurMinimal';
import { TorphBlurSection } from '@/components/TorphBlurSection';
import { TorphDemo } from '@/components/TorphDemo';

const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora-react/integrations/torph';
const TORPH_LIB_URL = 'https://torph.lochie.me/';
const LOCHIE_URL = 'https://lochie.me/';

const META_TITLE = 'Torph integration - animated numeric input with Numora React';
const META_DESCRIPTION =
  'Integrate the Torph library by Lochie Axon with Numora React to animate each digit while the real input keeps owning the keyboard, undo, IME, and string precision.';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Torph integration with Numora React',
    description: META_DESCRIPTION,
    url: TORPH_PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'Torph',
        alternateName: ['Torph library', 'torph', 'torph/react'],
        description:
          'Animated text-morphing library by Lochie Axon, with a React component (torph/react) and a vanilla TextMorph class.',
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Numora React',
        item: 'https://numeric-input.com/docs/numora-react',
      },
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
];

export const Route = createFileRoute('/docs/numora-react/integrations/torph')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'Torph library, Torph by Lochie Axon, Torph React, torph/react, TextMorph, animated numeric input React, Numora React, digit animation, number animation',
      },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: TORPH_PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: TORPH_PAGE_URL }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(JSON_LD) }],
  }),
  component: TorphIntegration,
});

function TorphIntegration() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-stone-100">Torph integration with Numora React</h1>
      <p className="text-stone-400 text-base leading-6">
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener" className="underline link-underline hover:text-stone-100 transition-colors">
          <strong>Torph</strong> by Lochie Axon
        </a>{' '}
        is an animated text-morphing library. This guide layers a Torph <code>TextMorph</code> on
        top of a transparent-text Numora React <code>NumoraInput</code> so the editable surface
        itself appears animated. The real <code>&lt;input&gt;</code> still handles every keystroke.
        Torph just renders what the user sees.
      </p>
      <p className="text-stone-400 text-base leading-6">
        Using other frameworks? See the{' '}
        <Link to="/docs/numora/integrations/torph" className="underline link-underline hover:text-stone-100 transition-colors">core Numora Torph integration</Link> - it uses{' '}
        <code>NumoraInput</code> and <code>TextMorph</code> directly with a DOM event bridge.
      </p>

      <TorphDemo />
      <p className="text-stone-400 text-base leading-6 text-center -mt-8 mb-12">
        <code>FormatOn.Change</code> - separators animate on every keystroke.
      </p>

      <hr/>

      <TorphBlurSection>
        {(variant) => (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={variant}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: prefersReducedMotion
                    ? { duration: 0.1 }
                    : { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.1 },
                }}
              >
                {variant === 'minimal' ? <TorphBlurMinimal /> : <TorphBlurDemo />}
                <p className="text-stone-400 text-base leading-6 text-center -mt-8 mb-12">
                  <code>FormatOn.Blur</code> -{' '}
                  {variant === 'minimal'
                    ? 'minimal integration; the caret floats during the focus-strip morph.'
                    : 'polished variant that hides the caret during the focus-strip morph.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {variant === 'polished' && (
                <motion.section
                  key="polished-deep-dive"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: prefersReducedMotion
                      ? { duration: 0.1 }
                      : { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.12 },
                  }}
                >
                  <h2 className="text-stone-100 text-2xl">Hiding the caret during the focus-strip morph.</h2>
                  <p className="text-stone-400 text-base leading-6">
                    With <code>FormatOn.Blur</code>, focusing the input swaps <code>1,234,567</code>{' '}
                    to <code>1234567</code> in one DOM call. The caret jumps to its final index
                    instantly, but Torph takes ~400ms to morph the visible digits there - making the
                    caret look like it drifts past stationary text. Hide the native caret on focus
                    and clear it on the next <code>onAnimationComplete</code>; a timeout fallback
                    covers the case where focus fires but no morph follows (value already has no
                    separators):
                  </p>

                  <CodeBlock language="tsx">
                    {`const [caretHidden, setCaretHidden] = useState(false)
const postFocusMorphPendingRef = useRef(false)

const morph = new TextMorph({
  element: displayRef.current,
  ease: { stiffness: 400, damping: 30 },
  onAnimationComplete: () => {
    if (postFocusMorphPendingRef.current) {
      postFocusMorphPendingRef.current = false
      setCaretHidden(false)
    }
  },
})

<NumoraInput
  onFocus={() => {
    postFocusMorphPendingRef.current = true
    setCaretHidden(true)
    window.setTimeout(() => {
      if (postFocusMorphPendingRef.current) {
        postFocusMorphPendingRef.current = false
        setCaretHidden(false)
      }
    }, 600)
  }}
  className={\`... \${caretHidden ? 'caret-transparent' : 'caret-white'} ...\`}
  ...
/>`}
                  </CodeBlock>

                  <p className="text-stone-400 text-base leading-6">
                    The flag gates the toggle so per-keystroke morphs after the strip don't keep
                    flipping the caret - only the first morph after focus matters.
                  </p>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}
      </TorphBlurSection>

      <h2 className="text-stone-100 text-2xl">How the overlay works</h2>
      <p className="text-stone-400 text-base leading-6">
        Native <code>&lt;input&gt;</code> elements render their <code>value</code> as a string with
        no child DOM, so animation libraries can't inject animated spans into them directly. The
        overlay sidesteps that constraint by stacking two layers in the same box:
      </p>
      <ul>
        <li>
          <strong>Visible layer:</strong> a <code>&lt;TextMorph&gt;</code> that animates the
          formatted display string.
        </li>
        <li>
          <strong>Keyboard layer:</strong> the real <code>NumoraInput</code> positioned on top with{' '}
          <code>color: transparent</code> and a visible caret. It still owns focus, keystrokes,
          selection, undo, IME, and mobile <code>inputmode</code>.
        </li>
      </ul>
      <p className="text-stone-400 text-base leading-6">
        Both layers render the same formatted string. As the user types, numora's{' '}
        <code>onChange</code> fires; the formatted value flows into the TextMorph; Torph diffs the
        old and new strings and animates each digit / separator into place. The input itself never
        animates - but because its text is transparent, you only see the Torph layer.
      </p>

      <h2 className="text-stone-100 text-2xl">Installation</h2>
      <InstallTabs packages="numora-react torph" />

      <h2 id="overlay" className="text-stone-100 text-2xl">Building the overlay</h2>
      <p className="text-stone-400 text-base leading-6">
        Implementation is short. The key constraints: identical typography on both layers,{' '}
        <code>FormatOn.Change</code> so the input's text matches the morph's text on every
        keystroke, and zero padding/border on the input so its text origin lines up with the overlay
        span.
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
        maxDecimals={2}
        thousandSeparator=","
        aria-label="Amount"
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent
                   text-transparent placeholder-transparent caret-white
                   outline-none focus:outline-none
                   text-4xl font-mono leading-none"
      />
    </label>
  )
}`}
      </CodeBlock>

      <h3 className="text-stone-100">Why each line matters</h3>
      <ul>
        <li>
          <strong>
            <code>formatOn: FormatOn.Change</code>
          </strong>{' '}
          (used here) - keeps the input's display as the formatted string at all times, so passing{' '}
          <code>formattedValue</code> to Torph on every <code>onChange</code> is enough.{' '}
          <code>FormatOn.Blur</code> also works, but the focus event silently strips separators (no{' '}
          <code>onChange</code> fires for it) - to use Blur mode add{' '}
          <code>onFocus={'{(e) => setFormatted(e.target.value)}'}</code> so Torph stays in sync.
        </li>
        <li>
          <strong>Match typography</strong> - share font size, family, leading on both layers and
          use <code>m-0 p-0 border-0</code> on the input. The caret is computed from the input's
          invisible text layout, so any difference in font metrics or text origin shows up as caret
          drift.
        </li>
      </ul>

      <h2 className="text-stone-100 text-2xl">Reducing motion</h2>
      <p className="text-stone-400 text-base leading-6">
        Torph respects <code>prefers-reduced-motion</code> by default. If a user opts out of
        animations at the OS level the morph becomes an instant swap - no extra code needed.
      </p>

      <h2 className="text-stone-100 text-2xl">Key points</h2>
      <ul>
        <li>
          <strong>No precision boundary.</strong> Torph operates on strings; numora hands you the
          formatted string. Pipe it through without ever calling <code>Number()</code>.
        </li>
        <li>
          <strong>The input still owns the keyboard.</strong> Undo, redo, IME, paste, mobile{' '}
          <code>inputmode="decimal"</code>, native form submission all keep working. The overlay is
          a display layer only.
        </li>
        <li>
          <strong>
            Pass <code>formattedValue</code> to Torph.
          </strong>{' '}
          That value always equals the input's current display string. With{' '}
          <code>FormatOn.Change</code> no extra wiring is needed. With <code>FormatOn.Blur</code>,
          add an <code>onFocus</code> handler to mirror the silent focus-strip - the blur reformat
          itself fires <code>onChange</code> and needs nothing.
        </li>
        <li>
          <strong>Match typography.</strong> Font family, size, line-height, letter-spacing, and
          zero padding/border on the input - the caret is computed from the input's text layout, so
          any difference shows up as caret drift.
        </li>
      </ul>

      <h2 className="text-stone-100 text-2xl">FAQ</h2>

      <h3 className="text-stone-100">What is the Torph library?</h3>
      <p className="text-stone-400 text-base leading-6">
        Torph is an animated text-morphing library by{' '}
        <a href={LOCHIE_URL} target="_blank" rel="noreferrer noopener" className="underline link-underline hover:text-stone-100 transition-colors">
          Lochie Axon
        </a>
        . It diffs an old string and a new string and animates each character between them. Torph
        ships a React component at <code>torph/react</code> and a vanilla <code>TextMorph</code>{' '}
        class - this page uses the React component.
      </p>

      <h3 className="text-stone-100">How do I use Torph with React?</h3>
      <p className="text-stone-400 text-base leading-6">
        Import <code>TextMorph</code> from <code>torph/react</code> and render it as the visible
        layer of a transparent-text <code>NumoraInput</code> overlay. Pass{' '}
        <code>formattedValue</code> from Numora's <code>onChange</code> as the{' '}
        <code>TextMorph</code> child and the digits animate on every keystroke.
      </p>

      <h3 className="text-stone-100">
        Does Torph respect <code>prefers-reduced-motion</code>?
      </h3>
      <p className="text-stone-400 text-base leading-6">
        Yes. Torph respects the OS-level <code>prefers-reduced-motion</code> setting by default. If
        the user opts out of animations, <code>TextMorph</code> becomes an instant swap - no extra
        code needed.
      </p>

      <h3 className="text-stone-100">Where can I install the Torph library?</h3>
      <p className="text-stone-400 text-base leading-6">
        The Torph library lives at{' '}
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener" className="underline link-underline hover:text-stone-100 transition-colors">
          torph.lochie.me
        </a>{' '}
        and is published on npm as <code>torph</code>. Install both packages with{' '}
        <code>npm install numora-react torph</code>.
      </p>
    </div>
  );
}
