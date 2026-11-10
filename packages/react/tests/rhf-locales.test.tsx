import { act, render, screen } from '@testing-library/react';
import { FormatOn } from 'numora';
import { Controller, type FieldErrors, type UseFormReturn, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { NumoraInput, type NumoraInputProps } from '../src/index';

/**
 * React Hook Form + NumoraInput across locales. The contract under test (ADR 0004): the
 * form state is always the canonical raw value (ASCII digits, `.` decimal, no grouping),
 * whatever the field displays; and everything the form writes back (`defaultValues`,
 * `setValue`, `reset`) is read as canonical, never as locale text.
 *
 * The display oracle is `Intl.NumberFormat` itself (with ASCII digits), not Numora's own
 * separator table, so a wrong separator for a locale fails here.
 */

const LOCALES = [
  'en-US', // 1,234,567.89
  'de-DE', // 1.234.567,89
  'fr-FR', // narrow no-break space group, comma decimal
  'pl-PL', // no-break space group, comma decimal
  'de-CH', // apostrophe group, dot decimal
  'es-ES',
  'pt-BR',
  'sv-SE',
  'ja-JP',
  'en-IN', // lakh grouping: 12,34,567.89
  'hi-IN',
  'ar-EG', // Arabic separators ٬ ٫ and Arabic-Indic digits in Intl output
  'fa-IR', // Persian digits in Intl output
] as const;

const RAW = '1234567.89';
const RAW_2 = '9876543.21';

/** What a user of that locale would copy from another app: native digits and all. */
function native(locale: string, raw: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 18 }).format(Number(raw));
}
/**
 * What the field displays: the locale's own separators and grouping with ASCII digits
 * (Numora never displays native digits).
 */
function display(locale: string, raw: string): string {
  return native(locale, raw).replace(/\p{Nd}/gu, (d) => {
    const cp = d.codePointAt(0) as number;
    // Unicode decimal digits come in contiguous runs of ten starting at a zero.
    for (let zero = cp; zero > cp - 10; zero--) {
      if (!/\p{Nd}/u.test(String.fromCodePoint(zero - 1))) return String(cp - zero);
    }
    return d;
  });
}
function decimalOf(locale: string): string {
  return (
    new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === 'decimal')?.value ??
    '.'
  );
}

