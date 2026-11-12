import { act, render, screen } from '@testing-library/react';
import { FormatOn } from 'numora';
import { Controller, type FieldErrors, type UseFormReturn, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { NumoraInput, type NumoraInputProps } from '../src/index';
import { LOCALES, RAW, RAW_2, decimalOf, display, native, paste, typeText } from './locale-matrix';

/**
 * React Hook Form + NumoraInput across locales. The contract under test (ADR 0004): the
 * form state is always the canonical raw value (ASCII digits, `.` decimal, no grouping),
 * whatever the field displays; and everything the form writes back (`defaultValues`,
 * `setValue`, `reset`) is read as canonical, never as locale text.
 *
 * The display oracle is `Intl.NumberFormat` itself (with ASCII digits), not Numora's own
 * separator table, so a wrong separator for a locale fails here.
 */

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
