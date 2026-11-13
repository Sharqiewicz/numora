import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NumoraInput } from '../src/index';

function nativeInput(input: HTMLInputElement, value: string, init: InputEventInit = {}) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.setSelectionRange(value.length, value.length);
  act(() => {
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', ...init })
    );
  });
}

describe('React input fallback', () => {
  it('focused Change mode reads its own grouping: 12,3456 -> 123,456', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" formatOn="change" defaultValue="12345" onChange={onChange} />);
    const el = screen.getByTestId('i') as HTMLInputElement;
    el.focus();
    nativeInput(el, '12,3456');
    expect(el.value).toBe('123,456');
    expect(onChange.mock.calls.at(-1)![0].target.value).toBe('123456');
  });
  it('does not rewrite while isComposing, reconciles on the final input', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" formatOn="change" onChange={onChange} />);
    const el = screen.getByTestId('i') as HTMLInputElement;
    el.focus();
    nativeInput(el, '1234', { isComposing: true });
    expect(el.value).toBe('1234');
    expect(onChange).not.toHaveBeenCalled();
    nativeInput(el, '12345', { isComposing: false });
    expect(el.value).toBe('12,345');
  });
});
