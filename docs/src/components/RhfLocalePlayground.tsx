import { FormatOn, NumoraInput } from 'numora-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const LOCALES = [
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

type Values = { amount: string };

const buttonClass =
  'rounded-md border border-surface-5 bg-surface-3 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const selectClass =
  'rounded-md border border-surface-5 bg-surface-3 px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-mono text-sm text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

/** A real React Hook Form form around NumoraInput, with the locale switchable live. */
export function RhfLocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState<string>('de-DE');
  const [formatOn, setFormatOn] = useState<FormatOn>(FormatOn.Change);
  const [shown, setShown] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty, touchedFields },
  } = useForm<Values>({ defaultValues: { amount: '1234567.89' }, mode: 'onChange' });
  const amount = watch('amount');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Mirror what the field displays. Numora writes the DOM value itself (after setValue, reset
  // or a locale switch too), so read it back after every render rather than from an event.
  useEffect(() => {
    const value = inputRef.current?.value ?? '';
    setShown((current) => (current === value ? current : value));
  });

  return (
    <figure className="not-prose my-8">
      <form
        onSubmit={handleSubmit((data) => setSubmitted(JSON.stringify(data)))}
        className="overflow-hidden rounded-xl bg-surface-1 shadow-border"
      >
        <div className="flex flex-wrap items-end gap-3 p-4">
          <label
            className="flex flex-col gap-1 text-sm text-muted-foreground"
            htmlFor={`${id}-locale`}
          >
            Locale
            <select
              id={`${id}-locale`}
              className={selectClass}
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
            >
              {LOCALES.map(([tag, name]) => (
                <option key={tag} value={tag}>
                  {name} ({tag})
                </option>
              ))}
            </select>
          </label>
          <label
            className="flex flex-col gap-1 text-sm text-muted-foreground"
            htmlFor={`${id}-mode`}
          >
            Format on
            <select
              id={`${id}-mode`}
              className={selectClass}
              value={formatOn}
              onChange={(e) => setFormatOn(e.target.value as FormatOn)}
            >
              <option value={FormatOn.Change}>change</option>
              <option value={FormatOn.Blur}>blur</option>
            </select>
          </label>
        </div>

        <div className="px-4 pb-4">
          <div className="flex flex-col gap-1 rounded-md border border-surface-5 bg-surface-3 p-3 transition-colors hover:bg-surface-5 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand">
            <label htmlFor={`${id}-amount`} className="text-sm text-muted-foreground">
              Amount
            </label>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: 'Enter an amount',
                validate: (v) => v !== '0' || 'Amount must be greater than 0',
              }}
              render={({ field }) => (
                <NumoraInput
                  id={`${id}-amount`}
                  ref={(el) => {
                    field.ref(el);
                    inputRef.current = el;
                  }}
                  locale={locale}
                  formatOn={formatOn}
                  decimalMaxLength={8}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={() => {
                    field.onBlur();
                    setShown(inputRef.current?.value ?? '');
                  }}
                  // Blur mode strips the grouping right after this event: read on the next frame.
                  onFocus={() =>
                    requestAnimationFrame(() => setShown(inputRef.current?.value ?? ''))
                  }
                  aria-invalid={errors.amount ? true : undefined}
                  aria-describedby={errors.amount ? `${id}-error` : undefined}
                  placeholder="0"
                  className="flex w-full min-w-0 border-none bg-transparent text-2xl text-foreground tabular-nums placeholder-muted-icon focus:outline-none"
                />
              )}
            />
          </div>
          <p id={`${id}-error`} role="alert" className="mt-2 min-h-5 text-sm text-red-500">
            {errors.amount?.message}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClass}
              onClick={() =>
                setValue('amount', '9876543.21', { shouldDirty: true, shouldValidate: true })
              }
            >
              setValue("9876543.21")
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() =>
                setValue('amount', '0.00000015', { shouldDirty: true, shouldValidate: true })
              }
            >
              setValue("0.00000015")
            </button>
            <button type="button" className={buttonClass} onClick={() => reset()}>
              reset()
            </button>
            <button type="submit" className={buttonClass}>
              Submit
            </button>
          </div>
        </div>

        <dl className="divide-y divide-surface-3 border-t border-surface-3 px-4 py-2">
          <Row label="Field shows" value={JSON.stringify(shown)} />
          <Row label="Form state (watch)" value={JSON.stringify(amount)} />
          <Row label="Submitted" value={submitted ?? '(not submitted)'} />
          <Row label="dirty / touched" value={`${isDirty} / ${Boolean(touchedFields.amount)}`} />
        </dl>
      </form>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        The form state stays a plain decimal string (ASCII digits, <code>.</code> as the decimal
        mark) in every locale. Try typing, pasting a number copied from another app, and switching
        the locale mid-edit.
      </figcaption>
    </figure>
  );
}
