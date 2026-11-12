import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { CORE_SIZE_GZIP } from '@/lib/constants/package';

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/vue';

const META_TITLE = 'Vue numeric input | Numora';
const META_DESCRIPTION = `Vue numeric input library with thousand separators, decimal limits, paste sanitization and cursor preservation. Use Numora in Vue 3 or Nuxt through a v-numora directive. It is a framework-agnostic vanilla package with zero dependencies, ${CORE_SIZE_GZIP} gzipped.`;

// Single source for the visible FAQ and the JSON-LD FAQPage. Backticks mark inline code.
const FAQ = [
  {
    question: 'What is the best Vue numeric input library?',
    answer: `Numora is framework-agnostic TypeScript, ${CORE_SIZE_GZIP} gzipped, with no runtime dependencies. In Vue you register a \`v-numora\` directive once, then write \`<input v-numora="opts" />\` anywhere.`,
  },
  {
    question: 'Is there a numora-vue package?',
    answer: 'No, and you do not need one. The `v-numora` directive is the entire Vue adapter.',
  },
  {
    question: 'Does Numora work with Nuxt 3 and SSR?',
    answer:
      'Yes. `NumoraInput` touches the DOM, so the `v-numora` directive only initializes in the `mounted` hook, which only runs in the browser. Nuxt renders the empty `<input>` on the server and Numora adopts it on hydration. You need no Nuxt-specific configuration.',
  },
  {
    question: 'How do I add thousand separators to a Vue number input?',
    answer:
      'Pass `groupingStyle: "thousand"` and `formatOn: "change"` inside the `v-numora` binding. Numora formats as the user types and keeps the cursor between the same two digits when it inserts a comma. `onValueChange` receives `{ value, formattedValue }`, where `value` is the raw value without separators, which you can store in a `ref`, Pinia, VeeValidate or FormKit.',
  },
  {
    question: 'Does it work with VeeValidate, FormKit or Pinia in Vue?',
    answer:
      'Yes. `onValueChange` receives `{ value, formattedValue }`, and `value` is the raw string. Pass it to VeeValidate, FormKit, Pinia or any other state library as you would a `v-model` value.',
  },
  {
    question: 'Does it support i18n (decimal commas, currency formatting) in Vue?',
    answer:
      "Yes. Set `decimalSeparator: ','` and `thousandSeparator: '.'` (or use the `locale` option) for European formats. The raw `value` is a plain dot-decimal string in every locale.",
  },
  {
    question: 'Why not v-model on a plain <input>?',
    answer:
      'A plain `v-model` has no thousand separators, decimal limits or paste sanitization, and you would have to write the cursor-positioning logic yourself. Numora handles all of it.',
  },
  {
    question: 'Can I animate digits in Vue?',
    answer:
      'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Vue component. Torph respects prefers-reduced-motion by default.',
  },
];

function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text
        .split('`')
        .map((part, i) => (i % 2 === 1 ? <code key={`${i}-${part}`}>{part}</code> : part))}
    </>
  );
}

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Vue numeric input: format numbers in Vue 3 with a v-numora directive',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: {
      '@type': 'Person',
      name: 'Kacper Szarkiewicz',
      url: 'https://x.com/sharqiewicz',
    },
    mentions: [
      {
        '@type': 'SoftwareSourceCode',
        name: 'Numora',
        url: 'https://numeric-input.com/',
      },
      { '@type': 'SoftwareSourceCode', name: 'Vue', url: 'https://vuejs.org/' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://numeric-input.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Numora',
        item: 'https://numeric-input.com/docs/numora',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Vue numeric input',
        item: PAGE_URL,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question.replaceAll('`', ''),
      acceptedAnswer: { '@type': 'Answer', text: answer.replaceAll('`', '') },
    })),
  },
];

export const Route = createFileRoute('/docs/numora/frameworks/vue')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'vue numeric input, vue 3 number input, vue input formatting, vue number format, vue input mask, nuxt numeric input, vue thousand separator, vue currency input, vue decimal input, v-numora directive, numora vue',
      },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: PAGE_URL }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(JSON_LD) }],
  }),
  component: VueIntegration,
});

