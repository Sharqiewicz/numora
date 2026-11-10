import { describe, it, expect } from 'vitest';
import {
  handleOnBeforeInputNumoraInput,
  handleOnPasteNumoraInput,
} from '../src/utils/event-handlers';
import { GroupingStyle, FormatOn, InputType } from '../src/types';
import type { NumoraOptions } from '../src/types';

/**
 * END-TO-END caret behavior — the behavioral source of truth for cursor positioning.
 *
 * These drive the REAL event handlers exactly as the DOM does: the caret is computed
 * from the edit itself (`computeCaretFromEdit`: text left of the edit plus the inserted
 * text, sanitized, then selected by rank in the new display string). Judge product
 * behaviour here, not with isolated helper calls on synthetic inputs.
 *
 * Invariant under test: after inserting a glyph the caret rests immediately after it;
 * after deletion it rests at the natural spot; separator reflow never shifts it.
 */

const DEFAULT: NumoraOptions = {
  thousandSeparator: ',',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Change,
  decimalSeparator: '.',
};
const EUROPEAN: NumoraOptions = {
  thousandSeparator: '.',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Change,
  decimalSeparator: ',',
};

interface Outcome {
  formatted: string;
  cursorPos: number;
}

/** Drive a real `beforeinput` event through the pure handler. */
function typeOrDelete(
  value: string,
  selStart: number,
  selEnd: number,
  data: string,
  inputType: string,
  options: NumoraOptions = DEFAULT
): Outcome {
  const input = document.createElement('input');
  input.value = value;
  document.body.appendChild(input);
  input.setSelectionRange(selStart, selEnd);
  const e = { inputType, data, target: input, preventDefault() {} } as unknown as InputEvent;
  const res = handleOnBeforeInputNumoraInput(e, 8, options);
  document.body.removeChild(input);
  if (res.type !== 'handled') throw new Error(`expected handled, got ${res.type}`);
  return { formatted: res.formatted, cursorPos: res.cursorPos };
}

/** Drive a real `paste` event through the pure handler. */
function paste(
  value: string,
  selStart: number,
  selEnd: number,
  clip: string,
  options: NumoraOptions = DEFAULT
): Outcome {
  const input = document.createElement('input');
  input.value = value;
  document.body.appendChild(input);
  input.setSelectionRange(selStart, selEnd);
  const e = {
    target: input,
    clipboardData: { getData: () => clip },
    preventDefault() {},
  } as unknown as ClipboardEvent;
  const res = handleOnPasteNumoraInput(e, 8, options);
  document.body.removeChild(input);
  if (res.type !== 'handled') throw new Error(`expected handled, got ${res.type}`);
  return { formatted: res.formatted, cursorPos: res.cursorPos };
}

const type = (v: string, at: number, ch: string, o?: NumoraOptions) =>
  typeOrDelete(v, at, at, ch, InputType.InsertText, o);
const selectType = (v: string, s: number, e: number, ch: string, o?: NumoraOptions) =>
  typeOrDelete(v, s, e, ch, InputType.InsertText, o);
const backspace = (v: string, at: number) =>
  typeOrDelete(v, at, at, '', InputType.DeleteContentBackward);
const forwardDelete = (v: string, at: number) =>
  typeOrDelete(v, at, at, '', InputType.DeleteContentForward);

describe('caret e2e — insertion (separator crossings, FormatOn.Change)', () => {
  it('type "5" at end of "1,234" → caret rests after the 5', () => {
    expect(type('1,234', 5, '5')).toEqual({ formatted: '12,345', cursorPos: 6 });
  });
  it('type "2" after "1" in "1,345" → caret hugs left of the new comma', () => {
    expect(type('1,345', 1, '2')).toEqual({ formatted: '12,345', cursorPos: 2 });
  });
  it('type "5" mid "1,2|34" → "12,5|34"', () => {
    expect(type('1,234', 3, '5')).toEqual({ formatted: '12,534', cursorPos: 4 });
  });
  it('type "9" at end of "999" → "9,999|"', () => {
    expect(type('999', 3, '9')).toEqual({ formatted: '9,999', cursorPos: 5 });
  });
  it('type "7" after the comma in "12|,345" → "127|,345"', () => {
    expect(type('12,345', 2, '7')).toEqual({ formatted: '127,345', cursorPos: 3 });
  });
  it('type "9" at start of "123,456" → "9|,123,456"', () => {
    expect(type('123,456', 0, '9')).toEqual({ formatted: '9,123,456', cursorPos: 1 });
  });
  it('type "9" at end of "999,999" → "9,999,999|"', () => {
    expect(type('999,999', 7, '9')).toEqual({ formatted: '9,999,999', cursorPos: 9 });
  });
  it('type "9" after first digit "9|99,999" → "9,9|99,999"', () => {
    expect(type('999,999', 1, '9')).toEqual({ formatted: '9,999,999', cursorPos: 3 });
  });
});

