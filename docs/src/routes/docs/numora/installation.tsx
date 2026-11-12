import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { InstallTabs } from '@/components/InstallTabs';

export const Route = createFileRoute('/docs/numora/installation')({
  head: () => ({
    meta: [
      { title: 'Installation | Numora' },
      {
        name: 'description',
        content:
          'Install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, no framework required.',
      },
      { property: 'og:title', content: 'Installation | Numora' },
      {
        property: 'og:description',
        content:
          'Install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, no framework required.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/installation' },
      { name: 'twitter:title', content: 'Installation | Numora' },
      {
        name: 'twitter:description',
        content:
          'Install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, no framework required.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/installation' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Install Numora',
            description:
              'How to install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun.',
            url: 'https://numeric-input.com/docs/numora/installation',
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
                name: 'Installation',
                item: 'https://numeric-input.com/docs/numora/installation',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Installation,
});

function Installation() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Install Numora</h1>
      <p>Add the Numora TypeScript numeric input library to any project. No framework required.</p>

      <h2>Install</h2>
      <p>Numora has zero runtime dependencies. Pick your package manager:</p>

      <InstallTabs packages="numora" />

      <h2>Basic usage</h2>
      <p>
        Import the <code>NumoraInput</code> class and pass it a container element:
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const container = document.querySelector('#my-input-container')

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  groupingStyle: 'thousand',
  thousandSeparator: ',',
  decimalSeparator: '.',
  formatOn: 'change',
  // typing 1234.56 displays "1,234.56"
})`}
      </CodeBlock>

      <h2>Options</h2>
      <p>
        The second argument is an optional options object (<code>NumoraInputOptions</code>). It
        extends <code>NumoraOptions</code> with the callbacks, <code>defaultValue</code> and a few
        native attributes. You can leave any of them out.
      </p>

      <h3>Formatting</h3>
      <div className="overflow-x-auto">
        <table className="[&_td:first-child]:whitespace-nowrap [&_td:nth-child(2)]:whitespace-nowrap">
          <thead>
            <tr>
              <th>Option</th>
              <th>Default</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>locale</code>
              </td>
              <td>unset</td>
              <td>
                A BCP 47 tag (<code>'de-DE'</code>) or <code>true</code> for the runtime's locale.
                Sets <code>thousandSeparator</code>, <code>decimalSeparator</code> and{' '}
                <code>groupingStyle</code>. If you also pass one of those, yours wins. See{' '}
                <Link to="/docs/numora/features/locale">Locale</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>formatOn</code>
              </td>
              <td>
                <code>'change'</code>
              </td>
              <td>
                Adds separators on every keystroke (<code>'change'</code>) or when the field loses
                focus (<code>'blur'</code>). See{' '}
                <Link to="/docs/numora/features/formatting">Formatting</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>groupingStyle</code>
              </td>
              <td>
                <code>'thousand'</code>
              </td>
              <td>
                <code>'thousand'</code> (1,234,567), <code>'lakh'</code> (12,34,567),{' '}
                <code>'wan'</code> (123,4567) or <code>'none'</code>. <code>'none'</code> is the
                only way to turn grouping off.
              </td>
            </tr>
            <tr>
              <td>
                <code>thousandSeparator</code>
              </td>
              <td>
                <code>','</code>
              </td>
              <td>The character between digit groups. Exactly one character.</td>
            </tr>
            <tr>
              <td>
                <code>decimalSeparator</code>
              </td>
              <td>
                <code>'.'</code>
              </td>
              <td>The character between the integer and decimal parts. Exactly one character.</td>
            </tr>
            <tr>
              <td>
                <code>decimalMaxLength</code>
              </td>
              <td>
                <code>18</code>
              </td>
              <td>
                Maximum number of decimal digits. Numora cuts extra digits off and never rounds. See{' '}
                <Link to="/docs/numora/features/decimals">Decimals</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>decimalMinLength</code>
              </td>
              <td>
                <code>0</code>
              </td>
              <td>
                Pads decimals with zeros up to this many digits. Numora pads on blur and when your
                app sets the value, never while the user types.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>What the user can enter</h3>
      <div className="overflow-x-auto">
        <table className="[&_td:first-child]:whitespace-nowrap [&_td:nth-child(2)]:whitespace-nowrap">
          <thead>
            <tr>
              <th>Option</th>
              <th>Default</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>allowNegative</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>
                Allows a leading <code>-</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>allowLeadingZeros</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>
                Keeps leading zeros (<code>007</code>) instead of removing them. See{' '}
                <Link to="/docs/numora/features/leading-zeros">Leading zeros</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>padLeadingZero</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>
                Puts a <code>0</code> in front of a bare decimal separator (<code>.5</code> becomes{' '}
                <code>0.5</code>).
              </td>
            </tr>
            <tr>
              <td>
                <code>allowCompactNotation</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>
                Expands <code>1k</code> to <code>1000</code>. See{' '}
                <Link to="/docs/numora/features/compact-notation">Compact notation</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>allowScientificNotation</code>
              </td>
              <td>
                <code>true</code>
              </td>
              <td>
                Expands a pasted <code>1.5e-7</code> to <code>0.00000015</code>. <code>false</code>{' '}
                rejects such a paste. See{' '}
                <Link to="/docs/numora/features/scientific-notation">Scientific notation</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>maxLength</code>
              </td>
              <td>unset</td>
              <td>
                The most characters the raw value can have. Digits, the decimal separator and a
                leading <code>-</code> count. Grouping separators and <code>decimalMinLength</code>{' '}
                padding don't. See <Link to="/docs/numora/features/max-length">Max length</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>isAllowed</code>
              </td>
              <td>unset</td>
              <td>
                <code>(rawValue) =&gt; boolean</code>. Return <code>false</code> to reject a
                keystroke or paste. See{' '}
                <Link to="/docs/numora/features/validation">Validation</Link>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Value and callbacks</h3>
      <div className="overflow-x-auto">
        <table className="[&_td:first-child]:whitespace-nowrap">
          <thead>
            <tr>
              <th>Option</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>defaultValue</code>
              </td>
              <td>
                The initial value, as a raw value (<code>'1234.5'</code> in every locale). Later
                writes go through <code>setValue()</code>. Numora ignores a <code>value</code>{' '}
                option. See <Link to="/docs/numora/features/value-types">Value types</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>onValueChange</code>
              </td>
              <td>
                Called with <code>{'{ value, formattedValue }'}</code> when the raw value changes.{' '}
                <code>value</code> is the raw value: ASCII digits, a <code>.</code> decimal, no
                grouping.
              </td>
            </tr>
            <tr>
              <td>
                <code>onFormattedValueChange</code>
              </td>
              <td>
                Called with the field's text every time Numora rewrites it and the text is new. That
                includes the rewrites <code>onValueChange</code> says nothing about: grouping on
                blur, removing separators on focus, and <code>setValue()</code>. Not called on
                creation.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Native attributes</h3>
      <p>
        Numora copies these onto the <code>{'<input>'}</code>: <code>id</code>, <code>name</code>,{' '}
        <code>className</code>, <code>placeholder</code>, <code>disabled</code>,{' '}
        <code>readOnly</code>, <code>required</code>, <code>tabIndex</code>, <code>title</code>,{' '}
        <code>autofocus</code> and <code>ariaLabel</code>, which sets <code>aria-label</code>. Set
        anything else on <code>numoraInput.element</code>.
      </p>
      <p>
        Don't set the native <code>maxLength</code> on the element. It counts grouping separators,
        and the Numora option doesn't.
      </p>

      <h2>TypeScript</h2>
      <p>Numora ships its own declarations. Import types directly:</p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'
import type { NumoraOptions } from 'numora'

const options: NumoraOptions = {
  decimalMaxLength: 6,
  formatOn: 'change',
  groupingStyle: 'thousand',
  thousandSeparator: ',',
}`}
      </CodeBlock>
    </div>
  );
}
