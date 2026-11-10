import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput, type NumoraInputChangeEvent } from '../src/index';

/** Behaviour that mutation testing showed no other test pins (packages/react/src/index.tsx). */

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
function nativeInput(input: HTMLInputElement, value: string, inputType = 'insertReplacementText') {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set!;
  setter.call(input, value);
  input.setSelectionRange(value.length, value.length);
  act(() => {
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
  });
}
afterEach(() => vi.restoreAllMocks());

describe('synthetic event target (index.tsx:87)', () => {
  it('methods called on e.target inside onChange are bound to the real input', () => {
    let err: unknown;
    let focused = false;
    const onChange = (e: NumoraInputChangeEvent) => {
      try {
        e.target.focus();
        focused = document.activeElement === screen.getByTestId('i');
        e.target.blur();
      } catch (x) {
        err = x;
      }
    };
    render(<NumoraInput data-testid="i" onChange={onChange} />);
    typeChar(screen.getByTestId('i') as HTMLInputElement, '1');
    expect(err).toBeUndefined();
    expect(focused).toBe(true);
    expect(document.activeElement).not.toBe(screen.getByTestId('i'));
  });
});

describe('options memo deps (index.tsx:237)', () => {
  it('rerender with a new thousandSeparator / locale re-resolves the display separators', () => {
    const { rerender } = render(<NumoraInput data-testid="i" value="1234567" />);
    const el = screen.getByTestId('i') as HTMLInputElement;
    expect(el.value).toBe('1,234,567');
    rerender(<NumoraInput data-testid="i" value="1234567.5" thousandSeparator=" " />);
    expect(el.value).toBe('1 234 567.5');
    rerender(<NumoraInput data-testid="i" value="1234567.6" locale="de-DE" />);
    expect(el.value).toBe('1.234.567,6');
  });
});

describe('canonical source for app-supplied values (index.tsx:273/308/323)', () => {
  it('uncontrolled defaultValue is canonical, shown with comma decimal', () => {
    render(
      <NumoraInput
        data-testid="i"
        defaultValue="1234.5"
        decimalSeparator=","
        thousandSeparator="."
      />
    );
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('1.234,5');
  });
  it('initial controlled value is canonical', () => {
    render(
      <NumoraInput data-testid="i" value="1234.5" decimalSeparator="," thousandSeparator="." />
    );
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('1.234,5');
  });
  it('a controlled value change in a comma-decimal locale is not read as display text', () => {
    const { rerender } = render(
      <NumoraInput data-testid="i" value="1" decimalSeparator="," thousandSeparator="." />
    );
    rerender(
      <NumoraInput data-testid="i" value="1234.5" decimalSeparator="," thousandSeparator="." />
    );
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('1.234,5');
  });
  it('a focused (Blur-mode) controlled change is canonical too and carries no separators', () => {
    const { rerender } = render(
      <NumoraInput data-testid="i" value="1" decimalSeparator="," thousandSeparator="." />
    );
    const el = screen.getByTestId('i') as HTMLInputElement;
    el.focus();
    rerender(
      <NumoraInput data-testid="i" value="1234.5" decimalSeparator="," thousandSeparator="." />
    );
    expect(el.value).toBe('1234,5');
  });
});

describe('beforeinput skip/reject leaves the formattedValue mirror alone (index.tsx:343)', () => {
  it('a rejected edit does not refresh the mirror from the DOM', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" isAllowed={(r) => r !== '12'} onChange={onChange} />);
    const el = screen.getByTestId('i') as HTMLInputElement & { formattedValue?: string };
    typeChar(el, '1');
    expect(el.formattedValue).toBe('1');
    // The browser text drifts from what Numora last wrote (e.g. a pending native edit).
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, '1x');
    el.setSelectionRange(2, 2);
    const be = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: '2',
    });
    el.dispatchEvent(be);
    expect(be.defaultPrevented).toBe(true);
    expect(el.value).toBe('1x');
    expect(el.formattedValue).toBe('1');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it('a rejected scientific-notation fallback restores the last written value from the mirror', () => {
    render(<NumoraInput data-testid="i" allowScientificNotation={false} />);
    const el = screen.getByTestId('i') as HTMLInputElement;
    typeChar(el, '1');
    typeChar(el, '2');
    nativeInput(el, '12e5');
    expect(el.value).toBe('12');
  });
});
