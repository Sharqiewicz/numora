import { describe, it, expect, vi } from 'vitest';
import { normalizeNegativeZero } from '../src/utils/format-utils';
import { NumoraInput } from '../src/NumoraInput';

// A2-11: "-0" (and its decimal variants) typed with allowNegative survives blur, and
// valueAsNumber then reports -0 for it indefinitely. normalizeNegativeZero maps any
// negative value whose magnitude is exactly zero down to the unsigned form - dropping only
// the sign, never touching padding/leading zeros.
describe('normalizeNegativeZero', () => {
  it('drops the sign from a bare "-0"', () => {
    expect(normalizeNegativeZero('-0', '.')).toBe('0');
  });

  it('drops the sign from "-0." (trailing decimal separator, no fraction digits)', () => {
    expect(normalizeNegativeZero('-0.', '.')).toBe('0.');
  });

  it('drops the sign from "-0.00" (padded fraction)', () => {
    expect(normalizeNegativeZero('-0.00', '.')).toBe('0.00');
  });

  it('drops the sign from "-.0" (no integer part)', () => {
    expect(normalizeNegativeZero('-.0', '.')).toBe('.0');
  });

  it('respects a non-dot configured decimal separator', () => {
    expect(normalizeNegativeZero('-0,00', ',')).toBe('0,00');
  });

  it('leaves a positive value untouched', () => {
    expect(normalizeNegativeZero('0.00', '.')).toBe('0.00');
  });

  it('leaves a non-zero negative value untouched', () => {
    expect(normalizeNegativeZero('-1', '.')).toBe('-1');
    expect(normalizeNegativeZero('-0.01', '.')).toBe('-0.01');
    expect(normalizeNegativeZero('-10', '.')).toBe('-10');
  });

  it('leaves a bare "-" untouched', () => {
    expect(normalizeNegativeZero('-', '.')).toBe('-');
  });

  it('leaves a value with no leading sign untouched', () => {
    expect(normalizeNegativeZero('123', '.')).toBe('123');
  });
});

describe('NumoraInput blur normalizes -0 to 0 (A2-11)', () => {
  let container: HTMLElement;

  function type(el: HTMLInputElement, char: string): void {
    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: char,
    });
    el.dispatchEvent(beforeInput);
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('settles "-0" to "0" on blur and valueAsNumber no longer reports -0', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const onChangeMock = vi.fn();
    const instance = new NumoraInput(container, { allowNegative: true, onChange: onChangeMock });
    const el = getInputElement();

    el.focus();
    type(el, '-');
    type(el, '0');
    expect(el.value).toBe('-0');

    el.blur();

    expect(el.value).toBe('0');
    expect(instance.valueAsNumber).not.toBe(-0);
    expect(Object.is(instance.valueAsNumber, -0)).toBe(false);
    expect(instance.valueAsNumber).toBe(0);
    document.body.removeChild(container);
  });

  it('settles "-0.00" to "0.00" on blur', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const instance = new NumoraInput(container, {
      allowNegative: true,
      decimalMinLength: 2,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.focus();
    for (const ch of '-0.00') type(el, ch);
    el.blur();

    expect(el.value).toBe('0.00');
    void instance;
    document.body.removeChild(container);
  });
});
