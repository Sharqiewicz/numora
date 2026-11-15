import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { LocalePlayground } from '@/components/LocalePlayground';
import { LocaleSeparatorsDemo } from '@/components/LocaleSeparatorsDemo';

export const Route = createFileRoute('/docs/numora/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale | Numora' },
      {
        name: 'description',
        content:
          'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
      },
      { property: 'og:title', content: 'Locale | Numora' },
      {
        property: 'og:description',
        content:
          'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/locale' },
      { name: 'twitter:title', content: 'Locale | Numora' },
      {
        name: 'twitter:description',
        content:
          'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/locale' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Locale support in Numora for international numeric input',
            description:
              'Locale-aware separator detection in the Numora JavaScript numeric input library. Handles comma decimals, dot thousand separators, and international grouping styles.',
            url: 'https://numeric-input.com/docs/numora/features/locale',
            author: {
              '@type': 'Person',
              name: 'Kacper Szarkiewicz',
              url: 'https://x.com/sharqiewicz',
            },
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
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Locale',
                item: 'https://numeric-input.com/docs/numora/features/locale',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Locale,
});

function Locale() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Locale</h1>
      <p>
        The <code>locale</code> option detects the thousand and decimal separators, and the
        digit-grouping style, through <code>Intl.NumberFormat</code>. An explicit{' '}
        <code>groupingStyle</code> overrides the detected one.
      </p>

      <LocaleSeparatorsDemo />

      <LocalePlayground />

      <h2>Where the separators come from</h2>
      <p>
        By default the field uses <code>,</code> for thousands and <code>.</code> for decimals.
        Numora does not read the browser's locale unless you ask it to. There are two ways to change
        the separators.
      </p>
      <p>
        Pass them yourself with <code>thousandSeparator</code> and <code>decimalSeparator</code>. Or
        set <code>locale</code> and Numora derives them. <code>locale: 'de-DE'</code> uses that
        locale and <code>locale: true</code> uses the browser's.
      </p>
      <p>
        You can mix the two. A separator you pass wins, and <code>locale</code> fills in the ones
        you did not set.
      </p>
      <p>
        Each separator is exactly one character. It cannot be a digit or one of{' '}
        <code>- + e E k K m M b B t T</code>, which Numora reads as a sign, an exponent or a
        compact-notation suffix. The two separators must be different. Numora throws on an invalid
        separator.
      </p>
      <p>
        A separator you pass never clashes with one you did not. If it is the character the defaults
        or the locale would use for the other separator, the other one switches:{' '}
        <code>thousandSeparator: '.'</code> on its own gives a <code>,</code> decimal, and{' '}
        <code>decimalSeparator: ','</code> on its own gives a <code>.</code> thousand separator.
        Numora only throws when you pass the same character for both.
      </p>
      <p>
        The separators only change what the field shows. The value you get back has the same format
        in every locale. See <Link to="/docs/numora/features/value-types">Value types</Link>.
      </p>

      <h2>Browser locale</h2>
      <p>
        <code>locale: true</code> reads both separators from the browser's locale. A separator you
        pass still wins.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Both separators detected from the browser locale
const input = new NumoraInput(container, {
  locale: true,
  groupingStyle: 'thousand',
})

// Override the decimal separator, keep the locale thousand separator
const input2 = new NumoraInput(container, {
  locale: 'fr-FR',
  groupingStyle: 'thousand',
  decimalSeparator: '.',
})`}
      </CodeBlock>

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 tag to pin the separators to one locale. <code>locale: true</code> reads the
        locale of whatever runtime the code runs in. On a server that is the server's locale and not
        the visitor's, so pass the tag there.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Pinned to German locale
const input = new NumoraInput(container, {
  locale: 'de-DE',
  groupingStyle: 'thousand',
})`}
      </CodeBlock>

      <h2>Grouping style detection</h2>
      <p>
        Indic locales group digits 3-2-2 (lakh and crore), not 3-3-3. Leave{' '}
        <code>groupingStyle</code> unset and Numora takes it from the locale, so <code>hi-IN</code>{' '}
        and <code>en-IN</code> get <code>'lakh'</code>.
      </p>
      <CodeBlock language="typescript">
        {`// grouping from the locale: 12345678 → "1,23,45,678"
const input = new NumoraInput(container, { locale: 'en-IN' })

// an explicit groupingStyle wins: 12345678 → "12,345,678"
const input2 = new NumoraInput(container, {
  locale: 'en-IN',
  groupingStyle: 'thousand',
})`}
      </CodeBlock>
      <p>
        Numora can only detect <code>'thousand'</code> and <code>'lakh'</code>.{' '}
        <code>Intl.NumberFormat</code> reports 3-3-3 grouping for <code>zh-CN</code> and{' '}
        <code>ja-JP</code>, so 4-4-4 grouping never comes from a locale. Pass{' '}
        <code>groupingStyle: 'wan'</code> yourself.
      </p>

      <h2>getSeparatorsFromLocale</h2>
      <p>
        <code>getSeparatorsFromLocale</code> returns the separators and grouping style for a tag, so
        you can read them or pass them in yourself.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, getSeparatorsFromLocale } from 'numora'

const { thousandSeparator, decimalSeparator } = getSeparatorsFromLocale('de-DE')
// → { thousandSeparator: '.', decimalSeparator: ',', groupingStyle: 'thousand' }

getSeparatorsFromLocale('en-US')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: 'thousand' }

getSeparatorsFromLocale('fr-FR')
// → { thousandSeparator: '\\u202f', decimalSeparator: ',', groupingStyle: 'thousand' }

getSeparatorsFromLocale('en-IN')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: 'lakh' }

// No argument: the runtime's own locale. An invalid tag throws.
getSeparatorsFromLocale()

const input = new NumoraInput(container, { thousandSeparator, decimalSeparator })`}
      </CodeBlock>

      <p>
        To set the decimal separator without a locale, see{' '}
        <Link to="/docs/numora/features/decimals">Decimals</Link>.
      </p>

      <h2>What the field displays</h2>
      <p>
        The field shows the locale's separators with ASCII digits and an ASCII <code>-</code>. In
        ar-EG it shows <code>1٬234٫5</code>, not the Arabic-Indic <code>١٬٢٣٤٫٥</code> that{' '}
        <code>Intl.NumberFormat</code> prints, and in sv-SE it shows <code>-</code>, not{' '}
        <code>−</code> (U+2212). Numora still accepts typed and pasted native digits and minus signs
        and converts them to ASCII. With thousand grouping, Numora groups four-digit numbers too, so
        es-ES shows <code>1.234</code> where <code>Intl</code> prints <code>1234</code>.
      </p>

      <h2>Changing the locale later</h2>
      <p>
        Call{' '}
        <code>
          instance.update({'{'} locale: 'fr-FR' {'}'})
        </code>{' '}
        on a live field. Numora keeps the raw value and rewrites the display with the new
        separators. An invalid tag throws and changes nothing. <code>locale: false</code> turns the
        locale off, and the field goes back to the <code>thousandSeparator</code> and{' '}
        <code>decimalSeparator</code> options.
      </p>

      <h2>Value format under a locale</h2>
      <p>
        <code>defaultValue</code> and <code>setValue</code> take the canonical raw value in every
        locale: ASCII digits, <code>.</code> as the decimal mark, no grouping. Under{' '}
        <code>locale: 'de-DE'</code>, <code>setValue('1234.5')</code> displays{' '}
        <code>"1.234,5"</code>, and <code>instance.rawValue</code> returns <code>"1234.5"</code>.
        See <Link to="/docs/numora/features/value-types">Value types</Link>.
      </p>
    </div>
  );
}
