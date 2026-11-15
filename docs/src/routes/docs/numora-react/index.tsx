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
          'React numeric input component with controlled mode, React Hook Form integration, the raw value in onChange and formattedValue for display. No dependencies beyond react and the numora core.',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Numora React</h1>
      <p>
        <strong className="font-numora">Numora React</strong> is a replacement for{' '}
        <code>{'<input>'}</code> that handles numeric formatting, sanitization and cursor management
        in React. It is a <code>forwardRef</code> component that works controlled and uncontrolled
        and accepts standard HTML input attributes. It manages <code>type</code> and{' '}
        <code>inputMode</code> itself, and <code>maxLength</code> counts the raw value.
      </p>

      <h2>
        Why <strong className="font-numora">numora</strong>?
      </h2>
      <p>
        If you audit the codebases of the top 10 DeFi protocols - Uniswap, Aave, Curve, Balancer -
        you'll notice a pattern. For the most critical UI component in finance, the numeric input,
        every single one has built a custom implementation from scratch.
      </p>
      <ul>
        <li>Uniswap maintains ~200 lines of custom regex and locale logic.</li>
        <li>Aave wraps a formatting library with heavy custom validation.</li>
        <li>Curve relies on a complex chain of hooks to handle state.</li>
      </ul>
      <p>
        <strong>There is no standard.</strong> Every team wastes days reinventing the wheel:
        comma/dot separator logic, parseFloat precision loss, mobile keyboard ghost characters.
      </p>
      <p>
        <strong>numora is the new standard for numeric inputs</strong> - a precision-first library
        you drop in once, configure with options, and forget about.
      </p>
      <p>
        See <Link to="/docs/numora-react/installation">Installation</Link> for the component API
        and props.
      </p>

      <h2>Raw and formatted values</h2>
      <p>
        On every change, <code>e.target.value</code> is the raw numeric string, with no thousand
        separators or other formatting characters. Its decimal mark is always <code>.</code>, even
        with a custom <code>decimalSeparator</code> or a <code>locale</code>, so you can pass it
        directly to BigNumber, ethers.js, viem or any precision math library.
      </p>
      <p>
        <code>e.target.formattedValue</code> is the display string, with thousand separators and
        decimal formatting, for showing to the user. <code>onValueChange</code> gives you both
        values in one call.
      </p>

      <CodeBlock language="tsx">
        {`import { NumoraInput } from 'numora-react'

function Amount() {
  return (
    <NumoraInput
      formatOn="change"
      decimalMaxLength={2}
      thousandSeparator=","
      onValueChange={({ value, formattedValue }) => {
        console.log(value)          // "1234.56" (raw)
        console.log(formattedValue) // "1,234.56" (display)
      }}
    />
  )
}`}
      </CodeBlock>

      <p>
        By default, grouping is <code>'thousand'</code> with <code>,</code> as the separator, the
        same as the vanilla <code>numora</code> package. Pass <code>groupingStyle="none"</code> to
        turn grouping off.
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
