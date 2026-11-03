import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CodeBlock } from '@/components/CodeBlock';
import { OverlayExplainer } from '@/components/docs/OverlayExplainer';
import { InstallTabs } from '@/components/InstallTabs';
import { TorphBlurDemo } from '@/components/TorphBlurDemo';
import { TorphBlurMinimal } from '@/components/TorphBlurMinimal';
import { TorphBlurSection } from '@/components/TorphBlurSection';
import { TorphDemo } from '@/components/TorphDemo';

const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora-react/integrations/torph';
const TORPH_LIB_URL = 'https://torph.lochie.me/';
const LOCHIE_URL = 'https://lochie.me/';

const META_TITLE = 'Torph integration | Numora React';
const META_DESCRIPTION =
  'Use the Torph library by Lochie Axon with Numora React to animate each digit while the real input keeps handling the keyboard, undo, IME and string precision.';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Torph integration: animated digits on a real numeric input',
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
      { '@type': 'ListItem', position: 3, name: 'Torph integration', item: TORPH_PAGE_URL },
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
          text: 'Torph is an animated text-morphing library by Lochie Axon. It diffs an old string and a new string and animates each character between them. Torph has a React component at `torph/react` and a vanilla TextMorph class. This page uses the React component.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use Torph with React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Import TextMorph from torph/react and render it as the visible layer of a transparent-text NumoraInput overlay. Pass formattedValue from the Numora onChange handler as the TextMorph child, and the digits animate on every keystroke.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Torph respect prefers-reduced-motion?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Torph respects the OS-level prefers-reduced-motion setting by default. If the user opts out of animations, TextMorph becomes an instant swap. You need no extra code.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I install the Torph library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The Torph library lives at ${TORPH_LIB_URL} and is published on npm as \`torph\`. Install both packages with \`npm install numora-react torph\`.`,
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
    <div className="docs-prose max-w-[40rem]">
      <h1>Torph integration</h1>
      <p>
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener">
          <strong>Torph</strong> by Lochie Axon
        </a>{' '}
        is an animated text-morphing library. This guide layers a Torph <code>TextMorph</code> on
        top of a transparent-text Numora React <code>NumoraInput</code> so the editable surface
        itself appears animated. The real <code>&lt;input&gt;</code> still handles every keystroke,
        and Torph renders what the user sees. With <code>FormatOn.Blur</code>, focusing the input
        removes the separators so the user can edit the plain digits; this guide calls that step the
        &quot;focus-strip&quot;.
      </p>
      <p>
        Not using React? See the{' '}
        <Link to="/docs/numora/integrations/torph">Numora (vanilla) Torph integration</Link>.
      </p>

      <TorphDemo />
      <p className="text-center -mt-8 mb-12">
        <code>FormatOn.Change</code>: separators animate on every keystroke.
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
                <p className="text-center -mt-8 mb-12">
                  <code>FormatOn.Blur</code>:{' '}
                  {variant === 'minimal'
                    ? 'minimal integration. The cursor drifts during the focus-strip morph.'
                    : 'polished variant. It hides the cursor during the focus-strip morph.'}
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
                  <h2>Hiding the cursor during the focus-strip morph</h2>
                  <p>
                    With <code>FormatOn.Blur</code>, focusing the input swaps <code>1,234,567</code>{' '}
                    to <code>1234567</code> in one DOM call. The cursor jumps to its final index
                    instantly, but Torph takes ~400ms to morph the visible digits there, so the
                    cursor looks like it drifts past stationary text. Hide the native cursor on focus
                    and show it again on the next <code>onAnimationComplete</code>. A timeout fallback
                    covers the case where focus fires but no morph follows (the value already has no
                    separators). The polished demo above drives the vanilla <code>TextMorph</code>{' '}
                    class from an effect, because <code>onAnimationComplete</code> is a constructor
                    option:
                  </p>

                  <CodeBlock language="tsx">
                    {`import { TextMorph } from 'torph'

const [cursorHidden, setCursorHidden] = useState(false)
const postFocusMorphPendingRef = useRef(false)
const displayRef = useRef<HTMLSpanElement>(null)
const morphRef = useRef<TextMorph | null>(null)

useEffect(() => {
  if (!displayRef.current) return
  displayRef.current.textContent = ''

  const morph = new TextMorph({
    element: displayRef.current,
    ease: { stiffness: 400, damping: 30 },
    onAnimationComplete: () => {
      if (postFocusMorphPendingRef.current) {
        postFocusMorphPendingRef.current = false
        setCursorHidden(false)
      }
    },
  })
  morphRef.current = morph

  return () => {
    morph.destroy()
    morphRef.current = null
  }
}, [])

// Feed the morph from state set in the input's onChange.
useEffect(() => {
  morphRef.current?.update(formatted || '0')
}, [formatted])

<span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre" />

<NumoraInput
  formatOn={FormatOn.Blur}
  onChange={(e) => setFormatted(e.target.formattedValue || '')}
  onFocus={() => {
    postFocusMorphPendingRef.current = true
    setCursorHidden(true)
    window.setTimeout(() => {
      if (postFocusMorphPendingRef.current) {
        postFocusMorphPendingRef.current = false
        setCursorHidden(false)
      }
    }, 600)
  }}
  className={\`... \${cursorHidden ? 'caret-transparent' : 'caret-secondary'} ...\`}
  ...
/>`}
                  </CodeBlock>

                  <p>
                    The flag gates the toggle, so per-keystroke morphs after the strip don't keep
                    flipping the cursor. Only the first morph after focus matters.
                  </p>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}
      </TorphBlurSection>

      <OverlayExplainer
        visibleLayer={
          <>
            a <code>&lt;TextMorph&gt;</code> that animates the formatted display string.
          </>
        }
        input={
          <>
            the real <code>NumoraInput</code>
          </>
        }
      >
        <p>
          Both layers render the same formatted string. As the user types, Numora React's{' '}
          <code>onChange</code> fires, and your handler passes the formatted value to the
          TextMorph. Torph diffs the old and new strings and animates each digit and separator into
          place. The input itself never animates, and because its text is transparent, you only see
          the Torph layer.
        </p>
      </OverlayExplainer>

      <h2>Installation</h2>
      <InstallTabs packages="numora-react torph" />

      <h2 id="overlay">Building the overlay</h2>
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
        aria-label="Amount"
        // m-0 p-0 border-0: same text origin as the overlay span
        // text-transparent + caret-white: hide the text, keep the cursor
        // text-4xl font-mono leading-none: must match the overlay, or the cursor drifts
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent
                   text-transparent placeholder-transparent caret-white
                   outline-none focus:outline-none
                   text-4xl font-mono leading-none"
      />
    </label>
  )
}`}
      </CodeBlock>

      <h3>Why each line matters</h3>
      <ul>
        <li>
          <strong>
            <code>formatOn={'{'}FormatOn.Change{'}'}</code>
          </strong>{' '}
          (used here) keeps the input's display as the formatted string at all times, so passing{' '}
          <code>formattedValue</code> to Torph on every <code>onChange</code> is enough.{' '}
          <code>FormatOn.Blur</code> works with the same <code>onChange</code> handler: the
          focus-strip and the blur reformat both call <code>onChange</code>, so you need no extra{' '}
          <code>onFocus</code> wiring.
        </li>
        <li>
          <strong>Match typography.</strong> The browser computes the cursor position from the
          input's invisible text layout, so any difference in font metrics or text origin between
          the layers shows up as cursor drift.
        </li>
      </ul>

      <h2>Reducing motion</h2>
      <p>
        Torph respects <code>prefers-reduced-motion</code> by default. If a user opts out of
        animations at the OS level, the morph becomes an instant swap. You need no extra code.
      </p>

      <h2>FAQ</h2>

      <h3>What is the Torph library?</h3>
      <p>
        Torph is an animated text-morphing library by{' '}
        <a href={LOCHIE_URL} target="_blank" rel="noreferrer noopener">
          Lochie Axon
        </a>
        . It diffs an old string and a new string and animates each character between them. Torph
        has a React component at <code>torph/react</code> and a vanilla <code>TextMorph</code>{' '}
        class. This page uses the React component.
      </p>

      <h3>How do I use Torph with React?</h3>
      <p>
        Import <code>TextMorph</code> from <code>torph/react</code> and render it as the visible
        layer of a transparent-text <code>NumoraInput</code> overlay. Pass{' '}
        <code>formattedValue</code> from the Numora <code>onChange</code> handler as the{' '}
        <code>TextMorph</code> child, and the digits animate on every keystroke.
      </p>

      <h3>Where can I install the Torph library?</h3>
      <p>
        The Torph library lives at{' '}
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener">
          torph.lochie.me
        </a>{' '}
        and is published on npm as <code>torph</code>. Install both packages with{' '}
        <code>npm install numora-react torph</code>.
      </p>
    </div>
  );
}
