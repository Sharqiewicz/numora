import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { OverlayExplainer } from '@/components/docs/OverlayExplainer';
import { InstallTabs } from '@/components/InstallTabs';
import { TorphVanillaBlurDemo } from '@/components/TorphVanillaBlurDemo';
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
        Torph renders what the user sees.
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

      <TorphVanillaBlurDemo />
      <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
        With <code>'blur'</code>, the separators animate out on focus and back in on blur. The caret
        appears once the digits have settled. See “The caret during the focus strip” below.
      </p>

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
          bridge is a single call:{' '}
          <code>morph.update(text || '0', numora.element.selectionStart ?? undefined)</code>. The
          second argument is the caret, which tells Torph where the edit was. Torph diffs the old
          and new strings and animates each digit and separator into place. The input itself never
          animates, and because its text is transparent, you only see the Torph layer.
        </p>
      </OverlayExplainer>

      <h2>Installation</h2>
      <InstallTabs packages="numora torph" />

      {/* biome-ignore lint/correctness/useUniqueElementIds: explicit heading id keeps a stable, shareable URL anchor (ArticleHeadings would otherwise slugify the text) */}
      <h2 id="overlay">Building the overlay</h2>

      <CodeBlock language="html">
        {`<label class="numora-overlay">
  <span class="numora-overlay-display" aria-hidden="true">0</span>
  <span class="numora-overlay-host"></span>
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

// Optional: empty the SSR placeholder up front. Torph also removes it itself.
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
  // The caret is the second argument: Torph then matches digits around the edit.
  onFormattedValueChange: (text) =>
    morph.update(text || '0', numora.element.selectionStart ?? undefined),
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
          empties a placeholder (e.g. SSR <code>0</code>) before Torph takes over the span. The line
          is optional, because Torph removes leftover text nodes itself when it renders.
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
          <code>onFormattedValueChange</code> does, so the same line covers both modes. Blur mode
          also needs a few lines of CSS for the caret, shown in the next section.
        </li>
        <li>
          <strong>Match typography.</strong> Set <code>font: inherit</code> plus{' '}
          <code>margin: 0; padding: 0; border: 0</code> on the input. The browser computes the caret
          position from the input's invisible text layout, so any difference in font metrics or text
          origin shows up as caret drift.
        </li>
      </ul>

      <h2>The caret during the focus strip</h2>
      <p>
        With <code>'blur'</code>, focusing the field rewrites <code>1,234,567</code> to{' '}
        <code>1234567</code> in one step. Numora calls this rewrite the focus strip. The native
        caret is at its final position at once, but Torph needs about 400ms to move the digits
        there, so the caret looks misplaced until they arrive. Keep the caret transparent while the
        digits move. It takes CSS only:
      </p>
      <CodeBlock language="css">
        {`@keyframes caret-hold {
  0%, 70% { caret-color: transparent; }
}

@media (prefers-reduced-motion: no-preference) {
  .numora-overlay-host input:focus { animation: caret-hold 400ms; }
}`}
      </CodeBlock>
      <p>
        The selector targets the input that <code>NumoraInput</code> creates inside the host. The
        caret stays transparent for the first 280ms and fades in over the last 120ms. The keyframes
        have no <code>to</code> step, so it fades into the colour the field already has.
      </p>
      <ul>
        <li>
          The 400ms matches the spring used on this page (<code>stiffness: 400, damping: 30</code>
          ). If you change <code>ease</code> or <code>duration</code>, change the 400ms to match.
        </li>
        <li>
          The hold runs on every focus, also when the value has no separators to remove. The caret
          is then 280ms late for no visible reason.
        </li>
        <li>
          Under <code>prefers-reduced-motion</code> Torph swaps the text instantly, so the hold is
          off.
        </li>
      </ul>

      <h2>Reducing motion</h2>
      <p>
        Torph respects <code>prefers-reduced-motion</code> by default. If a user opts out of
        animations at the OS level, the morph becomes an instant swap.
      </p>

      <h2>Cleanup</h2>
      <p>
        On teardown call <code>morph.destroy()</code> to detach Torph's observers and{' '}
        <code>numora.destroy()</code> to detach Numora's listeners, then remove the input element.
        Calling <code>destroy()</code> twice is safe.
      </p>

      <CodeBlock language="ts">
        {`morph.destroy()
numora.destroy()
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
