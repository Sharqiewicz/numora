import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/angular'

const META_TITLE = 'Angular Numeric Input – Format Numbers in Angular with Numora'
const META_DESCRIPTION = 'Angular numeric input library with thousand separators, decimal limits, paste sanitisation and cursor preservation. Drop Numora into Angular with a standalone directive that composes with Reactive Forms ControlValueAccessor – framework-agnostic core, zero dependencies, 6.4 kb gzipped.'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Angular Numeric Input – Format Numbers in Angular with a Standalone Directive',
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
        name: 'What is the best Angular numeric input library?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Numora is the recommended Angular numeric input library: framework-agnostic vanilla TypeScript, 6.4 kb gzipped, zero runtime dependencies, with thousand separators, decimal limits, paste sanitisation and cursor preservation built in. In Angular you wrap NumoraInput in a standalone directive that composes cleanly with ControlValueAccessor and Reactive Forms.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I add thousand separators to an Angular number input?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pass thousandStyle: ThousandStyle.Thousand through the directive\'s @Input. Numora formats as the user types, repositions the caret through the inserted comma, and emits the raw separator-free string from onChange – feed it straight into a signal or FormControl<string>.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a numora-angular package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No – and you do not need one. Numora is a thin layer over <input>. A short standalone directive is the entire Angular adapter; there is nothing a numora-angular package could meaningfully add.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Numora integrate with Angular Reactive Forms?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes – the NumoraDirective implements ControlValueAccessor out of the box, so <input numora> drops straight into [(ngModel)] and [formControl] with no extra wiring. Numora\'s raw value is a string, which matches what FormControl stores – no number-coercion gymnastics, no IEEE 754 rounding errors on currency amounts.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it work with Angular Universal SSR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. NumoraInput touches the DOM, so initialise it inside ngOnInit on the browser platform (guard with isPlatformBrowser if you target the server). Angular Universal renders an empty host element on the server, and Numora mounts the formatted <input> on hydration.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I animate digits in Angular?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Angular component template and respects prefers-reduced-motion by default.',
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
      { name: 'keywords', content: 'angular numeric input, angular number input, angular input formatting, angular number format, angular input mask, angular currency input, angular thousand separator, angular decimal input, angular reactive forms numeric, angular control value accessor, numora angular' },
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
      <h1>Angular Numeric Input</h1>
      <p className="text-lg text-muted-foreground">
        <strong className="font-numora">Numora</strong> is a precision-first <strong>Angular numeric input</strong>{' '}
        library: thousand separators, decimal limits, paste sanitisation, scientific-notation expansion and
        cursor preservation – wrapped in a standalone directive that maps cleanly onto{' '}
        <code>ngOnInit</code> / <code>ngOnDestroy</code>. Because Numora&apos;s value is a string
        end-to-end, the directive composes with <code>ControlValueAccessor</code> and{' '}
        <code>FormControl&lt;string&gt;</code> without any number-coercion gymnastics – ideal for currency
        and DeFi flows that cannot tolerate IEEE 754 rounding. No <code>numora-angular</code> wrapper, 6.4 kb
        gzipped, zero runtime dependencies.
      </p>

      <h2>Install</h2>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora`}
      </CodeBlock>

      <h2>Standalone directive with ControlValueAccessor</h2>
      <p>
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code> element.
        Implementing Angular&apos;s <code>ControlValueAccessor</code> on the directive lets the same{' '}
        <code>&lt;input numora&gt;</code> plug into <code>[(ngModel)]</code> and Reactive Forms with no
        extra glue:
      </p>

      <p className="text-sm text-muted-foreground">
        <code>src/app/numora.directive.ts</code>:
      </p>
      <CodeBlock language="ts">
{`import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NumoraInput, type NumoraInputOptions } from 'numora';

@Directive({
  selector: 'input[numora]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumoraDirective),
      multi: true,
    },
  ],
})
export class NumoraDirective implements ControlValueAccessor, OnInit {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private instance!: NumoraInput;
  private pendingValue: string | null = null;
  private onChangeCb: (value: string) => void = () => {};
  private onTouchedCb: () => void = () => {};

  @Input('numora') options: NumoraInputOptions = {};

