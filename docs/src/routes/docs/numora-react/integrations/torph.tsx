import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { OverlayExplainer } from '@/components/docs/OverlayExplainer';
import { InstallTabs } from '@/components/InstallTabs';
import { TorphBlurDemo } from '@/components/TorphBlurDemo';
import { TorphDemo } from '@/components/TorphDemo';
import { TorphLocalePlayground } from '@/components/TorphLocalePlayground';

const TORPH_PAGE_URL = 'https://numeric-input.com/docs/numora-react/integrations/torph';
const TORPH_LIB_URL = 'https://torph.lochie.me/';
const LOCHIE_URL = 'https://lochie.me/';

const META_TITLE = 'Torph integration | Numora React';
const META_DESCRIPTION =
  'Use the Torph library by Lochie Axon with Numora React to animate each digit while the real input keeps handling the keyboard, IME and string precision.';

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
          text: 'Import TextMorph from torph/react and render it as the visible layer of a transparent-text NumoraInput overlay. Store the string from the Numora onFormattedValueChange callback and pass it as the TextMorph child, with the caret position as cursorIndex. The digits animate on every keystroke, and on the focus strip and blur regroup too.',
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
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Torph integration</h1>
      <p>
        <a href={TORPH_LIB_URL} target="_blank" rel="noreferrer noopener">
          <strong>Torph</strong> by Lochie Axon
        </a>{' '}
        is an animated text-morphing library. This guide layers a Torph <code>TextMorph</code> on
        top of a transparent-text Numora React <code>NumoraInput</code> so the editable surface
        itself appears animated. The real <code>&lt;input&gt;</code> still handles every keystroke,
        and Torph renders what the user sees.
      </p>
      <p>
        Not using React? See the{' '}
        <Link to="/docs/numora/integrations/torph">Numora (vanilla) Torph integration</Link>.
      </p>

      <TorphDemo />
      <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
        With <code>'change'</code>, separators animate on every keystroke.
      </p>

      <hr />

      <TorphBlurDemo />
      <p className="mx-auto -mt-6 mb-12 max-w-lg text-sm text-muted-foreground">
        With <code>'blur'</code>, the separators animate out on focus and back in on blur. The caret
        appears once the digits have settled. See “The caret during the focus strip” below.
      </p>

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
          <code>onFormattedValueChange</code> fires with the text the field now shows, and your
          handler passes it to the TextMorph. Torph diffs the old and new strings and animates each
          digit and separator into place. The input itself never animates, and because its text is
          transparent, you only see the Torph layer.
        </p>
      </OverlayExplainer>

      <h2>Installation</h2>
      <InstallTabs packages="numora-react torph" />

      {/* biome-ignore lint/correctness/useUniqueElementIds: explicit heading id keeps a stable, shareable URL anchor (ArticleHeadings would otherwise slugify the text) */}
      <h2 id="overlay">Building the overlay</h2>
      <CodeBlock language="tsx">
        {`import { NumoraInput } from 'numora-react'
import { useRef, useState } from 'react'
import { TextMorph } from 'torph/react'

function AnimatedInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [formatted, setFormatted] = useState('')
  const [caret, setCaret] = useState<number>()

  return (
    <label className="relative inline-flex items-center text-4xl font-mono leading-none text-white">
      {/* Visible layer: Torph renders the animated text */}
      <span aria-hidden="true" className="pointer-events-none whitespace-pre">
        <TextMorph cursorIndex={caret} ease={{ stiffness: 400, damping: 30 }}>
          {formatted || '0'}
        </TextMorph>
      </span>

      {/* Invisible layer: real input owns the keyboard */}
      <NumoraInput
        ref={inputRef}
        value={value}
        onValueChange={({ value }) => setValue(value)}
        onFormattedValueChange={(text) => {
          setCaret(inputRef.current?.selectionStart ?? undefined)
          setFormatted(text)
        }}
        formatOn="change"
        decimalMaxLength={2}
        aria-label="Amount"
        // m-0 p-0 border-0: same text origin as the overlay span
        // text-transparent + caret-white: hide the text, keep the caret
        // [font:inherit]: the label's typography, so the caret cannot drift
        className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent
                   text-transparent placeholder-transparent caret-white
                   outline-none focus:outline-none [font:inherit]"
      />
    </label>
  )
}`}
      </CodeBlock>

      <h3>Why each line matters</h3>
      <ul>
        <li>
          <strong>
            <code>
              formatOn={'{'}'change'{'}'}
            </code>
          </strong>{' '}
          (used here) keeps the input's display as the formatted string at all times.{' '}
          <code>'blur'</code> needs no extra code here: <code>onFormattedValueChange</code> also
          fires for the focus strip and the blur regroup, which <code>onValueChange</code> does not
          report because the number itself didn&apos;t change. It does need a few lines of CSS for
          the caret, shown in the next section.
        </li>
        <li>
          <strong>
            <code>onFormattedValueChange</code>
          </strong>{' '}
          gives the display string every time Numora rewrites the field. It does not fire on mount,
          so start the state from <code>formatValue(initialValue, options)</code> when the field has
          an initial value.
        </li>
        <li>
          <strong>
            <code>cursorIndex</code>
          </strong>{' '}
          tells Torph where the edit was. Without it Torph cannot tell which of two equal characters
          is the new one, so typing <code>1</code> in front of <code>1,234</code> rebuilds the
          separator instead of sliding a digit in. The caret is already at its new position when{' '}
          <code>onFormattedValueChange</code> fires, so read it from the input there.
        </li>
        <li>
          <strong>
            <code>[font:inherit]</code>
          </strong>{' '}
          gives the input the label's font, size and line height. The browser computes the caret
          position from the input's invisible text layout, so any difference between the layers
          shows up as caret drift. Set the typography on the label only. <code>letter-spacing</code>{' '}
          is not part of <code>font</code>: if the label has a <code>tracking-*</code> class, add{' '}
          <code>tracking-[inherit]</code> to the input.
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
  .caret-hold:focus { animation: caret-hold 400ms; }
}`}
      </CodeBlock>
      <p>
        Add <code>caret-hold</code> to the <code>className</code> of the <code>NumoraInput</code>.
        The caret stays transparent for the first 280ms and fades in over the last 120ms. The
        keyframes have no <code>to</code> step, so it fades into the colour the field already has.
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

      <h2>Try it with any locale</h2>
      <p>
        Switch the locale, then type or paste. Torph is handed the text the field shows, so the
        overlay shows the same text in every locale.
      </p>
      <TorphLocalePlayground />

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
        layer of a transparent-text <code>NumoraInput</code> overlay. Store the string from the
        Numora <code>onFormattedValueChange</code> callback and pass it as the{' '}
        <code>TextMorph</code> child, with the input&apos;s caret as <code>cursorIndex</code>. The
        digits animate on every keystroke, and on the focus strip and blur regroup too.
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
