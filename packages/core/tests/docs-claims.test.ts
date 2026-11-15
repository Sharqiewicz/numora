import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatValue, NumoraInput } from '../src/index';
import * as pipeline from '../src/pipeline';

// One test per behaviour the docs state in prose (README, MIGRATION.md, docs site, llms.txt).
// When a test here fails, the code and the docs disagree: fix whichever is wrong, then the
// sentence that states it. The comment above each test names where the claim is written.

let els: HTMLInputElement[] = [];
function make(options: Record<string, unknown> = {}) {
  const el = document.createElement('input');
  document.body.appendChild(el);
  els.push(el);
  const numora = new NumoraInput(el, options as never);
  return { numora, el };
}
afterEach(() => {
  for (const el of els) el.remove();
  els = [];
  vi.restoreAllMocks();
});

function type(el: HTMLInputElement, text: string) {
  for (const data of text) {
    el.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data,
      })
    );
  }
}
function del(el: HTMLInputElement, caret: number, inputType: string) {
  el.setSelectionRange(caret, caret);
  el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType }));
}
function paste(el: HTMLInputElement, text: string) {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  el.dispatchEvent(ev);
}
// What the browser does for a drop or an autofill: it writes the text, then fires `input`.
function browserInsert(el: HTMLInputElement, value: string, inputType = 'insertFromDrop') {
  el.value = value;
  el.setSelectionRange(value.length, value.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
}

describe('paste, drop and autofill format detection', () => {
  // README.md, features/sanitization (both), anatomy PasteSection, DEVELOPER_GUIDE.md
  it('a paste is detected: 1.234,56 into an en-US field is 1,234.56', () => {
    const { numora, el } = make();
    el.focus();
    paste(el, '1.234,56');
    expect(el.value).toBe('1,234.56');
    expect(numora.rawValue).toBe('1234.56');
  });
  it('a drop into a focused field that formats on change is read as its own text', () => {
    const { numora, el } = make();
    el.focus();
    browserInsert(el, '1.234,56');
    expect(numora.rawValue).toBe('1.23456');
  });
  it('an autofill into an unfocused field is detected', () => {
    const { numora, el } = make();
    browserInsert(el, '1.234,56', 'insertReplacementText');
    expect(numora.rawValue).toBe('1234.56');
  });
  it('a drop into a focused field that formats on blur is detected', () => {
    const { numora, el } = make({ formatOn: 'blur' });
    el.focus();
    browserInsert(el, '1.234,56');
    expect(numora.rawValue).toBe('1234.56');
  });
  it('a single mark: grouping when it forms valid groups, else the decimal', () => {
    const en = make();
    paste(en.el, '1,234');
    expect(en.numora.rawValue).toBe('1234');
    const en2 = make();
    paste(en2.el, '1.234');
    expect(en2.numora.rawValue).toBe('1.234');
    const en3 = make();
    paste(en3.el, '1.5');
    expect(en3.numora.rawValue).toBe('1.5');
    const de = make({ locale: 'de-DE' });
    paste(de.el, '1.234');
    expect(de.numora.rawValue).toBe('1234');
  });
  it("the field's own decimal separator is the decimal mark even in a valid group", () => {
    const de = make({ locale: 'de-DE' });
    paste(de.el, '1,234');
    expect(de.numora.rawValue).toBe('1.234');
  });
});

describe('deleting next to a thousand separator', () => {
  // anatomy BeforeInputSection pseudocode
  it('Backspace right after the separator also removes the digit before it', () => {
    const { el } = make({ defaultValue: '1234' });
    del(el, 2, 'deleteContentBackward');
    expect(el.value).toBe('234');
  });
  it('Delete right before the separator also removes the digit after it', () => {
    const { el } = make({ defaultValue: '1234' });
    del(el, 1, 'deleteContentForward');
    expect(el.value).toBe('134');
  });
});

describe('update()', () => {
  // frameworks/angular, vue, solid; llms.txt
  it('merges: a key left out keeps its value', () => {
    const { numora, el } = make({ decimalMaxLength: 2 });
    numora.update({ locale: 'de-DE' });
    numora.setValue('1234.5678');
    expect(el.value).toBe('1.234,56');
  });
  it('a new onValueChange replaces the old one', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { numora, el } = make({ onValueChange: first });
    numora.update({ onValueChange: second });
    type(el, '5');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe('setValue()', () => {
  // MIGRATION.md, frameworks/angular
  it('reads its argument as a raw value: "," is a decimal mark, not grouping', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { numora } = make();
    numora.setValue('1,234.5');
    expect(numora.rawValue).toBe('1.2345');
    const other = make({ defaultValue: '1,234' });
    expect(other.numora.rawValue).toBe('1.234');
  });
  it('sanitizes and groups, and does not call onValueChange', () => {
    const onValueChange = vi.fn();
    const onFormattedValueChange = vi.fn();
    const { numora, el } = make({ decimalMaxLength: 2, onValueChange, onFormattedValueChange });
    numora.setValue('1234.567');
    expect(el.value).toBe('1,234.56');
    expect(numora.rawValue).toBe('1234.56');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFormattedValueChange).toHaveBeenCalledWith('1,234.56');
  });
});

describe('onFormattedValueChange', () => {
  // MIGRATION.md "New: onFormattedValueChange"
  it('does not fire when other code rewrites the field', () => {
    const onFormattedValueChange = vi.fn();
    const { el } = make({ onFormattedValueChange });
    const form = document.createElement('form');
    document.body.appendChild(form);
    form.appendChild(el);
    el.value = '12';
    form.reset();
    expect(onFormattedValueChange).not.toHaveBeenCalled();
    form.remove();
  });
  it('reports the blur regroup, which onValueChange does not', () => {
    const onValueChange = vi.fn();
    const onFormattedValueChange = vi.fn();
    const { el } = make({ formatOn: 'blur', onValueChange, onFormattedValueChange });
    el.focus();
    type(el, '1234');
    onValueChange.mockClear();
    onFormattedValueChange.mockClear();
    el.blur();
    expect(el.value).toBe('1,234');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFormattedValueChange).toHaveBeenCalledWith('1,234');
  });
});

describe('blur settles the value', () => {
  // MIGRATION.md, how-it-works (both)
  it.each([
    ['1.', '1', 'change'],
    ['.', '', 'change'],
    ['1.', '1', 'blur'],
    ['.', '', 'blur'],
  ])('typed %s rests as "%s" with formatOn %s', (typed, rest, formatOn) => {
    const { numora, el } = make({ formatOn });
    el.focus();
    type(el, typed);
    el.blur();
    expect(numora.rawValue).toBe(rest);
  });
  it('-0 rests as 0', () => {
    const { numora, el } = make({ allowNegative: true });
    el.focus();
    type(el, '-0');
    el.blur();
    expect(numora.rawValue).toBe('0');
  });
});

describe('vanilla form.reset()', () => {
  // MIGRATION.md defaultValue row
  it('empties a mounted field: defaultValue is not copied to the element', () => {
    const { el } = make({ defaultValue: '1234' });
    const form = document.createElement('form');
    document.body.appendChild(form);
    form.appendChild(el);
    form.reset();
    expect(el.value).toBe('');
    form.remove();
  });
});

describe('the instance', () => {
  // numora/installation "The instance"
  it('creates an <input> in a container and adopts an existing <input>', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const created = new NumoraInput(container, {});
    expect(created.element.parentElement).toBe(container);
    container.remove();
    const { numora, el } = make();
    expect(numora.element).toBe(el);
  });
  it('rawValue and formattedValue differ by the grouping', () => {
    const { numora } = make({ defaultValue: '1234.5' });
    expect(numora.rawValue).toBe('1234.5');
    expect(numora.formattedValue).toBe('1,234.5');
  });
  it('destroy() removes the listeners and leaves the <input> in the page', () => {
    const onValueChange = vi.fn();
    const { numora, el } = make({ onValueChange });
    numora.destroy();
    type(el, '5');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(el.isConnected).toBe(true);
  });
});

