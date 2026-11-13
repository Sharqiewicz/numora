import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumoraInput, type NumoraHTMLInputElement, type NumoraInputProps } from '../src/index';

// onFormattedValueChange: the display string, every time Numora rewrites the field. Same
// cases as packages/core/tests/formatted-value-change.test.ts, plus the controlled ones.
const field = () => screen.getByTestId('i') as HTMLInputElement;
const type = (data: string) =>
  act(() => {
    field().dispatchEvent(
      new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data })
    );
  });
const paste = (text: string) => {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  act(() => {
    field().dispatchEvent(ev);
  });
};

function setup(props: NumoraInputProps = {}) {
  const onFormattedValueChange = vi.fn();
  const onValueChange = vi.fn();
  const ref = { current: null as NumoraHTMLInputElement | null };
  const all = { onFormattedValueChange, onValueChange, ...props };
  const view = render(<NumoraInput data-testid="i" ref={ref} {...all} />);
  const rerender = (next: NumoraInputProps) =>
    view.rerender(<NumoraInput data-testid="i" ref={ref} {...all} {...next} />);
  const texts = () => onFormattedValueChange.mock.calls.map((c) => c[0]);
  return { onFormattedValueChange, onValueChange, ref, rerender, texts };
}

describe('onFormattedValueChange (React)', () => {
  it('does not fire on mount', () => {
    const { onFormattedValueChange } = setup({ defaultValue: '1234567' });
    expect(onFormattedValueChange).not.toHaveBeenCalled();
    const controlled = setup({ value: '1234567' });
    expect(controlled.onFormattedValueChange).not.toHaveBeenCalled();
  });

  it('fires with the display string on typing', () => {
    const { texts } = setup({ formatOn: 'change', defaultValue: '123' });
    act(() => field().focus());
    field().setSelectionRange(3, 3);
    type('4');
    expect(texts()).toEqual(['1,234']);
  });

  it('fires on paste', () => {
    const { texts } = setup({ formatOn: 'change' });
    act(() => field().focus());
    paste('1234567.5');
    expect(texts()).toEqual(['1,234,567.5']);
  });

  it('fires on the focus strip and the blur regroup, where onValueChange is silent', () => {
    const { texts, onValueChange } = setup({ formatOn: 'blur', defaultValue: '1234567' });
    act(() => field().focus());
    expect(texts()).toEqual(['1234567']);
    act(() => field().blur());
    expect(texts()).toEqual(['1234567', '1,234,567']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('fires on ref.setValue, which stays silent for onValueChange', () => {
    const { texts, onValueChange, ref } = setup();
    act(() => ref.current?.setValue('1234.5'));
    expect(texts()).toEqual(['1,234.5']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('fires on a locale change', () => {
    const { texts, onValueChange, rerender } = setup({ defaultValue: '1234567.89' });
    rerender({ locale: 'de-DE' });
    expect(texts()).toEqual(['1.234.567,89']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('fires when the controlled value changes from outside', () => {
    const { texts, onValueChange, rerender } = setup({ value: '1' });
    rerender({ value: '1234567' });
    expect(texts()).toEqual(['1,234,567']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not repeat the same text', () => {
    const { onFormattedValueChange, ref, rerender } = setup({ defaultValue: '5' });
    act(() => ref.current?.setValue('5'));
    rerender({ decimalMaxLength: 4 });
    act(() => field().focus());
    act(() => field().blur());
    expect(onFormattedValueChange).not.toHaveBeenCalled();
  });

  it('runs after onChange and onValueChange', () => {
    const order: string[] = [];
    setup({
      formatOn: 'change',
      onChange: () => order.push('change'),
      onValueChange: () => order.push('value'),
      onFormattedValueChange: () => order.push('formatted'),
    });
    act(() => field().focus());
    type('7');
    expect(order).toEqual(['change', 'value', 'formatted']);
  });

  it('a controlled echo reports each text once', () => {
    const seen: string[] = [];
    function Echo() {
      const [v, setV] = useState('123');
      return (
        <NumoraInput
          data-testid="i"
          formatOn="change"
          value={v}
          onValueChange={({ value }) => setV(value)}
          onFormattedValueChange={(text) => seen.push(text)}
        />
      );
    }
    render(<Echo />);
    act(() => field().focus());
    field().setSelectionRange(3, 3);
    type('4');
    expect(seen).toEqual(['1,234']);
  });

  it('a rejected controlled edit reports the edit and the put-back', () => {
    const { texts } = setup({ formatOn: 'change', value: '5' });
    act(() => field().focus());
    field().setSelectionRange(1, 1);
    type('6');
    expect(field().value).toBe('5');
    expect(texts()).toEqual(['56', '5']);
  });

  it('is not put on the DOM and must be a function', () => {
    setup();
    expect(field().getAttribute('onformattedvaluechange')).toBeNull();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => setup({ onFormattedValueChange: 'no' as never })).toThrow(/onFormattedValueChange/);
    vi.restoreAllMocks();
  });
});
