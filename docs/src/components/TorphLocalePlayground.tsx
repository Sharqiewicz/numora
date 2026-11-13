import { useId, useState } from 'react';
import { DemoFrame, demoOverlayBox } from './DemoFrame';
import { LOCALE_OPTIONS, Select } from './locale-playground-parts';
import { TorphField } from './TorphField';

/** The Torph overlay field with the locale switchable live. */
export function TorphLocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState<string>('de-DE');
  const [value, setValue] = useState('1234567.89');

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
        <div className={demoOverlayBox}>
          <TorphField
            id={`${id}-amount`}
            locale={locale}
            formatOn="change"
            decimalMaxLength={8}
            value={value}
            onValueChange={({ value }) => setValue(value)}
            aria-label="Amount"
            className="caret-foreground"
          />
        </div>
      </DemoFrame>
    </div>
  );
}
