import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CodeBlock } from '@/components/CodeBlock';
import { OverlayExplainer } from '@/components/docs/OverlayExplainer';
import { InstallTabs } from '@/components/InstallTabs';
import { TorphBlurSection } from '@/components/TorphBlurSection';
import { TorphVanillaBlurDemo } from '@/components/TorphVanillaBlurDemo';
import { TorphVanillaBlurMinimal } from '@/components/TorphVanillaBlurMinimal';
import { TorphVanillaDemo } from '@/components/TorphVanillaDemo';

const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora/integrations/torph';
const TORPH_LIB_URL = 'https://torph.lochie.me/';
const LOCHIE_URL = 'https://lochie.me/';

const META_TITLE = 'Torph integration | Numora';
const META_DESCRIPTION =
  'Use the Torph library by Lochie Axon with a vanilla Numora numeric input to animate each digit while the real input keeps handling the keyboard, IME and string precision.';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Torph integration: animated digits on a vanilla numeric input',
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Numora',
        item: 'https://numeric-input.com/docs/numora',
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
          text: 'Torph is an animated text-morphing library by Lochie Axon. It diffs an old string and a new string and animates each character between them. Torph has both a React component and a vanilla TextMorph class. This page uses the vanilla one.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Torph work without React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The code on this page uses the vanilla TextMorph class from the torph package together with the vanilla NumoraInput class. No React in the runtime.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Torph fit with Numora?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A transparent-text NumoraInput sits on top of a Torph TextMorph. The input owns the keyboard, IME and mobile inputmode. Its onFormattedValueChange option calls morph.update() every time Numora rewrites the field (typing, paste, the focus strip and the blur regroup), so Torph animates the formatted string. The value never passes through Number().',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I install the Torph library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The Torph library lives at ${TORPH_LIB_URL} and is published on npm as \`torph\`. Install both packages with \`npm install numora torph\`.`,
        },
      },
    ],
  },
];

