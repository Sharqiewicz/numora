import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';
import { NumoraInput, type NumoraHTMLInputElement, type NumoraInputChangeEvent } from '../src/index';
import { FormatOn } from 'numora';

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

  if (beforeInput.defaultPrevented) {
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    return;
  }

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

    it('does not add thousand separators on initial mount in Blur mode', () => {
      render(
        <NumoraInput
          data-testid="input"
          defaultValue="1234"
          thousandSeparator=","
          formatOn={FormatOn.Blur}
        />
      );
      // In Blur mode separators are added on blur, not on initial render
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('1234');
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
            <NumoraInput data-testid="input" value={val} maxDecimals={2} />
            <button onClick={() => setVal('99.99')}>Update</button>
          </>
        );
      }

      render(<Wrapper />);
      fireEvent.click(screen.getByText('Update'));
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('99.99');
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
        <NumoraInput data-testid="input" onChange={onChange} maxDecimals={2} />
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
    it('truncates initial value to maxDecimals on mount', () => {
      render(<NumoraInput data-testid="input" maxDecimals={2} defaultValue="1.999" />);
      const val = (screen.getByTestId('input') as HTMLInputElement).value;
      // Should be truncated to at most 2 decimal places
      expect(parseFloat(val)).toBeCloseTo(1.99, 2);
      expect(val.replace(/^\d+\./, '').length).toBeLessThanOrEqual(2);
    });
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
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('1234');
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
