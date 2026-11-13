import { createFileRoute, Link } from '@tanstack/react-router';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/formatting')({
  head: () => ({
    meta: [
      { title: 'Formatting | Numora React' },
      {
        name: 'description',
        content:
          'Format numbers as you type with the NumoraInput React component. Thousand separators, three grouping styles, and formatting on every keystroke that keeps the cursor position.',
      },
      {
        property: 'og:title',
        content: 'Formatting | Numora React',
      },
      {
        property: 'og:description',
        content:
          'Format numbers as you type with the NumoraInput React component. Thousand separators, three grouping styles, and formatting on every keystroke that keeps the cursor position.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/formatting',
      },
      {
        name: 'twitter:title',
        content: 'Formatting | Numora React',
      },
      {
        name: 'twitter:description',
        content:
          'Format numbers as you type with the NumoraInput React component. Thousand separators, three grouping styles, and formatting on every keystroke that keeps the cursor position.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/formatting' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Formatting | Numora React',
            description:
              'Format numbers as you type in a React numeric input. Numora React supports Thousand, Lakh and Wan grouping and keeps the cursor in place.',
            url: 'https://numeric-input.com/docs/numora-react/features/formatting',
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
                name: 'Formatting',
                item: 'https://numeric-input.com/docs/numora-react/features/formatting',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Formatting,
});

function Formatting() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Formatting</h1>
      <p>
        Numora React adds thousand separators as the user types by default, or only on blur with{' '}
        <code>formatOn="blur"</code>. It keeps the cursor position in both modes.
      </p>
      <p>
        By default, grouping is <code>'thousand'</code> with <code>,</code> as the thousand
        separator, in both the React component and the vanilla <code>numora</code> package. Pass{' '}
        <code>groupingStyle="none"</code> to turn grouping off. Thousand (1,234,567) is the default,
        so the demos below show the other two styles.
      </p>

      <h2>Other grouping styles</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Lakh (Indian, 12,34,567)"
          description="Type a large number to see Lakh grouping"
          language="tsx"
          code={`import { NumoraInput } from 'numora-react'

<NumoraInput groupingStyle="lakh" />`}
          config={{ groupingStyle: 'lakh' }}
        />
        <ExampleWithDemo
          title="Wan (East Asian, 123,4567)"
          description="Type a large number to see Wan grouping"
          language="tsx"
          code={`import { NumoraInput } from 'numora-react'

<NumoraInput groupingStyle="wan" />`}
          config={{ groupingStyle: 'wan' }}
        />
      </div>

      <h2>When to format</h2>
      <p>
        The separators appear on every keystroke by default, or only on blur with{' '}
        <code>formatOn="blur"</code>. See{' '}
        <Link to="/docs/numora-react/features/format-on">Change vs blur</Link> for both modes.
      </p>

      <h2>Separator skipping</h2>
      <ul>
        <li>
          Backspace and delete skip over thousand separators, so you never delete them by hand.
        </li>
      </ul>
    </div>
  );
}
