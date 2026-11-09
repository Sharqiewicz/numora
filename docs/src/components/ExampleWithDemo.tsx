import { useId } from 'react';
import type { NumoraInputProps } from 'numora-react';
import { NumoraInput } from 'numora-react';
import { CodeBlock } from './CodeBlock';

interface ExampleWithDemoProps {
  code: string;
  language?: string;
  config: NumoraInputProps;
  title?: string;
  /** What to try in the demo, e.g. `Type "1" and blur`. */
  description?: string;
  placeholder?: string;
  /** Field label, like a real form. Defaults to "Amount". */
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
  return (
    <figure className="not-prose my-8">
      {title && <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>}
      {description && (
        <p id={hintId} className="mb-3 text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <div className="p-4">
          <div className="flex flex-col gap-1 rounded-md border border-surface-5 bg-surface-3 p-3 transition-colors hover:bg-surface-5 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand">
            <label htmlFor={inputId} className="text-sm text-muted-foreground">
              {label}
              {title && <span className="sr-only">, {title}</span>}
            </label>
            <div className="flex items-baseline gap-2">
              <NumoraInput
                {...config}
                id={inputId}
                placeholder={placeholder}
                aria-describedby={description ? hintId : undefined}
                className="flex w-full min-w-0 border-none bg-transparent text-2xl text-foreground tabular-nums placeholder-muted-icon focus:outline-none"
              />
              {unit && <span className="shrink-0 text-sm font-medium text-muted-foreground">{unit}</span>}
            </div>
          </div>
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
