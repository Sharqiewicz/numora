import { describe, it, expect, vi } from 'vitest';
import {
  handleOnBeforeInputNumoraInput,
  handleOnPasteNumoraInput,
  isScientificNotationRejected,
} from '../src/utils/event-handlers';
import { containsScientificNotation } from '../src/features/scientific-notation';

function pasteInto(text: string, options: object, value = '') {
  const input = document.createElement('input');
  input.value = value;
  input.setSelectionRange(value.length, value.length);
  const e = {
    target: input,
    preventDefault: vi.fn(),
    clipboardData: { getData: vi.fn().mockReturnValue(text) },
  } as unknown as ClipboardEvent;
  return handleOnPasteNumoraInput(e, 18, options);
}

function beforeInput(data: string, options: object, value = '', inputType = 'insertText') {
  const input = document.createElement('input');
  input.value = value;
  input.setSelectionRange(value.length, value.length);
  const e = { target: input, inputType, data, preventDefault: vi.fn() } as unknown as InputEvent;
  return handleOnBeforeInputNumoraInput(e, 18, options);
}

const off = { allowScientificNotation: false, formatOn: 'change' };
const offDe = { ...off, decimalSeparator: ',', thousandSeparator: '.' };

describe('containsScientificNotation matches what the expander expands', () => {
  it.each([
    ['1e5', '.', true],
    ['1.e5', '.', true],
    ['1.E+5', '.', true],
    ['1,e5', ',', true],
    ['.5e3', '.', true],
    ['1.5e-7', '.', true],
    ['1,e5', '.', false],
    ['EUR', '.', false],
    ['2e', '.', false],
    ['2e+', '.', false],
    ['.e5', '.', false],
    ['e5', '.', false],
    ['abc1', '.', false],
  ])('%s (sep %s) -> %s', (text, sep, expected) => {
    expect(containsScientificNotation(text, sep)).toBe(expected);
  });

  it('isScientificNotationRejected keeps its (text, options) signature', () => {
    expect(isScientificNotationRejected('1.e5', off as never)).toBe(true);
    expect(isScientificNotationRejected('1,e5', offDe as never)).toBe(true);
    expect(isScientificNotationRejected('1.e5', { formatOn: 'change' } as never)).toBe(false);
  });
});

describe('a trailing-separator mantissa is refused with scientific notation off', () => {
  it.each([
    ['1.e5', off],
    ['1.E+5', off],
    ['1,e5', offDe],
  ])('paste of %s is refused', (text, opts) => {
    expect(pasteInto(text, opts)).toEqual({ type: 'reject' });
  });

  it.each([
    ['1.e5', off],
    ['1.E+5', off],
    ['1,e5', offDe],
  ])('multi-character insertText of %s is refused', (text, opts) => {
    expect(beforeInput(text, opts).type).toBe('reject');
  });

  it.each([
    ['1.e5', {}, '100000'],
    ['1.E+5', {}, '100000'],
    ['1,e5', { decimalSeparator: ',', thousandSeparator: '.' }, '100000'],
  ])('paste of %s expands with the option on', (text, extra, raw) => {
    const r = pasteInto(text, { formatOn: 'change', ...extra });
    expect(r.type === 'handled' && r.raw).toBe(raw);
  });

  it.each([
    ['1.e5', {}, '100000'],
    ['1,e5', { decimalSeparator: ',', thousandSeparator: '.' }, '100000'],
  ])('multi-character insertText of %s expands with the option on', (text, extra, raw) => {
    const r = beforeInput(text, { formatOn: 'change', ...extra });
    expect(r.type === 'handled' && r.raw).toBe(raw);
  });

  it('still accepts 2e as plain text', () => {
    expect(beforeInput('2e', off).type).toBe('handled');
  });
});

describe('isAllowed is not called for a keystroke that changes nothing', () => {
  it('a typed letter does not call the validator', () => {
    const isAllowed = vi.fn().mockReturnValue(true);
    expect(beforeInput('a', { formatOn: 'change', isAllowed }, '12').type).toBe('reject');
    expect(isAllowed).not.toHaveBeenCalled();
  });

  it('a real change still calls it, and a false answer still rejects', () => {
    const isAllowed = vi.fn().mockReturnValue(false);
    expect(beforeInput('3', { formatOn: 'change', isAllowed }, '12').type).toBe('reject');
    expect(isAllowed).toHaveBeenCalledWith('123');
  });
});
