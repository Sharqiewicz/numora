import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput, type NumoraInputOptions } from '../src/NumoraInput';

// onFormattedValueChange: the display string, every time Numora rewrites the field, including
// the rewrites onValueChange stays quiet about (blur regroup, focus strip, setValue, a new
// locale). Never on mount, never twice for the same text.
describe('onFormattedValueChange (vanilla)', () => {
  let host: HTMLDivElement;
  const onFormattedValueChange = vi.fn();
  const onValueChange = vi.fn();
  const make = (options: NumoraInputOptions = {}) =>
    new NumoraInput(host, { onFormattedValueChange, onValueChange, ...options });
  const type = (el: HTMLInputElement, data: string) =>
    el.dispatchEvent(
      new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data })
    );
  const paste = (el: HTMLInputElement, text: string) => {
    const ev = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
    el.dispatchEvent(ev);
  };
  const texts = () => onFormattedValueChange.mock.calls.map((c) => c[0]);

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    onFormattedValueChange.mockClear();
    onValueChange.mockClear();
  });
  afterEach(() => host.remove());

  it('does not fire on mount', () => {
    make({ defaultValue: '1234567' });
    expect(onFormattedValueChange).not.toHaveBeenCalled();
  });

  it('fires with the display string on typing', () => {
    const input = make({ formatOn: 'change', defaultValue: '123' });
    input.element.focus();
    input.element.setSelectionRange(3, 3);
    type(input.element, '4');
    expect(texts()).toEqual(['1,234']);
  });

  it('fires on paste', () => {
    const input = make({ formatOn: 'change' });
    input.element.focus();
    paste(input.element, '1234567.5');
    expect(texts()).toEqual(['1,234,567.5']);
  });

  it('fires on the focus strip and the blur regroup, where onValueChange is silent', () => {
    const input = make({ formatOn: 'blur', defaultValue: '1234567' });
    input.element.focus();
    expect(texts()).toEqual(['1234567']);
    input.element.blur();
    expect(texts()).toEqual(['1234567', '1,234,567']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('fires on setValue, which stays silent for onValueChange', () => {
    const input = make();
    input.setValue('1234.5');
    expect(texts()).toEqual(['1,234.5']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('fires on a locale change made with update()', () => {
    const input = make({ defaultValue: '1234567.89' });
    input.update({ locale: 'de-DE' });
    expect(texts()).toEqual(['1.234.567,89']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not repeat the same text', () => {
    const input = make({ defaultValue: '5' });
    input.setValue('5');
    input.update({ decimalMaxLength: 4 });
    input.element.focus();
    input.element.blur();
    expect(onFormattedValueChange).not.toHaveBeenCalled();
  });

  it('runs after onValueChange', () => {
    const order: string[] = [];
    const input = make({
      formatOn: 'change',
      onValueChange: () => order.push('value'),
      onFormattedValueChange: () => order.push('formatted'),
    });
    input.element.focus();
    type(input.element, '7');
    expect(order).toEqual(['value', 'formatted']);
  });

  it('a callback given to update() is the one called', () => {
    const input = make();
    const next = vi.fn();
    input.update({ onFormattedValueChange: next });
    input.setValue('42');
    expect(next).toHaveBeenCalledWith('42');
    expect(onFormattedValueChange).not.toHaveBeenCalled();
  });

  it('must be a function', () => {
    expect(() => make({ onFormattedValueChange: 'no' as never })).toThrow(/onFormattedValueChange/);
  });
});
