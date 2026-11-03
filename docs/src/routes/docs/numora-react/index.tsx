import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora-react/')({
  head: () => ({
    meta: [
      { title: 'React numeric input | Numora React' },
      {
        name: 'description',
        content:
          'Get started with Numora React, a React numeric input component. Format numbers as you type, controlled or uncontrolled, compatible with React Hook Form and other form libraries.',
      },
      { property: 'og:title', content: 'React numeric input | Numora React' },
      {
        property: 'og:description',
        content:
          'React numeric input component with controlled mode, React Hook Form integration, the raw value in onChange and formattedValue for display. No dependencies beyond its peers react and numora.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react' },
      { name: 'twitter:title', content: 'React numeric input | Numora React' },
      {
        name: 'twitter:description',
        content:
          'React numeric input component. Works with React Hook Form and gives you the raw and formatted value.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'numora-react',
            codeRepository: 'https://github.com/sharqiewicz/numora',
            programmingLanguage: 'TypeScript',
            runtimePlatform: 'Browser',
            url: 'https://numeric-input.com/docs/numora-react',
            description:
              'React numeric input component. NumoraInput has TypeScript types, works with React Hook Form, and keeps the raw and formatted values separate.',
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
            ],
          },
        ]),
      },
    ],
  }),
  component: GetStarted,
});

function GetStarted() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Numora React</h1>
      <p>
        <strong className="font-numora">Numora React</strong> is a replacement for{' '}
        <code>{'<input>'}</code> that handles numeric formatting, sanitization and cursor
        management in React. It is a <code>forwardRef</code> component that works controlled
        and uncontrolled and accepts standard HTML input attributes (except <code>type</code> and{' '}
        <code>inputMode</code>, which it manages; <code>maxLength</code> counts the raw value).
      </p>

      <h2>Raw and formatted values</h2>
      <p>
        On every change, <code>e.target.value</code> is the raw numeric string, with no thousand
        separators or other formatting characters. With the default <code>.</code> decimal
        separator you can pass it directly to BigNumber, ethers.js, viem or any precision math
        library. With a custom <code>decimalSeparator</code> or a <code>locale</code>, the raw value
        keeps that separator, so normalize it to <code>.</code> first.
      </p>
      <p>
        <code>e.target.formattedValue</code> is the display string, with thousand separators
        and decimal formatting, for showing to the user. One event gives you both values.
      </p>

      <CodeBlock language="tsx">
        {`import { NumoraInput, FormatOn } from 'numora-react'

function Amount() {
  return (
    <NumoraInput
      formatOn={FormatOn.Change}
      maxDecimals={2}
      thousandSeparator=","
      onChange={(e) => {
        console.log(e.target.value)          // "1234.56" (raw)
        console.log(e.target.formattedValue) // "1,234.56" (display)
      }}
    />
  )
}`}
      </CodeBlock>

      <p>
        By default, grouping is <code>ThousandStyle.Thousand</code> with <code>,</code> as the
        separator. The vanilla <code>numora</code> package defaults to no grouping. Pass{' '}
        <code>thousandStyle={'{ThousandStyle.None}'}</code> to turn grouping off.
      </p>

      <h2>Works with</h2>
      <ul>
        <li>Controlled and uncontrolled use, with no special props</li>
        <li>
          React Hook Form, through <code>Controller</code>
        </li>
        <li>Formik, as a custom field component</li>
        <li>
          <code>forwardRef</code>, which passes refs to the underlying input
        </li>
        <li>TypeScript types for props, events and options</li>
      </ul>

      <p>
        The component runs on the <Link to="/docs/numora">core numora engine</Link>, so both
        packages share the same formatting behavior.
      </p>
    </div>
  );
}
