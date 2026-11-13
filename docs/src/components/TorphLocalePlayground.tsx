import { NumoraInput } from 'numora-react';
import { useId, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';
import { LOCALE_OPTIONS, Select } from './locale-playground-parts';

// The default value as de-DE shows it: the text before the input can be read.
const INITIAL_TEXT = '1.234.567,89';
const EASE = { stiffness: 400, damping: 30 };

/** The Torph overlay field with the locale switchable live. */
export function TorphLocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState<string>('de-DE');
  const [value, setValue] = useState('1234567.89');
  const inputRef = useRef<HTMLInputElement>(null);
  // Every text the field shows, a locale switch included.
  const [text, setText] = useState(INITIAL_TEXT);
  const [caret, setCaret] = useState<number>();

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
          <span aria-hidden="true" className="pointer-events-none whitespace-pre">
            <TextMorph cursorIndex={caret} ease={EASE}>
              {text || '0'}
            </TextMorph>
          </span>
          <NumoraInput
            id={`${id}-amount`}
            ref={inputRef}
            locale={locale}
            formatOn="change"
            decimalMaxLength={8}
            value={value}
            onValueChange={({ value }) => setValue(value)}
            onFormattedValueChange={(next) => {
              setCaret(inputRef.current?.selectionStart ?? undefined);
              setText(next);
            }}
            aria-label="Amount"
            className={`${demoOverlayInput} caret-foreground`}
          />
        </div>
      </DemoFrame>
    </div>
  );
}
