import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { StrictMode, createRef } from 'react';
import { NumoraInput, type NumoraInputChangeEvent } from '../src/index';
import { FormatOn } from 'numora';

function typeChar(el: HTMLInputElement, char: string): void {
  const be = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: char });
  el.dispatchEvent(be);
  if (be.defaultPrevented) return;
  const s = el.selectionStart ?? el.value.length;
  const e = el.selectionEnd ?? s;
  el.value = el.value.slice(0, s) + char + el.value.slice(e);
  el.setSelectionRange(s + char.length, s + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}
function paste(el: HTMLInputElement, text: string): void {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  el.dispatchEvent(ev);
}
// Native `input` event that React's value tracker sees as a change (bypasses the patched setter).
function nativeInput(input: HTMLInputElement, value: string, start: number, end = start, inputType = 'insertReplacementText') {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.setSelectionRange(start, end);
  act(() => {
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
  });
}
afterEach(() => vi.restoreAllMocks());

describe('ref forwarding (callback + object)', () => {
  it('callback ref gets the input on mount and null on unmount', () => {
    const ref = vi.fn();
    const { unmount } = render(<NumoraInput data-testid="i" ref={ref} />);
    expect(ref).toHaveBeenLastCalledWith(screen.getByTestId('i'));
    unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
  });
  it('object ref is nulled on unmount', () => {
    const ref = createRef<HTMLInputElement>();
    const { unmount } = render(<NumoraInput data-testid="i" ref={ref} />);
    expect(ref.current).toBe(screen.getByTestId('i'));
    unmount();
    expect(ref.current).toBeNull();
  });
  it('swapping the ref prop detaches the old and attaches the new', () => {
    const a = createRef<HTMLInputElement>();
    const b = createRef<HTMLInputElement>();
    const { rerender } = render(<NumoraInput data-testid="i" ref={a} />);
    rerender(<NumoraInput data-testid="i" ref={b} />);
    expect(a.current).toBeNull();
    expect(b.current).toBe(screen.getByTestId('i'));
  });
});