describe('native decimal marks', () => {
  // features/sanitization (both)
  it("become the field's decimal separator", () => {
    const en = make();
    paste(en.el, '٣٫٥');
    expect(en.el.value).toBe('3.5');
    const ar = make({ locale: 'ar-EG' });
    paste(ar.el, '٣٫٥');
    expect(ar.el.value).toBe('3٫5');
    expect(ar.numora.rawValue).toBe('3.5');
  });
});

describe('compact notation', () => {
  // features/compact-notation (both), README.md
  it('is off by default', () => {
    const { numora, el } = make();
    paste(el, '1k');
    expect(numora.rawValue).toBe('1');
  });
});

describe('removed v4 names', () => {
  // llms.txt, MIGRATION.md
  it.each(['enableScientificNotation', 'emitRawValue', 'rawValueMode', 'thousandStyle'])(
    '%s logs a development warning',
    (name) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      make({ [name]: true });
      expect(warn.mock.calls.some(([message]) => String(message).includes(name))).toBe(true);
    }
  );
});

describe('numora/pipeline', () => {
  // llms.txt
  it('exports the twelve sanitization steps and nothing that formats', () => {
    const names = Object.keys(pipeline);
    expect(names).toHaveLength(12);
    expect(
      names.filter((name) => /format/i.test(name) && name !== 'normalizeForeignFormat')
    ).toEqual([]);
  });
});

