import { createFileRoute, Link } from '@tanstack/react-router';
import { BackspaceSkipFigure } from '@/components/anatomy/BackspaceSkipFigure';
import { CursorJumpRecording } from '@/components/anatomy/CursorJumpRecording';
import { CursorLanes } from '@/components/anatomy/CursorLanes';
import { GroupingStylesDiagram } from '@/components/anatomy/diagrams';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/formatting')({
  head: () => ({
    meta: [
      { title: 'Formatting | Numora' },
      {
        name: 'description',
        content:
          'Add thousand separators and format numbers as you type with Numora. Thousand, Lakh, and Wan grouping styles, with cursor position preservation.',
      },
      {
        property: 'og:title',
        content: 'Formatting | Numora',
      },
      {
        property: 'og:description',
        content:
          'Add thousand separators and format numbers as you type with Numora. Thousand, Lakh, and Wan grouping styles, with cursor position preservation.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/formatting' },
      {
        name: 'twitter:title',
        content: 'Formatting | Numora',
      },
      {
        name: 'twitter:description',
        content:
          'Add thousand separators and format numbers as you type with Numora. Thousand, Lakh, and Wan grouping styles, with cursor position preservation.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/formatting' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Number formatting in Numora: Thousand, Lakh, and Wan grouping',
            description:
              'Format numbers as you type in any JavaScript numeric input. Thousand (1,234,567), Lakh (Indian, 12,34,567), and Wan (East Asian, 123,4567) grouping, with cursor preservation.',
            url: 'https://numeric-input.com/docs/numora/features/formatting',
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
                name: 'Formatting',
                item: 'https://numeric-input.com/docs/numora/features/formatting',
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
        Formatting groups the digits of the value with thousand separators.{' '}
        <code>groupingStyle</code> defaults to <code>'thousand'</code>, and <code>'none'</code>{' '}
        turns grouping off. Formatting runs on every keystroke by default, or only on blur with{' '}
        <code>'blur'</code>. Numora keeps the cursor in place either way.
      </p>

      <h2>Grouping styles</h2>
      <GroupingStylesDiagram />
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Thousand (1,234,567)
const input1 = new NumoraInput(container, {
  groupingStyle: 'thousand',
})

// Lakh (Indian, 12,34,567)
const input2 = new NumoraInput(container, {
  groupingStyle: 'lakh',
})

// Wan (East Asian, 123,4567)
const input3 = new NumoraInput(container, {
  groupingStyle: 'wan',
})

// None (1234567)
const input4 = new NumoraInput(container, {
  groupingStyle: 'none',
})`}
      </CodeBlock>

      <h2>When to format</h2>
      <p>
        The separators appear on every keystroke by default, or only on blur with{' '}
        <code>formatOn: 'blur'</code>. See{' '}
        <Link to="/docs/numora/features/format-on">Change vs blur</Link> for both modes.
      </p>

      <h2>Caret position</h2>
      <p>When the separators move, the caret stays between the same two digits:</p>
      <CursorLanes />
      <p>Without that, a production app looks like this:</p>
      <CursorJumpRecording />

      <h2>Separator skipping</h2>
      <ul>
        <li>
          Backspace and Delete jump over thousand separators, so you never delete one by hand.
        </li>
        <li>
          This applies with <code>formatOn: 'change'</code>, a thousand separator set and no text
          selected. In blur mode a focused field has no separators to skip.
        </li>
        <li>
          Two handlers share the work. <code>keydown</code> moves the cursor over the separator, and{' '}
          <code>beforeinput</code> deletes the digit. Mobile keyboards that send no usable{' '}
          <code>keydown</code> still work, because <code>beforeinput</code> then deletes the digit
          past the separator itself.
        </li>
      </ul>
      <BackspaceSkipFigure />
    </div>
  );
}