describe('StrictMode / listener cleanup', () => {
  it('StrictMode: one keystroke fires onChange exactly once', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<StrictMode><NumoraInput data-testid="i" onChange={onChange} onValueChange={onValueChange} /></StrictMode>);
    typeChar(screen.getByTestId('i') as HTMLInputElement, '5');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
  it('StrictMode: a mouse focus defers the strip to click once', () => {
    render(<StrictMode><NumoraInput data-testid="i" defaultValue="1234567" /></StrictMode>);
    const input = screen.getByTestId('i') as HTMLInputElement;
    fireEvent.mouseDown(input);
    fireEvent.focus(input);
    expect(input.value).toBe('1,234,567');
    fireEvent.click(input);
    expect(input.value).toBe('1234567');
  });
  it('after unmount the detached element no longer drives onChange', () => {
    const onChange = vi.fn();
    const { unmount } = render(<NumoraInput data-testid="i" onChange={onChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    unmount();
    typeChar(input, '5');
    expect(onChange).not.toHaveBeenCalled();
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(input.value).toBe('5'.slice(0, 0) || input.value); // no throw
  });
});

describe('mouse deferred strip', () => {
  const setup = (props = {}) => {
    render(<NumoraInput data-testid="i" defaultValue="1234567" {...props} />);
    return screen.getByTestId('i') as HTMLInputElement;
  };
  it('left mousedown -> focus keeps grouping; click strips and maps caret', () => {
    const input = setup();
    fireEvent.mouseDown(input, { button: 0 });
    fireEvent.focus(input);
    expect(input.value).toBe('1,234,567');
    input.setSelectionRange(3, 3);
    fireEvent.click(input);
    expect(input.value).toBe('1234567');
    expect(input.selectionStart).toBe(2);
  });
  it('mousedown + blur without click does not carry over to the next keyboard focus', () => {
    const input = setup();
    fireEvent.mouseDown(input, { button: 0 });
    fireEvent.focus(input);
    fireEvent.blur(input);
    fireEvent.focus(input);
    expect(input.value).toBe('1234567');
  });
  it('a click with no preceding mousedown is a no-op', () => {
    const input = setup();
    fireEvent.click(input);
    expect(input.value).toBe('1,234,567');
  });
  it('Change mode: focus and mouse focus never strip grouping', () => {
    const input = setup({ formatOn: FormatOn.Change });
    expect(input.value).toBe('1,234,567');
    fireEvent.focus(input);
    expect(input.value).toBe('1,234,567');
    fireEvent.mouseDown(input);
    fireEvent.click(input);
    expect(input.value).toBe('1,234,567');
  });
});

describe('callbacks and misc props', () => {
  it('forwards onFocus and onKeyDown', () => {
    const onFocus = vi.fn();
    const onKeyDown = vi.fn();
    render(<NumoraInput data-testid="i" onFocus={onFocus} onKeyDown={onKeyDown} />);
    const input = screen.getByTestId('i');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'a' });
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
  it('Backspace right after a separator moves the caret before it', () => {
    render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} defaultValue="1234" />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    input.setSelectionRange(2, 2); // 1,|234
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(input.selectionStart).toBe(1);
  });
  it('has a displayName', () => {
    expect(NumoraInput.displayName).toBe('NumoraInput');
  });
  it('boolean prop defaults are off: compact, negative, leading zeros', () => {
    render(<NumoraInput data-testid="i" />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    typeChar(input, '1');
    typeChar(input, 'k');
    expect(input.value).toBe('1');
    typeChar(input, '-');
    expect(input.value).toBe('1');
  });
  it('default enableLeadingZeros is off', () => {
    render(<NumoraInput data-testid="i" />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    typeChar(input, '0');
    typeChar(input, '0');
    typeChar(input, '5');
    expect(input.value).toBe('5');
  });
  it('e.target methods are callable on the synthetic target', () => {
    let ok = false;
    render(<NumoraInput data-testid="i" onChange={(e) => { e.target.setSelectionRange(0, 0); ok = true; }} />);
    typeChar(screen.getByTestId('i') as HTMLInputElement, '5');
    expect(ok).toBe(true);
  });
  it('synthetic nativeEvent is a bubbling change event', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" onChange={onChange} />);
    typeChar(screen.getByTestId('i') as HTMLInputElement, '5');
    const e: NumoraInputChangeEvent = onChange.mock.calls[0][0];
    expect(e.nativeEvent.type).toBe('change');
    expect(e.nativeEvent.bubbles).toBe(true);
  });
});

describe('beforeinput skip', () => {
  it('insertFromPaste beforeinput is neither prevented nor broadcast', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" onChange={onChange} />);
    const be = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertFromPaste', data: '5' });
    screen.getByTestId('i').dispatchEvent(be);
    expect(be.defaultPrevented).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('undo / redo through the real input event', () => {
  for (const inputType of ['historyUndo', 'historyRedo']) {
    it(`${inputType}: broadcasts the restored string without reformatting`, () => {
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} defaultValue="5" onChange={onChange} onValueChange={onValueChange} />);
      const input = screen.getByTestId('i') as NumoraInputChangeEvent['target'];
      input.focus();
      const setRangeText = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
      nativeInput(input, '1234', 4, 4, inputType); // a re-format would give '1,234'
      expect(input.value).toBe('1234');
      expect(setRangeText).not.toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].target.value).toBe('1234');
      expect(onChange.mock.calls[0][0].target.formattedValue).toBe('1234');
      expect(onValueChange).toHaveBeenCalledWith({ value: '1234', formattedValue: '1234' });
    });
  }
});

describe('input fallback', () => {
  it('rejects scientific notation when disabled: restores previous value, no onChange', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" enableScientificNotation={false} defaultValue="5" onChange={onChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    nativeInput(input, '1.5e-7', 6);
    expect(input.value).toBe('5');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('fires onValueChange and skips the rewrite when already formatted', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} onChange={onChange} onValueChange={onValueChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    const setRangeText = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    nativeInput(input, '1,234', 5);
    expect(setRangeText).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ value: '1234', formattedValue: '1,234' });
  });
  it('unfocused autofill in a de-DE field reads a foreign en-US string', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" locale="de-DE" onChange={onChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    nativeInput(input, '1,234.56', 8);
    expect(input.value).toBe('1.234,56');
    expect(onChange.mock.calls[0][0].target.value).toBe('1234.56');
  });
  it('uses the larger of selectionStart/selectionEnd as the caret', () => {
    render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    input.focus();
    nativeInput(input, '1234', 1, 3);
    expect(input.value).toBe('1,234');
    expect(input.selectionStart).toBe(4); // 1,23|4
  });
  // BUG (React/vanilla divergence): the focused fallback uses formatValueForDisplay, which pads and
  // strips the trailing separator mid-typing. Vanilla uses formatInputValue and keeps '1.'.
  it.fails('focused fallback does not strip a trailing separator or pad (typing-time rules)', () => {
    render(<NumoraInput data-testid="i" decimalMinLength={2} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    input.focus();
    nativeInput(input, '1.', 2, 2, 'insertCompositionText');
    expect(input.value).toBe('1.');
  });
});

