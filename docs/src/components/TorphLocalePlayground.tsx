import { NumoraInput } from 'numora-react';
import { useEffect, useId, useRef, useState } from 'react';
import { TextMorph } from 'torph';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';
import { LOCALE_OPTIONS, Select } from './locale-playground-parts';

// The default value as de-DE shows it: the text before the input can be read.
const INITIAL_TEXT = '1.234.567,89';

/** The Torph overlay field with the locale switchable live. */
export function TorphLocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState<string>('de-DE');
  const [value, setValue] = useState('1234567.89');
  const displayRef = useRef<HTMLSpanElement>(null);
  const morphRef = useRef<TextMorph | null>(null);
  // Every text the field shows, a locale switch included.
  const [text, setText] = useState(INITIAL_TEXT);

  useEffect(() => {
    const display = displayRef.current;
    if (!display) return;
    if (!morphRef.current) {
      // Torph only adopts element children: clear the server-rendered text node first.
      display.textContent = '';
      morphRef.current = new TextMorph({
        element: display,
        ease: { stiffness: 400, damping: 30 },
      });
    }
    morphRef.current.update(text || '0');
  }, [text]);

  useEffect(
    () => () => {
      morphRef.current?.destroy();
      morphRef.current = null;
    },
    []
  );

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
          <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
            {INITIAL_TEXT}
          </span>
          <NumoraInput
            id={`${id}-amount`}
            locale={locale}
            formatOn="change"
            decimalMaxLength={8}
            value={value}
            onValueChange={({ value }) => setValue(value)}
            onFormattedValueChange={setText}
            aria-label="Amount"
            className={`${demoOverlayInput} caret-foreground`}
          />
        </div>
      </DemoFrame>
    </div>
  );
}
