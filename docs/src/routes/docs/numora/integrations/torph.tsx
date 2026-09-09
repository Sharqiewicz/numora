import { createFileRoute, Link } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CodeBlock } from '@/components/CodeBlock'
import { TorphBlurSection } from '@/components/TorphBlurSection'
import { TorphVanillaBlurDemo } from '@/components/TorphVanillaBlurDemo'
import { TorphVanillaBlurMinimal } from '@/components/TorphVanillaBlurMinimal'
import { TorphVanillaDemo } from '@/components/TorphVanillaDemo'

const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora/integrations/torph'
const TORPH_LIB_URL = 'https://torph.lochie.me/'
const LOCHIE_URL = 'https://lochie.me/'

const META_TITLE = 'Torph Library Integration - Animated Numeric Input with Numora'
const META_DESCRIPTION = 'Integrate the Torph library by Lochie Axon with a vanilla Numora numeric input to animate each digit while the real input keeps owning the keyboard, undo, IME, and string precision.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Torph Library Integration with Numora - Animated digits on a vanilla numeric input',
    description: META_DESCRIPTION,
    url: TORPH_PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'Torph',
        alternateName: ['Torph library', 'torph'],
        description: 'Animated text-morphing library by Lochie Axon.',
        url: TORPH_LIB_URL,
        author: { '@type': 'Person', name: 'Lochie Axon', url: LOCHIE_URL },
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
          text: 'Torph is an animated text-morphing library by Lochie Axon. It diffs old and new strings and animates each character between them. Torph ships both a React component and a vanilla TextMorph class.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Torph work without React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. This guide uses the vanilla TextMorph class from the `torph` package together with the vanilla NumoraInput class - no React in the runtime.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the Torph + Numora overlay work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A transparent-text NumoraInput sits on top of a Torph TextMorph element. The input owns the keyboard, undo, IME, and mobile inputmode. A beforeinput microtask sync plus an input listener calls morph.update(numora.value) so Torph animates the visible digits.',
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

