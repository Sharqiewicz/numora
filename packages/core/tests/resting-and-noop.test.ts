import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';

// Default options everywhere (formatOn: 'change'): resting clean-up and no-op reporting.

let container: HTMLElement;
let calls: { value: string; formattedValue: string }[];

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  calls = [];
});
afterEach(() => {
  container.remove();
  vi.restoreAllMocks();
});

function make(options: Record<string, unknown> = {}) {
  const numora = new NumoraInput(container, {
    onValueChange: (v: { value: string; formattedValue: string }) => calls.push(v),
    ...options,
  } as never);
  return { numora, el: numora.element };
}
function typeChar(el: HTMLInputElement, char: string) {
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
  el.setSelectionRange(s + 1, s + 1);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}
const typeAll = (el: HTMLInputElement, s: string) => {
  for (const c of s) typeChar(el, c);
};
function paste(el: HTMLInputElement, text: string) {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  el.dispatchEvent(ev);
}
function nativeInput(el: HTMLInputElement, value: string) {
  el.value = value;
  el.setSelectionRange(value.length, value.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' }));
}

describe('blur settles the field under default options', () => {
  it('strips a trailing separator and reports the raw change once', () => {
    const { numora, el } = make();
    el.focus();
    typeAll(el, '1.');
    expect(el.value).toBe('1.');
    calls.length = 0;
    el.blur();
    expect(el.value).toBe('1');
    expect(numora.rawValue).toBe('1');
    expect(calls).toEqual([{ value: '1', formattedValue: '1' }]);
  });

  it('strips a trailing separator in de-DE', () => {
    const { numora, el } = make({ locale: 'de-DE' });
    el.focus();
    typeAll(el, '1,');
    expect(el.value).toBe('1,');
    calls.length = 0;
    el.blur();
    expect(el.value).toBe('1');
    expect(numora.rawValue).toBe('1');
    expect(calls).toEqual([{ value: '1', formattedValue: '1' }]);
  });

  it('a lone separator rests as empty', () => {
    const { numora, el } = make();
    el.focus();
    typeAll(el, '.');
    expect(el.value).toBe('.');
    el.blur();
    expect(el.value).toBe('');
    expect(numora.rawValue).toBe('');
  });

  it('a lone minus rests as empty (allowNegative)', () => {
    const { numora, el } = make({ allowNegative: true });
    el.focus();
    typeAll(el, '-');
    expect(el.value).toBe('-');
    el.blur();
    expect(el.value).toBe('');
    expect(numora.rawValue).toBe('');
  });

  it('a blur on a settled field emits nothing', () => {
    const { el } = make({ defaultValue: '1234.5' });
    el.focus();
    el.blur();
    el.focus();
    el.blur();
    expect(el.value).toBe('1,234.5');
    expect(calls).toEqual([]);
  });
});

describe('resting formatter', () => {
  it('defaultValue "-0" shows 0 immediately', () => {
    const { numora, el } = make({ allowNegative: true, defaultValue: '-0' });
    expect(el.value).toBe('0');
    expect(numora.rawValue).toBe('0');
  });
  it('defaultValue "-" is empty', () => {
    const { numora, el } = make({ allowNegative: true, defaultValue: '-' });
    expect(el.value).toBe('');
    expect(numora.rawValue).toBe('');
  });
  it('typing -0 while focused stays -0', () => {
    const { el } = make({ allowNegative: true });
    el.focus();
    typeAll(el, '-0');
    expect(el.value).toBe('-0');
  });
});

describe('paste that leaves the text unchanged', () => {
  it('abc over empty field', () => {
    const { el } = make();
    paste(el, 'abc');
    expect(el.value).toBe('');
    expect(calls).toEqual([]);
  });
  it('empty clipboard', () => {
    const { el } = make({ defaultValue: '12' });
    paste(el, '');
    expect(calls).toEqual([]);
  });
  it('same number over a full selection', () => {
    const { el } = make({ defaultValue: '123' });
    el.focus();
    el.setSelectionRange(0, 3);
    paste(el, '123');
    expect(el.value).toBe('123');
    expect(calls).toEqual([]);
  });
  it('digits truncated away by maxLength', () => {
    const { el } = make({ defaultValue: '123', maxLength: 3 });
    el.focus();
    el.setSelectionRange(3, 3);
    paste(el, '45');
    expect(el.value).toBe('123');
    expect(calls).toEqual([]);
  });
  it('a real paste still reports', () => {
    const { el } = make();
    paste(el, '12');
    expect(calls).toEqual([{ value: '12', formattedValue: '12' }]);
  });
});

describe('input fallback', () => {
  it('programmatic input with unchanged text reports nothing', () => {
    const { el } = make({ defaultValue: '12' });
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' }));
    expect(calls).toEqual([]);
  });
  it('isAllowed rejection restores the previous text', () => {
    const isAllowed = (v: string) => v.length <= 3;
    const { numora, el } = make({ defaultValue: '12', isAllowed });
    nativeInput(el, '5000');
    expect(el.value).toBe('12');
    expect(numora.rawValue).toBe('12');
    expect(calls).toEqual([]);
  });
  it('isAllowed acceptance still reports', () => {
    const { el } = make({ defaultValue: '12', isAllowed: (v: string) => v.length <= 3 });
    nativeInput(el, '500');
    expect(el.value).toBe('500');
    expect(calls).toEqual([{ value: '500', formattedValue: '500' }]);
  });
});
