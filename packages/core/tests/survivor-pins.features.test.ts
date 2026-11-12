import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeForeignFormat } from '@/features/foreign-format';
import {
  computeStripSeparatorsResult,
  skipOverThousandSeparatorOnDelete,
} from '@/features/formatting/caret-position-utils';
import { writeValue } from '@/features/formatting/dom-writes';
import { expandScientificNotation } from '@/features/scientific-notation';
import { FormatOn } from '@/types';

/** Behaviour that round-3 mutation testing showed no other test pins (features/**). */

describe('normalizeForeignFormat pins', () => {
  it('a single mark with a head longer than 4 digits is decimal even for a Wan field', () => {
    expect(normalizeForeignFormat('12345,6789', { groupingStyle: 'wan' })).toBe('12345.6789');
    expect(normalizeForeignFormat('1234,5678', { groupingStyle: 'wan' })).toBe('12345678');
  });

  it('reads the Arabic comma as a comma, not a dot, when both kinds appear', () => {
    expect(normalizeForeignFormat('1.234،56')).toBe('1234.56');
  });

  it('treats the Arabic decimal separator as a mark when the field uses another custom separator', () => {
    expect(normalizeForeignFormat('1٫5', { decimalSeparator: ';' })).toBe('1.5');
  });

  it('does not skip a leading digit run of 95,000 (first digit is part of the number)', () => {
    expect(normalizeForeignFormat('95,000')).toBe('95000');
  });

  it('a definite decimal mark wins over an earlier comma that would not group', () => {
    expect(normalizeForeignFormat('1,23٫5')).toBe('123.5');
  });

  it('a definite decimal mark at index 0 stays decimal (later dot is a stray mark)', () => {
    expect(normalizeForeignFormat('٫5.3')).toBe('.53');
  });

  it('with both kinds the last is decimal even if the head would form groups', () => {
    expect(normalizeForeignFormat('1.2,345')).toBe('12.345');
  });
});

describe('computeStripSeparatorsResult', () => {
  it('returns null when there is nothing to strip', () => {
    expect(computeStripSeparatorsResult('1234', 2, 2, ',')).toBeNull();
  });
});

describe('skipOverThousandSeparatorOnDelete pins', () => {
  const opts = { formatOn: FormatOn.Change, thousandSeparator: ',' } as never;
  const make = (value: string, start: number, end: number) => {
    const el = document.createElement('input');
    el.value = value;
    el.setSelectionRange(start, end);
    return { el, spy: vi.spyOn(el, 'setSelectionRange') };
  };

  it('does not throw without options', () => {
    const { el } = make('1,234', 2, 2);
    expect(() =>
      skipOverThousandSeparatorOnDelete(new KeyboardEvent('keydown', { key: 'Backspace' }), el)
    ).not.toThrow();
  });

  it('Backspace after a separator moves the caret exactly one left', () => {
    const { el, spy } = make('1,234', 2, 2);
    skipOverThousandSeparatorOnDelete(new KeyboardEvent('keydown', { key: 'Backspace' }), el, opts);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(1, 1);
  });

  it('Delete before a separator moves the caret exactly one right', () => {
    const { el, spy } = make('1,234', 1, 1);
    skipOverThousandSeparatorOnDelete(new KeyboardEvent('keydown', { key: 'Delete' }), el, opts);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(2, 2);
  });

  it('leaves a non-collapsed selection alone', () => {
    const { el, spy } = make('1,234', 2, 4);
    skipOverThousandSeparatorOnDelete(new KeyboardEvent('keydown', { key: 'Backspace' }), el, opts);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('writeValue pins', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const make = (value: string, start: number, end: number) => {
    const el = document.createElement('input');
    el.value = value;
    el.setSelectionRange(start, end);
    return el;
  };

  it('writes the selection when only the selection start differs', () => {
    const el = make('abc', 1, 3);
    writeValue(el, 'abc', 2, 3);
    expect([el.selectionStart, el.selectionEnd]).toEqual([2, 3]);
  });

  it('writes the selection when only the selection end differs', () => {
    const el = make('abc', 1, 2);
    writeValue(el, 'abc', 1, 3);
    expect([el.selectionStart, el.selectionEnd]).toEqual([1, 3]);
  });

  describe('drift re-apply on next tick', () => {
    const setup = () => {
      vi.useFakeTimers();
      const el = make('x', 0, 0);
      writeValue(el, 'abc', 1, 2);
      const spy = vi.spyOn(el, 'setSelectionRange');
      return { el, spy };
    };

    it('does nothing when the selection did not drift', () => {
      const { spy } = setup();
      vi.runAllTimers();
      expect(spy).not.toHaveBeenCalled();
    });

    it('re-applies when only the start drifted', () => {
      const { el, spy } = setup();
      el.setSelectionRange(0, 2);
      spy.mockClear();
      vi.runAllTimers();
      expect(spy).toHaveBeenCalledWith(1, 2);
    });

    it('re-applies when only the end drifted', () => {
      const { el, spy } = setup();
      el.setSelectionRange(1, 3);
      spy.mockClear();
      vi.runAllTimers();
      expect(spy).toHaveBeenCalledWith(1, 2);
    });

    it('does not touch the selection once the value is no longer ours', () => {
      const { el, spy } = setup();
      el.value = 'changed';
      el.setSelectionRange(0, 0);
      spy.mockClear();
      vi.runAllTimers();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});

describe('expandScientificNotation zero magnitude', () => {
  it('collapses any zero mantissa to "0" whatever the exponent', () => {
    expect(expandScientificNotation('0e5')).toBe('0');
    expect(expandScientificNotation('0.00e-3')).toBe('0');
    expect(expandScientificNotation('-0e5')).toBe('0');
  });

  it('does not mistake a nonzero mantissa for zero (integer and fraction parts equal)', () => {
    expect(expandScientificNotation('5.5e3')).toBe('5500');
    expect(expandScientificNotation('1.1e-2')).toBe('0.011');
  });
});
