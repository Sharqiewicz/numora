import { getSeparatorsFromLocale, NumoraInput } from 'numora-react';
import { useId, useRef, useState } from 'react';
import {
  fieldBoxClass,
  fieldInputClass,
  LOCALE_OPTIONS,
  Row,
  Select,
  useFieldText,
} from './locale-playground-parts';

const CHAR_NAMES: Record<string, string> = {
  ',': 'comma',
  '.': 'full stop',
  ' ': 'space',
  ' ': 'no-break space',
  ' ': 'narrow no-break space',
  '’': 'right single quotation mark',
  "'": 'apostrophe',
  '٬': 'Arabic thousands separator',
  '٫': 'Arabic decimal separator',
};

const GROUPING_LABEL: Record<string, string> = {
  thousand: 'thousand (3-3-3)',
  lakh: 'lakh (3-2-2)',
  wan: 'wan (4-4-4)',
  none: 'none',
};

/** `.  U+002E full stop`; a whitespace separator is shown by code point and name only. */
function describeSeparator(char: string) {
  const code = `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`;
  const name = CHAR_NAMES[char];
  const described = name ? `${code} ${name}` : code;
  return /\s/.test(char) ? described : `${char}  ${described}`;
}

/** One NumoraInput with the locale switchable live, and what that locale resolves to. */
export function LocalePlayground() {
  const id = useId();
  const [locale, setLocale] = useState('de-DE');
  const [raw, setRaw] = useState('1234567.89');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { text: shown, handlers } = useFieldText(inputRef);
  const separators = getSeparatorsFromLocale(locale);

  return (
    <figure className="not-prose my-8">
      <div className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <div className="p-4">
          <Select
            id={`${id}-locale`}
            label="Locale"
            value={locale}
            onChange={setLocale}
            options={LOCALE_OPTIONS}
          />
        </div>
        <div className="px-4 pb-4">
          <div className={fieldBoxClass}>
            <label htmlFor={`${id}-amount`} className="sr-only">
              Amount
            </label>
            <NumoraInput
              id={`${id}-amount`}
              ref={inputRef}
              locale={locale}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              {...handlers}
              placeholder="0"
              className={fieldInputClass}
            />
          </div>
        </div>
        <dl className="divide-y divide-surface-3 border-t border-surface-3 px-4 py-2">
          <Row label="Field shows" value={JSON.stringify(shown)} />
          <Row label="Value you get" value={JSON.stringify(raw)} />
          <Row label="Thousand separator" value={describeSeparator(separators.thousandSeparator)} />
          <Row label="Decimal separator" value={describeSeparator(separators.decimalSeparator)} />
          <Row
            label="Grouping"
            value={GROUPING_LABEL[separators.groupingStyle] ?? separators.groupingStyle}
          />
        </dl>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Switch the locale mid-edit. The field regroups, and the value you get stays the same.
      </figcaption>
    </figure>
  );
}
