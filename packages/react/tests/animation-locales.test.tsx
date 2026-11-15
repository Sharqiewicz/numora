import NumberFlow from '@number-flow/react';
import { act, render, screen } from '@testing-library/react';
import { FormatOn } from 'numora';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';
import { beforeAll, describe, expect, it } from 'vitest';
import { NumoraInput, type NumoraInputProps } from '../src/index';
import { decimalOf, display, LOCALES, native, paste, RAW, typeText } from './locale-matrix';

/**
 * The two animated-display integrations from the docs, with the real libraries, across
 * locales. Torph morphs a string, so it is handed the field's own `formattedValue`.
 * NumberFlow formats a number itself with `Intl`, so it is handed the raw value as a string
 * plus the same `locale`; where its output differs from the field is pinned below.
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

/**
 * The docs overlay sample: the raw value as a string, decimals mirrored, same locale, the
 * half-typed decimal separator as a suffix.
 */
function FlowField({ locale, ...props }: { locale: string } & Partial<NumoraInputProps>) {
  const [{ value, formattedValue }, setValues] = useState({ value: '', formattedValue: '' });
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  const number = (/\d/.test(value) ? value : '0') as Intl.StringNumericLiteral;
  return (
    <>
      <NumberFlow
        // Outside a browser build the <number-flow-react> element is an inert stub that
        // cannot update in place, so remount per value. The data read below is still
        // computed by the real wrapper, with the real `Intl` formatter it builds.
        key={value}
        data-testid="flow"
        value={number}
        suffix={value.endsWith('.') ? formattedValue.slice(-1) : undefined}
        locales={locale}
        format={{
          useGrouping: true,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }}
      />
      <NumoraInput
        data-testid="amount"
        locale={locale}
        formatOn={FormatOn.Change}
        padLeadingZero
        value={value}
        onValueChange={setValues}
        {...props}
      />
    </>
  );
}
type FlowData = { valueAsString: string; integer: { type: string; value: number | string }[] };
const flowData = () => (screen.getByTestId('flow') as unknown as { data: FlowData }).data;
const flowed = () => flowData().valueAsString;
/** The digits NumberFlow draws: it renders each one from its numeric value, not from the text. */
const drawnDigits = () =>
  flowData()
    .integer.filter((part) => part.type === 'integer')
    .map((part) => part.value);

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

// Locales whose `Intl` digits are not ASCII. Numora always shows ASCII digits, and NumberFlow
// cannot draw the others at all (pinned below), so the docs call these unsupported.
const NATIVE_DIGITS = ['ar-EG', 'fa-IR'];
const LATIN_DIGITS = LOCALES.filter((locale) => !NATIVE_DIGITS.includes(locale));

describe.each(LATIN_DIGITS)('NumberFlow with locale %s', (locale) => {
  const dec = decimalOf(locale);

  it('shows the same text as the field at every keystroke', () => {
    render(<FlowField locale={locale} />);
    field().focus();
    // Covers a four-digit number (grouped by `useGrouping: true` in Spanish and Polish too),
    // the half-typed decimal separator and each fraction digit.
    for (const char of `1234567${dec}89`) {
      typeText(field(), char);
      expect(flowed()).toBe(field().value);
    }
    expect(field().value).toBe(display(locale, RAW));
  });

  it('keeps trailing zeros in step with the field', () => {
    render(<FlowField locale={locale} />);
    field().focus();
    typeText(field(), `12345${dec}50`);
    expect(field().value).toBe(display(locale, '12345.5').concat('0'));
    expect(flowed()).toBe(field().value);
  });

  it('shows the padded zero of a decimal separator typed first', () => {
    render(<FlowField locale={locale} />);
    field().focus();
    typeText(field(), dec);
    expect(field().value).toBe(`0${dec}`);
    expect(flowed()).toBe(field().value);
  });
});

describe('NumberFlow: the raw string keeps what Number() loses', () => {
  it('stays exact past 15-17 significant digits', () => {
    render(<FlowField locale="en-US" />);
    field().focus();
    paste(field(), '12345678901234567890.123456789012345678');
    expect(field().value).toBe('12,345,678,901,234,567,890.123456789012345678');
    expect(flowed()).toBe(field().value);
  });

  it('keeps the sign of a negative zero', () => {
    render(<FlowField locale="en-US" allowNegative />);
    field().focus();
    for (const char of '-0.05') {
      typeText(field(), char);
      // A lone "-" is not a number, so NumberFlow draws 0 (pinned below).
      if (field().value !== '-') expect(flowed()).toBe(field().value);
    }
    expect(field().value).toBe('-0.05');
  });
});

describe('NumberFlow: known differences from the field', () => {
  it.each(NATIVE_DIGITS)('%s: NumberFlow cannot draw non-ASCII digits', (locale) => {
    render(<FlowField locale={locale} />);
    field().focus();
    typeText(field(), '1234');
    expect(field().value).toBe(display(locale, '1234'));
    // The text is right, but each digit is drawn from parseInt() of a native digit.
    // If this starts failing, NumberFlow supports these locales: update the docs caveat.
    expect(flowed()).toBe(native(locale, '1234'));
    expect(drawnDigits()).toEqual([NaN, NaN, NaN, NaN]);
  });

  it('an empty field and a lone minus sign are drawn as 0', () => {
    render(<FlowField locale="en-US" allowNegative />);
    expect(field().value).toBe('');
    expect(flowed()).toBe('0');
    field().focus();
    typeText(field(), '-');
    expect(field().value).toBe('-');
    expect(flowed()).toBe('0');
  });

  it('leading zeros are not drawn', () => {
    render(<FlowField locale="en-US" allowLeadingZeros />);
    field().focus();
    typeText(field(), '007');
    expect(field().value).toBe('007');
    expect(flowed()).toBe('7');
  });

  it.each([
    ['groupingStyle wan', { groupingStyle: 'wan' }, '123,4567'],
    ['a custom thousand separator', { thousandSeparator: ' ' }, '1 234 567'],
  ] as const)('%s has no Intl equivalent', (_name, props, shown) => {
    render(<FlowField locale="en-US" {...props} />);
    field().focus();
    typeText(field(), '1234567');
    expect(field().value).toBe(shown);
    expect(flowed()).toBe('1,234,567');
  });
});
