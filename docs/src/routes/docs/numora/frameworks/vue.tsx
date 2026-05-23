import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/vue'

const META_TITLE = 'Numora + Vue - Numeric Input Library for Vue 3'
const META_DESCRIPTION = 'Use Numora in Vue 3 with a tiny composable or custom directive. Format numbers as you type, thousand separators, decimal limits, string precision. Framework-agnostic core, zero dependencies, 6.4kb gzipped.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Numora + Vue - Numeric input formatting with a Vue 3 composable',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      { '@type': 'SoftwareSourceCode', name: 'Numora', url: 'https://numeric-input.com/' },
      { '@type': 'SoftwareSourceCode', name: 'Vue', url: 'https://vuejs.org/' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
      { '@type': 'ListItem', position: 2, name: 'Numora', item: 'https://numeric-input.com/docs/numora' },
      { '@type': 'ListItem', position: 3, name: 'Vue', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Numora work with Vue?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The numora core package is framework-agnostic vanilla TypeScript. In Vue 3 you wrap NumoraInput in a small composable that runs in onMounted and cleans up in onUnmounted.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a numora-vue package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No - and you do not need one. Numora is a thin layer over <input>. A short composable or custom directive is the entire Vue adapter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate digits in Vue?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Vue component.',
        },
      },
    ],
  },
]

export const Route = createFileRoute('/docs/numora/frameworks/vue')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'Numora Vue, Vue numeric input, Vue 3 number input, Vue input formatting, framework-agnostic numeric input, Vue composable numora, Vue directive numora' },
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
})

function VueIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Numora + Vue</h1>
      <p className="text-lg text-muted-foreground">
        In Vue 3, Numora has two equally idiomatic shapes: a <code>&lt;script setup&gt;</code> composable
        bound to a template <code>ref</code>, or a <code>v-numora</code> directive if you want it
        declarative. Both are short - Numora&apos;s core is framework-agnostic vanilla TypeScript, and{' '}
        <code>NumoraInput</code> already does the heavy lifting (formatting, paste sanitisation, cursor
        preservation). This page shows the composable; the directive form is two extra lines.
      </p>

      <h2>Install</h2>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2>Vue 3 composable</h2>
      <p>
        <code>NumoraInput</code> takes a container element and creates a properly-wired{' '}
        <code>&lt;input&gt;</code> inside it. A composable bound to a template ref is the idiomatic Vue 3
        adapter:
      </p>

      <CodeBlock language="vue">
{`<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NumoraInput, ThousandStyle } from 'numora';

const host = ref<HTMLDivElement | null>(null);
const value = ref('');

onMounted(() => {
  if (!host.value) return;
  new NumoraInput(host.value, {
    thousandStyle: ThousandStyle.Thousand,
    decimalMaxLength: 2,
    onChange: (v) => (value.value = v),
  });
});
</script>

<template>
  <label>
    Amount
    <div ref="host" />
  </label>
  <p>Raw value: {{ value }}</p>
</template>`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        <code>onChange</code> receives the raw, separator-free string - feed it straight into your reactive
        state, Pinia store, or form library. Vue automatically removes the host <code>div</code> on unmount;
        the created <code>&lt;input&gt;</code> goes with it.
      </p>

      <p className="text-sm text-muted-foreground">
        The <code>&lt;label&gt;</code> associates with the <code>&lt;input&gt;</code> Numora creates on
        mount - modern browsers handle the late-arriving descendant correctly. To set attributes like{' '}
        <code>aria-label</code> programmatically, hold the <code>NumoraInput</code> instance in a{' '}
        <code>ref</code> and call <code>instance.getElement().setAttribute(&apos;aria-label&apos;, &apos;Amount&apos;)</code>.
      </p>

      <h2>Animate digits with Torph</h2>
      <p>
        For animated digit transitions, the{' '}
        <Link to="/docs/numora/integrations/torph">Torph + Numora overlay</Link>{' '}
        is framework-agnostic - the same vanilla pattern slots into a Vue component. Render the overlay
        markup in your template and run the bridge code in <code>onMounted</code>. Torph respects{' '}
        <code>prefers-reduced-motion</code> automatically.
      </p>

      <h2>FAQ</h2>

      <h3>Is there a numora-vue package?</h3>
      <p>
        No - and there does not need to be. Numora is intentionally a thin layer over the native{' '}
        <code>&lt;input&gt;</code>. A short composable (or a custom directive, if you prefer{' '}
        <code>v-numora</code>) is the entire Vue adapter.
      </p>

      <h3>Does it work with Nuxt?</h3>
      <p>
        Yes. <code>NumoraInput</code> touches the DOM, so initialise it inside <code>onMounted</code> -
        that path only runs in the browser. No SSR work beyond rendering an empty host element on the
        server.
      </p>

      <h3>Why not <code>v-model</code> on a plain <code>&lt;input&gt;</code>?</h3>
      <p>
        Numora handles thousand separators, decimal limits, scientific notation, paste sanitisation,
        cursor preservation through formatting, and mobile keyboard hints (<code>inputmode=&quot;decimal&quot;</code>).
        Doing all of that on a plain <code>v-model</code> means re-implementing cursor-positioning logic
        by hand - that&apos;s the part Numora exists to solve.
      </p>
    </div>
  )
}