describe('update() on a live field', () => {
  // installation (core) "The instance"
  it('a locale changes the display when no separator was passed, and keeps the raw value', () => {
    const onValueChange = vi.fn();
    const onFormattedValueChange = vi.fn();
    const { numora, el } = make({
      decimalMaxLength: 2,
      defaultValue: '1234.56',
      onValueChange,
      onFormattedValueChange,
    });
    numora.update({ locale: 'de-DE' });
    expect(el.value).toBe('1.234,56');
    expect(numora.rawValue).toBe('1234.56');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFormattedValueChange).toHaveBeenCalledWith('1.234,56');
  });
  it('a separator you passed wins over a locale set later', () => {
    const { numora, el } = make({
      thousandSeparator: ',',
      decimalSeparator: '.',
      defaultValue: '1234.56',
    });
    numora.update({ locale: 'de-DE' });
    expect(el.value).toBe('1,234.56');
  });
  it('a key set to undefined goes back to its default', () => {
    const { numora, el } = make({ locale: 'de-DE', defaultValue: '1234.56' });
    numora.update({ locale: undefined });
    expect(el.value).toBe('1,234.56');
  });
  it('an invalid option throws and leaves the field as it was', () => {
    const { numora, el } = make({ defaultValue: '1234.56' });
    expect(() => numora.update({ maxLength: 0 })).toThrow(
      'maxLength must be a positive integer (>= 1). Received: 0'
    );
    expect(el.value).toBe('1,234.56');
    type(el, '7');
    expect(el.value).toBe('1,234.567');
  });
  it('calls onValueChange only when the raw value changes', () => {
    const onValueChange = vi.fn();
    const { numora } = make({ defaultValue: '1234.56', onValueChange });
    numora.update({ decimalMaxLength: 1 });
    expect(onValueChange).toHaveBeenCalledWith({ value: '1234.5', formattedValue: '1,234.5' });
  });
});

describe('compact notation in a paste', () => {
  // features/compact-notation (both)
  it.each([
    ['1.5k', '1500'],
    ['1k USD', '1000'],
    ['1k 2m', '12000000'],
  ])('%s becomes %s', (text, raw) => {
    const { numora, el } = make({ allowCompactNotation: true });
    paste(el, text);
    expect(numora.rawValue).toBe(raw);
  });
});

