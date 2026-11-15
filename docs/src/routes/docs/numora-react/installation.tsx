import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { InstallTabs } from '@/components/InstallTabs';

export const Route = createFileRoute('/docs/numora-react/installation')({
  head: () => ({
    meta: [
      { title: 'Installation | Numora React' },
      {
        name: 'description',
        content:
          'Add a React numeric input component to your project. Install Numora React, render NumoraInput, and format numbers as the user types, with no dependencies beyond react and the numora core.',
      },
      {
        property: 'og:title',
        content: 'Installation | Numora React',
      },
      {
        property: 'og:description',
        content:
          'Install Numora React and render NumoraInput for string-based number formatting in any React project. No dependencies beyond react and the numora core. Written for TypeScript.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/installation' },
      {
        name: 'twitter:title',
        content: 'Installation | Numora React',
      },
      {
        name: 'twitter:description',
        content: 'React numeric input component that formats numbers as the user types.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/installation' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Installation | Numora React',
            description: 'Installation guide for Numora React, the React numeric input component.',
            url: 'https://numeric-input.com/docs/numora-react/installation',
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
                name: 'Installation',
                item: 'https://numeric-input.com/docs/numora-react/installation',
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
      <h1>Installation</h1>
      <p>
        Install Numora React and render <code>NumoraInput</code> in any React project.
      </p>

      <h2>Install</h2>
      <p>
        Numora React has one peer dependency, <code>react</code> (17 or later). The core engine,{' '}
        <code>numora</code>, is a regular dependency and installs with it. The command below also
        adds <code>numora</code> to your own dependencies so you can import its helpers. Pick your
        package manager:
      </p>

      <InstallTabs packages="numora numora-react" />

      <h2>Basic usage</h2>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

function App() {
  return (
    <NumoraInput
      decimalMaxLength={2}
      formatOn="change"
    />
  )
}`}
        language="tsx"
        config={{
          formatOn: 'change',
          decimalMaxLength: 2,
        }}
        description="Type a number to see it formatted"
      />

      <h2>Controlled component</h2>
      <p>
        Use <code>useState</code> with <code>NumoraInput</code> like any controlled input. Store the
        raw value, which has no separators. <Link to="/docs/numora-react">Get started</Link>{' '}
        explains raw and formatted values.
      </p>
      <CodeBlock language="tsx">
        {`import { useState } from 'react'
import { NumoraInput } from 'numora-react'

function AmountField() {
  const [amount, setAmount] = useState('')

  return (
    <>
      <NumoraInput
        value={amount}
        onValueChange={({ value }) => setAmount(value)}
        decimalMaxLength={6}
        formatOn="change"
      />
      <p>Raw value: {amount}</p>
    </>
  )
}`}
      </CodeBlock>

      <h2>Props</h2>
      <p>
        <code>NumoraInput</code> takes every core option as a prop. <code>NumoraInputProps</code>{' '}
        extends <code>NumoraOptions</code>. You can leave any of them out.
      </p>

      <h3>Formatting</h3>
      <div className="overflow-x-auto">
        <table className="[&_td:first-child]:whitespace-nowrap [&_td:nth-child(2)]:whitespace-nowrap">
          <thead>
            <tr>
              <th>Prop</th>
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
                <Link to="/docs/numora-react/features/locale">Locale</Link>.
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
                <Link to="/docs/numora-react/features/formatting">Formatting</Link>.
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
              <td>
                The character between digit groups. Exactly one character. It cannot be a digit, one
                of <code>- + e E k K m M b B t T</code>, or the same as{' '}
                <code>decimalSeparator</code>. In development Numora throws on an invalid value. In
                production it logs the error and keeps the last valid options.
              </td>
            </tr>
            <tr>
              <td>
                <code>decimalSeparator</code>
              </td>
              <td>
                <code>'.'</code>
              </td>
              <td>
                The character between the integer and decimal parts. Exactly one character, with the
                same rules as <code>thousandSeparator</code>.
              </td>
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
                <Link to="/docs/numora-react/features/decimals">Decimals</Link>.
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
              <th>Prop</th>
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
                <Link to="/docs/numora-react/features/leading-zeros">Leading zeros</Link>.
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
                <Link to="/docs/numora-react/features/compact-notation">Compact notation</Link>.
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
                Expands a pasted or app-set <code>1.5e-7</code> to <code>0.00000015</code>. A typed{' '}
                <code>e</code> is never accepted. <code>false</code> rejects such a paste. See{' '}
                <Link to="/docs/numora-react/features/scientific-notation">
                  Scientific notation
                </Link>
                .
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
                padding don't. See{' '}
                <Link to="/docs/numora-react/features/max-length">Max length</Link>.
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
                <Link to="/docs/numora-react/features/validation">Validation</Link>.
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
              <th>Prop</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>value</code>
              </td>
              <td>
                The controlled value, as a raw string (<code>'1234.5'</code> in every locale), never
                a number. The field shows this value after every change, so an edit your handler
                doesn't store is put back. See{' '}
                <Link to="/docs/numora-react/features/value-types">Value types</Link>.
              </td>
            </tr>
            <tr>
              <td>
                <code>defaultValue</code>
              </td>
              <td>
                The initial value of an uncontrolled field, as a raw string. Later writes go through{' '}
                <code>ref.current.setValue()</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>onChange</code>
              </td>
              <td>
                Called with a change event when the raw value changes. <code>e.target.value</code>{' '}
                is the raw value and <code>e.target.formattedValue</code> is the field's text.
              </td>
            </tr>
            <tr>
              <td>
                <code>onValueChange</code>
              </td>
              <td>
                Called with <code>{'{ value, formattedValue }'}</code> alongside{' '}
                <code>onChange</code>. <code>value</code> is the raw value: ASCII digits, a{' '}
                <code>.</code> decimal, no grouping.
              </td>
            </tr>
            <tr>
              <td>
                <code>onFormattedValueChange</code>
              </td>
              <td>
                Called with the field's text every time Numora rewrites it and the text is new. That
                includes the rewrites <code>onChange</code> and <code>onValueChange</code> say
                nothing about: grouping on blur, removing separators on focus,{' '}
                <code>setValue()</code>, a new <code>value</code> prop and a changed formatting
                prop. Not called on mount.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Native attributes</h3>
      <p>
        Every other prop goes to the <code>{'<input>'}</code>: <code>id</code>, <code>name</code>,{' '}
        <code>className</code>, <code>placeholder</code>, <code>disabled</code>, <code>aria-*</code>
        , <code>data-*</code> and the rest of the standard input attributes. Numora sets{' '}
        <code>type="text"</code> and <code>inputMode="decimal"</code> itself, so those two are not
        props.
      </p>
      <p>
        Your <code>onKeyDown</code> and <code>onPaste</code> run before Numora's. Call{' '}
        <code>e.preventDefault()</code> in one to turn Numora's handling of that event off.
      </p>

      <h2>The ref</h2>
      <p>
        The ref points at the <code>{'<input>'}</code>, with two read-only properties and one method
        added:
      </p>
      <CodeBlock language="tsx">
        {`const ref = useRef<NumoraHTMLInputElement>(null)

ref.current.rawValue        // '1234.5', the value to store or send
ref.current.formattedValue  // '1,234.5', the text in the field

// Write a raw value into an uncontrolled field. Numora sanitizes and formats it,
// and calls neither onChange nor onValueChange. For a controlled field, change \`value\`.
ref.current.setValue('2500')`}
      </CodeBlock>

      <h2>TypeScript</h2>
      <p>
        Types ship with the package. Import them from <code>numora-react</code>:
      </p>
      <CodeBlock language="typescript">
        {`import type {
  NumoraOptions,
  NumoraInputProps,
  NumoraInputChangeEvent,
  NumoraHTMLInputElement,
} from 'numora-react'`}
      </CodeBlock>
    </div>
  );
}
