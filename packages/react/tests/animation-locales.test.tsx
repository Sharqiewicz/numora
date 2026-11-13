import NumberFlow from '@number-flow/react';
import { act, render, screen } from '@testing-library/react';
import { FormatOn } from 'numora';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';
import { beforeAll, describe, expect, it } from 'vitest';
import { NumoraInput, type NumoraInputProps } from '../src/index';
import { LOCALES, RAW, decimalOf, display, native, paste, typeText } from './locale-matrix';

/**
 * The two animated-display integrations from the docs, with the real libraries, across
 * locales. Torph morphs a string, so it is handed the field's own `formattedValue`.
 * NumberFlow takes a `number` and formats it itself with `Intl`, so it is handed
 * `Number(rawValue)` plus the same `locale`; where its output differs from the field is
 * pinned below.
 */

beforeAll(() => {
  // jsdom has no matchMedia. `matches: true` puts Torph on its reduced-motion path (plain
  // text, no Web Animations), which is all jsdom can run; the text it shows is the same.
  window.matchMedia = (() => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  // Torph's destroy() cancels running animations; jsdom has no Web Animations API.
  Element.prototype.getAnimations ??= () => [];
});

const field = () => screen.getByTestId('amount') as HTMLInputElement;

/** The docs pattern: `onFormattedValueChange` drives a TextMorph on a sibling span. */
function TorphField(props: Partial<NumoraInputProps>) {
  const [formatted, setFormatted] = useState('');
  const span = useRef<HTMLSpanElement>(null);
  const morph = useRef<TextMorph | null>(null);
  useEffect(() => {
    morph.current ??= new TextMorph({ element: span.current as HTMLSpanElement });
    morph.current.update(formatted);
  }, [formatted]);
  useEffect(() => () => morph.current?.destroy(), []);
  return (
    <>
      <span data-testid="morph" ref={span} />
      <NumoraInput data-testid="amount" {...props} onFormattedValueChange={setFormatted} />
    </>
  );
}
const morphed = () => screen.getByTestId('morph').textContent;

/** The docs pattern: the raw value as a number, decimals mirrored, same locale. */
function FlowField({ locale }: { locale: string }) {
  const [value, setValue] = useState('');
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  return (
    <>
      <NumberFlow
        // Outside a browser build the <number-flow-react> element is an inert stub that
        // cannot update in place, so remount per value. The text read below (`data`) is
        // still computed by the real wrapper, with the real `Intl` formatter it builds.
        key={value}
        data-testid="flow"
        value={Number(value) || 0}
        locales={locale}
        format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals }}
      />
      <NumoraInput
        data-testid="amount"
        locale={locale}
        formatOn={FormatOn.Change}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  );
}
const flowed = () =>
  (screen.getByTestId('flow') as unknown as { data: { valueAsString: string } }).data.valueAsString;

describe.each(LOCALES)('Torph with locale %s', (locale) => {
  const dec = decimalOf(locale);

  it('morphs the same text the field shows while typing (Change mode)', () => {
    render(<TorphField locale={locale} formatOn={FormatOn.Change} />);
    field().focus();
    typeText(field(), `1234567${dec}`);
    // Half-typed: the trailing decimal separator is shown by both.
    expect(morphed()).toBe(`${display(locale, '1234567')}${dec}`);
    typeText(field(), '89');
    expect(field().value).toBe(display(locale, RAW));
    expect(morphed()).toBe(field().value);
  });

  it('follows a paste of the locale-formatted number', () => {
    render(<TorphField locale={locale} formatOn={FormatOn.Change} />);
    field().focus();
    paste(field(), native(locale, RAW));
    expect(morphed()).toBe(display(locale, RAW));
  });

  it('follows the focus strip and the blur regroup (Blur mode)', () => {
    render(<TorphField locale={locale} formatOn={FormatOn.Blur} />);
    act(() => field().focus());
    typeText(field(), `1234567${dec}89`);
    expect(morphed()).toBe(`1234567${dec}89`);
    act(() => field().blur());
    expect(morphed()).toBe(display(locale, RAW));
    act(() => field().focus());
    expect(morphed()).toBe(`1234567${dec}89`);
  });
});

// NumberFlow prints the locale's own digits; Numora always shows ASCII digits.
const NATIVE_DIGITS = ['ar-EG', 'fa-IR'];

describe.each(LOCALES)('NumberFlow with locale %s', (locale) => {
  const dec = decimalOf(locale);
  const same = !NATIVE_DIGITS.includes(locale);

  it(
    same
      ? 'shows the same text as the field'
      : 'shows the same number in native digits (known difference)',
    () => {
      render(<FlowField locale={locale} />);
      field().focus();
      typeText(field(), `1234567${dec}89`);
      expect(field().value).toBe(display(locale, RAW));
      expect(flowed()).toBe(native(locale, RAW));
      expect(flowed() === field().value).toBe(same);
    }
  );

  it('keeps trailing zeros in step with the field', () => {
    render(<FlowField locale={locale} />);
    field().focus();
    typeText(field(), `12345${dec}50`);
    expect(field().value).toBe(display(locale, '12345.5').concat('0'));
    if (same) expect(flowed()).toBe(field().value);
  });
});

describe('NumberFlow: known differences from the field', () => {
  it.each(['es-ES', 'pl-PL'])('%s: Intl does not group a four-digit number, Numora does', (locale) => {
    render(<FlowField locale={locale} />);
    field().focus();
    typeText(field(), '1234');
    expect(flowed()).toBe('1234');
    expect(field().value).toBe(display(locale, '11234').slice(1));
  });

  it('a half-typed decimal separator is not shown by NumberFlow', () => {
    render(<FlowField locale="de-DE" />);
    field().focus();
    typeText(field(), '12,');
    expect(field().value).toBe('12,');
    expect(flowed()).toBe('12');
  });

  it('past 15-17 significant digits NumberFlow rounds; the field and raw value do not', () => {
    render(<FlowField locale="en-US" />);
    field().focus();
    typeText(field(), '12345678901234567890');
    expect(field().value).toBe('12,345,678,901,234,567,890');
    expect(flowed()).not.toBe(field().value);
  });
});
