import { createFileRoute, Link } from '@tanstack/react-router';
import { useSyncExternalStore } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { LocaleSeparatorsDemo } from '@/components/LocaleSeparatorsDemo';

export const Route = createFileRoute('/docs/numora-react/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale | Numora React' },
      {
        name: 'description',
        content:
          'Take the thousand and decimal separators from a locale tag or from the runtime locale, with the locale prop and getSeparatorsFromLocale.',
      },
      { property: 'og:title', content: 'Locale | Numora React' },
      {
        property: 'og:description',
        content:
          'Take the thousand and decimal separators from a locale tag or from the runtime locale, with the locale prop and getSeparatorsFromLocale.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/locale',
      },
      { name: 'twitter:title', content: 'Locale | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Take the thousand and decimal separators from a locale tag or from the runtime locale, with the locale prop and getSeparatorsFromLocale.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/locale' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Locale | Numora React',
            description:
              'Locale-aware separator detection in the React numeric input component. Supports comma decimals, dot thousand separators and international grouping.',
            url: 'https://numeric-input.com/docs/numora-react/features/locale',
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
                name: 'Numora React',
                item: 'https://numeric-input.com/docs/numora-react',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Locale',
                item: 'https://numeric-input.com/docs/numora-react/features/locale',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Locale,
});

const subscribeNoop = () => () => {};
const getBrowserLocale = () => Intl.NumberFormat().resolvedOptions().locale;
// Browser locale is unknown on the server; the empty server snapshot keeps the first
// client render identical to the SSR HTML, and the real value appears after hydration.
const getServerLocale = () => '';

