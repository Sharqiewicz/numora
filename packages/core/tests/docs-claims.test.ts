import { afterEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput } from '../src/index';
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
      new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data })
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
    expect(names.filter((name) => /format/i.test(name) && name !== 'normalizeForeignFormat')).toEqual(
      []
    );
  });
});
