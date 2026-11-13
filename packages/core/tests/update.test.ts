import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput, type NumoraInputOptions } from '../src/NumoraInput';
import { FormatOn } from '../src/types';

// update(): options change on a live field. The raw value is kept and re-run through the
// new options; onValueChange reports raw changes only (ADR 0008).
describe('NumoraInput.update', () => {
  let host: HTMLDivElement;
  const onValueChange = vi.fn();
  const make = (options: NumoraInputOptions = {}) => new NumoraInput(host, { onValueChange, ...options });

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    onValueChange.mockClear();
  });
  afterEach(() => host.remove());

  it('re-formats the live value under a new locale without notifying', () => {
    const input = make({ defaultValue: '1234567.89' });
    expect(input.formattedValue).toBe('1,234,567.89');

    input.update({ locale: 'de-DE' });

    expect(input.formattedValue).toBe('1.234.567,89');
    expect(input.rawValue).toBe('1234567.89');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('notifies when the new options change the raw value', () => {
    const input = make({ defaultValue: '1.23456789' });

    input.update({ decimalMaxLength: 2 });

    expect(input.rawValue).toBe('1.23');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ value: '1.23', formattedValue: '1.23' });
  });

  it('dropping allowNegative removes the sign and notifies', () => {
    const input = make({ allowNegative: true, defaultValue: '-5' });
    input.update({ allowNegative: false });
    expect(input.rawValue).toBe('5');
    expect(onValueChange).toHaveBeenCalledWith({ value: '5', formattedValue: '5' });
  });

  it('merges: options not mentioned are kept', () => {
    const input = make({ locale: 'de-DE', decimalMaxLength: 2, defaultValue: '1234.5' });
    input.update({ decimalMinLength: 2 });
    expect(input.formattedValue).toBe('1.234,50');
    input.setValue('1.999');
    expect(input.rawValue).toBe('1.99');
  });

  it('undefined restores the default', () => {
    const input = make({ locale: 'de-DE', decimalMaxLength: 2, defaultValue: '1234.5' });
    input.update({ locale: undefined, decimalMaxLength: undefined });
    expect(input.formattedValue).toBe('1,234.5');
    input.setValue('0.123456');
    expect(input.rawValue).toBe('0.123456');
  });

  it('later typing, paste and blur use the new options', () => {
    const input = make({ defaultValue: '1234' });
    input.update({ locale: 'de-DE', formatOn: FormatOn.Change });
    const el = input.element;
    el.setSelectionRange(el.value.length, el.value.length);
    const e = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: ',',
    });
    el.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    expect(el.value).toBe('1.234,');
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '1234.', formattedValue: '1.234,' });
  });

  it('swaps onValueChange', () => {
    const next = vi.fn();
    const input = make({ defaultValue: '1.239' });
    input.update({ onValueChange: next });
    input.update({ decimalMaxLength: 2 });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith({ value: '1.23', formattedValue: '1.23' });
  });

  it('applies native attributes and sets no pattern', () => {
    const input = make({ placeholder: '0.0' });
    input.update({ placeholder: 'Amount', disabled: true, ariaLabel: 'Amount', locale: 'de-DE' });
    const el = input.element;
    expect(el.placeholder).toBe('Amount');
    expect(el.disabled).toBe(true);
    expect(el.getAttribute('aria-label')).toBe('Amount');
    expect(el.hasAttribute('pattern')).toBe(false);

    input.update({ placeholder: undefined });
    expect(el.placeholder).toBe('Amount');
  });

  it('ignores value: the live value is kept', () => {
    const input = make({ defaultValue: '5' });
    input.update({ value: '9' } as never);
    expect(input.rawValue).toBe('5');
  });

  it('an invalid combination throws and changes nothing', () => {
    const input = make({ locale: 'de-DE', defaultValue: '1234.5' });
    expect(() => input.update({ thousandSeparator: ',', decimalSeparator: ',' })).toThrow(
      /cannot equal/
    );
    expect(() => input.update({ decimalMaxLength: -1, placeholder: 'x' })).toThrow();

    expect(input.formattedValue).toBe('1.234,5');
    expect(input.element.placeholder).toBe('');
    input.setValue('99.5');
    expect(input.formattedValue).toBe('99,5');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('the rewrite goes through setRangeText, and only when the text changes', () => {
    const input = make({ defaultValue: '1234' });
    const spy = vi.spyOn(input.element, 'setRangeText');
    input.update({ locale: 'de-DE' });
    expect(spy).toHaveBeenCalled();
    spy.mockClear();
    input.update({ placeholder: 'same text, no write' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('a focused Blur-mode field keeps its ungrouped edit format', () => {
    const input = make({ formatOn: 'blur', defaultValue: '1234567.5' });
    const el = input.element;
    el.dispatchEvent(new Event('focus'));
    expect(el.value).toBe('1234567.5');

    input.update({ locale: 'de-DE' });
    expect(el.value).toBe('1234567,5');

    el.dispatchEvent(new Event('blur'));
    expect(el.value).toBe('1.234.567,5');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('a refused input after update restores the re-formatted text', () => {
    const input = make({ defaultValue: '1234', allowScientificNotation: false });
    input.update({ locale: 'de-DE' });
    const el = input.element;
    el.value = '1e5';
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' }));
    expect(el.value).toBe('1.234');
  });

  it('warns about an option removed since v4', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    make().update({ enableNegative: true } as never);
    expect(warn.mock.calls[0][0]).toContain('enableNegative is removed in v5');
    vi.unstubAllEnvs();
    warn.mockRestore();
  });
  describe('on a field being typed in', () => {
    const type = (el: HTMLInputElement, text: string) => {
      for (const data of text)
        el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data }));
    };

    it('leaves the text and caret alone when the options format the same way', () => {
      const onFormattedValueChange = vi.fn();
      const input = make({ onFormattedValueChange });
      const el = input.element;
      el.focus();
      type(el, '1234.');
      el.setSelectionRange(1, 1);
      onValueChange.mockClear();
      onFormattedValueChange.mockClear();

      input.update({});
      input.update({ decimalMaxLength: 18, isAllowed: () => true });

      expect(el.value).toBe('1,234.');
      expect(el.selectionStart).toBe(1);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onFormattedValueChange).not.toHaveBeenCalled();
    });

    it('a wrapper that calls update() after every change can still type a decimal', () => {
      const options: NumoraInputOptions = {
        onValueChange: (values) => {
          onValueChange(values.value);
          input.update(options);
        },
      };
      const input: NumoraInput = new NumoraInput(host, options);
      input.element.focus();
      type(input.element, '1.5');

      expect(input.element.value).toBe('1.5');
      expect(onValueChange.mock.calls.flat()).toEqual(['1', '1.', '1.5']);
    });

    it('does not pad to decimalMinLength mid-edit', () => {
      const input = make({ decimalMinLength: 2 });
      input.element.focus();
      type(input.element, '1');
      input.update({ decimalMinLength: 2 });
      type(input.element, '2');

      expect(input.element.value).toBe('12');
    });

    it('still applies the new options to the next keystroke and to attributes', () => {
      const next = vi.fn();
      const input = make();
      input.element.focus();
      type(input.element, '1.');
      input.update({ onValueChange: next, placeholder: '0.00' });
      type(input.element, '5');

      expect(input.element.placeholder).toBe('0.00');
      expect(next).toHaveBeenCalledWith({ value: '1.5', formattedValue: '1.5' });
    });

    it('still re-formats when the formatting really changed', () => {
      const input = make();
      input.element.focus();
      type(input.element, '1234.567');
      onValueChange.mockClear();
      input.update({ decimalMaxLength: 2 });

      expect(input.element.value).toBe('1,234.56');
      expect(onValueChange).toHaveBeenCalledWith({ value: '1234.56', formattedValue: '1,234.56' });
    });

    it('still re-formats a field at rest when nothing changed', () => {
      const input = make();
      input.element.focus();
      type(input.element, '1.');
      input.element.blur();
      input.element.value = '1234';
      input.update({});

      expect(input.element.value).toBe('1,234');
    });
  });
});
