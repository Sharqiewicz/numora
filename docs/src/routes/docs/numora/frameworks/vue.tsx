import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/vue'

const META_TITLE = 'Vue Numeric Input – Format Numbers in Vue 3 with Numora'
const META_DESCRIPTION = 'Vue numeric input library with thousand separators, decimal limits, paste sanitisation and cursor preservation. Drop Numora into Vue 3 or Nuxt with a tiny v-numora directive – framework-agnostic core, zero dependencies, 6.4 kb gzipped.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Vue Numeric Input – Format Numbers in Vue 3 with a v-numora Directive',
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
        name: 'What is the best Vue numeric input library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Numora is the recommended Vue 3 numeric input library: framework-agnostic vanilla TypeScript, 6.4 kb gzipped, zero runtime dependencies, with thousand separators, decimal limits, paste sanitisation and cursor preservation built in. In Vue you register a six-line v-numora custom directive once, then write <input v-numora="opts" /> anywhere – no wrapping container, no composable, no ref boilerplate.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I format a number input with thousand separators in Vue?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pass thousandStyle: ThousandStyle.Thousand inside the v-numora binding. Numora formats as the user types, keeps the caret stable through the inserted separator, and emits the raw separator-free string from onChange so your ref or Pinia store stays clean.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a numora-vue package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No – and you do not need one. Numora is a thin layer over <input>. A six-line v-numora directive is the entire Vue adapter; there is nothing a numora-vue package could meaningfully add.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Numora work with Nuxt 3 and SSR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. NumoraInput touches the DOM, so initialise it inside onMounted – that path only runs in the browser. Nuxt renders an empty host element on the server, and Numora mounts the formatted <input> on hydration. No Nuxt-specific configuration is required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it work with VeeValidate, FormKit or Pinia in Vue?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Numora\'s onChange emits the raw separator-free string – feed it into VeeValidate, FormKit, Pinia, or any other Vue state library exactly as you would a normal v-model value. The string-end-to-end design avoids parseFloat rounding errors in financial flows.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate digits in Vue?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Vue component and respects prefers-reduced-motion by default.',
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
      { name: 'keywords', content: 'vue numeric input, vue 3 number input, vue input formatting, vue number format, vue input mask, nuxt numeric input, vue thousand separator, vue currency input, vue decimal input, v-numora directive, numora vue' },
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
      <h1>Vue Numeric Input</h1>
      <p className="text-lg text-muted-foreground">
        <strong className="font-numora">Numora</strong> is a precision-first <strong>Vue numeric input</strong>{' '}
        library: thousand separators, decimal limits, paste sanitisation, scientific-notation expansion and
        cursor preservation – all driven by a six-line <code>v-numora</code> custom directive that mounts
        directly on an <code>&lt;input&gt;</code>. The core is framework-agnostic vanilla TypeScript,
        6.4 kb gzipped, with zero runtime dependencies – the same engine works inside Vue 3, Nuxt 3,
        VeeValidate, FormKit and Pinia without any wrapper package.
      </p>

      <h2>Install</h2>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2>Vue 3 directive</h2>
      <p>
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code> element. A
        custom directive is the idiomatic Vue 3 adapter – drop this helper into your project once and
        every <code>&lt;input v-numora=&quot;opts&quot;&gt;</code> works.
      </p>

      <p className="text-sm text-muted-foreground">
        <code>src/directives/numora.ts</code>:
      </p>
      <CodeBlock language="ts">
{`import type { Directive } from 'vue';
import { NumoraInput, type NumoraInputOptions } from 'numora';

export const vNumora: Directive<HTMLInputElement, NumoraInputOptions> = {
  mounted(el, binding) {
    new NumoraInput(el, binding.value ?? {});
    // No unmounted hook needed - listeners die with the <input> when Vue removes it.
  },
};`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Register globally in <code>src/main.ts</code> (or import + declare locally in any{' '}
        <code>&lt;script setup&gt;</code>):
      </p>
      <CodeBlock language="ts">
{`import { createApp } from 'vue';
import App from './App.vue';
import { vNumora } from './directives/numora';

createApp(App).directive('numora', vNumora).mount('#app');`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Component <code>&lt;script setup lang=&quot;ts&quot;&gt;</code>:
      </p>
      <CodeBlock language="ts">
{`import { ref } from 'vue';
import { ThousandStyle } from 'numora';

const value = ref('');`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Component <code>&lt;template&gt;</code>:
      </p>
      <CodeBlock language="html">
{`<label>
  Amount
  <input
    v-numora="{
      thousandStyle: ThousandStyle.Thousand,
      decimalMaxLength: 2,
      onChange: (v) => (value = v),
    }"
  />
</label>
<p>Raw value: {{ value }}</p>`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        The directive receives the <code>&lt;input&gt;</code> Vue renders and calls{' '}
        <code>new NumoraInput(el, binding.value)</code>. Numora adopts the element, forces the required
        attributes (<code>type</code>, <code>inputmode</code>, <code>spellcheck</code>,{' '}
        <code>autocomplete</code>, <code>pattern</code>), and emits the raw, separator-free string from{' '}
        <code>onChange</code> – safe to feed straight into a ref, Pinia store, or VeeValidate field.
      </p>

      <p className="text-sm text-muted-foreground">
        Because the <code>&lt;input&gt;</code> is yours, set <code>placeholder</code>,{' '}
        <code>aria-label</code>, <code>name</code> or any other attribute on it directly in the template.
      </p>

      <h2>Animated example: Numora + Torph in Vue 3</h2>
      <p>
        For animated digit transitions, stack a{' '}
        <a href="https://torph.lochie.dev" target="_blank" rel="noopener noreferrer">Torph</a>{' '}
        <code>TextMorph</code> on top of a transparent-text <code>NumoraInput</code>. The input owns the
        keyboard, undo and IME; Torph animates the visible characters. The{' '}
        <Link to="/docs/numora/integrations/torph">vanilla overlay guide</Link> covers the pattern in
        depth - below is the idiomatic Vue 3 adapter.
      </p>

      <CodeBlock language="bash">
{`pnpm add numora torph`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Script block (inside <code>&lt;script setup lang=&quot;ts&quot;&gt;</code>):
      </p>
      <CodeBlock language="ts">
{`import { onBeforeUnmount, onMounted, ref } from 'vue';
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';
import { TextMorph } from 'torph';

const display = ref<HTMLSpanElement | null>(null);
const host = ref<HTMLDivElement | null>(null);

let cleanup: (() => void) | null = null;

onMounted(() => {
  if (!display.value || !host.value) return;

  // SSR placeholder is a text node; Torph only animates element children.
  display.value.textContent = '';

  const numora = new NumoraInput(host.value, {
    formatOn: FormatOn.Change,
    thousandStyle: ThousandStyle.Thousand,
    decimalMaxLength: 2,
    thousandSeparator: ',',
  });
  const input = numora.getElement();

  const morph = new TextMorph({
    element: display.value,
    ease: { stiffness: 400, damping: 30 },
  });
  morph.update('0');

  const syncMorph = () => morph.update(numora.value || '0');
  // Numora writes the formatted value in beforeinput; sync after that handler runs.
  const scheduleSync = () => queueMicrotask(syncMorph);

  input.addEventListener('beforeinput', scheduleSync);
  input.addEventListener('input', syncMorph);

  cleanup = () => {
    input.removeEventListener('beforeinput', scheduleSync);
    input.removeEventListener('input', syncMorph);
  };
});

onBeforeUnmount(() => cleanup?.());`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Template (inside <code>&lt;template&gt;</code>):
      </p>
      <CodeBlock language="html">
{`<label class="numora-overlay">
  <span ref="display" class="numora-overlay-display" aria-hidden="true">0</span>
  <div ref="host" class="numora-overlay-host" />
</label>`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Styles (inside <code>&lt;style scoped&gt;</code>):
      </p>
      <CodeBlock language="css">
{`.numora-overlay {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 2.25rem/1 ui-monospace, SFMono-Regular, monospace;
  color: white;
}
.numora-overlay-display { pointer-events: none; white-space: pre; }
.numora-overlay-host { position: absolute; inset: 0; }

/* :deep(...) escapes Vue's scoped-style attribute so the rule can reach
   the <input> NumoraInput creates at runtime. */
.numora-overlay-host :deep(input) {
  width: 100%; height: 100%;
  margin: 0; padding: 0; border: 0;
  background: transparent; color: transparent; caret-color: white;
  outline: none; font: inherit;
}
.numora-overlay-host :deep(input::selection) { background: rgba(255, 255, 255, 0.25); }
.numora-overlay-host :deep(input::placeholder) { color: transparent; }`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        The <code>beforeinput</code> microtask + <code>input</code> listener combination keeps Torph in
        sync across typing, paste, undo and redo. Torph respects{' '}
        <code>prefers-reduced-motion</code> automatically.
      </p>

      <h2>FAQ</h2>

      <h3>Is there a numora-vue package?</h3>
      <p>
        No - and there does not need to be. Numora is intentionally a thin layer over the native{' '}
        <code>&lt;input&gt;</code>. A six-line <code>v-numora</code> directive is the entire Vue adapter.
      </p>

      <h3>Does Numora work with Nuxt 3 and SSR?</h3>
      <p>
        Yes. <code>NumoraInput</code> touches the DOM, so the <code>v-numora</code> directive only
        initialises in the <code>mounted</code> hook – that path only runs in the browser. Nuxt renders
        the empty <code>&lt;input&gt;</code> on the server and Numora adopts it on hydration. No
        Nuxt-specific configuration needed.
      </p>

      <h3>How do I add thousand separators to a Vue number input?</h3>
      <p>
        Pass <code>thousandStyle: ThousandStyle.Thousand</code> inside the <code>v-numora</code> binding.
        Numora formats as the user types, keeps the caret stable through the inserted comma, and emits
        the raw separator-free string from <code>onChange</code> – safe to feed into <code>ref</code>,
        Pinia, VeeValidate or FormKit.
      </p>

      <h3>Does it support i18n (decimal commas, currency formatting) in Vue?</h3>
      <p>
        Yes. Set <code>decimalSeparator: &apos;,&apos;</code> and{' '}
        <code>thousandSeparator: &apos;.&apos;</code> (or use the <code>locale</code> option) for European
        formats. Numora keeps the raw value as a string end-to-end, so currency math stays precise – no{' '}
        <code>parseFloat</code> rounding errors.
      </p>

      <h3>Why not <code>v-model</code> on a plain <code>&lt;input&gt;</code>?</h3>
      <p>
        Numora handles thousand separators, decimal limits, scientific notation, paste sanitisation,
        cursor preservation through formatting, and mobile keyboard hints (<code>inputmode=&quot;decimal&quot;</code>).
        Doing all of that on a plain <code>v-model</code> means re-implementing cursor-positioning logic
        by hand - that&apos;s the part Numora exists to solve.
      </p>

      <h2>Numora in other frameworks</h2>
      <p>
        Numora&apos;s core is framework-agnostic. The same vanilla{' '}
        <code>NumoraInput</code> class powers the numeric input across every modern UI framework:
      </p>
      <ul className="list-disc list-inside">
        <li><Link to="/docs/numora/frameworks/svelte">Svelte numeric input</Link> – <code>use:numora</code> action for Svelte and SvelteKit</li>
        <li><Link to="/docs/numora/frameworks/angular">Angular numeric input</Link> – standalone directive with <code>ControlValueAccessor</code></li>
        <li><Link to="/docs/numora/frameworks/solid">SolidJS numeric input</Link> – signal-bound <code>onMount</code> wrapper</li>
        <li><Link to="/docs/numora-react">React numeric input</Link> – drop-in <code>&lt;NumoraInput /&gt;</code> component (<code>numora-react</code>)</li>
      </ul>
    </div>
  )
}
