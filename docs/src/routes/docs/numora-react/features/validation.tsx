import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { ValidationDemo } from '@/components/ValidationDemo';

export const Route = createFileRoute('/docs/numora-react/features/validation')({
  head: () => ({
    meta: [
      { title: 'Validation | Numora React' },
      {
        name: 'description',
        content:
          'Reject numeric input before it commits, with a custom isAllowed validator in the NumoraInput React component. Cap values, enforce business rules and block invalid keystrokes before they reach React state.',
      },
      { property: 'og:title', content: 'Validation | Numora React' },
      {
        property: 'og:description',
        content:
          'Reject numeric input before it commits, with a custom isAllowed validator in the NumoraInput React component. Cap values, enforce business rules and block invalid keystrokes before they reach React state.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/validation',
      },
      { name: 'twitter:title', content: 'Validation | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Reject numeric input before it commits, with a custom isAllowed validator in the NumoraInput React component. Cap values, enforce business rules and block invalid keystrokes before they reach React state.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/validation' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Validation | Numora React',
            description:
              'Use the isAllowed predicate prop to reject invalid numeric input before it commits to React state. Enforce caps and business rules without writing your own keydown handlers.',
            url: 'https://numeric-input.com/docs/numora-react/features/validation',
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
                name: 'Validation',
                item: 'https://numeric-input.com/docs/numora-react/features/validation',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Validation,
});

function Validation() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Validation</h1>
      <p>
        Use an <code>isAllowed</code> predicate to reject edits the user makes (typing, deleting,
        paste, drop, autofill, IME) <em>before</em> they commit. It fits business rules and format
        rules that no built-in prop covers.
      </p>

      <ValidationDemo api="react" />

      <CodeBlock language="typescript">
        {`type IsAllowed = (rawValue: string) => boolean`}
      </CodeBlock>

      <p>
        <code>rawValue</code> is the sanitized, raw (no-separator) string that <em>would</em> be
        committed. Return <code>true</code> to accept it or <code>false</code> to discard it. A
        discarded value leaves the input at its previous value, and neither <code>onChange</code>{' '}
        nor <code>onValueChange</code> fires.
      </p>

      <h2>Example: cap at 100</h2>
      <ExampleWithDemo
        title="Reject anything above 100"
        description={'Try typing past 100. Keystrokes that would exceed it are blocked'}
        language="tsx"
        code={`<NumoraInput
  isAllowed={(raw) => {
    // Half-typed values. "-" and "-." only arrive with allowNegative
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return true
    const n = parseFloat(raw) // comparison only
    return Number.isFinite(n) && n <= 100
  }}
/>`}
        config={{
          isAllowed: (raw: string) => {
            if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return true;
            const n = parseFloat(raw);
            return Number.isFinite(n) && n <= 100;
          },
        }}
      />

      <h2>Example: whole numbers, up to 6 digits</h2>
      <p>This predicate is safe for every prefix, so users can type and delete freely.</p>
      <CodeBlock language="tsx">
        {`<NumoraInput
  isAllowed={(raw) => /^\\d{0,6}$/.test(raw)}
/>`}
      </CodeBlock>

      <h2>Notes</h2>
      <ul>
        <li>
          Runs <em>after</em> sanitization and formatting. For typing and paste that is{' '}
          <em>before</em> the DOM is mutated and React state updates. For drop, autofill and IME
          text, which the browser has already inserted, a rejection puts the previous value back
        </li>
        <li>
          Fires for typing, deletion, paste, drop, autofill and IME text. A keystroke that changes
          nothing, or one a built-in option already refused, never reaches it
        </li>
        <li>
          Does not run for values your code writes: the <code>value</code> and{' '}
          <code>defaultValue</code> props, option changes and the ref's <code>setValue()</code> are
          never checked
        </li>
        <li>
          Does not run when blur settles the value. If blur turns <code>1.</code> into{' '}
          <code>1</code> or pads <code>1.5</code> to <code>1.50</code>, the settled value is not
          checked
        </li>
        <li>
          A predicate that throws counts as a rejection, and the error is logged with{' '}
          <code>console.error</code>
        </li>
        <li>
          Always allow the intermediate strings users need to type their way to a valid value (empty
          string, lone <code>-</code> or decimal separator)
        </li>
        <li>Keep the predicate cheap, because it runs on every edit</li>
        <li>
          For length and decimal-precision caps, use{' '}
          <Link to="/docs/numora-react/features/max-length">max length</Link> and{' '}
          <Link to="/docs/numora-react/features/decimals">decimals</Link> instead
        </li>
      </ul>

      {/* biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash */}
      <h2 id="invalid-options" className="scroll-mt-24">
        Invalid options
      </h2>
      <p>
        Numora React checks every prop before it uses it. In development an invalid prop throws
        during render. In production it logs the error with <code>console.error</code> and the field
        keeps its last valid options, or the defaults on a first render.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Invalid when</th>
              <th>Error message</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>maxLength</code>
              </td>
              <td>Not a whole number of 1 or more</td>
              <td>
                <code>{'maxLength must be a positive integer (>= 1). Received: 0'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>decimalMaxLength</code>
              </td>
              <td>Not a whole number of 0 or more</td>
              <td>
                <code>{'decimalMaxLength must be a non-negative integer. Received: -1'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>decimalMinLength</code>
              </td>
              <td>Not a whole number of 0 or more</td>
              <td>
                <code>{'decimalMinLength must be a non-negative integer. Received: -1'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>decimalMinLength</code>
              </td>
              <td>
                Greater than <code>decimalMaxLength</code>
              </td>
              <td>
                <code>{'decimalMinLength (3) cannot be greater than decimalMaxLength (2).'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>formatOn</code>
              </td>
              <td>
                Not <code>'blur'</code> or <code>'change'</code>
              </td>
              <td>
                <code>{"formatOn must be one of: 'blur', 'change'. Received: \"input\""}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>groupingStyle</code>
              </td>
              <td>Not one of the four styles</td>
              <td>
                <code>
                  {
                    "groupingStyle must be one of: 'none', 'thousand', 'lakh', 'wan'. Received: \"indian\""
                  }
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>thousandSeparator</code>
              </td>
              <td>An empty string</td>
              <td>
                <code>{"thousandSeparator cannot be empty. Use groupingStyle: 'none'."}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>thousandSeparator</code>, <code>decimalSeparator</code>
              </td>
              <td>
                Longer than one character. For <code>decimalSeparator</code>, also an empty string
              </td>
              <td>
                <code>{'decimalSeparator must be a single character. Received: ", "'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>thousandSeparator</code>, <code>decimalSeparator</code>
              </td>
              <td>A digit</td>
              <td>
                <code>{'thousandSeparator cannot be a digit. Received: "1"'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>thousandSeparator</code>, <code>decimalSeparator</code>
              </td>
              <td>
                One of <code>- + e E k K m M b B t T</code>
              </td>
              <td>
                <code>
                  {
                    'thousandSeparator cannot be one of the reserved characters -+eEkKmMbBtT (sign, exponent, or compact-notation suffix). Received: "k"'
                  }
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code>thousandSeparator</code>, <code>decimalSeparator</code>
              </td>
              <td>Both passed, as the same character</td>
              <td>
                <code>{'decimalSeparator cannot equal thousandSeparator. Both were ".".'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>allowNegative</code>, <code>allowLeadingZeros</code>,{' '}
                <code>allowCompactNotation</code>, <code>allowScientificNotation</code>,{' '}
                <code>padLeadingZero</code>
              </td>
              <td>Not a boolean</td>
              <td>
                <code>{'allowNegative must be a boolean. Received: "yes"'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>isAllowed</code>, <code>onValueChange</code>,{' '}
                <code>onFormattedValueChange</code>
              </td>
              <td>Not a function</td>
              <td>
                <code>{'isAllowed must be a function. Received: "x"'}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>locale</code>
              </td>
              <td>A string that is not a BCP 47 tag</td>
              <td>
                <code>{'locale must be a BCP 47 tag such as "de-DE". Received: "not a tag"'}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>These never throw:</p>
      <ul>
        <li>
          One separator passed alone. If it lands on the other separator, the other one switches
          between <code>.</code> and <code>,</code>.
        </li>
        <li>
          A well-formed <code>locale</code> tag the runtime does not know. The runtime picks its
          closest match.
        </li>
        <li>
          A removed v4 prop such as <code>thousandStyle</code> or <code>maxDecimals</code>. Numora
          ignores it and, in development, warns with the name of its replacement. The{' '}
          <a
            href="https://github.com/sharqiewicz/numora/blob/main/MIGRATION.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            migration guide
          </a>{' '}
          lists every one.
        </li>
      </ul>
    </div>
  );
}
