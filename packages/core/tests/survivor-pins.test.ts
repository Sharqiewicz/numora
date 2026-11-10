import { describe, expect, it, vi } from 'vitest';
import { expandCompactNotation } from '@/features/compact-notation';
import { removeExtraDecimalSeparators } from '@/features/decimals';
import { canonicalToDisplayText, normalizeForeignFormat } from '@/features/foreign-format';
import { skipOverThousandSeparatorOnDelete } from '@/features/formatting/caret-position-utils';
import { writeValuePreservingUndo } from '@/features/formatting/dom-writes';
import { truncateToMaxLength } from '@/features/max-length';
import { removeNonNumericCharacters } from '@/features/non-numeric-characters';
import { sanitizeNumoraInput } from '@/features/sanitization';
import { expandScientificNotation } from '@/features/scientific-notation';
import { FormatOn } from '@/types';

/** Behaviour that mutation testing showed no other test pins. */

describe('compact notation remainder', () => {
  it('keeps interior zeros and strips only trailing zeros of the remainder', () => {
    expect(expandCompactNotation('1.2340567k')).toBe('1234.0567');
    expect(expandCompactNotation('1.234500k')).toBe('1234.5');
    expect(expandCompactNotation('1.2340k')).toBe('1234');
  });
});

describe('removeExtraDecimalSeparators', () => {
  it('returns a value without the decimal separator untouched, other marks included', () => {
    expect(removeExtraDecimalSeparators('1,234', '.')).toBe('1,234');
  });
});

describe('normalizeForeignFormat pins', () => {
  it('maps comma-like and dot-like glyphs', () => {
    expect(normalizeForeignFormat('1،5')).toBe('1.5');
    expect(normalizeForeignFormat('1，5')).toBe('1.5');
    expect(normalizeForeignFormat('1．5')).toBe('1.5');
    expect(normalizeForeignFormat('1。5')).toBe('1.5');
  });
  it('removes a glyph thousand separator instead of remapping it', () => {
    expect(normalizeForeignFormat('1，23', { thousandSeparator: '，' })).toBe('123');
  });
  it('keeps a glyph decimal separator as the definite decimal', () => {
    expect(normalizeForeignFormat('1，234', { decimalSeparator: '，' })).toBe('1.234');
  });
  it('treats the Arabic decimal mark and a custom decimal as definite', () => {
    expect(normalizeForeignFormat('1٫234')).toBe('1.234');
    expect(normalizeForeignFormat('1;234', { decimalSeparator: ';' })).toBe('1.234');
  });
  it('reads leading-zero and empty-head marks as decimals', () => {
    expect(normalizeForeignFormat('0,123')).toBe('0.123');
    expect(normalizeForeignFormat('05,123')).toBe('05.123');
    expect(normalizeForeignFormat(',123')).toBe('.123');
  });
  it('group-size boundaries', () => {
    expect(normalizeForeignFormat('123,456')).toBe('123456');
    expect(normalizeForeignFormat('1234,567')).toBe('1234.567');
    expect(normalizeForeignFormat('1234,5678', { groupingStyle: 'wan' })).toBe('12345678');
    expect(normalizeForeignFormat('12345,6789', { groupingStyle: 'wan' })).toBe('12345.6789');
    expect(normalizeForeignFormat('123,4567', { groupingStyle: 'thousand' })).toBe('123.4567');
  });
  it('skips leading text before the first number', () => {
    expect(normalizeForeignFormat('USD 1,234.5')).toBe('USD1234.5');
  });
  it('canonicalToDisplayText defaults to a dot', () => {
    expect(canonicalToDisplayText('1.5')).toBe('1.5');
  });
});

describe('scientific notation pins', () => {
  it('drops base and exponent when a decimal separator + digit follows the exponent digits only', () => {
    expect(expandScientificNotation('1e3.')).toBe('1000.');
  });
  it('a zero mantissa stays 0 whatever the exponent', () => {
    expect(expandScientificNotation('0e5')).toBe('0');
    expect(expandScientificNotation('-0.0e-5')).toBe('0');
  });
  it('exponent equal to the fraction length', () => {
    expect(expandScientificNotation('1.23e2')).toBe('123');
    expect(expandScientificNotation('1.23e1')).toBe('12.3');
    expect(expandScientificNotation('1.23e4')).toBe('12300');
  });
});

describe('truncateToMaxLength', () => {
  it('does not strip a trailing separator when nothing is truncated', () => {
    expect(truncateToMaxLength('12.', 3)).toBe('12.');
    expect(truncateToMaxLength('12.', 5)).toBe('12.');
  });
});

describe('removeNonNumericCharacters', () => {
  it('drops the minus by default', () => {
    expect(removeNonNumericCharacters('-5')).toBe('5');
  });
});

describe('sanitizeNumoraInput', () => {
  it('reads "." as plain text by default (display source)', () => {
    expect(sanitizeNumoraInput('1.5', { decimalSeparator: ',' })).toBe('15');
  });
  it('caps raw input at 10000 characters', () => {
    expect(sanitizeNumoraInput('1'.repeat(10_001))).toHaveLength(10_000);
  });
  it('accepts canonical and foreign sources without options', () => {
    expect(sanitizeNumoraInput('1.5', undefined, 'canonical')).toBe('1.5');
    expect(sanitizeNumoraInput('1,5', undefined, 'foreign')).toBe('1.5');
  });
});

describe('skipOverThousandSeparatorOnDelete', () => {
  const run = (key: string, value: string, start: number, end = start) => {
    const el = document.createElement('input');
    el.value = value;
    el.setSelectionRange(start, end);
    skipOverThousandSeparatorOnDelete({ key } as KeyboardEvent, el, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
    });
    return [el.selectionStart, el.selectionEnd];
  };
  it('Backspace moves a collapsed caret left past the separator', () => {
    expect(run('Backspace', '1,234', 2)).toEqual([1, 1]);
  });
  it('Delete moves a collapsed caret right past the separator', () => {
    expect(run('Delete', '1,234', 1)).toEqual([2, 2]);
  });
  it('does not move for the other key or a non-separator neighbour', () => {
    expect(run('Backspace', '1,234', 1)).toEqual([1, 1]);
    expect(run('Delete', '1,234', 2)).toEqual([2, 2]);
  });
  it('leaves a non-collapsed selection alone', () => {
    expect(run('Backspace', '1,234', 2, 4)).toEqual([2, 4]);
  });
});

describe('writeValuePreservingUndo', () => {
  it('still sets the caret when the value already matches but the caret does not', () => {
    const el = document.createElement('input');
    el.value = '1234';
    el.setSelectionRange(0, 0);
    writeValuePreservingUndo(el, '1234', 4);
    expect(el.selectionStart).toBe(4);
  });
  it('re-applies the caret on the next tick if the browser drifted it', () => {
    vi.useFakeTimers();
    try {
      const el = document.createElement('input');
      el.value = '12';
      writeValuePreservingUndo(el, '1234', 4);
      el.setSelectionRange(1, 1);
      vi.runAllTimers();
      expect([el.selectionStart, el.selectionEnd]).toEqual([4, 4]);
    } finally {
      vi.useRealTimers();
    }
  });
});
