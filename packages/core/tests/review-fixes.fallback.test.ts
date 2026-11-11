import { describe, it, expect, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';

// `input` fallback: the focused field's own grouped text must not be read as foreign, and an
// active IME composition must not be rewritten.

let container: HTMLElement;
function make(options: Record<string, unknown> = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  const numora = new NumoraInput(container, options as never);
  return { numora, el: numora.element };
}
function native(el: HTMLInputElement, value: string, init: InputEventInit = {}) {
  el.value = value;
  el.setSelectionRange(value.length, value.length);
  el.dispatchEvent(
    new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', ...init })
  );
}
afterEach(() => container?.remove());

describe('focused fallback in Change mode reads the field text as its own', () => {
  it('en: 12,3456 -> 123,456', () => {
    const { numora, el } = make({ formatOn: 'change', initialValue: '12345' });
    el.focus();
    native(el, '12,3456');
    expect(el.value).toBe('123,456');
    expect(numora.rawValue).toBe('123456');
  });
  it('de-DE: 1.2345 -> 12.345', () => {
    const { numora, el } = make({ formatOn: 'change', locale: 'de-DE', initialValue: '1234' });
    el.focus();
    native(el, '1.2345');
    expect(el.value).toBe('12.345');
    expect(numora.rawValue).toBe('12345');
  });
  it('Blur mode focused still detects foreign text: 1,5 is a decimal', () => {
    const { el } = make({ initialValue: '12345' });
    el.focus();
    native(el, '1,5', { inputType: 'insertFromDrop' });
    expect(el.value).toBe('1.5');
  });
  it('unfocused Change mode still detects foreign text', () => {
    const { el } = make({ formatOn: 'change', locale: 'de-DE' });
    native(el, '1.5', { inputType: 'insertFromDrop' });
    expect(el.value).toBe('1,5');
  });
});

describe('IME composition', () => {
  it('does not rewrite while isComposing, reconciles on the final input', () => {
    const { numora, el } = make({ formatOn: 'change' });
    el.focus();
    native(el, '1234', { isComposing: true });
    expect(el.value).toBe('1234');
    native(el, '12345', { isComposing: false });
    expect(el.value).toBe('12,345');
    expect(numora.rawValue).toBe('12345');
  });
});
