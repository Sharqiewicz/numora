import { describe, it, expect, vi } from 'vitest';
import { handleOnPasteNumoraInput } from '../src/utils/event-handlers';
import { expandScientificNotation } from '../src/features/scientific-notation';

function pasteInto(
  value: string,
  start: number,
  end: number,
  text: string,
  options: object
) {
  const input = document.createElement('input');
  input.value = value;
  input.setSelectionRange(start, end);
  const e = {
    target: input,
    preventDefault: vi.fn(),
    clipboardData: { getData: vi.fn().mockReturnValue(text) },
  } as unknown as ClipboardEvent;
  return handleOnPasteNumoraInput(e, 8, options);
}

const off = { enableScientificNotation: false, formatOn: 'change' };
const offDe = { ...off, decimalSeparator: ',', thousandSeparator: '.' };

describe('paste with enableScientificNotation: false checks the combined value', () => {
  it('rejects `e-7` pasted after `1.5`', () => {
    expect(pasteInto('1.5', 3, 3, 'e-7', off)).toEqual({ type: 'reject' });
  });

  it('rejects `e-7` pasted after `1,5` in a comma-decimal locale', () => {
    expect(pasteInto('1,5', 3, 3, 'e-7', offDe)).toEqual({ type: 'reject' });
  });

  it('rejects `e` pasted over the `.` of `1.5` (selection replaced, leaves `1e5`)', () => {
    expect(pasteInto('1.5', 1, 2, 'e', off)).toEqual({ type: 'reject' });
  });

  it('rejects pasted text ending in `1e` landing before an existing digit', () => {
    expect(pasteInto('5', 0, 0, '1e', off)).toEqual({ type: 'reject' });
  });

  it('rejects `e5` pasted between digits after a thousand separator', () => {
    expect(pasteInto('1,234', 5, 5, 'e5', off)).toEqual({ type: 'reject' });
  });

  it.each(['12', 'abc'])('still accepts a legitimate paste of %s', (text) => {
    expect(pasteInto('1.5', 3, 3, text, off).type).toBe('handled');
    expect(pasteInto('1,5', 3, 3, text, offDe).type).toBe('handled');
  });

  it('still expands when the option is on', () => {
    const r = pasteInto('1.5', 3, 3, 'e-7', { formatOn: 'change' });
    expect(r.type === 'handled' && r.raw).toBe('0.00000015');
  });
});

describe('a malformed exponent token with a fractional tail is dropped whole', () => {
  it.each([
    ['1e3.5', ''],
    ['1e-3.5', ''],
    ['-1e3.5', ''],
    ['1e3.5.7', ''],
    ['a1e3.5b', 'ab'],
    ['2 1e3.5', '2 '],
    ['1e3x5', '1000x5'],
  ])('%s -> %s', (input, expected) => {
    expect(expandScientificNotation(input)).toBe(expected);
  });

  it('drops the comma-decimal tail too', () => {
    expect(expandScientificNotation('1e3,5', ',')).toBe('');
  });

  it('leaves a foreign separator alone', () => {
    expect(expandScientificNotation('1e3,5', '.')).toBe('1000,5');
  });
});