export const Route = createFileRoute('/docs/numora/integrations/torph')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'Torph library, Torph by Lochie Axon, Torph React, Torph vanilla, animated numeric input, Numora, TextMorph, number animation, digit morph',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Torph integration</h1>
      <p>
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener">
          <strong>Torph</strong> by Lochie Axon
        </a>{' '}
        is an animated text-morphing library. This guide layers a Torph <code>TextMorph</code> on
        top of a transparent-text vanilla <code>NumoraInput</code> so the editable surface itself
        appears animated. The real <code>&lt;input&gt;</code> still handles every keystroke, and
        Torph renders what the user sees. With <code>'blur'</code>, focusing the input removes the
        separators so the user can edit the plain digits. This guide calls that step the
        &quot;focus-strip&quot;.
      </p>
      <p>
        Using React? See the{' '}
        <Link to="/docs/numora-react/integrations/torph">Numora React Torph integration</Link>.
      </p>

      <TorphVanillaDemo />
      <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
        With <code>'change'</code>, separators animate on every keystroke.
      </p>

      <hr />

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
                {variant === 'minimal' ? <TorphVanillaBlurMinimal /> : <TorphVanillaBlurDemo />}
                <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
                  <code>'blur'</code>:{' '}
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
                  <p>
                    <strong>Hiding the cursor during the focus-strip morph.</strong> With{' '}
                    <code>'blur'</code>, focusing the input swaps <code>1,234,567</code> to{' '}
                    <code>1234567</code> in one DOM call. The cursor jumps to its final index
                    instantly, but Torph takes ~400ms to morph the visible digits there, so the
                    cursor looks like it drifts past stationary text. Hide the native cursor on
                    focus and show it again on the next <code>onAnimationComplete</code>. A timeout
                    fallback covers the case where focus fires but no morph follows (the value
                    already has no separators):
                  </p>

                  <CodeBlock language="ts">
                    {`let postFocusMorphPending = false
const setCursorHidden = (hidden: boolean) => {
  host.classList.toggle('cursor-suppressed', hidden)
}

const morph = new TextMorph({
  element: display,
  ease: { stiffness: 400, damping: 30 },
  onAnimationComplete: () => {
    if (postFocusMorphPending) {
      postFocusMorphPending = false
      setCursorHidden(false)
    }
  },
})

input.addEventListener('focus', () => {
  postFocusMorphPending = true
  setCursorHidden(true)
  window.setTimeout(() => {
    if (postFocusMorphPending) {
      postFocusMorphPending = false
      setCursorHidden(false)
    }
  }, 600)
})`}
                  </CodeBlock>

                  <CodeBlock language="css">
                    {`.numora-overlay-host input { caret-color: white; }
.numora-overlay-host.cursor-suppressed input { caret-color: transparent; }`}
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
            a <code>TextMorph</code> bound to a sibling span that animates the formatted string.
          </>
        }
        input={
          <>
            the vanilla <code>NumoraInput</code>
          </>
        }
      >
        <p>
          Both layers render the same formatted string. The vanilla <code>NumoraInput</code> class
          calls its <code>onFormattedValueChange</code> option every time it rewrites the field:
          typing (from <code>beforeinput</code>), paste, the focus strip and the blur regroup. The
          bridge is a single line:{' '}
          <code>onFormattedValueChange: (text) =&gt; morph.update(text || '0')</code>. Torph diffs
          the old and new strings and animates each digit and separator into place. The input itself
          never animates, and because its text is transparent, you only see the Torph layer.
        </p>
      </OverlayExplainer>

      <h2>Installation</h2>
      <InstallTabs packages="numora torph" />

      <h2 id="overlay">Building the overlay</h2>

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
        {`import { NumoraInput } from 'numora'
import { TextMorph } from 'torph'

const wrap = document.querySelector<HTMLElement>('.numora-overlay')!
const display = wrap.querySelector<HTMLElement>('.numora-overlay-display')!
const host = wrap.querySelector<HTMLElement>('.numora-overlay-host')!

// SSR placeholder is a text node; Torph only replaces element children.
display.textContent = ''

const morph = new TextMorph({
  element: display,
  ease: { stiffness: 400, damping: 30 },
})

// onFormattedValueChange gives the display string, which is what Torph should show.
const numora = new NumoraInput(host, {
  formatOn: 'change',
  decimalMaxLength: 2,
  groupingStyle: 'thousand',
  onFormattedValueChange: (text) => morph.update(text || '0'),
})
const input = numora.element
input.setAttribute('aria-label', 'Amount')

morph.update('0')`}
      </CodeBlock>

      <h3>Why each line matters</h3>
      <ul>
        <li>
          <strong>
            <code>display.textContent = ''</code>
          </strong>{' '}
          is needed because a placeholder text node (e.g. SSR <code>0</code>) is not an element
          child. Torph's <code>createTextGroup</code> only replaces element children, so it would
          append animated spans beside a stuck <code>0</code> instead of owning the span.
        </li>
        <li>
          <strong>
            <code>onFormattedValueChange</code>
          </strong>{' '}
          fires every time Numora rewrites the field, so you need no DOM <code>input</code>,{' '}
          <code>focus</code> or <code>blur</code> listeners. It does not fire on creation, so call{' '}
          <code>morph.update()</code> once after construction (with{' '}
          <code>numora.formattedValue</code> if you pass an initial value).
        </li>
        <li>
          <strong>
            <code>formatOn: 'change'</code>
          </strong>{' '}
          (used here) keeps the input's display as the formatted string at all times. With{' '}
          <code>'blur'</code>, the focus strip and the blur regroup only add or remove separators.{' '}
          <code>onValueChange</code> does not report them, because the raw value is unchanged, but{' '}
          <code>onFormattedValueChange</code> does, so the same line covers both modes.
        </li>
        <li>
          <strong>Match typography.</strong> Set <code>font: inherit</code> plus{' '}
          <code>margin: 0; padding: 0; border: 0</code> on the input. The browser computes the
          cursor position from the input's invisible text layout, so any difference in font metrics
          or text origin shows up as cursor drift.
        </li>
      </ul>

      <h2>Reducing motion</h2>
      <p>
        Torph respects <code>prefers-reduced-motion</code> by default. If a user opts out of
        animations at the OS level, the morph becomes an instant swap.
      </p>

      <h2>Cleanup</h2>
      <p>
        On teardown call <code>morph.destroy()</code> to detach Torph's observers, then remove the
        input element. The vanilla <code>NumoraInput</code> doesn't expose an explicit destroy
        method. Its internal listeners are bound to the input it created, so removing that element
        from the DOM is enough for Numora itself.
      </p>

      <CodeBlock language="ts">
        {`morph.destroy()
input.remove()`}
      </CodeBlock>

      <h2>FAQ</h2>

      <h3>What is the Torph library?</h3>
      <p>
        Torph is an animated text-morphing library by{' '}
        <a href={LOCHIE_URL} target="_blank" rel="noreferrer noopener">
          Lochie Axon
        </a>
        . It diffs an old string and a new string and animates each character between them. Torph
        has both a React component and a vanilla <code>TextMorph</code> class. This page uses the
        vanilla one.
      </p>

      <h3>Does Torph work without React?</h3>
      <p>
        Yes. The code on this page uses the vanilla <code>TextMorph</code> class from the{' '}
        <code>torph</code> package together with the vanilla <code>NumoraInput</code> class. No
        React in the runtime.
      </p>

      <h3>Where can I install the Torph library?</h3>
      <p>
        The Torph library lives at{' '}
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener">
          torph.lochie.me
        </a>{' '}
        and is published on npm as <code>torph</code>. Install both packages with{' '}
        <code>npm install numora torph</code>.
      </p>
    </div>
  );
}