describe('caret e2e — decimals', () => {
  it('type "6" at end of "1,234.5" → "1,234.56|"', () => {
    expect(type('1,234.5', 7, '6')).toEqual({ formatted: '1,234.56', cursorPos: 8 });
  });
  it('type "1" at start of "234.56" → "1|,234.56"', () => {
    expect(type('234.56', 0, '1')).toEqual({ formatted: '1,234.56', cursorPos: 1 });
  });
});

describe('caret e2e — backspace / forward delete', () => {
  it('backspace at end of "1,234" → "123|"', () => {
    expect(backspace('1,234', 5)).toEqual({ formatted: '123', cursorPos: 3 });
  });
  it('backspace at end of "12,345" (separator collapses) → "1,234|"', () => {
    expect(backspace('12,345', 6)).toEqual({ formatted: '1,234', cursorPos: 5 });
  });
  it('forward-delete at start of "1,234" → "|234"', () => {
    expect(forwardDelete('1,234', 0)).toEqual({ formatted: '234', cursorPos: 0 });
  });
});

describe('caret e2e — selection-replace', () => {
  it('select "23" in "1,[23]4" and type "5" → "15|4"', () => {
    expect(selectType('1,234', 2, 4, '5')).toEqual({ formatted: '154', cursorPos: 2 });
  });
  it('select-all "1,234" and type "9" → "9|"', () => {
    expect(selectType('1,234', 0, 5, '9')).toEqual({ formatted: '9', cursorPos: 1 });
  });
});

describe('caret e2e — European locale (decimal ",", thousand ".")', () => {
  it('type "5" at end of "1.234" → "12.345|"', () => {
    expect(type('1.234', 5, '5', EUROPEAN)).toEqual({ formatted: '12.345', cursorPos: 6 });
  });
  it('type "2" after "1" in "1.345" → "12|.345"', () => {
    expect(type('1.345', 1, '2', EUROPEAN)).toEqual({ formatted: '12.345', cursorPos: 2 });
  });
});

describe('caret e2e — value-normalizing transforms', () => {
  const LZ: NumoraOptions = {
    thousandSeparator: ',',
    groupingStyle: GroupingStyle.Thousand,
    formatOn: FormatOn.Change,
    decimalSeparator: '.',
    autoAddLeadingZero: true,
  };

  it('autoAddLeadingZero: typing "." → "0." with caret after the decimal', () => {
    // caret must land at end so the next digit lands in the fraction (→ "0.5"), not "5."
    const r = type('', 0, '.', LZ);
    expect(r.formatted).toBe('0.');
    expect(r.cursorPos).toBe(2);
  });

  it('autoAddLeadingZero: "." then "5" yields "0.5" with caret at end', () => {
    const dot = type('', 0, '.', LZ);
    const r = type(dot.formatted, dot.cursorPos, '5', LZ);
    expect(r.formatted).toBe('0.5');
    expect(r.cursorPos).toBe(3);
  });

  it('compact expansion "15k" → "15,000" snaps caret to end', () => {
    const COMPACT: NumoraOptions = {
      ...LZ,
      autoAddLeadingZero: false,
      enableCompactNotation: true,
    };
    const r = type('15', 2, 'k', COMPACT);
    expect(r.formatted).toBe('15,000');
    expect(r.cursorPos).toBe(r.formatted.length);
  });

  // Leading-zero REMOVAL during an edit: typing a digit right after a leading "0" that then
  // gets stripped. Change is BEFORE the caret → distance-from-end anchoring keeps the caret
  // immediately after the typed glyph (not pushed past the decimal).
  it('editing the integer part of "0.5": type "5" after the 0 → "5.5" caret after the 5', () => {
    const r = type('0.5', 1, '5');
    expect(r.formatted).toBe('5.5');
    expect(r.cursorPos).toBe(1); // "5|.5"
  });

  // Decimal TRIM (change AFTER the caret): typing "." at the front of a maxed-out integer.
  // Common-prefix anchoring keeps the caret right after the typed ".".
  it('type "." at start of a long number (fraction trimmed) keeps caret after the "."', () => {
    const r = type('1,234,567,890', 0, '.'); // → ".12345678" (decimalMaxLength 8)
    expect(r.formatted).toBe('.12345678');
    expect(r.cursorPos).toBe(1); // ".|12345678"
  });

  it('negative: typing "5" before the sign of "-1,234" → "51,234" caret after the 5', () => {
    const NEG: NumoraOptions = { ...LZ, autoAddLeadingZero: false, enableNegative: true };
    const r = type('-1,234', 0, '5', NEG);
    expect(r.formatted).toBe('51,234');
    expect(r.cursorPos).toBe(1); // "5|1,234"
  });
});

