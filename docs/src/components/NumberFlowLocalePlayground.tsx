import NumberFlow from '@number-flow/react';
import { NumoraInput } from 'numora-react';
import { useEffect, useId, useState } from 'react';
import { DemoFrame } from './DemoFrame';
import { LOCALE_OPTIONS, Select } from './locale-playground-parts';

/** The NumberFlow overlay field with the same locale passed to both, switchable live. */
export function NumberFlowLocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState<string>('de-DE');
  const [value, setValue] = useState('1234567.89');
  const [mounted, setMounted] = useState(false);

  // NumberFlow is a custom element: render it on the client only.
  useEffect(() => setMounted(true), []);

  // Mirror the typed decimals so trailing zeros ("1,20") stay on the animated number.
  // Always-on grouping makes Intl group four-digit numbers in Spanish and Polish too, as
  // the field does, so the caret of the transparent input underneath lines up.
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  const format = {
    // 'always' is ES2023; this project's TS lib still types useGrouping as boolean.
    useGrouping: 'always' as unknown as boolean,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };
  const number = Number(value) || 0;

  return (
    <div className="not-prose mx-auto my-8 flex w-full max-w-lg flex-col items-start gap-4">
      <Select
        id={`${id}-locale`}
        label="Locale"
        value={locale}
        onChange={setLocale}
        options={LOCALE_OPTIONS}
      />
      <DemoFrame inputId={`${id}-amount`} className="my-0">
        <div className="relative flex min-h-[44px] min-w-[6ch] items-center font-mono text-4xl text-white leading-none">
          <span aria-hidden="true" className="pointer-events-none whitespace-pre tabular-nums">
            {mounted ? (
              <NumberFlow value={number} locales={locale} format={format} />
            ) : (
              new Intl.NumberFormat(locale, format).format(number)
            )}
          </span>
          <NumoraInput
            id={`${id}-amount`}
            locale={locale}
            formatOn="change"
            decimalMaxLength={8}
            value={value}
            onValueChange={({ value: raw }) => setValue(raw)}
            aria-label="Amount"
            className="absolute inset-0 m-0 h-full w-full border-0 bg-transparent p-0 font-mono text-4xl text-transparent leading-none placeholder-transparent caret-white outline-none selection:bg-white/25 focus:outline-none"
          />
        </div>
      </DemoFrame>
    </div>
  );
}
