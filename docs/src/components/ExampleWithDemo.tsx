import type { NumoraHTMLInputElement, NumoraInputProps } from 'numora-react';
import { NumoraInput } from 'numora-react';
import { useId, useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { demoFieldText } from './DemoFrame';

interface ExampleWithDemoProps {
  code: string;
  language?: string;
  config: NumoraInputProps;
  title?: string;
  /** What to try in the demo, e.g. `Type "1" and blur`. */
  description?: string;
  placeholder?: string;
  /** Accessible name for the field (visually hidden). Defaults to "Amount". */
  label?: string;
  /** Unit shown after the value, e.g. "ETH" or "USD". */
  unit?: string;
}

/**
 * Demo-first example card: a realistic field on top, the code that produced it underneath.
 * The field mirrors the /swap page's amount field so every example reads like product UI.
 */
export function ExampleWithDemo({
  code,
  language = 'typescript',
  config,
  title,
  description,
  placeholder = '0',
  label = 'Amount',
  unit,
}: ExampleWithDemoProps) {
  const inputId = useId();
  const hintId = useId();
  const [readout, setReadout] = useState<{ raw: string; formatted: string } | null>(null);
  // The display string changes on focus and blur too ('blur' regroups without
  // an onChange), so the readout is read off the element on all three events.
  const syncReadout = ({ rawValue, formattedValue }: NumoraHTMLInputElement) => {
    setReadout(rawValue ? { raw: rawValue, formatted: formattedValue } : null);
  };
  return (
    <figure className="not-prose my-8">
      {title && <h3 className="mb-1 text-[15px] font-medium text-foreground">{title}</h3>}
      {description && (
        <p id={hintId} className="mb-3 text-caption text-muted-foreground">
          {description}
        </p>
      )}
      <div className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <div className="p-4">
          <div className="rounded-md border border-surface-5 bg-surface-3 p-3 transition-colors [@media(hover:hover)]:hover:bg-surface-5 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand">
            <label htmlFor={inputId} className="sr-only">
              {label}
              {title && <span className="sr-only">, {title}</span>}
            </label>
            <div className="flex items-baseline gap-2">
              <NumoraInput
                {...config}
                onChange={(e) => {
                  syncReadout(e.target);
                  config.onChange?.(e);
                }}
                onFocus={(e) => {
                  config.onFocus?.(e);
                  syncReadout(e.currentTarget as NumoraHTMLInputElement);
                }}
                onBlur={(e) => {
                  config.onBlur?.(e);
                  syncReadout(e.currentTarget as NumoraHTMLInputElement);
                }}
                id={inputId}
                placeholder={placeholder}
                aria-describedby={description ? hintId : undefined}
                className={`flex w-full min-w-0 border-none bg-transparent ${demoFieldText} placeholder:text-muted-foreground focus:outline-none`}
              />
              {unit && (
                <span className="shrink-0 text-sm font-medium text-muted-foreground">{unit}</span>
              )}
            </div>
          </div>
          <p
            aria-hidden="true"
            className="mt-2 truncate font-mono text-caption tabular-nums text-muted-foreground"
          >
            {readout ? `raw ${readout.raw} → formatted ${readout.formatted}` : '\u00A0'}
          </p>
        </div>
        <div className="border-t border-surface-3">
          <CodeBlock bare language={language}>
            {code}
          </CodeBlock>
        </div>
      </div>
    </figure>
  );
}
