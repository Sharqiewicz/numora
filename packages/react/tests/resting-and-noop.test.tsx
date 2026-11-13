import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { NumoraInput } from '../src/index';

// Default options everywhere (formatOn: 'change'): resting clean-up and no-op reporting.

let el: HTMLInputElement;
const vc = vi.fn();
const ch = vi.fn();
afterEach(() => {
  cleanup();
  vc.mockClear();
  ch.mockClear();
});

function mount(props: Record<string, unknown> = {}) {
  const utils = render(<NumoraInput onValueChange={vc} onChange={ch} {...props} />);
  el = utils.container.querySelector('input') as HTMLInputElement;
}
function typeChar(char: string) {
  const be = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  act(() => {
    el.dispatchEvent(be);
  });
}
const typeAll = (s: string) => {
  for (const c of s) typeChar(c);
};
function paste(text: string) {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  act(() => {
    el.dispatchEvent(ev);
  });
}
const focus = () => act(() => el.focus());
const blur = () => act(() => el.blur());

describe('blur settles the field under default options', () => {
  it('strips a trailing separator and reports once', () => {
    mount();
    focus();
    typeAll('1.');
    expect(el.value).toBe('1.');
    vc.mockClear();
    ch.mockClear();
    blur();
    expect(el.value).toBe('1');
    expect(vc).toHaveBeenCalledTimes(1);
    expect(vc).toHaveBeenCalledWith({ value: '1', formattedValue: '1' });
    expect(ch).toHaveBeenCalledTimes(1);
  });

  it('strips a trailing separator in de-DE', () => {
    mount({ locale: 'de-DE' });
    focus();
    typeAll('1,');
    expect(el.value).toBe('1,');
    vc.mockClear();
    blur();
    expect(el.value).toBe('1');
    expect(vc).toHaveBeenCalledTimes(1);
    expect(vc).toHaveBeenCalledWith({ value: '1', formattedValue: '1' });
  });

  it('a lone separator rests as empty', () => {
    mount();
    focus();
    typeAll('.');
    expect(el.value).toBe('.');
    blur();
    expect(el.value).toBe('');
    expect((el as unknown as { rawValue: string }).rawValue).toBe('');
  });

  it('a lone minus rests as empty (allowNegative)', () => {
    mount({ allowNegative: true });
    focus();
    typeAll('-');
    expect(el.value).toBe('-');
    blur();
    expect(el.value).toBe('');
  });

  it('a blur on a settled field emits nothing', () => {
    mount({ defaultValue: '1234.5' });
    focus();
    blur();
    focus();
    blur();
    expect(el.value).toBe('1,234.5');
    expect(vc).not.toHaveBeenCalled();
    expect(ch).not.toHaveBeenCalled();
  });
});

describe('resting formatter', () => {
  it('defaultValue "-0" shows 0 immediately', () => {
    mount({ allowNegative: true, defaultValue: '-0' });
    expect(el.value).toBe('0');
  });
  it('defaultValue "-" is empty', () => {
    mount({ allowNegative: true, defaultValue: '-' });
    expect(el.value).toBe('');
  });
  it('typing -0 while focused stays -0', () => {
    mount({ allowNegative: true });
    focus();
    typeAll('-0');
    expect(el.value).toBe('-0');
  });
  it('a formatting-prop change keeps a lone minus being typed (uncontrolled)', () => {
    const utils = render(<NumoraInput allowNegative onValueChange={vc} />);
    el = utils.container.querySelector('input') as HTMLInputElement;
    focus();
    typeAll('-');
    vc.mockClear();
    utils.rerender(<NumoraInput allowNegative decimalMaxLength={2} onValueChange={vc} />);
    expect(el.value).toBe('-');
    expect(vc).not.toHaveBeenCalled();
  });
});

describe('paste that leaves the text unchanged', () => {
  it('abc over empty field', () => {
    mount();
    paste('abc');
    expect(el.value).toBe('');
    expect(vc).not.toHaveBeenCalled();
    expect(ch).not.toHaveBeenCalled();
  });
  it('empty clipboard', () => {
    mount({ defaultValue: '12' });
    paste('');
    expect(vc).not.toHaveBeenCalled();
  });
  it('same number over a full selection', () => {
    mount({ defaultValue: '123' });
    focus();
    el.setSelectionRange(0, 3);
    paste('123');
    expect(el.value).toBe('123');
    expect(vc).not.toHaveBeenCalled();
    expect(ch).not.toHaveBeenCalled();
  });
  it('digits truncated away by maxLength', () => {
    mount({ defaultValue: '123', maxLength: 3 });
    focus();
    el.setSelectionRange(3, 3);
    paste('45');
    expect(el.value).toBe('123');
    expect(vc).not.toHaveBeenCalled();
  });
  it('a real paste still reports', () => {
    mount();
    paste('12');
    expect(vc).toHaveBeenCalledWith({ value: '12', formattedValue: '12' });
  });
});

describe('input fallback', () => {
  // Native `input` event that React's value tracker sees as a change.
  function nativeInput(value: string) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    act(() => {
      setter.call(el, value);
      el.setSelectionRange(value.length, value.length);
      el.dispatchEvent(
        new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' })
      );
    });
  }
  it('programmatic input with unchanged text reports nothing', () => {
    mount({ defaultValue: '12' });
    act(() => {
      el.dispatchEvent(
        new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' })
      );
    });
    expect(vc).not.toHaveBeenCalled();
  });
  it('isAllowed rejection restores the previous text', () => {
    mount({ defaultValue: '12', isAllowed: (v: string) => v.length <= 3 });
    nativeInput('5000');
    expect(el.value).toBe('12');
    expect(vc).not.toHaveBeenCalled();
    expect(ch).not.toHaveBeenCalled();
  });
  it('isAllowed acceptance still reports', () => {
    mount({ defaultValue: '12', isAllowed: (v: string) => v.length <= 3 });
    nativeInput('500');
    expect(el.value).toBe('500');
    expect(vc).toHaveBeenCalledWith({ value: '500', formattedValue: '500' });
  });
});
