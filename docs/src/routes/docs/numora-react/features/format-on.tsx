import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { TorphBlurMinimal } from '@/components/TorphBlurMinimal';
import { TorphDemo } from '@/components/TorphDemo';

const PAGE_URL = 'https://numeric-input.com/docs/numora-react/features/format-on';
const META_TITLE = 'Change vs blur | Numora React';
const META_DESCRIPTION =
  'The formatOn prop of the NumoraInput React component decides when thousand separators appear. "change" adds them on every keystroke, and "blur" adds them when the field loses focus.';

export const Route = createFileRoute('/docs/numora-react/features/format-on')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: PAGE_URL }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: META_TITLE,
            description: META_DESCRIPTION,
            url: PAGE_URL,
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
              { '@type': 'ListItem', position: 3, name: 'Change vs blur', item: PAGE_URL },
            ],
          },
        ]),
      },
    ],
  }),
  component: FormatOn,
});

function FormatOn() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Change vs blur</h1>
      <p>
        The <code>formatOn</code> prop decides when the thousand separators appear. It has two
        modes: <code>"change"</code> (the default) and <code>"blur"</code>. The raw value you get
        from <code>onValueChange</code> is the same in both.
      </p>

      <h2>Change</h2>
      <p>The separators update on every keystroke, and the cursor stays where the user left it.</p>
      <TorphDemo />
      <CodeBlock language="tsx">{`<NumoraInput formatOn="change" />`}</CodeBlock>

      <h2>Blur</h2>
      <p>
        The field shows plain digits while it has focus. Numora removes the separators when the
        field takes focus and puts them back when it loses focus.
      </p>
      <TorphBlurMinimal />
      <CodeBlock language="tsx">{`<NumoraInput formatOn="blur" />`}</CodeBlock>
      <p>
        Removing and restoring the separators does not change the raw value, so{' '}
        <code>onChange</code> and <code>onValueChange</code> stay silent on focus and blur.{' '}
        <code>onFormattedValueChange</code> reports the new text. Numora groups a <code>value</code>{' '}
        you pass while the field is unfocused.
      </p>

      <h2>Which one to use</h2>
      <p>
        Keep the default for amounts the user reads while typing, such as a price or a token amount.
        Use <code>"blur"</code> when users edit digits in the middle of a long number. No separator
        moves under the cursor while they type.
      </p>
      <p>
        The demos on this page animate the digits with Torph. See the{' '}
        <Link to="/docs/numora-react/integrations/torph">Torph integration</Link> to build them, and{' '}
        <Link to="/docs/numora-react/features/formatting">Formatting</Link> for the grouping styles.
      </p>
    </div>
  );
}