function VueIntegration() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Vue numeric input</h1>
      <p>
        <strong className="font-numora">Numora</strong> is a precision-first{' '}
        <strong>Vue numeric input</strong> library. It handles thousand separators, decimal limits,
        paste sanitization, scientific-notation expansion and cursor preservation through a{' '}
        <code>v-numora</code> custom directive that mounts directly on an <code>&lt;input&gt;</code>
        . The vanilla package is framework-agnostic TypeScript, {CORE_SIZE_GZIP} gzipped, with zero
        runtime dependencies. The same engine works in Vue 3, Nuxt 3, VeeValidate, FormKit and
        Pinia, with no wrapper package.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash">{`pnpm add numora`}</CodeBlock>

      <h2>Vue 3 directive</h2>
      <p>
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code>{' '}
        element. A custom directive is the usual Vue 3 adapter. Add this helper to your project
        once, and every <code>&lt;input v-numora=&quot;opts&quot;&gt;</code> works.
      </p>

      <p>
        <code>src/directives/numora.ts</code>:
      </p>
      <CodeBlock language="ts">
        {`import type { Directive } from 'vue';
import { NumoraInput, type NumoraInputOptions } from 'numora';

export const vNumora: Directive<HTMLInputElement, NumoraInputOptions> = {
  mounted(el, binding) {
    new NumoraInput(el, binding.value ?? {});
    // No unmounted hook needed: listeners die with the <input> when Vue removes it.
  },
};`}
      </CodeBlock>

      <p>
        Register globally in <code>src/main.ts</code> (or import and declare locally in any{' '}
        <code>&lt;script setup&gt;</code>):
      </p>
      <CodeBlock language="ts">
        {`import { createApp } from 'vue';
import App from './App.vue';
import { vNumora } from './directives/numora';

createApp(App).directive('numora', vNumora).mount('#app');`}
      </CodeBlock>

      <p>
        Component <code>&lt;script setup lang=&quot;ts&quot;&gt;</code>:
      </p>
      <CodeBlock language="ts">
        {`import { ref } from 'vue';

const value = ref('');`}
      </CodeBlock>

      <p>
        Component <code>&lt;template&gt;</code>:
      </p>
      <CodeBlock language="html">
        {`<label>
  Amount
  <input
    v-numora="{
      formatOn: 'change',
      groupingStyle: 'thousand',
      decimalMaxLength: 2,
      onValueChange: ({ value: v }) => (value = v),
    }"
  />
</label>
<p>Raw value: {{ value }}</p>`}
      </CodeBlock>

      <p>
        Numora adopts the <code>&lt;input&gt;</code> and sets the attributes it needs (
        <code>type</code>, <code>inputmode</code>, <code>autocomplete</code> and others).{' '}
        <code>onValueChange</code> receives <code>{`{ value, formattedValue }`}</code>, where{' '}
        <code>value</code> is the raw string (see{' '}
        <Link to="/docs/numora/features/value-types">value types</Link>).{' '}
        <code>'change'</code> formats on every keystroke (see{' '}
        <Link to="/docs/numora/features/formatting">formatting</Link>).
      </p>

      <p>
        Read the value from <code>onValueChange</code>, not from <code>v-model</code>: the element's
        own
        <code>value</code> is the display string (<code>"1,234.56"</code>), while
        <code>onValueChange</code> gives you the raw value (<code>"1234.56"</code>).
      </p>

      <h2>Animated example: Numora + Torph in Vue 3</h2>
      <p>
        Stack a Torph <code>TextMorph</code> over a transparent-text <code>NumoraInput</code>. The{' '}
        <Link to="/docs/numora/integrations/torph">Torph integration</Link> explains the overlay and
        has the shared CSS and install steps. Below is the Vue 3 lifecycle and the scoped-style
        note.
      </p>
      <p>
        Script block (inside <code>&lt;script setup lang=&quot;ts&quot;&gt;</code>):
      </p>
      <CodeBlock language="ts">
        {`import { onBeforeUnmount, onMounted, ref } from 'vue';
import { NumoraInput } from 'numora';
import { TextMorph } from 'torph';

const display = ref<HTMLSpanElement | null>(null);
const host = ref<HTMLDivElement | null>(null);

let cleanup: (() => void) | null = null;

onMounted(() => {
  if (!display.value || !host.value) return;

  // SSR placeholder is a text node; Torph only animates element children.
  display.value.textContent = '';

  const morph = new TextMorph({
    element: display.value,
    ease: { stiffness: 400, damping: 30 },
  });
  morph.update('0');

  // 'change': onValueChange fires on every edit (in Blur mode also sync on focus/blur). Torph shows
  // the formatted string, so read formattedValue.
  const numora = new NumoraInput(host.value, {
    formatOn: 'change',
    groupingStyle: 'thousand',
    decimalMaxLength: 2,
    onValueChange: ({ formattedValue }) => morph.update(formattedValue || '0'),
  });
  const input = numora.element;
  input.setAttribute('aria-label', 'Amount');

  cleanup = () => {
    morph.destroy();
    input.remove();
  };
});

onBeforeUnmount(() => cleanup?.());`}
      </CodeBlock>

      <p>
        Template (inside <code>&lt;template&gt;</code>):
      </p>
      <CodeBlock language="html">
        {`<label class="numora-overlay">
  <span ref="display" class="numora-overlay-display" aria-hidden="true">0</span>
  <div ref="host" class="numora-overlay-host" />
</label>`}
      </CodeBlock>

      <p>
        Use the overlay CSS from the Torph page in <code>&lt;style scoped&gt;</code>. Wrap the
        selectors that target the runtime-created <code>&lt;input&gt;</code> in <code>:deep()</code>
        , because scoped styles cannot reach it otherwise:
      </p>
      <CodeBlock language="css">{`.numora-overlay-host :deep(input) { /* ... */ }`}</CodeBlock>

      <h2>FAQ</h2>
      {FAQ.map(({ question, answer }) => (
        <div key={question}>
          <h3>
            <InlineCode text={question} />
          </h3>
          <p>
            <InlineCode text={answer} />
          </p>
        </div>
      ))}
    </div>
  );
}
