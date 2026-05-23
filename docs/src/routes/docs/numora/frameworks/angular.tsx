import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/angular'

const META_TITLE = 'Numora + Angular - Numeric Input Library for Angular'
const META_DESCRIPTION = 'Use Numora in Angular with a tiny standalone directive. Format numbers as you type, thousand separators, decimal limits, string precision. Framework-agnostic core, zero dependencies, 6.4kb gzipped.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Numora + Angular - Numeric input formatting with a standalone directive',
    description: META_DESCRIPTION,
    url: PAGE_URL,
    author: { '@type': 'Person', name: 'Kacper Szarkiewicz', url: 'https://x.com/sharqiewicz' },
    mentions: [
      { '@type': 'SoftwareSourceCode', name: 'Numora', url: 'https://numeric-input.com/' },
      { '@type': 'SoftwareSourceCode', name: 'Angular', url: 'https://angular.dev/' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
      { '@type': 'ListItem', position: 2, name: 'Numora', item: 'https://numeric-input.com/docs/numora' },
      { '@type': 'ListItem', position: 3, name: 'Angular', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Numora work with Angular?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The numora core package is framework-agnostic vanilla TypeScript. In Angular you wrap NumoraInput in a small standalone directive that initialises it in ngOnInit and tears down in ngOnDestroy.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a numora-angular package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No - and you do not need one. Numora is a thin layer over <input>. A short standalone directive is the entire Angular adapter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate digits in Angular?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Angular component template.',
        },
      },
    ],
  },
]

export const Route = createFileRoute('/docs/numora/frameworks/angular')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      { name: 'keywords', content: 'Numora Angular, Angular numeric input, Angular number input, Angular input formatting, framework-agnostic numeric input, Angular directive numora' },
      { property: 'og:title', content: META_TITLE },
      { property: 'og:description', content: META_DESCRIPTION },
      { property: 'og:url', content: PAGE_URL },
      { name: 'twitter:title', content: META_TITLE },
      { name: 'twitter:description', content: META_DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: PAGE_URL }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(JSON_LD) }],
  }),
  component: AngularIntegration,
})

function AngularIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Numora + Angular</h1>
      <p className="text-lg text-muted-foreground">
        Angular standalone directives map cleanly onto <code>NumoraInput</code>&apos;s lifecycle:{' '}
        <code>ngOnInit</code> to instantiate, <code>ngOnDestroy</code> (or the host removal) to tear down.
        Because Numora&apos;s value is a string end-to-end, the directive composes with{' '}
        <code>ControlValueAccessor</code> without any number-coercion gymnastics - a{' '}
        <code>FormControl&lt;string&gt;</code> is the right type. No <code>numora-angular</code>{' '}
        wrapper required.
      </p>

      <h2>Install</h2>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2>Standalone directive</h2>
      <p>
        <code>NumoraInput</code> takes a container element and creates a properly-wired{' '}
        <code>&lt;input&gt;</code> inside it. An Angular directive bound to a host element is the
        idiomatic way to drive that lifecycle:
      </p>

      <CodeBlock language="ts">
{`import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { NumoraInput, ThousandStyle, type NumoraInputOptions } from 'numora';

@Directive({
  selector: '[numora]',
  standalone: true,
})
export class NumoraDirective implements OnInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input('numora') options: NumoraInputOptions = {};

  ngOnInit(): void {
    new NumoraInput(this.el.nativeElement, this.options);
  }
}`}
      </CodeBlock>

      <p>Use it on any host element:</p>

      <CodeBlock language="ts">
{`import { Component, signal } from '@angular/core';
import { NumoraDirective } from './numora.directive';
import { ThousandStyle } from 'numora';

@Component({
  selector: 'app-amount',
  standalone: true,
  imports: [NumoraDirective],
  template: \`
    <label>
      Amount
      <div
        [numora]="{
          thousandStyle: ThousandStyle.Thousand,
          decimalMaxLength: 2,
          onChange: handleChange,
        }"
      ></div>
    </label>
    <p>Raw value: {{ value() }}</p>
  \`,
})
export class AmountComponent {
  protected readonly ThousandStyle = ThousandStyle;
  protected readonly value = signal('');
  protected readonly handleChange = (v: string) => this.value.set(v);
}`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        <code>onChange</code> receives the raw, separator-free string. Feed it into a signal, a Reactive
        Forms control, or whatever state layer you use. Angular removes the host element on teardown -
        the created <code>&lt;input&gt;</code> goes with it.
      </p>

      <p className="text-sm text-muted-foreground">
        The <code>&lt;label&gt;</code> associates with the <code>&lt;input&gt;</code> Numora creates on
        mount - modern browsers handle the late-arriving descendant correctly. To set attributes like{' '}
        <code>aria-label</code> programmatically, store the <code>NumoraInput</code> instance on the
        directive and call <code>this.instance.getElement().setAttribute(&apos;aria-label&apos;, &apos;Amount&apos;)</code>{' '}
        after construction.
      </p>

      <h2>Animate digits with Torph</h2>
      <p>
        For animated digit transitions, the{' '}
        <Link to="/docs/numora/integrations/torph">Torph + Numora overlay</Link>{' '}
        is framework-agnostic. Render the overlay markup in your component template and run the bridge
        code in <code>ngOnInit</code> (or extend the directive above). Torph respects{' '}
        <code>prefers-reduced-motion</code> automatically.
      </p>

      <h2>FAQ</h2>

      <h3>Is there a numora-angular package?</h3>
      <p>
        No. Numora is intentionally a thin layer over the native <code>&lt;input&gt;</code>. A short
        standalone directive is the entire Angular adapter.
      </p>

      <h3>Does it integrate with Reactive Forms?</h3>
      <p>
        Yes - extend the directive to implement <code>ControlValueAccessor</code> and forward Numora&apos;s{' '}
        <code>onChange</code> to the registered <code>onChange</code> callback. Numora&apos;s raw value is
        a string, which matches what <code>FormControl</code> stores.
      </p>

      <h3>Why not a native <code>&lt;input type=&quot;number&quot;&gt;</code>?</h3>
      <p>
        Native number inputs lose precision (IEEE 754), have inconsistent mobile keyboards, do not format
        thousand separators, and break paste sanitisation. Numora keeps the value as a string throughout
        and handles all of the above.
      </p>
    </div>
  )
}
