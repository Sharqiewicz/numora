import { act, render } from '@testing-library/react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormatOn, NumoraInput } from '../src/index';

afterEach(() => vi.restoreAllMocks());

function nativeInput(input: HTMLInputElement, value: string, inputType = 'insertFromDrop') {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set!;
  setter.call(input, value);
  input.setSelectionRange(value.length, value.length);
  act(() => {
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
  });
}

function mountInShadow(el: (v?: string) => React.ReactElement) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadow.appendChild(container);
  const root: Root = createRoot(container);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  act(() => root.render(el()));
  return { shadow, root, input: shadow.querySelector('input') as HTMLInputElement };
}

describe('focus detection inside a shadow root', () => {
  it('keeps a trailing decimal separator and adds no grouping while focused', () => {
    const { shadow, input, root } = mountInShadow(() => <NumoraInput formatOn={FormatOn.Blur} />);
    act(() => input.focus());
    expect(shadow.activeElement).toBe(input);
    expect(document.activeElement).not.toBe(input);
    nativeInput(input, '1.');
    expect(input.value).toBe('1.');
    nativeInput(input, '1234.');
    expect(input.value).toBe('1234.');
    act(() => root.unmount());
  });

  it('does not group a controlled value change while focused', () => {
    const { input, root } = mountInShadow(() => <NumoraInput formatOn={FormatOn.Blur} value="1" onChange={() => {}} />);
    act(() => input.focus());
    act(() => root.render(<NumoraInput formatOn={FormatOn.Blur} value="1234567" onChange={() => {}} />));
    expect(input.value).toBe('1234567');
    act(() => root.unmount());
  });
});

describe('renamed v4 props', () => {
  const setEnv = (v: string) => vi.stubEnv('NODE_ENV', v);

  it.each([
    ['maxDecimals', 2, 'decimalMaxLength'],
    ['thousandStyle', 'lakh', 'groupingStyle'],
    ['rawValueMode', true, 'e.target.value'],
  ])('warns once for %s, names the replacement, and keeps it off the DOM', (name, val, hint) => {
    setEnv('development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const props = { [name]: val } as Record<string, unknown>;
    const { container, rerender } = render(<NumoraInput {...props} />);
    rerender(<NumoraInput {...props} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(name);
    expect(warn.mock.calls[0][0]).toContain(hint);
    expect(container.querySelector('input')?.hasAttribute(name.toLowerCase())).toBe(false);
    expect(container.querySelector('input')?.hasAttribute(name)).toBe(false);
  });

  it('does not warn in production', () => {
    setEnv('production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<NumoraInput {...({ maxDecimals: 2 } as object)} />);
    expect(warn).not.toHaveBeenCalled();
    expect(container.querySelector('input')?.hasAttribute('maxdecimals')).toBe(false);
  });

  it('does not warn without old props', () => {
    setEnv('development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<NumoraInput decimalMaxLength={2} />);
    expect(warn).not.toHaveBeenCalled();
  });
});