describe('sanitization', () => {
  // features/sanitization (both), anatomy SanitizationJourney
  it.each([
    ['$1,234.56 USD', '1,234.56'],
    ['００7.5', '7.5'],
    ['$.75', '.75'],
    ['1 234', '1,234'],
    ['1​234', '1,234'],
    ['–5', '5'],
    ['—5', '5'],
    ['1.234.567', '1,234,567'],
  ])('a default field turns a pasted %s into %s', (text, shown) => {
    const { el } = make();
    paste(el, text);
    expect(el.value).toBe(shown);
  });
  it('padLeadingZero is what turns .75 into 0.75', () => {
    const { el } = make({ padLeadingZero: true });
    paste(el, '$.75');
    expect(el.value).toBe('0.75');
  });
  it.each(['−', '－', '﹣'])('the minus variant %s becomes -', (minus) => {
    const { numora, el } = make({ allowNegative: true });
    paste(el, `${minus}5`);
    expect(numora.rawValue).toBe('-5');
  });
  it('an en dash is not a minus sign', () => {
    const { numora, el } = make({ allowNegative: true });
    paste(el, '–5');
    expect(numora.rawValue).toBe('5');
  });
  it('reads at most 10,000 characters', () => {
    const { numora, el } = make();
    paste(el, '1'.repeat(20000));
    expect(numora.rawValue).toHaveLength(10000);
  });
});

describe('option errors', () => {
  // features/validation (both), "Invalid options" table
  it.each([
    [{ maxLength: 0 }, 'maxLength must be a positive integer (>= 1). Received: 0'],
    [{ decimalMaxLength: -1 }, 'decimalMaxLength must be a non-negative integer. Received: -1'],
    [{ decimalMinLength: -1 }, 'decimalMinLength must be a non-negative integer. Received: -1'],
    [
      { decimalMinLength: 3, decimalMaxLength: 2 },
      'decimalMinLength (3) cannot be greater than decimalMaxLength (2).',
    ],
    [{ formatOn: 'input' }, `formatOn must be one of: 'blur', 'change'. Received: "input"`],
    [
      { groupingStyle: 'indian' },
      `groupingStyle must be one of: 'none', 'thousand', 'lakh', 'wan'. Received: "indian"`,
    ],
    [{ thousandSeparator: '' }, "thousandSeparator cannot be empty. Use groupingStyle: 'none'."],
    [{ decimalSeparator: ', ' }, 'decimalSeparator must be a single character. Received: ", "'],
    [{ thousandSeparator: '1' }, 'thousandSeparator cannot be a digit. Received: "1"'],
    [
      { thousandSeparator: 'k' },
      'thousandSeparator cannot be one of the reserved characters -+eEkKmMbBtT (sign, exponent, or compact-notation suffix). Received: "k"',
    ],
    [
      { thousandSeparator: '.', decimalSeparator: '.' },
      'decimalSeparator cannot equal thousandSeparator. Both were ".".',
    ],
    [{ allowNegative: 'yes' }, 'allowNegative must be a boolean. Received: "yes"'],
    [{ isAllowed: 'x' }, 'isAllowed must be a function. Received: "x"'],
    [{ locale: 'not a tag' }, 'locale must be a BCP 47 tag such as "de-DE". Received: "not a tag"'],
  ])('%o throws', (options, message) => {
    expect(() => make(options)).toThrow(message);
  });
  // installation (both), features/locale (both)
  it('one separator passed alone never throws: the other one switches', () => {
    const comma = make({ decimalSeparator: ',', defaultValue: '1234.5' });
    expect(comma.el.value).toBe('1.234,5');
    const dot = make({ thousandSeparator: '.', defaultValue: '1234.5' });
    expect(dot.el.value).toBe('1.234,5');
  });
});

describe('isAllowed', () => {
  // features/validation (both)
  it('does not check setValue() or the blur settle', () => {
    const isAllowed = vi.fn((raw: string) => raw !== '500.00' && raw !== '1.50');
    const { numora, el } = make({ isAllowed, decimalMinLength: 2 });
    numora.setValue('500');
    expect(numora.rawValue).toBe('500.00');
    numora.setValue('');
    el.focus();
    type(el, '1.5');
    isAllowed.mockClear();
    el.blur();
    expect(numora.rawValue).toBe('1.50');
    expect(isAllowed).not.toHaveBeenCalled();
  });
  it('checks a drop, and puts the previous value back when it rejects', () => {
    const { numora, el } = make({ isAllowed: (raw: string) => Number(raw) <= 100 });
    el.focus();
    type(el, '50');
    browserInsert(el, '500');
    expect(numora.rawValue).toBe('50');
  });
});

