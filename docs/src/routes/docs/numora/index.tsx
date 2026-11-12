import { createFileRoute, Link } from '@tanstack/react-router';
import { CORE_SIZE_GZIP } from '@/lib/constants/package';

export const Route = createFileRoute('/docs/numora/')({
  head: () => ({
    meta: [
      { title: 'Numeric input library | Numora' },
      {
        name: 'description',
        content: `Get started with Numora, the zero-dependency TypeScript numeric input library. Attach it to any input element. Works with React, Vue, Svelte, Angular, and vanilla JS. ${CORE_SIZE_GZIP} gzipped.`,
      },
      { property: 'og:title', content: 'Numeric input library | Numora' },
      {
        property: 'og:description',
        content: `Get started with Numora, the zero-dependency TypeScript numeric input library. Attach it to any input element. Works with React, Vue, Svelte, Angular, and vanilla JS. ${CORE_SIZE_GZIP} gzipped.`,
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora' },
      { name: 'twitter:title', content: 'Numeric input library | Numora' },
      {
        name: 'twitter:description',
        content: `Get started with Numora, the zero-dependency TypeScript numeric input library. Attach it to any input element. Works with React, Vue, Svelte, Angular, and vanilla JS. ${CORE_SIZE_GZIP} gzipped.`,
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'Numora',
            codeRepository: 'https://github.com/sharqiewicz/numora',
            programmingLanguage: 'TypeScript',
            runtimePlatform: 'Browser',
            url: 'https://numeric-input.com/docs/numora',
            description: `Zero-dependency TypeScript numeric input library. Precision-first, framework-agnostic, ${CORE_SIZE_GZIP} gzipped.`,
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
      <h1>Numeric input library</h1>
      <p>
        <strong className="font-numora">Numora</strong> is a zero-dependency TypeScript library that
        turns any <code>{'<input>'}</code> element into a precision numeric input. Unlike{' '}
        <code>{'<input type="number">'}</code>, Numora uses <code>type="text"</code>, so you decide
        which characters can be typed, pasted and shown.
      </p>

      <h2>What you get</h2>
      <ul>
        <li>
          <strong>Zero dependencies, {CORE_SIZE_GZIP} gzipped.</strong>
        </li>
        <li>
          <strong>String-only values.</strong> Numora never converts to <code>Number</code>, so
          amounts like <code>0.1 + 0.2</code> don't pick up IEEE 754 rounding errors.
        </li>
        <li>
          <strong>Three grouping styles.</strong> Thousand (1,234,567), Lakh (12,34,567) and Wan
          (123,4567).
        </li>
      </ul>

      <p>
        See <Link to="/docs/numora/installation">Installation</Link> for the vanilla JS API and
        options. <Link to="/docs/numora-react">numora-react</Link> is built on the same core.
      </p>

      <hr />
      <h2>Use Numora in your framework</h2>
      <ul>
        <li>
          <Link to="/docs/numora/frameworks/svelte">
            <strong>Svelte numeric input</strong>
          </Link>
          . A 10-line <code>use:numora</code> action for Svelte 5 and SvelteKit (SSR-safe).
        </li>
        <li>
          <Link to="/docs/numora/frameworks/vue">
            <strong>Vue numeric input</strong>
          </Link>
          . A Vue 3 composable bound to a template <code>ref</code>, or a <code>v-numora</code>{' '}
          directive. Works with Nuxt 3, VeeValidate, FormKit and Pinia.
        </li>
        <li>
          <Link to="/docs/numora/frameworks/angular">
            <strong>Angular numeric input</strong>
          </Link>
          . A standalone directive that works with <code>ControlValueAccessor</code> and{' '}
          <code>FormControl&lt;string&gt;</code> for Reactive Forms.
        </li>
        <li>
          <Link to="/docs/numora/frameworks/solid">
            <strong>SolidJS numeric input</strong>
          </Link>
          . An <code>onMount</code> wrapper that writes the raw value into a{' '}
          <code>createSignal</code>. Works with SolidStart.
        </li>
        <li>
          <Link to="/docs/numora-react">
            <strong>React numeric input</strong>
          </Link>
          . The <code>numora-react</code> package has a drop-in <code>&lt;NumoraInput /&gt;</code>{' '}
          component with TypeScript types and React Hook Form support.
        </li>
      </ul>
    </div>
  );
}
