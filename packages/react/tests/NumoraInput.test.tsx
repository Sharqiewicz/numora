import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';
import { NumoraInput, type NumoraHTMLInputElement, type NumoraInputChangeEvent } from '../src/index';
import { FormatOn, GroupingStyle } from 'numora';

// ---------------------------------------------------------------------------
// Helpers - simulate the real browser beforeinput → input event sequence.
// React's synthetic onChange fires from the native 'input' event, so both
// must be dispatched to exercise the full formatting path.
// ---------------------------------------------------------------------------

function simulateTyping(el: HTMLInputElement, char: string): void {
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  el.dispatchEvent(beforeInput);

  // Real browsers do NOT fire `input` after a preventDefault'd `beforeinput`. The
  // production handler calls setRangeText (which dispatches `input` synchronously) and
  // invokes onChange itself, so a synthetic `input` here would cause a double-fire.
  if (beforeInput.defaultPrevented) return;

  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  el.value = el.value.slice(0, start) + char + el.value.slice(end);
  el.setSelectionRange(start + char.length, start + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}

/** Simulate paste without relying on the ClipboardEvent constructor (not in jsdom). */
function simulatePaste(el: HTMLInputElement, text: string): void {
  const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(pasteEvent, 'clipboardData', {
    value: { getData: (_: string) => text },
  });
  el.dispatchEvent(pasteEvent);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NumoraInput', () => {
  describe('rendering and initial values', () => {
    it('renders as a text input with correct attributes', () => {
      render(<NumoraInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.type).toBe('text');
      expect(input.inputMode).toBe('decimal');
      expect(input.autocomplete).toBe('off');
      expect(input.getAttribute('spellcheck')).toBe('false');
    });

    it('renders empty when no value is provided', () => {
      render(<NumoraInput data-testid="input" />);
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('');
    });

    it('formats initial defaultValue with thousand separators (Change mode)', () => {
      render(
        <NumoraInput
          data-testid="input"
          defaultValue="1234.56"
          thousandSeparator=","
          formatOn={FormatOn.Change}
        />
      );
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('1,234.56');
    });

    it('formats initial controlled value with thousand separators (Change mode)', () => {
      render(
        <NumoraInput
          data-testid="input"
          value="9876"
          thousandSeparator=","
          formatOn={FormatOn.Change}
        />
      );
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('9,876');
    });

    it('formats initial defaultValue with thousand separators in Blur mode (unfocused mount)', () => {
      render(
        <NumoraInput
          data-testid="input"
          defaultValue="1234567"
          thousandSeparator=","
          groupingStyle={GroupingStyle.Thousand}
          formatOn={FormatOn.Blur}
        />
      );
      // Initial mount is unfocused, so Blur mode shows separators. Stripping only happens
      // on focus — without separators on mount, the first focus has nothing to strip
      // and overlay integrations (Torph etc.) never receive an onChange sync.
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('1,234,567');
    });

    it('forwards className and other HTML attributes', () => {
      render(<NumoraInput data-testid="input" className="my-input" placeholder="0.00" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.className).toBe('my-input');
      expect(input.placeholder).toBe('0.00');
    });
  });

  describe('ref forwarding', () => {
    it('forwards a ref to the underlying input element', () => {
      const ref = createRef<HTMLInputElement>();
      render(<NumoraInput ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('sets formattedValue on the ref element after mount', () => {
      const ref = createRef<HTMLInputElement>();
      render(<NumoraInput ref={ref} defaultValue="100" />);
      expect((ref.current as NumoraHTMLInputElement).formattedValue).toBe('100');
    });

    it('formattedValue on mount is empty string when no initial value', () => {
      const ref = createRef<HTMLInputElement>();
      render(<NumoraInput ref={ref} />);
      expect((ref.current as NumoraHTMLInputElement).formattedValue).toBe('');
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when the user types', () => {
      const onChange = vi.fn();
      render(<NumoraInput data-testid="input" onChange={onChange} />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      simulateTyping(input, '5');

      expect(onChange).toHaveBeenCalled();
    });

    it('e.target.value is the raw numeric string for typed input', () => {
      const onChange = vi.fn();
      render(<NumoraInput data-testid="input" onChange={onChange} />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      simulateTyping(input, '4');
      simulateTyping(input, '2');

      const lastEvent: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
      expect(lastEvent.target.value).toBe('42');
    });

    it('e.target.value strips thousand separators; e.target.formattedValue has them', () => {
      const onChange = vi.fn();
      render(
        <NumoraInput
          data-testid="input"
          onChange={onChange}
          thousandSeparator=","
          formatOn={FormatOn.Change}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '3');
      simulateTyping(input, '4');

      const lastEvent: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
      // Display has separator; e.target.value is raw (separators stripped).
      expect(input.value).toBe('1,234');
      expect(lastEvent.target.value).toBe('1234');
      expect((lastEvent.target as NumoraHTMLInputElement).formattedValue).toBe('1,234');
    });
  });

  describe('controlled value sync', () => {
    it('updates the displayed value when the value prop changes', () => {
      function Wrapper() {
        const [val, setVal] = useState('100');
        return (
          <>
            <NumoraInput
              data-testid="input"
              value={val}
              thousandSeparator=","
              formatOn={FormatOn.Change}
            />
            <button onClick={() => setVal('2000')}>Update</button>
          </>
        );
      }

      render(<Wrapper />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('100');

      fireEvent.click(screen.getByText('Update'));
      expect(input.value).toBe('2,000');
    });

    it('reformats when the value prop changes to include decimals', () => {
      function Wrapper() {
        const [val, setVal] = useState('100');
        return (
          <>
            <NumoraInput data-testid="input" value={val} decimalMaxLength={2} />
            <button onClick={() => setVal('99.99')}>Update</button>
          </>
        );
      }

      render(<Wrapper />);
      fireEvent.click(screen.getByText('Update'));
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('99.99');
    });

    it('does not inject separators mid-typing in Blur mode when controlled (#4)', () => {
      function Wrapper() {
        const [val, setVal] = useState('');
        return (
          <NumoraInput
            data-testid="input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            thousandSeparator=","
            groupingStyle={GroupingStyle.Thousand}
            formatOn={FormatOn.Blur}
          />
        );
      }
      render(<Wrapper />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      act(() => {
        input.focus();
      });

      // Type across a thousands boundary. Each keystroke echoes the raw value back into
      // the controlled `value` prop; Blur mode must keep separators OUT until blur, even
      // though the controlled resync runs on every render.
      act(() => simulateTyping(input, '1'));
      act(() => simulateTyping(input, '2'));
      act(() => simulateTyping(input, '3'));
      act(() => simulateTyping(input, '4'));

      expect(input.value).toBe('1234');
    });
  });

  describe('mouse-strip flag robustness (#5)', () => {
    it('a right-click (button 2) mousedown does not wedge the focus-strip', () => {
      render(
        <NumoraInput
          data-testid="input"
          thousandSeparator=","
          groupingStyle={GroupingStyle.Thousand}
          formatOn={FormatOn.Blur}
          defaultValue="1234567"
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.blur(input);
      expect(input.value).toBe('1,234,567');

      // Right-click never dispatches a following `click`. The strip must still run on
      // focus, not be deferred to a click that never arrives.
      fireEvent.mouseDown(input, { button: 2 });
      fireEvent.focus(input);
      expect(input.value).toBe('1234567');
    });
  });

  describe('FormatOn.Blur formatting', () => {
    it('formats value with thousand separators after blur', () => {
      const onChange = vi.fn();
      render(
        <NumoraInput
          data-testid="input"
          onChange={onChange}
          thousandSeparator=","
          formatOn={FormatOn.Blur}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '3');
      simulateTyping(input, '4');
      expect(input.value).toBe('1234'); // no separator yet

      onChange.mockClear();
      fireEvent.blur(input);

      expect(input.value).toBe('1,234');
      expect(onChange).toHaveBeenCalled();
      const lastCall: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
      // e.target.value is raw; e.target.formattedValue has the separator
      expect(lastCall.target.value).toBe('1234');
      expect((lastCall.target as NumoraHTMLInputElement).formattedValue).toBe('1,234');
    });

    it('strips thousand separators on focus so the user can edit cleanly', () => {
      render(
        <NumoraInput
          data-testid="input"
          thousandSeparator=","
          formatOn={FormatOn.Blur}
          defaultValue="1234"
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      // Blur first to apply separators
      fireEvent.blur(input);
      expect(input.value).toBe('1,234');

      // Focus should strip them for editing
      fireEvent.focus(input);
      expect(input.value).toBe('1234');
    });

    it('maps the click caret to its raw equivalent on focus-strip', () => {
      render(
        <NumoraInput
          data-testid="input"
          thousandSeparator=","
          groupingStyle={GroupingStyle.Thousand}
          formatOn={FormatOn.Blur}
          defaultValue="1234567"
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.blur(input);
      expect(input.value).toBe('1,234,567');

      // Simulate clicking between `2` and `3` (display pos 3) then focusing
      input.setSelectionRange(3, 3);
      fireEvent.focus(input);

      expect(input.value).toBe('1234567');
      // Should land between `2` and `3` in raw (pos 2), not between `3` and `4` (pos 3)
      expect(input.selectionStart).toBe(2);
      expect(input.selectionEnd).toBe(2);
    });

    it('maps click between thousand separator and digit correctly', () => {
      render(
        <NumoraInput
          data-testid="input"
          thousandSeparator=","
          groupingStyle={GroupingStyle.Thousand}
          formatOn={FormatOn.Blur}
          defaultValue="1234567"
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.blur(input);
      expect(input.value).toBe('1,234,567');

      // Click between `4` and `,` (display pos 5)
      input.setSelectionRange(5, 5);
      fireEvent.focus(input);

      expect(input.value).toBe('1234567');
      // Should land after `4` in raw (pos 4)
      expect(input.selectionStart).toBe(4);
    });

    it('preserves a select-all range across focus-strip', () => {
      render(
        <NumoraInput
          data-testid="input"
          thousandSeparator=","
          groupingStyle={GroupingStyle.Thousand}
          formatOn={FormatOn.Blur}
          defaultValue="1234567"
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.blur(input);
      expect(input.value).toBe('1,234,567');

      // Tab-focus typically select-alls
      input.setSelectionRange(0, input.value.length);
      fireEvent.focus(input);

      expect(input.value).toBe('1234567');
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(7);
    });

    it('does not call onChange on blur in Change mode', () => {
      const onChange = vi.fn();
      render(
        <NumoraInput
          data-testid="input"
          onChange={onChange}
          thousandSeparator=","
          formatOn={FormatOn.Change}
          defaultValue="1234"
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      onChange.mockClear();

      fireEvent.blur(input);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('paste handling', () => {
    it('formats pasted numeric value and fires onChange', () => {
      const onChange = vi.fn();
      render(
        <NumoraInput data-testid="input" onChange={onChange} decimalMaxLength={2} />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      act(() => simulatePaste(input, '1234.56'));

      expect(onChange).toHaveBeenCalled();
      const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
      expect(event.target.value).toBe('1234.56');
    });
  });

  describe('negative numbers', () => {
    it('renders a negative initial value when enableNegative is true', () => {
      render(<NumoraInput data-testid="input" enableNegative defaultValue="-50" />);
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('-50');
    });
  });

  describe('decimal handling', () => {
    it('truncates initial value to decimalMaxLength on mount', () => {
      render(<NumoraInput data-testid="input" decimalMaxLength={2} defaultValue="1.999" />);
      const val = (screen.getByTestId('input') as HTMLInputElement).value;
      // Should be truncated to at most 2 decimal places
      expect(parseFloat(val)).toBeCloseTo(1.99, 2);
      expect(val.replace(/^\d+\./, '').length).toBeLessThanOrEqual(2);
    });
  });

  describe('autoAddLeadingZero', () => {
    it('prepends 0 before a bare leading decimal on typing', async () => {
      render(
        <NumoraInput
          data-testid="input"
          autoAddLeadingZero
          formatOn={FormatOn.Change}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        simulateTyping(input, '.');
        simulateTyping(input, '5');
      });

      expect(input.value).toBe('0.5');
    });

    it('leaves leading dot alone when option is off', async () => {
      render(<NumoraInput data-testid="input" formatOn={FormatOn.Change} />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        simulateTyping(input, '.');
        simulateTyping(input, '5');
      });

      expect(input.value).toBe('.5');
    });
  });

  describe('maxLength', () => {
    it('rejects keystrokes that would push raw length past the cap', async () => {
      render(
        <NumoraInput
          data-testid="input"
          maxLength={5}
          thousandSeparator=","
          formatOn={FormatOn.Change}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        for (const c of '123456789') simulateTyping(input, c);
      });

      // Display has separator; raw is exactly 5 digits (not counted toward maxLength).
      expect(input.value).toBe('12,345');
    });

    it('truncates pasted value that exceeds the cap', () => {
      const onChange = vi.fn();
      render(
        <NumoraInput
          data-testid="input"
          maxLength={5}
          thousandSeparator=","
          onChange={onChange}
          formatOn={FormatOn.Change}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      act(() => simulatePaste(input, '1234567890'));

      const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
      expect(event.target.value).toBe('12345');
      expect(input.value).toBe('12,345');
    });

    it('does not set the native HTML maxLength attribute', () => {
      render(<NumoraInput data-testid="input" maxLength={5} />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      // Native maxLength reflects -1 (unset) so the browser does not double-count separators.
      expect(input.maxLength).toBe(-1);
    });
  });

  describe('isAllowed', () => {
    it('rejects keystroke when validator returns false', async () => {
      // Forbid any raw value greater than 100.
      const isAllowed = (raw: string) => raw === '' || Number(raw) <= 100;
      const onChange = vi.fn();
      render(
        <NumoraInput
          data-testid="input"
          isAllowed={isAllowed}
          onChange={onChange}
          formatOn={FormatOn.Change}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        simulateTyping(input, '9');
        simulateTyping(input, '9');
        // 999 > 100 → rejected
        simulateTyping(input, '9');
      });

      expect(input.value).toBe('99');
      // No onChange for the rejected 3rd keystroke (only first two fired).
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('rejects paste when validator returns false', () => {
      const isAllowed = (raw: string) => raw === '' || Number(raw) <= 100;
      const onChange = vi.fn();
      render(
        <NumoraInput
          data-testid="input"
          isAllowed={isAllowed}
          onChange={onChange}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      act(() => simulatePaste(input, '500'));

      // Rejected → no value change, no onChange fired.
      expect(input.value).toBe('');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('receives the post-sanitization raw value', async () => {
      const seen: string[] = [];
      render(
        <NumoraInput
          data-testid="input"
          isAllowed={(raw) => {
            seen.push(raw);
            return true;
          }}
          thousandSeparator=","
          formatOn={FormatOn.Change}
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        simulateTyping(input, '1');
        simulateTyping(input, '2');
        simulateTyping(input, '3');
        simulateTyping(input, '4');
      });

      // Last call must see the raw "1234" without the comma.
      expect(seen.at(-1)).toBe('1234');
    });
  });
});

// ---------------------------------------------------------------------------
// handleChange fallback (non-beforeinput edits)
// ---------------------------------------------------------------------------

describe('handleChange fallback (non-beforeinput edits)', () => {
  it('sanitizes a dirty insertFromDrop value before broadcasting', () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        decimalMaxLength={2}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    // Simulate drop/autofill: use fireEvent.change so React's synthetic onChange fires,
    // then verify the value was sanitized. The nativeEvent is faked with insertFromDrop
    // inputType so handleChange routes to the fallback (not undo) branch.
    fireEvent.change(input, {
      target: { value: '12a3.4x5' },
      nativeEvent: new InputEvent('input', { bubbles: true, inputType: 'insertFromDrop' }),
    });

    // onChange must have been called with a sanitized raw value (no letters).
    expect(onChange).toHaveBeenCalled();
    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    expect(event.target.value).toMatch(/^[\d.]*$/);
    expect(event.target.value).not.toContain('a');
    expect(event.target.value).not.toContain('x');

    // The DOM value itself should also be sanitized.
    expect(input.value).toMatch(/^[\d.]*$/);
  });

  it('does not re-format on undo (undo branch is still a pass-through)', () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        formatOn={FormatOn.Change}
        defaultValue="1234"
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    onChange.mockClear();

    // Dispatch historyUndo via fireEvent.change with a prior raw value.
    // The undo branch should be a pass-through (no re-format, no write-back).
    fireEvent.change(input, {
      target: { value: '123' },
      nativeEvent: new InputEvent('input', { bubbles: true, inputType: 'historyUndo' }),
    });

    // onChange must fire with the stripped raw value.
    expect(onChange).toHaveBeenCalledTimes(1);
    const event: NumoraInputChangeEvent = onChange.mock.calls[0][0];
    // Raw value = DOM value (no separators present).
    expect(event.target.value).toBe('123');

    // The DOM value must NOT be rewritten (no extra formatting step).
    expect(input.value).toBe('123');
  });
});

// ---------------------------------------------------------------------------
// simulateDelete helper
// ---------------------------------------------------------------------------

function simulateDelete(el: HTMLInputElement, inputType: 'deleteContentBackward' | 'deleteContentForward'): void {
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
  });
  el.dispatchEvent(beforeInput);

  // If the production handler prevented default (it handles the delete via setRangeText),
  // do not simulate a second DOM mutation here.
  if (beforeInput.defaultPrevented) return;

  // Otherwise mimic the browser: delete one character at the caret position.
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  if (start !== end) {
    // Selection present: delete selection
    el.value = el.value.slice(0, start) + el.value.slice(end);
    el.setSelectionRange(start, start);
  } else if (inputType === 'deleteContentBackward' && start > 0) {
    el.value = el.value.slice(0, start - 1) + el.value.slice(start);
    el.setSelectionRange(start - 1, start - 1);
  } else if (inputType === 'deleteContentForward' && start < el.value.length) {
    el.value = el.value.slice(0, start) + el.value.slice(start + 1);
    el.setSelectionRange(start, start);
  }
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
}

// ---------------------------------------------------------------------------
// undo / redo
// ---------------------------------------------------------------------------

describe('undo/redo', () => {
  it('broadcasts the raw value on historyUndo without re-formatting', () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        formatOn={FormatOn.Change}
        defaultValue="1234"
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    onChange.mockClear();

    // Simulate undo restoring "123"
    fireEvent.change(input, {
      target: { value: '123' },
      nativeEvent: new InputEvent('input', { bubbles: true, inputType: 'historyUndo' }),
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const event: NumoraInputChangeEvent = onChange.mock.calls[0][0];
    // Raw value stripped of separators
    expect(event.target.value).toBe('123');
    // DOM value is the literal restored string (not re-formatted)
    expect(input.value).toBe('123');
  });

  it('broadcasts the raw value on historyRedo without re-formatting', () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        formatOn={FormatOn.Change}
        defaultValue="123"
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    onChange.mockClear();

    // Simulate redo restoring "1234"
    fireEvent.change(input, {
      target: { value: '1,234' },
      nativeEvent: new InputEvent('input', { bubbles: true, inputType: 'historyRedo' }),
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const event: NumoraInputChangeEvent = onChange.mock.calls[0][0];
    // Raw value has separators stripped
    expect(event.target.value).toBe('1234');
    // DOM retains the literal restored string
    expect(input.value).toBe('1,234');
  });
});

// ---------------------------------------------------------------------------
// onPaste callback
// ---------------------------------------------------------------------------

describe('onPaste callback', () => {
  it('calls onPaste for an accepted paste and fires onChange with formatted value', () => {
    const onChange = vi.fn();
    const onPaste = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        onPaste={onPaste}
        thousandSeparator=","
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    act(() => simulatePaste(input, '5678'));

    expect(onPaste).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalled();
    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    // Raw value is digits only
    expect(event.target.value).toBe('5678');
    // DOM shows formatted value
    expect(input.value).toBe('5,678');
  });

  it('calls onPaste but NOT onChange when isAllowed rejects the pasted value', () => {
    const onChange = vi.fn();
    const onPaste = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        onPaste={onPaste}
        isAllowed={() => false}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    act(() => simulatePaste(input, '999'));

    expect(onPaste).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    // DOM must remain unchanged
    expect(input.value).toBe('');
  });
});

// ---------------------------------------------------------------------------
// keyboard delete / backspace
// ---------------------------------------------------------------------------

describe('keyboard delete/backspace', () => {
  it('backspace removes the trailing digit in FormatOn.Change mode', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '3');
      simulateTyping(input, '4');
    });
    expect(input.value).toBe('1,234');

    onChange.mockClear();

    await act(async () => {
      // Place cursor at end before deleting
      input.setSelectionRange(input.value.length, input.value.length);
      simulateDelete(input, 'deleteContentBackward');
    });

    // After deleting trailing '4', should be '123'
    expect(input.value).toBe('123');
    expect(onChange).toHaveBeenCalled();
    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    expect(event.target.value).toBe('123');
  });

  it('delete-forward removes the character after the caret', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '3');
    });
    expect(input.value).toBe('123');

    onChange.mockClear();

    await act(async () => {
      // Place cursor before '3'
      input.setSelectionRange(2, 2);
      simulateDelete(input, 'deleteContentForward');
    });

    // After deleting '3', should be '12'
    expect(input.value).toBe('12');
    expect(onChange).toHaveBeenCalled();
    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    expect(event.target.value).toBe('12');
  });
});

// ---------------------------------------------------------------------------
// option-behavior tests
// ---------------------------------------------------------------------------

describe('e.target.value is always the raw string', () => {
  it('emits raw value in e.target.value and formatted in formattedValue', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '3');
      simulateTyping(input, '4');
    });

    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    // e.target.value is ALWAYS the raw numeric string (there is no rawValueMode toggle in React)
    expect(event.target.value).toBe('1234');
    // formattedValue has the separator
    expect((event.target as NumoraHTMLInputElement).formattedValue).toBe('1,234');
  });
});

describe('onValueChange', () => {
  it('fires with { value, formattedValue } alongside onChange', async () => {
    const onValueChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onValueChange={onValueChange}
        thousandSeparator=","
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '3');
      simulateTyping(input, '4');
    });

    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)![0]).toEqual({ value: '1234', formattedValue: '1,234' });
  });
});

describe('locale', () => {
  it('uses locale-derived separators when locale is provided', async () => {
    // Note: jsdom may not have full ICU data. If locale="de-DE" (comma decimal, dot thousand)
    // isn't reflected, this test falls back to checking that *some* separator is applied.
    // We use locale="en-US" which jsdom reliably supports.
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        locale="en-US"
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '3');
      simulateTyping(input, '4');
    });

    // en-US uses ',' as thousand separator and '.' as decimal separator
    expect(input.value).toBe('1,234');
    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    expect(event.target.value).toBe('1234');
  });

  it('derives lakh grouping from an Indic locale', () => {
    render(<NumoraInput data-testid="input" locale="hi-IN" defaultValue="12345678" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('1,23,45,678');
  });

  it('lets an explicit groupingStyle win over the locale-derived one', () => {
    render(
      <NumoraInput
        data-testid="input"
        locale="hi-IN"
        groupingStyle={GroupingStyle.Thousand}
        defaultValue="12345678"
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('12,345,678');
  });

  it('keeps Thousand grouping for a Western locale', () => {
    render(<NumoraInput data-testid="input" locale="de-DE" defaultValue="12345678" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('12.345.678');
  });
});

describe('blur onChange guard', () => {
  it('does NOT fire onChange on blur when the value is unchanged', async () => {
    // Use a value with no separators so focus-strip is a no-op and blur adds nothing.
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        formatOn={FormatOn.Blur}
        defaultValue="5"
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('5');

    onChange.mockClear();

    // Focus: no separators to strip, onChange stays silent.
    fireEvent.focus(input);
    // Blur: "5" formats to "5" (no separators added), so onChange must NOT fire.
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange exactly once on blur when the value has separators to add', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        groupingStyle={GroupingStyle.Thousand}
        formatOn={FormatOn.Blur}
        defaultValue="1234"
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    // On mount: "1,234" (initialDisplayValue forces Change mode for initial format)
    expect(input.value).toBe('1,234');

    // Focus strips separators (onChange fires from stripSeparatorsAndMapCaret).
    fireEvent.focus(input);
    expect(input.value).toBe('1234');

    onChange.mockClear();

    // Blur adds separators back: "1234" → "1,234" — value changed, so onChange fires once.
    fireEvent.blur(input);
    expect(input.value).toBe('1,234');
    expect(onChange).toHaveBeenCalledTimes(1);
    const event: NumoraInputChangeEvent = onChange.mock.calls[0][0];
    expect(event.target.value).toBe('1234');
    expect((event.target as NumoraHTMLInputElement).formattedValue).toBe('1,234');
  });
});

describe('decimalMinLength', () => {
  it('pads to decimalMinLength zeros immediately on typing (applied at keystroke time)', async () => {
    // decimalMinLength is enforced in the beforeinput pipeline (formatInputValue →
    // ensureMinDecimals), so the value is padded on each keystroke — not deferred to blur.
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        decimalMinLength={2}
        decimalMaxLength={2}
        formatOn={FormatOn.Blur}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '5');
    });

    // Padding is applied immediately at keystroke, not deferred to blur.
    expect(input.value).toBe('5.00');
    expect(onChange).toHaveBeenCalled();
    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    expect(event.target.value).toBe('5.00');
  });

  it('blur does not fire onChange when decimalMinLength already padded the value', async () => {
    // Since padding is applied at keystroke, blur sees no change and must NOT fire onChange.
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        decimalMinLength={2}
        decimalMaxLength={2}
        formatOn={FormatOn.Blur}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '5');
    });
    // Value is already "5.00"
    expect(input.value).toBe('5.00');
    onChange.mockClear();

    // Blur: "5.00" formats to "5.00" — no change, onChange must NOT fire.
    await act(async () => {
      fireEvent.blur(input);
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// react-hook-form integration
// ---------------------------------------------------------------------------

describe('react-hook-form integration', () => {
  describe('with Controller', () => {
    it('renders with the field value provided by Controller', () => {
      function Form() {
        const { control } = useForm({ defaultValues: { amount: '1234' } });
        return (
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <NumoraInput
                data-testid="input"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />
        );
      }

      render(<Form />);
      // No thousandSeparator passed -> defaults to ',' (matching vanilla and the README),
      // so the Controller's "1234" renders grouped.
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('1,234');
    });

    it('updates form state when user types', async () => {
      let capturedValue = '';

      function Form() {
        const { control, watch } = useForm({ defaultValues: { amount: '' } });
        capturedValue = watch('amount');
        return (
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <NumoraInput
                data-testid="input"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />
        );
      }

      render(<Form />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        simulateTyping(input, '7');
        simulateTyping(input, '5');
      });

      expect(capturedValue).toBe('75');
    });

    it('updates displayed value when form setValue is called externally', async () => {
      function Form() {
        const { control, setValue } = useForm({ defaultValues: { amount: '0' } });
        return (
          <>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <NumoraInput
                  data-testid="input"
                  thousandSeparator=","
                  formatOn={FormatOn.Change}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              )}
            />
            <button onClick={() => setValue('amount', '5000')}>Set 5000</button>
          </>
        );
      }

      render(<Form />);
      await act(async () => {
        fireEvent.click(screen.getByText('Set 5000'));
      });

      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('5,000');
    });

    it('triggers validation on blur when a required field is empty', async () => {
      function Form() {
        const {
          control,
          formState: { errors },
        } = useForm({ defaultValues: { amount: '' }, mode: 'onBlur' });

        return (
          <>
            <Controller
              name="amount"
              control={control}
              rules={{ required: 'Amount is required' }}
              render={({ field }) => (
                <NumoraInput
                  data-testid="input"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              )}
            />
            {errors.amount && <span data-testid="error">{errors.amount.message}</span>}
          </>
        );
      }

      render(<Form />);

      await act(async () => {
        fireEvent.blur(screen.getByTestId('input'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Amount is required');
      });
    });
  });

  describe('with useController - spread field props directly', () => {
    it('stores the raw value (no thousand separators) when user types in a formatted field', async () => {
      // Ideal DX: e.target.value from onChange is already the raw numeric string,
      // so field.onChange(e.target.value) stores "1234", not the display string "1,234".
      let capturedValue = '';

      function Form() {
        const { control, watch } = useForm({ defaultValues: { amount: '' } });
        capturedValue = watch('amount');
        const { field } = useController({ name: 'amount', control });
        return (
          <NumoraInput
            data-testid="input"
            thousandSeparator=","
            formatOn={FormatOn.Change}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        );
      }

      render(<Form />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        simulateTyping(input, '1');
        simulateTyping(input, '2');
        simulateTyping(input, '3');
        simulateTyping(input, '4');
      });

      // Display is formatted; stored form value is the raw numeric string
      expect(input.value).toBe('1,234');
      expect(capturedValue).toBe('1234');
    });

    it('stores the raw value after blur-mode formatting', async () => {
      let capturedValue = '';

      function Form() {
        const { control, watch } = useForm({ defaultValues: { amount: '' } });
        capturedValue = watch('amount');
        const { field } = useController({ name: 'amount', control });
        return (
          <NumoraInput
            data-testid="input"
            thousandSeparator=","
            formatOn={FormatOn.Blur}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        );
      }

      render(<Form />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await act(async () => {
        simulateTyping(input, '5');
        simulateTyping(input, '0');
        simulateTyping(input, '0');
        simulateTyping(input, '0');
      });

      await act(async () => { fireEvent.blur(input); });

      // Display formatted by blur; stored value must be bare "5000"
      expect(input.value).toBe('5,000');
      expect(capturedValue).toBe('5000');
    });
  });
});

describe('option validation', () => {
  // Vanilla NumoraInput.ts validates options unconditionally at construction.
  // The React component must do the same so misconfig throws in both dev and prod.
  it('throws on multi-char thousand separator', () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => render(<NumoraInput thousandSeparator="!!" />)).toThrow(/thousandSeparator/);
    } finally {
      console.error = originalError;
    }
  });

  it('throws when thousandSeparator equals decimalSeparator', () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => render(<NumoraInput thousandSeparator="." decimalSeparator="." />)).toThrow(
        /decimalSeparator cannot equal thousandSeparator/
      );
    } finally {
      console.error = originalError;
    }
  });

  it('throws when decimalMinLength exceeds decimalMaxLength', () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => render(<NumoraInput decimalMaxLength={2} decimalMinLength={5} />)).toThrow(
        /decimalMinLength.*cannot be greater than decimalMaxLength/
      );
    } finally {
      console.error = originalError;
    }
  });
});

describe('separator default resolution (parity with vanilla)', () => {
  it('defaults thousandSeparator to "," so grouping works with no formatting props', () => {
    render(<NumoraInput data-testid="d" defaultValue="1234567" />);
    // Blur mode default: initial value is formatted for display with the default separator.
    expect((screen.getByTestId('d') as HTMLInputElement).value).toBe('1,234,567');
  });

  it('throws when thousandSeparator="." is given without decimalSeparator (would collide with the "." default)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(<NumoraInput thousandSeparator="." defaultValue="1234567" />)
      ).toThrow(/cannot equal|separator/i);
    } finally {
      spy.mockRestore();
    }
  });

  it('accepts the European pair (thousandSeparator="." + decimalSeparator=",")', () => {
    render(<NumoraInput data-testid="eu" thousandSeparator="." decimalSeparator="," defaultValue="1234567" />);
    expect((screen.getByTestId('eu') as HTMLInputElement).value).toBe('1.234.567');
  });
});