describe('typed and pasted decimal marks', () => {
  // features/locale (both), features/decimals (both)
  it.each([
    ['1234.5', '1.234,5'],
    ['1234,5', '1.234,5'],
    ['1٫5', '1,5'],
  ])('typing %s into a de-DE field shows %s', (typed, shown) => {
    const { el } = make({ locale: 'de-DE' });
    type(el, typed);
    expect(el.value).toBe(shown);
  });
  it('a pasted number is read by its own format', () => {
    const { numora, el } = make({ locale: 'de-DE' });
    paste(el, '1,234,567.89');
    expect(el.value).toBe('1.234.567,89');
    expect(numora.rawValue).toBe('1234567.89');
  });
  it.each([
    ['1,5', '1.5'],
    ['12,345', '12345'],
    ['1,234', '1234'],
    ['123,456', '123456'],
    ['1.5', '1.5'],
    ['1234,567', '1234.567'],
    ['0,123', '0.123'],
  ])('a single mark in a pasted %s gives the raw value %s', (text, raw) => {
    const { numora, el } = make();
    paste(el, text);
    expect(numora.rawValue).toBe(raw);
  });
});

describe('a single mark pasted into a de-DE field', () => {
  // features/decimals (both)
  it.each([
    ['1,234', '1.234'],
    ['1.234', '1234'],
    ['1.5', '1.5'],
  ])('%s gives the raw value %s', (text, raw) => {
    const { numora, el } = make({ locale: 'de-DE' });
    paste(el, text);
    expect(numora.rawValue).toBe(raw);
  });
});

describe('decimalMaxLength: 0', () => {
  // features/decimals (both)
  it('refuses a typed decimal mark and cuts the decimals off a paste', () => {
    const typed = make({ decimalMaxLength: 0 });
    type(typed.el, '12.5');
    expect(typed.el.value).toBe('125');
    const pasted = make({ decimalMaxLength: 0 });
    paste(pasted.el, '12.75');
    expect(pasted.el.value).toBe('12');
  });
});

describe('maxLength', () => {
  // features/max-length (both)
  it('cuts the value before the decimals are trimmed', () => {
    const { numora, el } = make({ maxLength: 4, decimalMaxLength: 2 });
    paste(el, '1.23456789');
    expect(numora.rawValue).toBe('1.23');
    expect(formatValue('123.456', { maxLength: 4 })).toBe('123');
  });
});

describe('scientific notation', () => {
  // features/scientific-notation (both)
  it('expands an exponent of up to 1000 digits and drops a larger one', () => {
    const fits = make();
    paste(fits.el, '1e1000');
    expect(fits.numora.rawValue).toHaveLength(1001);
    const tooBig = make();
    paste(tooBig.el, '1e1001');
    expect(tooBig.numora.rawValue).toBe('');
    const tooSmall = make();
    paste(tooSmall.el, '1e-1001');
    expect(tooSmall.numora.rawValue).toBe('');
  });
  it('drops a number whose exponent is not a whole number', () => {
    const { numora, el } = make();
    paste(el, '1e3.5');
    expect(numora.rawValue).toBe('');
  });
  it('with the option off, a pasted exponent leaves the field as it was', () => {
    const { numora, el } = make({ allowScientificNotation: false, defaultValue: '42' });
    el.focus();
    el.setSelectionRange(2, 2);
    paste(el, '1.5e-7');
    expect(numora.rawValue).toBe('42');
  });
  it.each([
    [true, '100000'],
    [false, '15'],
  ])('allowScientificNotation %s: an e typed between 1 and 5 leaves %s', (allow, raw) => {
    const { numora, el } = make({ allowScientificNotation: allow, defaultValue: '15' });
    el.focus();
    el.setSelectionRange(1, 1);
    type(el, 'e');
    expect(numora.rawValue).toBe(raw);
  });
  it('an exponent with no digits is dropped', () => {
    const { numora, el } = make();
    paste(el, '1e');
    expect(numora.rawValue).toBe('1');
  });
  it('an e typed at the end of the field is ignored', () => {
    const { numora, el } = make();
    type(el, '1e5');
    expect(numora.rawValue).toBe('15');
  });
});