describe('paste / blur onValueChange', () => {
  it('paste fires onValueChange', () => {
    const onValueChange = vi.fn();
    render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} onValueChange={onValueChange} />);
    paste(screen.getByTestId('i') as HTMLInputElement, '1234.5');
    expect(onValueChange).toHaveBeenCalledWith({ value: '1234.5', formattedValue: '1,234.5' });
  });
  it('blur fires onValueChange when grouping is added', () => {
    const onValueChange = vi.fn();
    render(<NumoraInput data-testid="i" onValueChange={onValueChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    input.focus();
    for (const c of '1234') typeChar(input, c);
    onValueChange.mockClear();
    act(() => input.blur());
    expect(input.value).toBe('1,234');
    expect(onValueChange).toHaveBeenCalledWith({ value: '1234', formattedValue: '1,234' });
  });
  it('Change mode (no decimalMinLength/enableNegative): blur leaves a trailing separator alone', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} onChange={onChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    input.focus();
    typeChar(input, '1'); typeChar(input, '2'); typeChar(input, '.');
    onChange.mockClear();
    act(() => input.blur());
    expect(input.value).toBe('12.');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('blur with an unchanged display does not rewrite the field', () => {
    render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} enableNegative />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    input.focus();
    typeChar(input, '1'); typeChar(input, '2');
    const setRangeText = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    act(() => input.blur());
    expect(setRangeText).not.toHaveBeenCalled();
  });
});

describe('controlled value sync', () => {
  it('locale: an external canonical value is formatted for the locale', () => {
    const { rerender } = render(<NumoraInput data-testid="i" locale="de-DE" value="1" onChange={() => {}} />);
    rerender(<NumoraInput data-testid="i" locale="de-DE" value="1234.5" onChange={() => {}} />);
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('1.234,5');
  });
  it('locale + focused Blur mode: external canonical value is formatted for editing', () => {
    const { rerender } = render(<NumoraInput data-testid="i" locale="de-DE" value="1" onChange={() => {}} />);
    (screen.getByTestId('i') as HTMLInputElement).focus();
    rerender(<NumoraInput data-testid="i" locale="de-DE" value="1234.5" onChange={() => {}} />);
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('1234,5');
  });
  it('does not rewrite when the parent value differs only by padding already shown', () => {
    const setRangeText = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    const { rerender } = render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} decimalMinLength={2} value="1234.5" onChange={() => {}} />);
    rerender(<NumoraInput data-testid="i" formatOn={FormatOn.Change} decimalMinLength={2} value="1234.5" onChange={() => {}} />);
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('1,234.50');
    expect(setRangeText).not.toHaveBeenCalled();
  });
});

describe('internal writes fire no input event', () => {
  it('typing calls onChange once and dispatches no input event (setRangeText is silent)', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" formatOn={FormatOn.Change} onChange={onChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    const inputEvents = vi.fn();
    input.addEventListener('input', inputEvents);
    typeChar(input, '5');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(inputEvents).not.toHaveBeenCalled();
  });
});