export const Route = createFileRoute('/docs/numora/integrations/torph')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'Torph library, Torph by Lochie Axon, Torph React, Torph vanilla, animated numeric input, Numora, TextMorph, number animation, digit morph' },
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
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="prose prose-invert max-w-none">
      <h1>Torph Library Integration with Numora</h1>
      <p className="text-lg text-muted-foreground">
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener"><strong>Torph</strong> by Lochie Axon</a>{' '}
        is an animated text-morphing library. This guide layers a Torph <code>TextMorph</code> on top of a transparent-text vanilla{' '}
        <code>NumoraInput</code> so the editable surface itself appears animated. The real <code>&lt;input&gt;</code>{' '}
        still handles every keystroke; Torph just renders what the user sees.
      </p>
      <p className="text-sm text-muted-foreground">
        Using React? See the{' '}
        <Link to="/docs/numora-react/integrations/torph">Numora React Torph integration</Link> - it wires the overlay
        through <code>onChange</code> instead of manual DOM listeners.
      </p>

      <TorphVanillaDemo />
      <p className="text-center text-sm text-muted-foreground -mt-12 mb-12">
        <code>FormatOn.Change</code> - separators animate on every keystroke.
      </p>

      <TorphBlurSection>
        {(variant) => (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={variant}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: prefersReducedMotion ? { duration: 0.1 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.1 },
                }}
              >
                {variant === 'minimal' ? <TorphVanillaBlurMinimal /> : <TorphVanillaBlurDemo />}
                <p className="text-center text-sm text-muted-foreground -mt-12 mb-12">
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
                    transition: prefersReducedMotion ? { duration: 0.1 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.12 },
                  }}
                >
                <p>
                  <strong>Hiding the caret during the focus-strip morph.</strong>{' '}
                  With <code>FormatOn.Blur</code>, focusing the input swaps{' '}
                  <code>1,234,567</code> to <code>1234567</code> in one DOM call. The caret jumps
                  to its final index instantly, but Torph takes ~400ms to morph the visible digits
                  there - making the caret look like it drifts past stationary text. Hide the native
                  caret on focus and clear it on the next <code>onAnimationComplete</code>; a timeout
                  fallback covers the case where focus fires but no morph follows (value already
                  has no separators):
                </p>

                <CodeBlock language="ts">
{`let postFocusMorphPending = false
const updateCaret = (hidden: boolean) => {
  host.classList.toggle('caret-suppressed', hidden)
}

const morph = new TextMorph({
  element: display,
  ease: { stiffness: 400, damping: 30 },
  onAnimationComplete: () => {
    if (postFocusMorphPending) {
      postFocusMorphPending = false
      updateCaret(false)
    }
  },
})

input.addEventListener('focus', () => {
  postFocusMorphPending = true
  updateCaret(true)
  window.setTimeout(() => {
    if (postFocusMorphPending) {
      postFocusMorphPending = false
      updateCaret(false)
    }
  }, 600)
})`}
                </CodeBlock>

                <CodeBlock language="css">
{`.numora-overlay-host input { caret-color: white; }
.numora-overlay-host.caret-suppressed input { caret-color: transparent; }`}
                </CodeBlock>

                <p className="text-sm text-muted-foreground">
                  The flag gates the toggle so per-keystroke morphs after the strip don't keep
                  flipping the caret - only the first morph after focus matters.
                </p>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}
      </TorphBlurSection>

      <p className="text-sm text-muted-foreground">
        The demos above are rendered inside this React docs site, but the code below is plain TypeScript - no React.
        It uses the vanilla <code>NumoraInput</code> class and Torph's vanilla <code>TextMorph</code> directly.
      </p>

      <h2>How the overlay works</h2>
      <p>
        Native <code>&lt;input&gt;</code> elements render their <code>value</code> as a string with no child DOM, so animation libraries
        can't inject animated spans into them directly. The overlay sidesteps that by stacking two layers in the same box:
      </p>
      <ul>
        <li><strong>Visible layer:</strong> a <code>TextMorph</code> bound to a sibling span that animates the formatted string.</li>
        <li><strong>Keyboard layer:</strong> the vanilla <code>NumoraInput</code> positioned on top with <code>color: transparent</code> and a visible caret. It still owns focus, keystrokes, undo, IME, and mobile <code>inputmode</code>.</li>
      </ul>
      <p>
        Both layers render the same formatted string. The vanilla <code>NumoraInput</code> class applies formatting in{' '}
        <code>beforeinput</code> via <code>setRangeText</code>, but only runs <code>onChange</code> (or your listeners) when
        an <code>input</code> event follows - which is not guaranteed on every path. The bridge therefore syncs Torph via a{' '}
        <code>beforeinput</code> microtask (typing) and an <code>input</code> listener (undo/redo; paste, since Numora's paste
        handler dispatches a synthetic <code>input</code> after sanitizing). Each calls <code>morph.update(numora.value)</code>.
        Torph diffs old vs new and animates each digit / separator into place. The input itself never animates - but because its
        text is transparent, you only see the Torph layer.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash">
{`pnpm add numora torph
# or
npm install numora torph`}
      </CodeBlock>

      <h2 id="overlay">Building the overlay</h2>
      <p>
        Two DOM nodes in a relative-positioned wrapper, one stylesheet, and a small sync bridge between the two libraries.
      </p>

      <CodeBlock language="html">
{`<label class="numora-overlay">
  <span class="numora-overlay-display" aria-hidden="true">0</span>
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

.numora-overlay-host input::placeholder {
  color: transparent;
}`}
      </CodeBlock>

      <CodeBlock language="ts">
{`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'
import { TextMorph } from 'torph'

const wrap = document.querySelector<HTMLElement>('.numora-overlay')!
const display = wrap.querySelector<HTMLElement>('.numora-overlay-display')!
const host = wrap.querySelector<HTMLElement>('.numora-overlay-host')!

// SSR placeholder is a text node; Torph only replaces element children.
display.textContent = ''

const numora = new NumoraInput(host, {
  formatOn: FormatOn.Change,
  decimalMaxLength: 2,
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
})
const input = numora.getElement()
input.setAttribute('aria-label', 'Amount')

const morph = new TextMorph({
  element: display,
  ease: { stiffness: 400, damping: 30 },
})

morph.update('0')

const syncMorph = () => {
  // numora.value mirrors what the input shows. With FormatOn.Change that's
  // the formatted string - exactly what Torph should display.
  morph.update(numora.value || '0')
}

// Numora applies formatted values in beforeinput (setRangeText). Sync after that
// handler runs; an input listener alone is not guaranteed in every environment.
const scheduleMorphSync = () => {
  queueMicrotask(syncMorph)
}

input.addEventListener('beforeinput', scheduleMorphSync)
// Undo/redo, paste (Numora dispatches synthetic input), and other paths that skip beforeinput.
input.addEventListener('input', syncMorph)`}
      </CodeBlock>

      <h3>Why each line matters</h3>
      <ul>
        <li><strong><code>display.textContent = ''</code></strong> - a placeholder text node (e.g. SSR <code>0</code>) is not an element child. Torph's <code>createTextGroup</code> only replaces element children, so it would append animated spans beside a stuck <code>0</code> instead of owning the span.</li>
        <li><strong><code>formatOn: FormatOn.Change</code></strong> (used here) - keeps the input's display as the formatted string at all times. Numora applies that string in <code>beforeinput</code>, so mirror it with a <code>beforeinput</code> microtask sync plus an <code>input</code> listener for undo/redo and paste. <code>FormatOn.Blur</code> also works, but the focus event silently strips separators - bind a <code>focus</code> listener that calls <code>morph.update(numora.value)</code> too.</li>
        <li><strong>Match typography</strong> - <code>font: inherit</code> plus <code>margin: 0; padding: 0; border: 0</code> on the input. The caret is computed from the input's invisible text layout, so any difference in font metrics or text origin shows up as caret drift.</li>
      </ul>

      <h2>Reducing motion</h2>
      <p>
        Torph respects <code>prefers-reduced-motion</code> by default. If a user opts out of animations at the OS level the morph
        becomes an instant swap.
      </p>

      <h2>Cleanup</h2>
      <p>
        On teardown remove the bridge listeners, call <code>morph.destroy()</code> to detach Torph's observers, then remove the input
        element. The vanilla <code>NumoraInput</code> doesn't expose an explicit destroy method - its internal listeners are bound to
        the input it created, so removing that element from the DOM is sufficient for Numora itself.
      </p>

      <CodeBlock language="ts">
{`input.removeEventListener('beforeinput', scheduleMorphSync)
input.removeEventListener('input', syncMorph)
morph.destroy()
input.remove()`}
      </CodeBlock>

      <h2>Key points</h2>
      <ul>
        <li>
          <strong>No precision boundary.</strong> Torph operates on strings; numora hands you the formatted string. No{' '}
          <code>Number()</code> conversion at the display seam.
        </li>
        <li>
          <strong>The input still owns the keyboard.</strong> Undo, redo, IME, paste, mobile <code>inputmode="decimal"</code>, native
          form submission all keep working. The overlay is a display layer only.
        </li>
        <li>
          <strong>Mirror <code>numora.value</code> into Torph.</strong> That string always equals the input's current display. With{' '}
          <code>FormatOn.Change</code>, sync on <code>beforeinput</code> (microtask) plus <code>input</code> for undo/redo and paste. With{' '}
          <code>FormatOn.Blur</code> also bind a <code>focus</code> listener to catch the silent focus-strip; the blur reformat already
          fires <code>input</code>.
        </li>
        <li>
          <strong>Match typography.</strong> Use <code>font: inherit</code> on the input so wrapper and input share font metrics. Set{' '}
          <code>margin: 0; padding: 0; border: 0</code> on the input so its text origin aligns with the overlay span.
        </li>
      </ul>

      <h2>FAQ</h2>

      <h3>What is the Torph library?</h3>
      <p>
        Torph is an animated text-morphing library by{' '}
        <a href={LOCHIE_URL} target="_blank" rel="noreferrer noopener">Lochie Axon</a>. It diffs an old string and a new
        string and animates each character between them. Torph ships both a React component and a vanilla{' '}
        <code>TextMorph</code> class - this page uses the vanilla one.
      </p>

      <h3>Does Torph work without React?</h3>
      <p>
        Yes. The code on this page uses the vanilla <code>TextMorph</code> class from the <code>torph</code> package
        together with the vanilla <code>NumoraInput</code> class. No React in the runtime.
      </p>

      <h3>How does Torph fit with Numora?</h3>
      <p>
        Numora formats the display string in <code>beforeinput</code>; your bridge mirrors <code>numora.value</code> into{' '}
        <code>morph.update()</code> and Torph animates it. The two libraries compose because Numora never crosses the
        string→number boundary, and Torph operates on strings directly.
      </p>

      <h3>Where can I install the Torph library?</h3>
      <p>
        The Torph library lives at{' '}
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener">torph.lochie.me</a>{' '}
        and is published on npm as <code>torph</code>. Install both packages with{' '}
        <code>npm install numora torph</code>.
      </p>
    </div>
  )
}