describe('what blur changes in the raw value', () => {
  // features/format-on (both), features/value-types (both), anatomy FocusBlurSection
  it.each([
    [{}, '1.', '1'],
    [{ decimalMinLength: 2 }, '1.5', '1.50'],
    [{ allowNegative: true }, '-0', '0'],
    [{ allowNegative: true }, '-0.00', '0.00'],
    [{ allowNegative: true }, '-', ''],
    [{}, '.', ''],
  ])('%o: typed %s rests as "%s" and calls onValueChange once', (options, typed, rest) => {
    const onValueChange = vi.fn();
    const { numora, el } = make({ ...options, onValueChange });
    el.focus();
    type(el, typed);
    onValueChange.mockClear();
    el.blur();
    expect(numora.rawValue).toBe(rest);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});

describe('skipping a thousand separator', () => {
  // how-it-works (both), features/formatting (both), anatomy KeydownSection
  const key = (el: HTMLInputElement, name: string) =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
  it('keydown only moves the caret over the separator', () => {
    const { el } = make({ defaultValue: '1234' });
    el.focus();
    el.setSelectionRange(2, 2);
    key(el, 'Backspace');
    expect(el.value).toBe('1,234');
    expect(el.selectionStart).toBe(1);
  });
  it('keydown leaves a selection alone', () => {
    const { el } = make({ defaultValue: '1234' });
    el.focus();
    el.setSelectionRange(2, 4);
    key(el, 'Backspace');
    expect([el.selectionStart, el.selectionEnd]).toEqual([2, 4]);
  });
  it('without a keydown, beforeinput still deletes the digit past the separator', () => {
    const { el } = make({ defaultValue: '1234' });
    el.focus();
    del(el, 2, 'deleteContentBackward');
    expect(el.value).toBe('234');
    expect(el.selectionStart).toBe(0);
  });
});

describe('attributes Numora sets on the <input>', () => {
  // anatomy NativeInputSection
  it('type and inputmode always, spellcheck and autocomplete only when absent', () => {
    const adopted = document.createElement('input');
    adopted.type = 'number';
    adopted.setAttribute('autocomplete', 'cc-number');
    document.body.appendChild(adopted);
    els.push(adopted);
    new NumoraInput(adopted);
    expect(adopted.getAttribute('type')).toBe('text');
    expect(adopted.getAttribute('inputmode')).toBe('decimal');
    expect(adopted.getAttribute('spellcheck')).toBe('false');
    expect(adopted.getAttribute('autocomplete')).toBe('cc-number');
    expect(adopted.hasAttribute('pattern')).toBe(false);
  });
});

describe('MIGRATION.md', () => {
  // MIGRATION.md option tables
  it('has a row for every removed option the library warns about', () => {
    const guide = readFileSync(resolve(__dirname, '../../../MIGRATION.md'), 'utf8');
    const source = readFileSync(resolve(__dirname, '../src/utils/removed-options.ts'), 'utf8');
    const block = source.slice(source.indexOf('const REMOVED'), source.indexOf('};'));
    const names = [...block.matchAll(/^\s+(\w+):/gm)].map((match) => match[1]);
    expect(names.length).toBeGreaterThan(8);
    const rows = guide.split('\n').filter((line) => line.startsWith('|'));
    const missing = names.filter(
      (name) => !rows.some((row) => row.split('|')[1].includes(`\`${name}`))
    );
    expect(missing).toEqual([]);
  });
});

describe('caret when the edit re-reads the whole value', () => {
  it('goes to the end when nothing left of the cursor survives', () => {
    const { el } = make();
    type(el, '15');
    el.setSelectionRange(1, 1);
    paste(el, 'e-');
    expect(el.value).toBe('0.00001');
    expect(el.selectionStart).toBe(el.value.length);
  });
});
