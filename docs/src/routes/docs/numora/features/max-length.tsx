import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/max-length')({
  head: () => ({
    meta: [
      { title: 'Max Length (Raw-Counted) | Numora' },
      {
        name: 'description',
        content:
          'Cap numeric input length by raw digits with Numora. Thousand separators and decimal points are counted the way users actually think about length - not by formatted character count.',
      },
      { property: 'og:title', content: 'Max Length (Raw-Counted) | Numora' },
      {
        property: 'og:description',
        content:
          'Cap numeric input length by raw digits with Numora. Separator-aware truncation for financial inputs.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/max-length' },
      { name: 'twitter:title', content: 'Max Length (Raw-Counted) | Numora' },
      {
        name: 'twitter:description',
        content: 'Cap numeric input length by raw digits with Numora.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/max-length' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Max Length in Numora - Raw-Counted Numeric Input Length Limit',
            description:
              'Cap numeric input length by raw digits with Numora. Thousand separators are excluded from the count, so the limit reflects the actual numeric value rather than the formatted display.',
            url: 'https://numeric-input.com/docs/numora/features/max-length',
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
                name: 'Numora JS',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Max Length',
                item: 'https://numeric-input.com/docs/numora/features/max-length',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: MaxLength,
});

function MaxLength() {
  return (
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-foreground">Max Length</h1>
      <p className="text-muted-foreground text-base leading-6">
        Cap the input by raw character count - thousand separators are excluded from the limit, so
        the cap reflects the actual numeric value rather than the formatted display.
      </p>

      <h2 className="text-foreground text-2xl">Why not the native HTML attribute?</h2>
      <p className="text-muted-foreground text-base leading-6">
        The native <code>maxLength</code> attribute on <code>&lt;input&gt;</code> counts every
        formatted character. With thousand separators, <code>1,234,567</code> is 9 characters; the
        user thinks of it as 7 digits. Numora's option counts the raw value the way users actually
        reason about length.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  maxLength: 7,
  thousandSeparator: ',',
})

// User types: 1, 2, 3, 4, 5, 6, 7  → "1,234,567"  (allowed)
// Next keystroke is blocked - raw length is already 7.`}
      </CodeBlock>

      <h2 className="text-foreground text-2xl">Rules</h2>
      <ul>
        <li>
          Counts the <strong>raw</strong> value - thousand separators are stripped before measuring
        </li>
        <li>
          The decimal separator <em>is</em> counted (it's part of the raw value)
        </li>
        <li>
          A leading <code>-</code> sign <em>is</em> counted
        </li>
        <li>
          Counts raw characters after sanitization, excluding grouping separators and{' '}
          <code>decimalMinLength</code> padding
        </li>
        <li>
          Truncation happens from the right; if it would leave a trailing decimal separator, that
          separator is also stripped (<code>"1234.56"</code> capped at 5 → <code>"1234"</code>)
        </li>
        <li>
          If truncation would leave a bare <code>"-"</code>, the result is <code>""</code>
        </li>
      </ul>

      <h2 className="text-foreground text-2xl">Pasted values</h2>
      <p className="text-muted-foreground text-base leading-6">
        Pastes are truncated after sanitization. Pasting <code>"99999999"</code> into an input with{' '}
        <code>maxLength: 4</code> commits <code>"9999"</code>.
      </p>

      <h2 className="text-foreground text-2xl">Standalone utility</h2>
      <p className="text-muted-foreground text-base leading-6">
        For one-off truncation outside of the input pipeline, Numora exports
        <code>truncateToMaxLength</code>:
      </p>

      <CodeBlock language="typescript">
        {`import { truncateToMaxLength } from 'numora'

truncateToMaxLength('1234567', 5)        // → '12345'
truncateToMaxLength('1234.56', 5)        // → '1234'   (trailing dot stripped)
truncateToMaxLength('-1234567', 5)       // → '-1234'  (minus counts)
truncateToMaxLength('1234,56', 5, ',')   // → '1234'   (custom separator)`}
      </CodeBlock>
    </div>
  );
}
