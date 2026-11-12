import { type RefObject, useEffect, useState } from 'react';
import { demoFieldText } from './DemoFrame';

/** Locales offered by the docs playgrounds: every separator and grouping family. */
export const LOCALES = [
  ['en-US', 'English (US)'],
  ['de-DE', 'German'],
  ['fr-FR', 'French'],
  ['pl-PL', 'Polish'],
  ['de-CH', 'Swiss German'],
  ['es-ES', 'Spanish'],
  ['pt-BR', 'Portuguese (Brazil)'],
  ['sv-SE', 'Swedish'],
  ['ja-JP', 'Japanese'],
  ['en-IN', 'English (India)'],
  ['hi-IN', 'Hindi'],
  ['ar-EG', 'Arabic (Egypt)'],
  ['fa-IR', 'Persian'],
] as const;

export const buttonClass =
  'min-h-11 rounded-md border border-surface-5 bg-surface-3 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
export const selectClass =
  'min-h-11 rounded-md border border-surface-5 bg-surface-3 px-2 py-1.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
export const fieldBoxClass =
  'rounded-md border border-surface-5 bg-surface-3 p-3 transition-colors [@media(hover:hover)]:hover:bg-surface-5 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand';
export const fieldInputClass = `flex w-full min-w-0 border-none bg-transparent ${demoFieldText} placeholder:text-muted-foreground focus:outline-none`;

export function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [value: string, label: string])[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted-foreground" htmlFor={id}>
      {label}
      <select
        id={id}
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export const LOCALE_OPTIONS = LOCALES.map(([tag, name]) => [tag, `${name} (${tag})`] as const);
export const FORMAT_ON_OPTIONS = [
  ['change', 'change'],
  ['blur', 'blur'],
] as const;

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-right font-mono text-sm text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  );
}

/**
 * The text a NumoraInput currently displays. Numora writes the DOM value itself (after a
 * controlled value change or a locale switch too, with no onChange), so it is read back
 * after every render rather than taken from an event. Spread `handlers` on the input for
 * the Blur-mode focus strip and blur regroup, which happen without a render. `initial` is
 * the text for the server render and first frame, before the input can be read.
 */
export function useFieldText(ref: RefObject<HTMLInputElement | null>, initial = '') {
  const [text, setText] = useState(initial);
  const read = () => {
    const value = ref.current?.value ?? '';
    setText((current) => (current === value ? current : value));
  };
  useEffect(read);
  return {
    text,
    handlers: {
      // The focus strip runs right after the focus event: read on the next frame.
      onFocus: () => requestAnimationFrame(read),
      onBlur: read,
    },
  };
}