  ngOnInit(): void {
    this.instance = new NumoraInput(this.el.nativeElement, {
      ...this.options,
      onChange: (raw: string) => {
        this.onChangeCb(raw);
        this.options.onChange?.(raw);
      },
    });
    if (this.pendingValue !== null) {
      this.instance.setValue(this.pendingValue);
      this.pendingValue = null;
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouchedCb();
  }

  writeValue(value: string | null): void {
    const next = value ?? '';
    if (this.instance) {
      this.instance.setValue(next);
    } else {
      this.pendingValue = next;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeCb = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCb = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (!this.instance) return;
    isDisabled ? this.instance.disable() : this.instance.enable();
  }
}`}
      </CodeBlock>

      <p>Use it directly on any <code>&lt;input&gt;</code>:</p>

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
      <input
        [numora]="{
          thousandStyle: ThousandStyle.Thousand,
          decimalMaxLength: 2,
          onChange: handleChange,
        }"
      />
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

      <p>Or plug it into Reactive Forms – the raw string flows through <code>FormControl</code>:</p>

      <CodeBlock language="ts">
{`import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NumoraDirective } from './numora.directive';
import { ThousandStyle } from 'numora';

@Component({
  selector: 'app-amount-form',
  standalone: true,
  imports: [NumoraDirective, ReactiveFormsModule],
  template: \`
    <label>
      Amount
      <input
        [formControl]="amount"
        [numora]="{ thousandStyle: ThousandStyle.Thousand, decimalMaxLength: 2 }"
      />
    </label>
    <p>Raw value: {{ amount.value }}</p>
  \`,
})
export class AmountFormComponent {
  protected readonly ThousandStyle = ThousandStyle;
  protected readonly amount = new FormControl('0', { nonNullable: true });
}`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Numora adopts the <code>&lt;input&gt;</code> and forces the required attributes
        (<code>type</code>, <code>inputmode</code>, <code>spellcheck</code>, <code>autocomplete</code>,{' '}
        <code>pattern</code>). The <code>ControlValueAccessor</code> bridge means{' '}
        <code>writeValue</code> calls Numora&apos;s <code>setValue</code>, <code>registerOnChange</code>{' '}
        wires the raw string back into the form control, and <code>setDisabledState</code> toggles{' '}
        Numora&apos;s <code>disable()</code> / <code>enable()</code> – everything Angular Forms expects.
      </p>

      <p className="text-sm text-muted-foreground">
        Because the <code>&lt;input&gt;</code> is yours, set <code>placeholder</code>,{' '}
        <code>aria-label</code>, <code>name</code> or any other attribute on it directly in the template.
      </p>

      <h2>Animated example: Numora + Torph in Angular</h2>
      <p>
        For animated digit transitions, stack a{' '}
        <a href="https://torph.lochie.dev" target="_blank" rel="noopener noreferrer">Torph</a>{' '}
        <code>TextMorph</code> on top of a transparent-text <code>NumoraInput</code>. The input owns the
        keyboard, undo and IME; Torph animates the visible characters. The{' '}
        <Link to="/docs/numora/integrations/torph">vanilla overlay guide</Link> covers the pattern in
        depth - below is the idiomatic Angular standalone component.
      </p>

      <CodeBlock language="bash">
{`pnpm add numora torph`}
      </CodeBlock>

      <CodeBlock language="ts">
{`import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';
import { TextMorph } from 'torph';

@Component({
  selector: 'app-numora-overlay',
  standalone: true,
  encapsulation: ViewEncapsulation.None, // Numora's <input> is created at runtime
  template: \`
    <label class="numora-overlay">
      <span #display class="numora-overlay-display" aria-hidden="true">0</span>
      <div #host class="numora-overlay-host"></div>
    </label>
  \`,
  styles: [\`
    .numora-overlay {
      position: relative;
      display: inline-flex;
      align-items: center;
      font: 2.25rem/1 ui-monospace, SFMono-Regular, monospace;
      color: white;
    }
    .numora-overlay-display { pointer-events: none; white-space: pre; }
    .numora-overlay-host { position: absolute; inset: 0; }
    .numora-overlay-host input {
      width: 100%; height: 100%;
      margin: 0; padding: 0; border: 0;
      background: transparent; color: transparent; caret-color: white;
      outline: none; font: inherit;
    }
    .numora-overlay-host input::selection { background: rgba(255, 255, 255, 0.25); }
    .numora-overlay-host input::placeholder { color: transparent; }
  \`],
})
export class NumoraOverlayComponent implements OnInit, OnDestroy {
  @ViewChild('display', { static: true }) display!: ElementRef<HTMLSpanElement>;
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private numora!: NumoraInput;
  private input!: HTMLInputElement;
  private syncMorph!: () => void;
  private scheduleSync!: () => void;

  ngOnInit(): void {
    // SSR placeholder is a text node; Torph only animates element children.
    this.display.nativeElement.textContent = '';

    this.numora = new NumoraInput(this.host.nativeElement, {
      formatOn: FormatOn.Change,
      thousandStyle: ThousandStyle.Thousand,
      decimalMaxLength: 2,
      thousandSeparator: ',',
    });
    this.input = this.numora.getElement();

    const morph = new TextMorph({
      element: this.display.nativeElement,
      ease: { stiffness: 400, damping: 30 },
    });
    morph.update('0');

    this.syncMorph = () => morph.update(this.numora.value || '0');
    // Numora writes the formatted value in beforeinput; sync after that handler runs.
    this.scheduleSync = () => queueMicrotask(this.syncMorph);

    this.input.addEventListener('beforeinput', this.scheduleSync);
    this.input.addEventListener('input', this.syncMorph);
  }

  ngOnDestroy(): void {
    this.input?.removeEventListener('beforeinput', this.scheduleSync);
    this.input?.removeEventListener('input', this.syncMorph);
  }
}`}
      </CodeBlock>

      <p className="text-sm text-muted-foreground">
        Note <code>encapsulation: ViewEncapsulation.None</code> - Numora creates the{' '}
        <code>&lt;input&gt;</code> at runtime, so Angular&apos;s default shadow-DOM-style attribute
        scoping can&apos;t reach it. The <code>beforeinput</code> microtask + <code>input</code>{' '}
        listener combination keeps Torph in sync across typing, paste, undo and redo. Torph respects{' '}
        <code>prefers-reduced-motion</code> automatically.
      </p>

      <h2>FAQ</h2>

      <h3>Is there a numora-angular package?</h3>
      <p>
        No. Numora is intentionally a thin layer over the native <code>&lt;input&gt;</code>. A short
        standalone directive is the entire Angular adapter.
      </p>

      <h3>Does Numora integrate with Angular Reactive Forms?</h3>
      <p>
        Yes – the <code>NumoraDirective</code> above implements <code>ControlValueAccessor</code> out of
        the box, so the same <code>&lt;input numora&gt;</code> works with <code>[(ngModel)]</code> and{' '}
        <code>[formControl]</code> with no extra wiring. Numora&apos;s raw value is a string, which
        matches what <code>FormControl</code> stores – no number-coercion gymnastics, no IEEE 754
        rounding errors on currency amounts.
      </p>

      <h3>How do I add thousand separators to an Angular number input?</h3>
      <p>
        Pass <code>thousandStyle: ThousandStyle.Thousand</code> through the directive&apos;s{' '}
        <code>@Input()</code>. Numora formats as the user types, keeps the caret stable through the
        inserted comma, and emits the raw separator-free string from <code>onChange</code> - feed it into
        a signal or <code>FormControl&lt;string&gt;</code>.
      </p>

      <h3>Does it work with Angular Universal SSR?</h3>
      <p>
        Yes. <code>NumoraInput</code> touches the DOM, so initialise it in <code>ngOnInit</code> on the
        browser platform (guard with <code>isPlatformBrowser</code> if you target the server). Universal
        renders an empty host element on the server, Numora mounts on hydration.
      </p>

      <h3>Why not a native <code>&lt;input type=&quot;number&quot;&gt;</code>?</h3>
      <p>
        Native number inputs lose precision (IEEE 754), have inconsistent mobile keyboards, do not format
        thousand separators, and break paste sanitisation. Numora keeps the value as a string throughout
        and handles all of the above.
      </p>

      <h2>Numora in other frameworks</h2>
      <p>
        Numora&apos;s core is framework-agnostic. The same vanilla{' '}
        <code>NumoraInput</code> class powers the numeric input across every modern UI framework:
      </p>
      <ul className="list-disc list-inside">
        <li><Link to="/docs/numora/frameworks/svelte">Svelte numeric input</Link> – <code>use:numora</code> action for Svelte and SvelteKit</li>
        <li><Link to="/docs/numora/frameworks/vue">Vue numeric input</Link> – Vue 3 <code>v-numora</code> custom directive</li>
        <li><Link to="/docs/numora/frameworks/solid">SolidJS numeric input</Link> – signal-bound <code>onMount</code> wrapper</li>
        <li><Link to="/docs/numora-react">React numeric input</Link> – drop-in <code>&lt;NumoraInput /&gt;</code> component (<code>numora-react</code>)</li>
      </ul>
    </div>
  )
}
