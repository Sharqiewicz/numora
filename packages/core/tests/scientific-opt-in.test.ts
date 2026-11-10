import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { handleOnPasteNumoraInput, handleOnBeforeInputNumoraInput } from '../src/utils/event-handlers';
import { validateNumoraInputOptions } from '../src/validation';

function paste(input: HTMLInputElement, text: string, options: object) {
  const e = {
    target: input,
    preventDefault: vi.fn(),
    clipboardData: { getData: vi.fn().mockReturnValue(text) },
  } as unknown as ClipboardEvent;
  return handleOnPasteNumoraInput(e, 8, options);
}

describe('enableScientificNotation', () => {
  let input: HTMLInputElement;
  beforeEach(() => {
    input = document.createElement('input');
    document.body.appendChild(input);
  });
  afterEach(() => input.remove());

  it('is on by default: a pasted 1.5e-7 expands', () => {
    const result = paste(input, '1.5e-7', {});
    expect(result.type).toBe('handled');
    if (result.type === 'handled') expect(result.raw).toBe('0.00000015');
  });

  it('when off, a pasted 1.5e-7 is rejected instead of becoming 1.57', () => {
    expect(paste(input, '1.5e-7', { enableScientificNotation: false })).toEqual({
      type: 'reject',
    });
  });

  it.each(['2E5', '1e+3', '-3.2e-4', '1,5e3'])('rejects pasted %s when off', (text) => {
    expect(
      paste(input, text, {
        decimalSeparator: ',',
        thousandSeparator: '.',
        enableScientificNotation: false,
      })
    ).toEqual({
      type: 'reject',
    });
  });

  it('still accepts ordinary pastes when off', () => {
    const result = paste(input, '1,234.5', { thousandSeparator: ',', enableScientificNotation: false });
    expect(result.type).toBe('handled');
    if (result.type === 'handled') expect(result.raw).toBe('1234.5');
  });

  it('does not treat words containing e as scientific notation', () => {
    const result = paste(input, 'EUR 12.5', { enableScientificNotation: false });
    expect(result.type).toBe('handled');
    if (result.type === 'handled') expect(result.raw).toBe('12.5');
  });

  it('expands pasted scientific notation when on', () => {
    const result = paste(input, '1.5e-7', { enableScientificNotation: true });
    expect(result.type).toBe('handled');
    if (result.type === 'handled') expect(result.raw).toBe('0.00000015');
  });

  it('always expands app-supplied values, since String(1e21) is "1e+21"', () => {
    const container = document.createElement('div');
    const n = new NumoraInput(container, { formatOn: 'change' });
    n.setValue(String(1e21));
    expect(n.getValue()).toBe('1000000000000000000000');
  });

  it('validates the option type', () => {
    expect(() =>
      validateNumoraInputOptions({ enableScientificNotation: 'yes' } as never)
    ).toThrow();
  });

  describe('every user-input path when off', () => {
    const before = (el: HTMLInputElement, data: string, inputType = 'insertText') =>
      handleOnBeforeInputNumoraInput(
        { target: el, data, inputType } as unknown as InputEvent,
        8,
        { enableScientificNotation: false }
      );

    it('rejects a multi-char insertText carrying scientific notation', () => {
      expect(before(input, '1.5e-7')).toEqual({ type: 'reject' });
    });

    it('still expands multi-char insertText when on', () => {
      const r = handleOnBeforeInputNumoraInput(
        { target: input, data: '1.5e-7', inputType: 'insertText' } as unknown as InputEvent,
        8,
        {}
      );
      expect(r.type).toBe('handled');
      if (r.type === 'handled') expect(r.raw).toBe('0.00000015');
    });

    it('still accepts ordinary typing', () => {
      expect(before(input, '5').type).toBe('handled');
    });

    it('input fallback (autofill) restores the previous value and does not fire onChange', () => {
      const onChange = vi.fn();
      const n = new NumoraInput(document.body, {
        enableScientificNotation: false,
        formatOn: 'change' as never,
        value: '12',
        onChange,
      });
      const el = n.getElement();
      el.focus();
      el.value = '1.5e-7';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      expect(el.value).toBe('12');
      expect(onChange).not.toHaveBeenCalled();
      n.destroy();
    });

    it('input fallback still expands when on', () => {
      const n = new NumoraInput(document.body, { value: '12' });
      const el = n.getElement();
      el.value = '1.5e-7';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      expect(el.value).toBe('0.00000015');
      n.destroy();
    });

    it('app-supplied values always expand', () => {
      const n = new NumoraInput(document.body, { enableScientificNotation: false });
      n.setValue('1.5e-7');
      expect(n.getElement().value).toBe('0.00000015');
      n.destroy();
    });
  });
});