describe('caret e2e — paste', () => {
  it('paste "456" at end of "123" → caret after the pasted run', () => {
    const r = paste('123', 3, 3, '456');
    expect(r.formatted).toBe('123,456');
    // caret should rest at or after the pasted content, never before it
    expect(r.cursorPos).toBeGreaterThanOrEqual(4);
    expect(r.cursorPos).toBeLessThanOrEqual(7);
  });
  it('paste "1000000" into empty → grouped, caret at end', () => {
    const r = paste('', 0, 0, '1000000');
    expect(r.formatted).toBe('1,000,000');
    expect(r.cursorPos).toBe(r.formatted.length);
  });
});

// Grouping-agnostic invariant: after typing a digit the caret has exactly one more
// significant (non-thousand-separator) char before it than the edit position did.
// Covers Lakh/Wan grouping and integer-part edits with a decimal present — the cases
// previously exercised only by the (deleted) direct-call cursor suite.
describe('caret e2e — Lakh / Wan / decimal integer-part (digit-count invariant)', () => {
  const significantBefore = (str: string, pos: number, sep: string) => {
    let n = 0;
    for (let i = 0; i < pos && i < str.length; i++) if (str[i] !== sep) n++;
    return n;
  };

  const styles: Array<[string, GroupingStyle, string]> = [
    ['Lakh', GroupingStyle.Lakh, ','],
    ['Wan', GroupingStyle.Wan, ','],
  ];

  for (const [name, style, sepChar] of styles) {
    const o: NumoraOptions = {
      thousandSeparator: sepChar,
      groupingStyle: style,
      formatOn: FormatOn.Change,
      decimalSeparator: '.',
    };
    for (const pos of [0, 1, 2, 3, 4]) {
      it(`${name}: typing a digit preserves digit-count-before-caret (pos ${pos})`, () => {
        const start = '12,34,567'; // arbitrary already-grouped-ish seed; handler reformats
        const r = type(start, Math.min(pos, start.length), '5', o);
        const expected = significantBefore(start, Math.min(pos, start.length), sepChar) + 1;
        expect(significantBefore(r.formatted, r.cursorPos, sepChar)).toBe(expected);
      });
    }
  }

  it('decimal present: typing in the integer part keeps the caret after the typed digit', () => {
    // "1,234.56", type "9" right after "1" (pos 1) → integer part regroups, fraction untouched
    const r = type('1,234.56', 1, '9');
    // caret should sit after the typed 9: significant chars before caret = 2 (the "1" and "9")
    const significantBefore = (str: string, p: number) => {
      let n = 0;
      for (let i = 0; i < p && i < str.length; i++) if (str[i] !== ',') n++;
      return n;
    };
    expect(r.formatted).toBe('19,234.56');
    expect(significantBefore(r.formatted, r.cursorPos)).toBe(2);
  });
});
