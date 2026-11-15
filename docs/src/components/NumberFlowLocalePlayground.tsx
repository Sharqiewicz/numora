import NumberFlow from '@number-flow/react';
import { NumoraInput } from 'numora-react';
import { useId, useState } from 'react';
import { DemoFrame } from './DemoFrame';
import { LOCALE_OPTIONS, Select } from './locale-playground-parts';

// NumberFlow draws no digits for a locale whose Intl digits are not ASCII (Arabic, Persian),
// so the overlay playground leaves those out.
const OPTIONS = LOCALE_OPTIONS.filter(
  ([tag]) => new Intl.NumberFormat(tag).resolvedOptions().numberingSystem === 'latn'
);

/** The NumberFlow overlay field with the same locale passed to both, switchable live. */
export function NumberFlowLocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState<string>('de-DE');
  const [{ value, formattedValue }, setValues] = useState({
    value: '1234567.89',
    formattedValue: '',
  });

  // Mirror the typed decimals so trailing zeros ("1,20") stay on the animated number.
  // `useGrouping: true` makes Intl group four-digit numbers in Spanish and Polish too, as
  // the field does, so the caret of the transparent input underneath lines up.
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  const format = {
    useGrouping: true,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };
  // The raw string itself, not Number(value): Intl formats a numeric string digit for digit,
  // so eight decimals on a long integer stay exact. This project's TS lib (ES2022) still types
  // the value as a number.
  const number = (/\d/.test(value) ? value : '0') as unknown as number;
  // A raw value ending in "." shows the locale's decimal mark last in the field.
  const suffix = value.endsWith('.') ? formattedValue.slice(-1) : undefined;

  return (
    <div className="not-prose mx-auto my-8 flex w-full max-w-lg flex-col items-start gap-4">
      <Select
        id={`${id}-locale`}
        label="Locale"
        value={locale}
        onChange={setLocale}
        options={OPTIONS}
      />
      <DemoFrame inputId={`${id}-amount`} className="my-0">
        <div className="relative flex min-h-[44px] min-w-[6ch] items-center font-mono text-4xl text-white tabular-nums leading-none">
          <span aria-hidden="true" className="pointer-events-none whitespace-pre">
            <NumberFlow value={number} suffix={suffix} locales={locale} format={format} />
          </span>
          <NumoraInput
            id={`${id}-amount`}
            locale={locale}
            decimalMaxLength={8}
            padLeadingZero
            value={value}
            onValueChange={setValues}
            aria-label="Amount"
            className="absolute inset-0 m-0 h-full w-full border-0 bg-transparent p-0 text-transparent tracking-[inherit] placeholder-transparent [font:inherit] caret-white outline-none selection:bg-white/25 focus:outline-none"
          />
        </div>
      </DemoFrame>
    </div>
  );
}