function Locale() {
  const usersLocale = useSyncExternalStore(subscribeNoop, getBrowserLocale, getServerLocale);

  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Locale</h1>
      <p>
        The <code>locale</code> prop detects thousand and decimal separators, and the digit-grouping
        style, via <code>Intl.NumberFormat</code>. An explicit <code>groupingStyle</code> overrides
        the detected one.
      </p>

      <LocaleSeparatorsDemo />

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 locale tag to pin separators to one locale. Use this whenever the field
        is rendered on the server. There, <code>locale={'{true}'}</code> resolves to the server's
        locale, which may not match the browser, and logs a warning in development.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title='locale="de-DE"'
          description="German separators: 1234567.89 displays as 1.234.567,89"
          language="tsx"
          code={`<NumoraInput locale="de-DE" defaultValue="1234567.89" />`}
          config={{ locale: 'de-DE', defaultValue: '1234567.89' }}
        />
      </div>

      <h2>Browser locale (auto-detect)</h2>
      <p>
        Pass <code>locale={'{true}'}</code> to detect both separators from the browser's current
        locale. Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values win
        over locale-detected ones.
      </p>
      <div className="space-y-4">
        {/* The browser's locale is unknown on the server, so the field is prefilled only once it
            is known. The key remounts the field so the defaultValue applies. */}
        <ExampleWithDemo
          key={usersLocale ? 'client' : 'server'}
          title="locale={true}"
          description={
            usersLocale
              ? `Your browser reports ${usersLocale}, so both separators come from that locale`
              : "Both separators come from your browser's locale"
          }
          language="tsx"
          code={`<NumoraInput locale={true} defaultValue="1234567.89" />`}
          config={{
            locale: true,
            defaultValue: usersLocale ? '1234567.89' : undefined,
          }}
        />
      </div>

      <h2>Grouping style detection</h2>
      <p>
        Indic locales group as 3-2-2 (lakh/crore) rather than 3-3-3. When <code>groupingStyle</code>{' '}
        is left unset, it is derived from the locale, so <code>hi-IN</code> and <code>en-IN</code>{' '}
        get <code>'lakh'</code>.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title='locale="en-IN"'
          description="Grouping derived from the locale: 12345678 displays as 1,23,45,678"
          language="tsx"
          code={`<NumoraInput locale="en-IN" defaultValue="12345678" />`}
          config={{ locale: 'en-IN', defaultValue: '12345678' }}
        />
        <ExampleWithDemo
          title='locale="en-IN" groupingStyle="thousand"'
          description="An explicit groupingStyle wins over the locale: 12345678 displays as 12,345,678"
          language="tsx"
          code={`<NumoraInput
  locale="en-IN"
  groupingStyle="thousand"
  defaultValue="12345678"
/>`}
          config={{
            locale: 'en-IN',
            groupingStyle: 'thousand',
            defaultValue: '12345678',
          }}
        />
      </div>
      <p>
        Only <code>'thousand'</code> and <code>'lakh'</code> can be detected. <code>'wan'</code>{' '}
        (4-4-4) cannot be derived from <code>Intl.NumberFormat</code>, because <code>zh-CN</code>{' '}
        and <code>ja-JP</code> both report Western 3-3-3 grouping. Pass <code>'wan'</code>{' '}
        explicitly.
      </p>

      <h2>Where the separators come from</h2>
      <p>
        Numora does not read the browser's locale unless you ask it to. A separator you pass wins,{' '}
        <code>locale</code> fills in the ones you did not set, and the defaults fill in the rest.
      </p>
      <table>
        <thead>
          <tr>
            <th>You pass</th>
            <th>Thousand</th>
            <th>Decimal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nothing</td>
            <td>
              <code>,</code>
            </td>
            <td>
              <code>.</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>locale="de-DE"</code>
            </td>
            <td>
              <code>.</code>
            </td>
            <td>
              <code>,</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>locale="de-DE"</code> <code>thousandSeparator=" "</code>
            </td>
            <td>space</td>
            <td>
              <code>,</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>thousandSeparator="."</code>
            </td>
            <td>
              <code>.</code>
            </td>
            <td>
              <code>,</code> (switched)
            </td>
          </tr>
          <tr>
            <td>
              <code>decimalSeparator=","</code>
            </td>
            <td>
              <code>.</code> (switched)
            </td>
            <td>
              <code>,</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The last two rows show that a separator you pass never clashes with one you did not. If it
        is the character the defaults or the locale would use for the other separator, the other one
        switches.
      </p>
      <p>A separator must follow three rules:</p>
      <ul>
        <li>It is exactly one character.</li>
        <li>
          It is not a digit or one of <code>- + e E k K m M b B t T</code>, which Numora reads as a
          sign, an exponent or a compact-notation suffix.
        </li>
        <li>The thousand and decimal separators are different characters.</li>
      </ul>
      <p>
        Numora throws on an invalid separator in development, including when you pass the same
        character for both. In a production build it logs the error and keeps the last valid
        options, or the defaults if the first render was invalid.
      </p>

      <h2>getSeparatorsFromLocale</h2>
      <p>
        <code>getSeparatorsFromLocale</code> returns the separators and grouping style for a tag, so
        you can read them or pass them in yourself.
      </p>
      <CodeBlock language="tsx">
        {`import {
  NumoraInput,
  getSeparatorsFromLocale,
} from 'numora-react'

getSeparatorsFromLocale('de-DE')
// {
//   thousandSeparator: '.',
//   decimalSeparator: ',',
//   groupingStyle: 'thousand',
// }

getSeparatorsFromLocale('fr-FR').thousandSeparator
// '\\u202f'

getSeparatorsFromLocale('en-IN').groupingStyle
// 'lakh'

const separators = getSeparatorsFromLocale('de-DE')

<NumoraInput
  thousandSeparator={separators.thousandSeparator}
  decimalSeparator={separators.decimalSeparator}
/>`}
      </CodeBlock>

      <p>
        To set the decimal separator without a locale, see{' '}
        <Link to="/docs/numora-react/features/decimals">Decimals</Link>.
      </p>

      <h2>What the field displays</h2>
      <p>
        The field shows the locale's separators with ASCII digits and an ASCII minus. In ar-EG it
        shows <code>1٬234٫5</code>, not the Arabic-Indic{' '}
        <code lang="ar" style={{ fontSize: '1em' }}>
          ١٬٢٣٤٫٥
        </code>{' '}
        that <code>Intl.NumberFormat</code> prints. In sv-SE it shows the hyphen-minus (U+002D), not
        the minus sign (U+2212). Typed and pasted native digits and minus signs are still accepted
        and folded to ASCII. With thousand grouping, four-digit numbers are grouped too (
        <code>1.234</code> in es-ES), even where <code>Intl</code> leaves them ungrouped.
      </p>

      <h2>Changing the locale later</h2>
      <p>
        Change the <code>locale</code> prop on a mounted field. The raw value is kept and the
        display is rewritten with the new separators. An invalid tag throws in development and is
        logged in production. <code>locale={'{false}'}</code> turns locale handling off and uses the{' '}
        <code>thousandSeparator</code> and <code>decimalSeparator</code> props.
      </p>

      <h2>Value format under a locale</h2>
      <p>
        The separators only change what the field shows. <code>value</code> and{' '}
        <code>defaultValue</code> take the canonical raw value in every locale: ASCII digits,{' '}
        <code>.</code> as the decimal mark, no grouping. Under <code>locale="de-DE"</code>,{' '}
        <code>{'value="1234.5"'}</code> displays <code>"1.234,5"</code>, and{' '}
        <code>e.target.value</code> is <code>"1234.5"</code>. See{' '}
        <Link to="/docs/numora-react/features/value-types">Value types</Link> for the full value
        contract.
      </p>
    </div>
  );
}
