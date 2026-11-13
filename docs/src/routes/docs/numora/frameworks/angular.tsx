import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { CORE_SIZE_GZIP } from '@/lib/constants/package';

const PAGE_URL = 'https://numeric-input.com/docs/numora/frameworks/angular';

const META_TITLE = 'Angular numeric input | Numora';
const META_DESCRIPTION = `Angular numeric input library with thousand separators, decimal limits, paste sanitization and cursor preservation. Use Numora in Angular through a standalone directive that implements ControlValueAccessor for Reactive Forms. It is a framework-agnostic vanilla package with zero dependencies, ${CORE_SIZE_GZIP} gzipped.`;

// Single source for the visible FAQ and the JSON-LD FAQPage. Backticks mark inline code.
const FAQ = [
  {
    question: 'What is the best Angular numeric input library?',
    answer: `Numora is framework-agnostic TypeScript, ${CORE_SIZE_GZIP} gzipped, with no runtime dependencies. In Angular you wrap \`NumoraInput\` in a standalone directive that implements \`ControlValueAccessor\`, so it works with Reactive Forms.`,
  },
  {
    question: 'How do I add thousand separators to an Angular number input?',
    answer:
      'Nothing to configure: grouping on every keystroke is the default. Numora formats as the user types and keeps the cursor between the same two digits when it inserts a comma. `onValueChange` receives `{ value, formattedValue }`, where `value` is the raw value without separators. You can write it straight into a signal or a `FormControl<string>`.',
  },
  {
    question: 'Is there a numora-angular package?',
    answer: 'No, and you do not need one. The standalone directive is the entire Angular adapter.',
  },
  {
    question: 'Does Numora integrate with Angular Reactive Forms?',
    answer:
      'Yes. The `NumoraDirective` implements `ControlValueAccessor`, so `<input numora>` works with `[formControl]` and `[(ngModel)]` (import `FormsModule`). The raw value is a string, which matches what `FormControl<string>` stores, so currency amounts never go through floating-point numbers.',
  },
  {
    question: 'Does it work with Angular SSR?',
    answer:
      'Yes. `NumoraInput` touches the DOM, so initialize it inside `ngOnInit` and guard with `isPlatformBrowser` if you target the server. Angular renders the empty `<input>` on the server and Numora adopts it in the browser.',
  },
  {
    question: 'Can I animate digits in Angular?',
    answer:
      'Yes. The Torph + Numora overlay pattern is vanilla DOM, so it works inside any Angular component template and Torph respects prefers-reduced-motion by default.',
  },
  {
    question: 'Why not use a native number input?',
    answer:
      'Native `type="number"` has no thousand separators or decimal limit, and its value is a floating-point number. Numora keeps the value as a string and preserves the cursor while formatting.',
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
    headline: 'Angular numeric input: format numbers in Angular with a standalone directive',
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
      {
        '@type': 'SoftwareSourceCode',
        name: 'Angular',
        url: 'https://angular.dev/',
      },
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
        name: 'Angular numeric input',
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

export const Route = createFileRoute('/docs/numora/frameworks/angular')({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: 'description', content: META_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'angular numeric input, angular number input, angular input formatting, angular number format, angular input mask, angular currency input, angular thousand separator, angular decimal input, angular reactive forms numeric, angular control value accessor, numora angular',
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
  component: AngularIntegration,
});

function AngularIntegration() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Angular numeric input</h1>
      <p>
        <strong className="font-numora">Numora</strong> is a precision-first{' '}
        <strong>Angular numeric input</strong> library. It handles thousand separators, decimal
        limits, paste sanitization, scientific-notation expansion and cursor preservation in a
        standalone directive. Numora&apos;s value is a string end to end, so the directive works
        with <code>ControlValueAccessor</code> and <code>FormControl&lt;string&gt;</code> directly,
        and currency amounts never pass through IEEE 754 floating-point numbers. You need no{' '}
        <code>numora-angular</code> wrapper. The package is {CORE_SIZE_GZIP} gzipped with zero
        runtime dependencies.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash">{`pnpm add numora`}</CodeBlock>

      <h2>Standalone directive with ControlValueAccessor</h2>
      <p>
        <code>NumoraInput</code> attaches directly to an existing <code>&lt;input&gt;</code>{' '}
        element. Implementing Angular&apos;s <code>ControlValueAccessor</code> on the directive lets
        the same <code>&lt;input numora&gt;</code> work with <code>[(ngModel)]</code> and Reactive
        Forms:
      </p>

      <p>
        <code>src/app/numora.directive.ts</code>:
      </p>
      <CodeBlock language="ts">
        {`import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
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
export class NumoraDirective implements ControlValueAccessor, OnInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private instance!: NumoraInput;
  private pendingValue: string | null = null;
  private onChangeCb: (value: string) => void = () => {};
  private onTouchedCb: () => void = () => {};

  // Read once in ngOnInit. Later changes to the binding are not applied.
  @Input('numora') options: NumoraInputOptions = {};

  ngOnInit(): void {
    // NumoraInput touches the DOM, so skip it during server rendering.
    if (!isPlatformBrowser(this.platformId)) return;

    this.instance = new NumoraInput(this.el.nativeElement, {
      ...this.options,
      // The form control stores the raw string, so forward the raw \`value\`.
      onValueChange: (values) => {
        this.onChangeCb(values.value);
        this.options.onValueChange?.(values);
      },
    });
    if (this.pendingValue !== null) {
      this.instance.setValue(this.pendingValue);
      this.pendingValue = null;
    }
  }

  ngOnDestroy(): void {
    // Removes Numora's listeners from the adopted <input>.
    this.instance?.destroy();
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
    // Set on the element itself: Angular can call this before ngOnInit creates the instance.
    this.el.nativeElement.disabled = isDisabled;
  }
}`}
      </CodeBlock>

      <p>
        Use it directly on any <code>&lt;input&gt;</code>:
      </p>

      <CodeBlock language="ts">
        {`import { Component, signal } from '@angular/core';
import { NumoraDirective } from './numora.directive';

@Component({
  selector: 'app-amount',
  standalone: true,
  imports: [NumoraDirective],
  template: \`
    <label>
      Amount
      <input
        [numora]="{
          formatOn: 'change',
          groupingStyle: 'thousand',
          decimalMaxLength: 2,
          onValueChange: handleChange,
        }"
      />
    </label>
    <p>Raw value: {{ value() }}</p>
  \`,
})
export class AmountComponent {
  protected readonly value = signal('');
  protected readonly handleChange = ({ value }: { value: string }) => this.value.set(value);
}`}
      </CodeBlock>

      <p>
        Or use it with Reactive Forms, where the raw value goes through <code>FormControl</code>:
      </p>

      <CodeBlock language="ts">
        {`import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NumoraDirective } from './numora.directive';

@Component({
  selector: 'app-amount-form',
  standalone: true,
  imports: [NumoraDirective, ReactiveFormsModule],
  template: \`
    <label>
      Amount
      <input
        [formControl]="amount"
        [numora]="{ formatOn: 'change', groupingStyle: 'thousand', decimalMaxLength: 2 }"
      />
    </label>
    <p>Raw value: {{ amount.value }}</p>
  \`,
})
export class AmountFormComponent {
  protected readonly amount = new FormControl('0', { nonNullable: true });
}`}
      </CodeBlock>

      <p>
        A value the form sets goes through <code>setValue()</code>, which sanitizes it without
        calling <code>onValueChange</code>. With <code>decimalMaxLength: 2</code>, a control set to{' '}
        <code>'1234.567'</code> shows <code>1,234.56</code> but still holds <code>'1234.567'</code>{' '}
        until the user edits the field. Give the control values that already fit the options.
      </p>

      <p>
        Template-driven forms work the same way with <code>[(ngModel)]</code>. The bare{' '}
        <code>numora</code> attribute uses the default options. If strict templates reject it, write{' '}
        <code>[numora]="{'{}'}"</code>:
      </p>

      <CodeBlock language="ts">
        {`import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NumoraDirective } from './numora.directive';

@Component({
  selector: 'app-amount-model',
  standalone: true,
  imports: [NumoraDirective, FormsModule],
  template: \`
    <label>
      Amount
      <input numora [(ngModel)]="amount" />
    </label>
    <p>Raw value: {{ amount }}</p>
  \`,
})
export class AmountModelComponent {
  protected amount = '0';
}`}
      </CodeBlock>

      <p>
        Numora adopts the <code>&lt;input&gt;</code> and sets the attributes it needs. The{' '}
        <code>ControlValueAccessor</code> bridge: <code>writeValue</code> calls{' '}
        <code>setValue</code>, <code>registerOnChange</code> passes the raw <code>value</code> to
        the form control (see <Link to="/docs/numora/features/value-types">value types</Link>), and{' '}
        <code>setDisabledState</code> sets the element's <code>disabled</code> property.{' '}
        <code>'change'</code> formats on every keystroke (see{' '}
        <Link to="/docs/numora/features/formatting">formatting</Link>).
      </p>

      <h2>Animated example: Numora + Torph in Angular</h2>
      <p>
        Stack a Torph <code>TextMorph</code> over a transparent-text <code>NumoraInput</code>. The{' '}
        <Link to="/docs/numora/integrations/torph">Torph integration</Link> explains the overlay and
        has the shared CSS and install steps. Below is the standalone component.
      </p>
      <CodeBlock language="ts">
        {`import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NumoraInput } from 'numora';
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
})
export class NumoraOverlayComponent implements OnInit, OnDestroy {
  @ViewChild('display', { static: true }) display!: ElementRef<HTMLSpanElement>;
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private morph?: TextMorph;
  private numora?: NumoraInput;
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // NumoraInput and TextMorph touch the DOM, so skip them during server rendering.
    if (!isPlatformBrowser(this.platformId)) return;

    // Optional: empty the SSR placeholder up front. Torph also removes it itself.
    this.display.nativeElement.textContent = '';

    const morph = new TextMorph({
      element: this.display.nativeElement,
      ease: { stiffness: 400, damping: 30 },
    });
    this.morph = morph;

    const numora = new NumoraInput(this.host.nativeElement, {
      formatOn: 'change',
      groupingStyle: 'thousand',
      decimalMaxLength: 2,
      // onFormattedValueChange reports every rewrite of the field, in both formatOn modes.
      // The caret is the second argument: Torph then matches digits around the edit.
      onFormattedValueChange: (text) =>
        morph.update(text || '0', numora.element.selectionStart ?? undefined),
    });
    this.numora = numora;
    numora.element.setAttribute('aria-label', 'Amount');

    // The callback does not fire on creation, so prime the display.
    morph.update(numora.formattedValue || '0');
  }

  ngOnDestroy(): void {
    this.morph?.destroy();
    this.numora?.destroy();
    this.numora?.element.remove();
  }
}`}
      </CodeBlock>

      <p>
        Add the overlay CSS from the Torph page to your global styles, or to the component's{' '}
        <code>styles</code> array. <code>ViewEncapsulation.None</code> is required because Numora
        creates the <code>&lt;input&gt;</code> at runtime, outside Angular&apos;s scoped styles.
      </p>

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
