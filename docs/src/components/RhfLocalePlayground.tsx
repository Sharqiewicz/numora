import { type FormatOn, NumoraInput } from 'numora-react';
import { useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  buttonClass,
  FORMAT_ON_OPTIONS,
  fieldBoxClass,
  fieldInputClass,
  LOCALE_OPTIONS,
  Row,
  Select,
  useFieldText,
} from './locale-playground-parts';

type Values = { amount: string };

/** A real React Hook Form form around NumoraInput, with the locale switchable live. */
export function RhfLocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState<string>('de-DE');
  const [formatOn, setFormatOn] = useState<FormatOn>('change');
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

  const { text: shown, handlers } = useFieldText(inputRef);

  return (
    <figure className="not-prose my-8">
      <form
        onSubmit={handleSubmit((data) => setSubmitted(JSON.stringify(data)))}
        className="overflow-hidden rounded-xl bg-surface-1 shadow-border"
      >
        <div className="flex flex-wrap items-end gap-3 p-4">
          <Select
            id={`${id}-locale`}
            label="Locale"
            value={locale}
            onChange={setLocale}
            options={LOCALE_OPTIONS}
          />
          <Select
            id={`${id}-mode`}
            label="Format on"
            value={formatOn}
            onChange={(v) => setFormatOn(v as FormatOn)}
            options={FORMAT_ON_OPTIONS}
          />
        </div>

        <div className="px-4 pb-4">
          <div className={fieldBoxClass}>
            <label htmlFor={`${id}-amount`} className="sr-only">
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
                  onFocus={handlers.onFocus}
                  onBlur={() => {
                    field.onBlur();
                    handlers.onBlur();
                  }}
                  aria-invalid={errors.amount ? true : undefined}
                  aria-describedby={errors.amount ? `${id}-error` : undefined}
                  placeholder="0"
                  className={fieldInputClass}
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
              className={`${buttonClass} font-mono`}
              onClick={() =>
                setValue('amount', '9876543.21', { shouldDirty: true, shouldValidate: true })
              }
            >
              setValue("9876543.21")
            </button>
            <button
              type="button"
              className={`${buttonClass} font-mono`}
              onClick={() =>
                setValue('amount', '0.00000015', { shouldDirty: true, shouldValidate: true })
              }
            >
              setValue("0.00000015")
            </button>
            <button type="button" className={`${buttonClass} font-mono`} onClick={() => reset()}>
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
