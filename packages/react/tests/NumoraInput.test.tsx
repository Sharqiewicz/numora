import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';
import {
  NumoraInput,
  type NumoraHTMLInputElement,
  type NumoraInputChangeEvent,
} from '../src/index';
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

    // A2-01: `formatValueForDisplay` (and `formatForDisplay`, which forces Change) both
    // strip a trailing decimal separator and pad to `decimalMinLength` - display/blur-only
    // concerns. Formatting the controlled echo-back with those and comparing the RESULT
    // against the DOM's current value made "1." round-trip as "1", "0.05" collapse
    // mid-entry, and a decimalMinLength:2 field snap to "1.00" after every keystroke. The
    // fix compares `sanitizeNumoraInput` output instead (no display-only transforms) to
    // detect a same-number echo and leaves the DOM untouched in that case.
    describe('accepts a trailing decimal separator through the echo-back (A2-01)', () => {
      it('Blur mode: typing "1", ".", "5" lands as "1.5", not "15"', () => {
        const raws: string[] = [];
        function Wrapper() {
          const [val, setVal] = useState('');
          return (
            <NumoraInput
              data-testid="input"
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                raws.push(e.target.value);
              }}
            />
          );
        }
        render(<Wrapper />);
        const input = screen.getByTestId('input') as HTMLInputElement;
        act(() => input.focus());

        act(() => simulateTyping(input, '1'));
        expect(input.value).toBe('1');
        act(() => simulateTyping(input, '.'));
        expect(input.value).toBe('1.');
        act(() => simulateTyping(input, '5'));
        expect(input.value).toBe('1.5');

        expect(raws).toEqual(['1', '1.', '1.5']);
      });

      it('Change mode: typing "0", ".", "0", "5" lands as "0.05", not "5"', () => {
        function Wrapper() {
          const [val, setVal] = useState('');
          return (
            <NumoraInput
              data-testid="input"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              formatOn={FormatOn.Change}
            />
          );
        }
        render(<Wrapper />);
        const input = screen.getByTestId('input') as HTMLInputElement;
        act(() => input.focus());

        act(() => simulateTyping(input, '0'));
        act(() => simulateTyping(input, '.'));
        act(() => simulateTyping(input, '0'));
        act(() => simulateTyping(input, '5'));

        expect(input.value).toBe('0.05');
      });

      it('Change mode: groups digits while preserving a trailing decimal separator mid-entry', () => {
        function Wrapper() {
          const [val, setVal] = useState('');
          return (
            <NumoraInput
              data-testid="input"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              thousandSeparator=","
              formatOn={FormatOn.Change}
            />
          );
        }
        render(<Wrapper />);
        const input = screen.getByTestId('input') as HTMLInputElement;
        act(() => input.focus());

        for (const ch of ['1', '2', '3', '4', '.', '5']) {
          act(() => simulateTyping(input, ch));
        }

        expect(input.value).toBe('1,234.5');
      });

      it('decimalMinLength/decimalMaxLength 2: does not pad/truncate while focused, still correct after blur', () => {
        function Wrapper() {
          const [val, setVal] = useState('');
          return (
            <NumoraInput
              data-testid="input"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              decimalMaxLength={2}
              decimalMinLength={2}
            />
          );
        }
        render(<Wrapper />);
        const input = screen.getByTestId('input') as HTMLInputElement;
        act(() => input.focus());

        for (const ch of ['1', '.', '5', '7']) {
          act(() => simulateTyping(input, ch));
        }
        // Focused: no premature padding/truncation artifact (e.g. "1.00") from the
        // controlled echo-back forcing decimalMinLength on every keystroke.
        expect(input.value).toBe('1.57');

        act(() => fireEvent.blur(input));
        expect(input.value).toBe('1.57');
      });

      // `valueAsNumber` is a native getter that is spec-mandated to return NaN for any
      // input whose `type` is not number/range/date/etc. - and NumoraInput's underlying
      // <input> is always `type="text"` (see the JSX below), regardless of its content.
      // So `e.target.valueAsNumber` can NEVER recover the typed value here - this is a
      // platform limitation, not something A2-01 can fix (there is no display-formatting
      // choice that changes what a native DOM getter returns for a text input). Use
      // `e.target.value` (the raw string) instead, or parse it yourself with `Number(...)`.
      // What A2-01 still guarantees: the field does not corrupt into a literal "NaN" and
      // stays usable - it resets to empty and keeps accepting further digits normally.
      it('valueAsNumber cannot round-trip a text input - documents the platform limitation', () => {
        function Wrapper() {
          const [val, setVal] = useState<number>(0);
          return (
            <NumoraInput
              data-testid="input"
              value={val}
              onChange={(e) => setVal(e.target.valueAsNumber)}
            />
          );
        }
        render(<Wrapper />);
        const input = screen.getByTestId('input') as HTMLInputElement;
        act(() => input.focus());
        input.setSelectionRange(input.value.length, input.value.length);

        act(() => simulateTyping(input, '.'));
        // valueAsNumber on a type="text" input is always NaN, so the controlled value
        // collapses - but it collapses to an EMPTY field, not to a corrupted/garbage one.
        expect(input.value).toBe('');

        // The field is still fully usable afterwards - no digits get stuck or rejected.
        act(() => simulateTyping(input, '5'));
        expect(input.value).toBe('5');
      });
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

  describe('controlled value while focused', () => {
    function Controlled({ formatOn, initial = '1234' }: { formatOn: FormatOn; initial?: string }) {
      const [v, setV] = useState(initial);
      return (
        <>
          <NumoraInput
            data-testid="input"
            formatOn={formatOn}
            thousandSeparator=","
            groupingStyle={GroupingStyle.Thousand}
            value={v}
            onChange={(e) => setV(e.target.value)}
          />
          <button data-testid="set" onClick={() => setV('98765')} />
        </>
      );
    }

    it('keeps the value ungrouped while focused in Blur mode and groups on blur', () => {
      render(<Controlled formatOn={FormatOn.Blur} />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('1,234');

      act(() => input.focus());
      expect(input.value).toBe('1234');

      act(() => simulateTyping(input, '5'));
      expect(input.value).toBe('12345');

      // A second keystroke must stay ungrouped and land at the caret
      act(() => simulateTyping(input, '6'));
      expect(input.value).toBe('123456');
      expect(input.selectionStart).toBe(6);

      act(() => input.blur());
      expect(input.value).toBe('123,456');
    });

    it('formats an external value change with separators while not focused', () => {
      render(<Controlled formatOn={FormatOn.Blur} />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.click(screen.getByTestId('set'));
      expect(input.value).toBe('98,765');
    });

    it('shows the raw value for an external change while focused in Blur mode', () => {
      render(<Controlled formatOn={FormatOn.Blur} />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      act(() => input.focus());
      fireEvent.click(screen.getByTestId('set'));
      // fireEvent.click does not move focus, so the input is still the active element
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe('98765');
    });

    it('still groups on every keystroke in Change mode', () => {
      render(<Controlled formatOn={FormatOn.Change} />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      act(() => input.focus());
      act(() => simulateTyping(input, '5'));
      expect(input.value).toBe('12,345');
    });
  });

  // `input` events with no preceding cancelable `beforeinput`: execCommand('insertText'),
  // browser autofill, some Android IMEs. Must be sanitized like the typing path.
  describe('input event without beforeinput', () => {
    it('sanitizes and formats the value before emitting (Change mode)', () => {
      const onChange = vi.fn();
      render(
        <NumoraInput
          data-testid="input"
          onChange={onChange}
          formatOn={FormatOn.Change}
          enableCompactNotation
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      fireEvent.input(input, { target: { value: '1.5k' } });

      expect(onChange.mock.calls.at(-1)![0].target.value).toBe('1500');
      expect(input.value).toBe('1,500');
    });

    it('strips non-numeric characters and expands scientific notation', () => {
      const onChange = vi.fn();
      render(<NumoraInput data-testid="input" onChange={onChange} />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      fireEvent.input(input, { target: { value: '12abc.3' } });
      expect(onChange.mock.calls.at(-1)![0].target.value).toBe('12.3');

      fireEvent.input(input, { target: { value: '1e-7' } });
      expect(onChange.mock.calls.at(-1)![0].target.value).toBe('0.0000001');
      expect(input.value).toBe('0.0000001');
    });

    it('does not add separators while typing in Blur mode', () => {
      const onChange = vi.fn();
      render(<NumoraInput data-testid="input" onChange={onChange} formatOn={FormatOn.Blur} />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      act(() => input.focus());

      fireEvent.input(input, { target: { value: '1234567' } });

      expect(input.value).toBe('1234567');
      expect(onChange.mock.calls.at(-1)![0].target.value).toBe('1234567');
    });
  });

  describe('paste handling', () => {
    it('formats pasted numeric value and fires onChange', () => {
      const onChange = vi.fn();
      render(<NumoraInput data-testid="input" onChange={onChange} decimalMaxLength={2} />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      act(() => simulatePaste(input, '1234.56'));

      expect(onChange).toHaveBeenCalled();
      const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
      expect(event.target.value).toBe('1234.56');
    });

    // A2-02
    it('ignores a paste on a readOnly input (no write, no onChange)', () => {
      const onChange = vi.fn();
      render(<NumoraInput data-testid="input" readOnly defaultValue="5" onChange={onChange} />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      act(() => simulatePaste(input, '999'));

      expect(input.value).toBe('5');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('ignores a paste on a disabled input (no write, no onChange)', () => {
      const onChange = vi.fn();
      render(<NumoraInput data-testid="input" disabled defaultValue="5" onChange={onChange} />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      act(() => simulatePaste(input, '999'));

      expect(input.value).toBe('5');
      expect(onChange).not.toHaveBeenCalled();
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
      render(<NumoraInput data-testid="input" autoAddLeadingZero formatOn={FormatOn.Change} />);
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
      render(<NumoraInput data-testid="input" isAllowed={isAllowed} onChange={onChange} />);
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
    render(<NumoraInput data-testid="input" onChange={onChange} decimalMaxLength={2} />);
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

  // Q8 parity: the vanilla class maps the caret through the rewrite while focused and puts
  // it at the end while unfocused; React shares the same core logic.
  const nativeInputEvent = (input: HTMLInputElement, value: string, caret: number) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, value);
    input.setSelectionRange(caret, caret);
    act(() => {
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' }));
    });
  };

  it('keeps the caret on the same digit for a focused non-beforeinput edit', () => {
    render(<NumoraInput data-testid="input" formatOn={FormatOn.Change} thousandSeparator="," />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    act(() => input.focus());
    nativeInputEvent(input, '1234', 2);
    expect(input.value).toBe('1,234');
    expect(input.selectionStart).toBe(3); // 1,2|34
  });

  it('puts the caret at the end for a non-beforeinput edit while unfocused', () => {
    render(<NumoraInput data-testid="input" formatOn={FormatOn.Change} thousandSeparator="," />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    nativeInputEvent(input, '1234', 2);
    expect(input.value).toBe('1,234');
    expect(input.selectionStart).toBe(5);
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

  // A2-07
  it('formats an unfocused autofill in Blur mode for its RESTING display (grouped), not the editing display', () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        groupingStyle={GroupingStyle.Thousand}
        formatOn={FormatOn.Blur}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    // Not focused: document.activeElement is not `input`.
    expect(document.activeElement).not.toBe(input);

    // Simulate an autofill/programmatic write landing while the field is at rest.
    fireEvent.change(input, {
      target: { value: '1234567' },
      nativeEvent: new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' }),
    });

    // Blur mode normally keeps separators OUT while editing, but this value never went
    // through an editing session - it should rest exactly like a blurred/initial value.
    expect(input.value).toBe('1,234,567');
    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    expect(event.target.value).toBe('1234567');
    expect((event.target as NumoraHTMLInputElement).formattedValue).toBe('1,234,567');
  });
});

// ---------------------------------------------------------------------------
// simulateDelete helper
// ---------------------------------------------------------------------------

function simulateDelete(
  el: HTMLInputElement,
  inputType: 'deleteContentBackward' | 'deleteContentForward'
): void {
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
    render(<NumoraInput data-testid="input" onChange={onChange} formatOn={FormatOn.Change} />);
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

describe('synthetic event target is writable', () => {
  it('forwards property writes to the real input instead of throwing Illegal invocation', async () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="input" onChange={onChange} />);
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      simulateTyping(input, '1');
    });

    const event: NumoraInputChangeEvent = onChange.mock.calls.at(-1)![0];
    expect(() => {
      event.target.disabled = true;
    }).not.toThrow();
    expect(input.disabled).toBe(true);
    expect(() => {
      event.target.value = '9';
    }).not.toThrow();
    expect(input.value).toBe('9');
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

  // Regression (ticket 04): a numeric `value`/`defaultValue` is always dot-decimal
  // (`String(1234.5)` -> `'1234.5'`), so under de-DE - where '.' is the *thousand*
  // separator - passing it straight through got silently reinterpreted as grouping and
  // concatenated: 1234.5 displayed as "12.345", a silent 10x error. The initializer must
  // convert a JS number to the field's display format before formatting it.
  it('converts a numeric controlled value to de-DE display format', () => {
    render(<NumoraInput data-testid="input" locale="de-DE" value={1234.5} onChange={() => {}} />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('1.234,5');
  });

  it('converts a numeric defaultValue to de-DE display format', () => {
    render(<NumoraInput data-testid="input" locale="de-DE" defaultValue={0.5} />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('0,5');
  });

  // App-supplied values are canonical raw values (ADR 0004/0006): a string is never read as
  // locale text and never format-detected.
  it('formats a canonical raw string defaultValue into de-DE display', () => {
    render(<NumoraInput data-testid="input" locale="de-DE" defaultValue="1234.5" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('1.234,5');
  });

  it('does not reinterpret a canonical value as de-DE grouping (1.5 stays 1,5)', () => {
    render(<NumoraInput data-testid="input" locale="de-DE" defaultValue="1.5" />);
    expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('1,5');
  });
});

// ---------------------------------------------------------------------------
// A2-09: formattingOptions memoization must not depend on onChange/isAllowed identity
// ---------------------------------------------------------------------------

describe('formattingOptions memoization (A2-09)', () => {
  it('does not reconstruct Intl.NumberFormat (locale resolution) when only an inline onChange changes identity', () => {
    const OriginalNumberFormat = Intl.NumberFormat;
    let constructions = 0;
    // @ts-expect-error - test spy, not a full Intl.NumberFormat replacement.
    Intl.NumberFormat = function (...args: unknown[]) {
      constructions++;
      // eslint-disable-next-line new-cap
      return new OriginalNumberFormat(...(args as [string]));
    };
    Intl.NumberFormat.prototype = OriginalNumberFormat.prototype;

    try {
      let bump: () => void = () => {};
      function Parent() {
        const [, setN] = useState(0);
        bump = () => setN((x) => x + 1);
        // A fresh inline function every render - the pre-fix memo depended on `onChange`
        // identity, so this alone forced `applyLocale`/Intl.NumberFormat to re-run.
        return <NumoraInput data-testid="input" locale="de-DE" onChange={() => {}} />;
      }
      render(<Parent />);
      const afterMount = constructions;
      expect(afterMount).toBeGreaterThan(0);

      act(() => bump());
      act(() => bump());
      act(() => bump());

      expect(constructions).toBe(afterMount);
    } finally {
      Intl.NumberFormat = OriginalNumberFormat;
    }
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

    // Focus strips separators for display only (A2-06: the raw number is unchanged by a
    // separator strip, so stripSeparatorsAndMapCaret no longer fires onChange here).
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

  // A2-06
  it('does not fire onChange/onValueChange for the focus-strip itself (raw value is unchanged)', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        onValueChange={onValueChange}
        thousandSeparator=","
        groupingStyle={GroupingStyle.Thousand}
        formatOn={FormatOn.Blur}
        defaultValue="1234567"
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('1,234,567');

    onChange.mockClear();
    onValueChange.mockClear();

    // Focus strips the separators - display changes ("1,234,567" -> "1234567") but the
    // number itself does not, so neither callback should fire.
    fireEvent.focus(input);
    expect(input.value).toBe('1234567');
    expect((input as unknown as NumoraHTMLInputElement).formattedValue).toBe('1234567');
    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('decimalMinLength', () => {
  it('does not pad while typing - padding is a display/blur-only concern', async () => {
    // decimalMinLength pads on display/blur only (formatValueForDisplay), never on the
    // typing path (formatInputValue) - padding on every keystroke would make a 2/2
    // currency field unable to receive cents by typing.
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
      simulateTyping(input, '1');
      simulateTyping(input, '2');
      simulateTyping(input, '.');
      simulateTyping(input, '5');
    });

    expect(input.value).toBe('12.5');

    onChange.mockClear();
    await act(async () => {
      fireEvent.blur(input);
    });

    expect(input.value).toBe('12.50');
    expect(onChange).toHaveBeenCalledTimes(1);
    const event: NumoraInputChangeEvent = onChange.mock.calls[0][0];
    expect(event.target.value).toBe('12.50');
  });

  it('select-all + delete clears the field instead of leaving a bare separator', async () => {
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
      simulateTyping(input, '1');
      simulateTyping(input, '2');
    });
    expect(input.value).toBe('12');

    await act(async () => {
      input.setSelectionRange(0, input.value.length);
      simulateDelete(input, 'deleteContentBackward');
    });

    expect(input.value).toBe('');
  });

  it('blur on an empty field stays empty and does not fire onChange', async () => {
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

    onChange.mockClear();
    await act(async () => {
      fireEvent.blur(input);
    });

    expect(input.value).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Change mode + decimalMinLength + grouping pads on blur', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        decimalMinLength={2}
        thousandSeparator=","
        groupingStyle={GroupingStyle.Thousand}
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      for (const char of '1234.5') {
        simulateTyping(input, char);
      }
    });

    await act(async () => {
      fireEvent.blur(input);
    });

    expect(input.value).toBe('1,234.50');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ target: expect.objectContaining({ value: '1234.50' }) })
    );
  });
});

// ---------------------------------------------------------------------------
// decimalMaxLength: 0 and a trailing separator surviving to display (ticket 08,
// steps 1 and 3 - the beforeinput reject is step 2, owned by another agent's
// work on event-handlers.ts).
// ---------------------------------------------------------------------------

describe('decimalMaxLength: 0 and trailing separator on blur', () => {
  it('normalizes -0 to 0 on blur with enableNegative (A2-11)', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        enableNegative
        formatOn={FormatOn.Change}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    input.focus();
    simulateTyping(input, '-');
    simulateTyping(input, '0');
    expect(input.value).toBe('-0');
    fireEvent.blur(input);
    expect(input.value).toBe('0');
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.target.value).toBe('0');
  });

  it('blur strips a trailing separator: 1234. -> 1,234', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        groupingStyle={GroupingStyle.Thousand}
        formatOn={FormatOn.Blur}
        decimalMaxLength={2}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    // Typing still allows a trailing separator mid-entry - only the display/blur path
    // strips it.
    await act(async () => {
      for (const char of '1234.') {
        simulateTyping(input, char);
      }
    });
    expect(input.value).toBe('1234.');

    await act(async () => {
      fireEvent.blur(input);
    });

    expect(input.value).toBe('1,234');
    expect(input.value.endsWith('.')).toBe(false);
  });

  it('blur strips a trailing separator and pads when decimalMinLength is set: 1234. -> 1,234.00', async () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="input"
        onChange={onChange}
        thousandSeparator=","
        groupingStyle={GroupingStyle.Thousand}
        formatOn={FormatOn.Blur}
        decimalMaxLength={2}
        decimalMinLength={2}
      />
    );
    const input = screen.getByTestId('input') as HTMLInputElement;

    await act(async () => {
      for (const char of '1234.') {
        simulateTyping(input, char);
      }
    });
    expect(input.value).toBe('1234.');

    await act(async () => {
      fireEvent.blur(input);
    });

    expect(input.value).toBe('1,234.00');
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

      await act(async () => {
        fireEvent.blur(input);
      });

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
      expect(() => render(<NumoraInput thousandSeparator="." defaultValue="1234567" />)).toThrow(
        /cannot equal|separator/i
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('accepts the European pair (thousandSeparator="." + decimalSeparator=",")', () => {
    render(
      <NumoraInput
        data-testid="eu"
        thousandSeparator="."
        decimalSeparator=","
        defaultValue="1234567"
      />
    );
    expect((screen.getByTestId('eu') as HTMLInputElement).value).toBe('1.234.567');
  });
});

// ---------------------------------------------------------------------------
// Canonical raw value (ADR 0004/0005/0006)
// ---------------------------------------------------------------------------

describe('canonical raw value', () => {
  const deProps = { locale: 'de-DE', groupingStyle: GroupingStyle.Thousand, formatOn: FormatOn.Change } as const;

  it('de-DE typing 1234567.89 gives display 1.234.567,89 and raw 1234567.89', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(<NumoraInput data-testid="i" {...deProps} onChange={onChange} onValueChange={onValueChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    for (const ch of '1234567.89') simulateTyping(input, ch);
    expect(input.value).toBe('1.234.567,89');
    const e = onChange.mock.calls.at(-1)![0] as NumoraInputChangeEvent;
    expect(e.target.value).toBe('1234567.89');
    expect(e.target.formattedValue).toBe('1.234.567,89');
    expect(onValueChange).toHaveBeenLastCalledWith({
      value: '1234567.89',
      formattedValue: '1.234.567,89',
    });
  });

  it('de-DE ignores a second typed "."', () => {
    render(<NumoraInput data-testid="i" {...deProps} onChange={() => {}} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    for (const ch of '1.5.') simulateTyping(input, ch);
    expect(input.value).toBe('1,5');
  });

  it('en-US rejects a typed ","', () => {
    render(<NumoraInput data-testid="i" {...deProps} locale="en-US" onChange={() => {}} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    simulateTyping(input, '1');
    simulateTyping(input, ',');
    expect(input.value).toBe('1');
  });

  it('de-DE paste 1.234,56 emits canonical raw 1234.56', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" {...deProps} onChange={onChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    simulatePaste(input, '1.234,56');
    expect(input.value).toBe('1.234,56');
    expect((onChange.mock.calls.at(-1)![0] as NumoraInputChangeEvent).target.value).toBe('1234.56');
  });

  it('de-DE paste 1.5 is 1,5 (not 15)', () => {
    const onChange = vi.fn();
    render(<NumoraInput data-testid="i" {...deProps} onChange={onChange} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    simulatePaste(input, '1.5');
    expect(input.value).toBe('1,5');
    expect((onChange.mock.calls.at(-1)![0] as NumoraInputChangeEvent).target.value).toBe('1.5');
  });

  it('controlled echo of canonical raw leaves the DOM untouched, including the trailing decimal', () => {
    function Controlled() {
      const [v, setV] = useState('');
      return (
        <NumoraInput
          data-testid="i"
          {...deProps}
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    for (const ch of '1234,') simulateTyping(input, ch);
    expect(input.value).toBe('1.234,');
    simulateTyping(input, '5');
    expect(input.value).toBe('1.234,5');
  });

  it('controlled canonical value 1234.5 renders as 1.234,5', () => {
    render(<NumoraInput data-testid="i" {...deProps} value="1234.5" onChange={() => {}} />);
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('1.234,5');
  });
});

describe('enableScientificNotation', () => {
  it('rejects a pasted 1.5e-7 when disabled, leaving the field unchanged', () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="i"
        defaultValue="7"
        enableScientificNotation={false}
        onChange={onChange}
      />
    );
    const input = screen.getByTestId('i') as HTMLInputElement;
    input.setSelectionRange(1, 1);
    simulatePaste(input, '1.5e-7');
    expect(input.value).toBe('7');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('expands a pasted 1.5e-7 by default', () => {
    render(<NumoraInput data-testid="i" decimalMaxLength={8} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    simulatePaste(input, '1.5e-7');
    expect(input.value).toBe('0.00000015');
  });

  it('restores the previous value when autofill delivers 1.5e-7 and it is disabled', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <NumoraInput
        data-testid="i"
        defaultValue="7"
        enableScientificNotation={false}
        onChange={onChange}
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByTestId('i') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, '1.5e-7');
    fireEvent.input(input);
    expect(input.value).toBe('7');
    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('still expands autofilled 1.5e-7 by default', () => {
    render(<NumoraInput data-testid="i" decimalMaxLength={8} />);
    const input = screen.getByTestId('i') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, '1.5e-7');
    fireEvent.input(input);
    expect(input.value).toBe('0.00000015');
  });
});
