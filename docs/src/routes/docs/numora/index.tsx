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
          . A short <code>use:numora</code> action for Svelte 5 and SvelteKit (SSR-safe).
        </li>
        <li>
          <Link to="/docs/numora/frameworks/vue">
            <strong>Vue numeric input</strong>
          </Link>
          . A <code>v-numora</code> directive for Vue 3. Works with Nuxt 3, VeeValidate, FormKit and
          Pinia.
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
          . A <code>use:numora</code> directive that writes the raw value into a{' '}
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