function typeChar(el: HTMLInputElement, char: string): void {
  const be = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  el.dispatchEvent(be);
  if (be.defaultPrevented) return;
  const s = el.selectionStart ?? el.value.length;
  const e = el.selectionEnd ?? s;
  el.value = el.value.slice(0, s) + char + el.value.slice(e);
  el.setSelectionRange(s + char.length, s + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}
function typeText(el: HTMLInputElement, text: string): void {
  act(() => {
    for (const c of text) typeChar(el, c);
  });
}
function paste(el: HTMLInputElement, text: string): void {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  act(() => {
    el.dispatchEvent(ev);
  });
}

type Values = { amount: string };

function mount(props: Partial<NumoraInputProps>, defaultAmount = '') {
  let form!: UseFormReturn<Values>;
  let submitted: Values | undefined;
  let errors: FieldErrors<Values> = {};
  function Form() {
    form = useForm<Values>({ defaultValues: { amount: defaultAmount }, mode: 'onChange' });
    // formState is a proxy: reading it during render subscribes to error updates.
    errors = form.formState.errors;
    return (
      <form>
        <Controller
          name="amount"
          control={form.control}
          rules={{
            required: 'required',
            // A canonical decimal string: what a backend or a bigint/decimal library accepts.
            validate: (v) => /^-?\d+(\.\d+)?$/.test(v) || 'not canonical',
          }}
          render={({ field }) => (
            <NumoraInput
              data-testid="amount"
              {...props}
              ref={field.ref}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
          )}
        />
      </form>
    );
  }
  const utils = render(<Form />);
  const el = screen.getByTestId('amount') as HTMLInputElement;
  return {
    el,
    form: () => form,
    errors: () => errors,
    state: () => form.getValues('amount'),
    submit: async () => {
      submitted = undefined;
      await act(async () => {
        await form.handleSubmit((d) => {
          submitted = d;
        })();
      });
      return submitted;
    },
    ...utils,
  };
}

describe.each(LOCALES)('react-hook-form with locale %s', (locale) => {
  const dec = decimalOf(locale);

  it('defaultValues is canonical and renders in the locale format', () => {
    const { el, state } = mount({ locale }, RAW);
    expect(el.value).toBe(display(locale, RAW));
    expect(state()).toBe(RAW);
  });

  it('typing with the locale decimal key stores the canonical raw value (Change mode)', () => {
    const { el, state } = mount({ locale, formatOn: FormatOn.Change });
    el.focus();
    typeText(el, `1234567${dec}89`);
    expect(el.value).toBe(display(locale, RAW));
    expect(state()).toBe(RAW);
  });

  it('typing "." as the decimal key works in every locale (ADR 0005)', () => {
    const { el, state } = mount({ locale, formatOn: FormatOn.Change });
    el.focus();
    typeText(el, '1234567.89');
    expect(el.value).toBe(display(locale, RAW));
    expect(state()).toBe(RAW);
  });

  it('Blur mode: raw while typing, grouped after blur, state unchanged by the blur', () => {
    const { el, state } = mount({ locale, formatOn: FormatOn.Blur });
    act(() => el.focus());
    typeText(el, `1234567${dec}89`);
    expect(el.value).toBe(`1234567${dec}89`);
    expect(state()).toBe(RAW);
    act(() => el.blur());
    expect(el.value).toBe(display(locale, RAW));
    expect(state()).toBe(RAW);
    // Focusing again strips the grouping for editing and keeps the state.
    act(() => el.focus());
    expect(el.value).toBe(`1234567${dec}89`);
    expect(state()).toBe(RAW);
  });

  it('pasting the locale-formatted number (native digits) stores the canonical raw value', () => {
    const { el, state } = mount({ locale, formatOn: FormatOn.Change });
    el.focus();
    paste(el, native(locale, RAW));
    expect(el.value).toBe(display(locale, RAW));
    expect(state()).toBe(RAW);
  });

  it('setValue and reset write canonical values, shown in the locale format', () => {
    const { el, form, state } = mount({ locale }, RAW);
    act(() => form().setValue('amount', RAW_2));
    expect(el.value).toBe(display(locale, RAW_2));
    expect(state()).toBe(RAW_2);
    act(() => form().reset());
    expect(el.value).toBe(display(locale, RAW));
    expect(state()).toBe(RAW);
    act(() => form().reset({ amount: '' }));
    expect(el.value).toBe('');
  });

  it('a controlled re-render (the form echoing the value back) never rewrites the field', async () => {
    const { el, form, state } = mount({ locale, formatOn: FormatOn.Change });
    el.focus();
    typeText(el, `12345${dec}`);
    // Trailing decimal mid-typing survives the echo through form state.
    expect(el.value).toBe(`${display(locale, '12345')}${dec}`);
    await act(async () => {
      await form().trigger();
    });
    expect(el.value).toBe(`${display(locale, '12345')}${dec}`);
    typeText(el, '5');
    expect(el.value).toBe(display(locale, '12345.5'));
    expect(state()).toBe('12345.5');
  });

  it('validation and submit see the canonical raw value', async () => {
    const { el, errors, submit } = mount({ locale, formatOn: FormatOn.Change });
    expect(await submit()).toBeUndefined();
    expect(errors().amount?.message).toBe('required');
    el.focus();
    typeText(el, `1234567${dec}89`);
    expect(await submit()).toEqual({ amount: RAW });
    expect(errors().amount).toBeUndefined();
  });
});

describe('react-hook-form with custom separators', () => {
  const CASES: [string, Partial<NumoraInputProps>, string, string][] = [
    ['space group, comma decimal', { thousandSeparator: ' ', decimalSeparator: ',' }, ',', '1 234 567,89'],
    ['dot group, comma decimal', { thousandSeparator: '.', decimalSeparator: ',' }, ',', '1.234.567,89'],
    ['comma decimal alone', { decimalSeparator: ',' }, ',', '1.234.567,89'],
    ['apostrophe group', { thousandSeparator: "'" }, '.', "1'234'567.89"],
    ['defaults', {}, '.', '1,234,567.89'],
  ];
  it.each(CASES)('%s', async (_name, props, dec, shown) => {
    const { el, form, state, submit } = mount({ ...props, formatOn: FormatOn.Change }, RAW);
    expect(el.value).toBe(shown);
    act(() => form().setValue('amount', ''));
    el.focus();
    typeText(el, `1234567${dec}89`);
    expect(el.value).toBe(shown);
    expect(state()).toBe(RAW);
    expect(await submit()).toEqual({ amount: RAW });
  });
});

describe('known difference from Intl', () => {
  // es-ES and pl-PL do not group four-digit numbers in Intl (`1234,5`); Numora groups from
  // four digits in every locale. Pinned so a change here is deliberate.
  it.each(['es-ES', 'pl-PL'])('%s groups a four-digit number', (locale) => {
    const { el, state } = mount({ locale }, '1234.5');
    expect(native(locale, '1234.5')).toBe('1234,5');
    expect(el.value).toBe(display(locale, '11234.5').slice(1));
    expect(state()).toBe('1234.5');
  });
});
