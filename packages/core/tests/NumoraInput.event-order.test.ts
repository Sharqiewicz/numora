import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { FormatOn } from '../src/types';

// Characterization tests: pin the exact order and payload of every onChange callback
// (plus the element value/caret) for the vanilla event wiring, so a refactor of that
// wiring cannot change behaviour silently. Typing uses the beforeinput path
// (typeChar mirrors simulateTyping); `nativeInput` exercises the `input` fallback.

type Entry = { ev: string; value?: string; formattedValue?: string; dom: string };
let container: HTMLElement;
let log: Entry[];

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  log = [];
});
afterEach(() => {
  container.remove();
  vi.restoreAllMocks();
});

function make(options: Record<string, unknown> = {}) {
  let el!: HTMLInputElement;
  const numora = new NumoraInput(container, {
    onChange: (v: { value: string; formattedValue: string }) =>
      log.push({ ev: 'onChange', value: v.value, formattedValue: v.formattedValue, dom: el.value }),
    ...options,
  } as never);
  el = numora.getElement();
  return { numora, el };
}

function typeChar(el: HTMLInputElement, char: string): boolean {
  const be = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  el.dispatchEvent(be);
  if (be.defaultPrevented) return true;
  const s = el.selectionStart ?? el.value.length;
  const e = el.selectionEnd ?? s;
  el.value = el.value.slice(0, s) + char + el.value.slice(e);
  el.setSelectionRange(s + char.length, s + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
  return false;
}
function typeAll(el: HTMLInputElement, s: string) {
  for (const c of s) typeChar(el, c);
}
function paste(el: HTMLInputElement, text: string): Event {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  el.dispatchEvent(ev);
  return ev;
}
// Native `input` event without a preceding beforeinput (autofill, undo/redo, IME, ...).
function nativeInput(
  el: HTMLInputElement,
  value: string,
  start: number,
  end = start,
  inputType = 'insertReplacementText'
) {
  el.value = value;
  el.setSelectionRange(start, end);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
}
// Expected JSON for the table-driven cases below (looped tests cannot share inline snapshots).
const PINNED: Record<string, string[]> = {
  'typing via beforeinput > en-US blur: digits and a decimal': [
    '[{"ev":"onChange","value":"1","formattedValue":"1","dom":"1"},{"ev":"onChange","value":"12","formattedValue":"12","dom":"12"},{"ev":"onChange","value":"123","formattedValue":"123","dom":"123"},{"ev":"onChange","value":"1234","formattedValue":"1234","dom":"1234"},{"ev":"onChange","value":"12345","formattedValue":"12345","dom":"12345"},{"ev":"onChange","value":"12345.","formattedValue":"12345.","dom":"12345."},{"ev":"onChange","value":"12345.6","formattedValue":"12345.6","dom":"12345.6"}]',
    '{"value":"12345.6","caret":[7,7]}',
  ],
  'typing via beforeinput > de-DE blur: digits and a decimal': [
    '[{"ev":"onChange","value":"1","formattedValue":"1","dom":"1"},{"ev":"onChange","value":"12","formattedValue":"12","dom":"12"},{"ev":"onChange","value":"123","formattedValue":"123","dom":"123"},{"ev":"onChange","value":"1234","formattedValue":"1234","dom":"1234"},{"ev":"onChange","value":"12345","formattedValue":"12345","dom":"12345"},{"ev":"onChange","value":"12345.","formattedValue":"12345,","dom":"12345,"},{"ev":"onChange","value":"12345.6","formattedValue":"12345,6","dom":"12345,6"}]',
    '{"value":"12345,6","caret":[7,7]}',
  ],
  'typing via beforeinput > en-US change: digits and a decimal': [
    '[{"ev":"onChange","value":"1","formattedValue":"1","dom":"1"},{"ev":"onChange","value":"12","formattedValue":"12","dom":"12"},{"ev":"onChange","value":"123","formattedValue":"123","dom":"123"},{"ev":"onChange","value":"1234","formattedValue":"1,234","dom":"1,234"},{"ev":"onChange","value":"12345","formattedValue":"12,345","dom":"12,345"},{"ev":"onChange","value":"12345.","formattedValue":"12,345.","dom":"12,345."},{"ev":"onChange","value":"12345.6","formattedValue":"12,345.6","dom":"12,345.6"}]',
    '{"value":"12,345.6","caret":[8,8]}',
  ],
  'typing via beforeinput > de-DE change: digits and a decimal': [
    '[{"ev":"onChange","value":"1","formattedValue":"1","dom":"1"},{"ev":"onChange","value":"12","formattedValue":"12","dom":"12"},{"ev":"onChange","value":"123","formattedValue":"123","dom":"123"},{"ev":"onChange","value":"1234","formattedValue":"1.234","dom":"1.234"},{"ev":"onChange","value":"12345","formattedValue":"12.345","dom":"12.345"},{"ev":"onChange","value":"12345.","formattedValue":"12.345,","dom":"12.345,"},{"ev":"onChange","value":"12345.6","formattedValue":"12.345,6","dom":"12.345,6"}]',
    '{"value":"12.345,6","caret":[8,8]}',
  ],
  'paste > en-US blur: normal paste': [
    '[{"ev":"onChange","value":"1234567.891","formattedValue":"1234567.891","dom":"1234567.891"}]',
    '{"value":"1234567.891","caret":[11,11]}',
  ],
  'paste > de-DE blur: normal paste of a de-DE string': [
    '[{"ev":"onChange","value":"1234567.89","formattedValue":"1234567,89","dom":"1234567,89"}]',
    '{"value":"1234567,89","caret":[10,10]}',
  ],
  'paste > en-US change: normal paste': [
    '[{"ev":"onChange","value":"1234567.891","formattedValue":"1,234,567.891","dom":"1,234,567.891"}]',
    '{"value":"1,234,567.891","caret":[13,13]}',
  ],
  'paste > de-DE change: normal paste of a de-DE string': [
    '[{"ev":"onChange","value":"1234567.89","formattedValue":"1.234.567,89","dom":"1.234.567,89"}]',
    '{"value":"1.234.567,89","caret":[12,12]}',
  ],
  'keyboard focus then blur > en-US Blur: focus strips without onChange; blur regroups with no onChange (raw unchanged)':
    [
      '"1,234,567.89"',
      '{"value":"1234567.89","caret":[10,10]}',
      '[]',
      '{"value":"1,234,567.89","caret":[12,12]}',
    ],
  'keyboard focus then blur > en-US Blur: type then blur groups; blur does not fire onChange': [
    '[{"ev":"onChange","value":"1","formattedValue":"1","dom":"1"},{"ev":"onChange","value":"12","formattedValue":"12","dom":"12"},{"ev":"onChange","value":"123","formattedValue":"123","dom":"123"},{"ev":"onChange","value":"1234","formattedValue":"1234","dom":"1234"},{"ev":"onChange","value":"12345","formattedValue":"12345","dom":"12345"},{"ev":"onChange","value":"123456","formattedValue":"123456","dom":"123456"},{"ev":"onChange","value":"1234567","formattedValue":"1234567","dom":"1234567"},{"ev":"onChange","value":"1234567.","formattedValue":"1234567.","dom":"1234567."},{"ev":"onChange","value":"1234567.5","formattedValue":"1234567.5","dom":"1234567.5"}]',
    '{"value":"1,234,567.5","caret":[11,11]}',
  ],
  'keyboard focus then blur > de-DE Blur: focus strips without onChange; blur regroups with no onChange (raw unchanged)':
    [
      '"1.234.567,89"',
      '{"value":"1234567,89","caret":[10,10]}',
      '[]',
      '{"value":"1.234.567,89","caret":[12,12]}',
    ],
  'keyboard focus then blur > de-DE Blur: type then blur groups; blur does not fire onChange': [
    '[{"ev":"onChange","value":"1","formattedValue":"1","dom":"1"},{"ev":"onChange","value":"12","formattedValue":"12","dom":"12"},{"ev":"onChange","value":"123","formattedValue":"123","dom":"123"},{"ev":"onChange","value":"1234","formattedValue":"1234","dom":"1234"},{"ev":"onChange","value":"12345","formattedValue":"12345","dom":"12345"},{"ev":"onChange","value":"123456","formattedValue":"123456","dom":"123456"},{"ev":"onChange","value":"1234567","formattedValue":"1234567","dom":"1234567"},{"ev":"onChange","value":"1234567.","formattedValue":"1234567,","dom":"1234567,"},{"ev":"onChange","value":"1234567.5","formattedValue":"1234567,5","dom":"1234567,5"}]',
    '{"value":"1.234.567,5","caret":[11,11]}',
  ],
};
const pinCounts = new Map<string, number>();
const pin = (_k: string, v: unknown) => {
  const name = expect.getState().currentTestName as string;
  const n = pinCounts.get(name) ?? 0;
  pinCounts.set(name, n + 1);
  expect(JSON.stringify(v)).toBe(PINNED[name][n]);
};
const state = (el: HTMLInputElement) => ({
  value: el.value,
  caret: [el.selectionStart, el.selectionEnd],
});

describe('typing via beforeinput', () => {
  for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
    it(`en-US ${formatOn}: digits and a decimal`, () => {
      const { el } = make({ formatOn });
      el.focus();
      typeAll(el, '12345.6');
      pin('log', log);
      pin('sta', state(el));
    });
    it(`de-DE ${formatOn}: digits and a decimal`, () => {
      const { el } = make({ formatOn, locale: 'de-DE' });
      el.focus();
      typeAll(el, '12345,6');
      pin('log', log);
      pin('sta', state(el));
    });
  }
  it('Change mode: typing in the middle keeps the caret after the typed digit', () => {
    const { el } = make({ formatOn: FormatOn.Change, defaultValue: '1234' });
    el.focus();
    el.setSelectionRange(2, 2);
    typeChar(el, '9');
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "19,234",
          "ev": "onChange",
          "formattedValue": "19,234",
          "value": "19234",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          2,
          2,
        ],
        "value": "19,234",
      }
    `);
  });
  it('a rejected keystroke is prevented and logs nothing', () => {
    const { el } = make({ defaultValue: '1' });
    el.focus();
    expect(typeChar(el, 'a')).toBe(true);
    expect(log).toEqual([]);
    expect(el.value).toBe('1');
  });
});

describe('paste', () => {
  for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
    it(`en-US ${formatOn}: normal paste`, () => {
      const { el } = make({ formatOn });
      el.focus();
      const ev = paste(el, '1234567.891');
      expect(ev.defaultPrevented).toBe(true);
      pin('log', log);
      pin('sta', state(el));
    });
    it(`de-DE ${formatOn}: normal paste of a de-DE string`, () => {
      const { el } = make({ formatOn, locale: 'de-DE' });
      el.focus();
      paste(el, '1.234.567,89');
      pin('log', log);
      pin('sta', state(el));
    });
  }
  it('paste replaces the selection', () => {
    const { el } = make({ formatOn: FormatOn.Change, defaultValue: '123456' });
    el.focus();
    el.setSelectionRange(1, 3);
    paste(el, '99');
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "199,456",
          "ev": "onChange",
          "formattedValue": "199,456",
          "value": "199456",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          3,
          3,
        ],
        "value": "199,456",
      }
    `);
  });
  it('readOnly: prevented, no write, no onChange', () => {
    const { el } = make({ defaultValue: '5', readOnly: true });
    const ev = paste(el, '123');
    expect(ev.defaultPrevented).toBe(true);
    expect(log).toEqual([]);
    expect(el.value).toBe('5');
  });
  it('disabled: prevented, no write, no onChange', () => {
    const { el } = make({ defaultValue: '5', disabled: true });
    const ev = paste(el, '123');
    expect(ev.defaultPrevented).toBe(true);
    expect(log).toEqual([]);
    expect(el.value).toBe('5');
  });
  it('rejected by isAllowed: prevented, value untouched, no onChange', () => {
    const { el } = make({ defaultValue: '5', isAllowed: (r: string) => r.length < 3 });
    el.focus();
    const ev = paste(el, '123');
    expect(ev.defaultPrevented).toBe(true);
    expect(log).toEqual([]);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          0,
          0,
        ],
        "value": "5",
      }
    `);
  });
  it('rejected scientific notation (allowScientificNotation:false): no write, no onChange', () => {
    const { el } = make({ defaultValue: '5', allowScientificNotation: false });
    el.focus();
    paste(el, '1.5e-7');
    expect(log).toEqual([]);
    expect(el.value).toBe('5');
  });
  it('paste of non-numeric text (pinned as-is)', () => {
    const { el } = make({ defaultValue: '5' });
    el.focus();
    paste(el, 'abc');
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "5",
          "ev": "onChange",
          "formattedValue": "5",
          "value": "5",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          0,
          0,
        ],
        "value": "5",
      }
    `);
  });
});

describe('keyboard focus then blur', () => {
  for (const [name, extra] of [
    ['en-US', {}],
    ['de-DE', { locale: 'de-DE' }],
  ] as const) {
    it(`${name} Blur: focus strips without onChange; blur regroups with no onChange (raw unchanged)`, () => {
      const { el } = make({ defaultValue: '1234567.89', ...extra });
      pin('val', el.value);
      el.focus();
      expect(log).toEqual([]);
      pin('sta', state(el));
      el.blur();
      pin('log', log);
      pin('sta', state(el));
    });
    it(`${name} Blur: type then blur groups; blur does not fire onChange`, () => {
      const { el } = make({ ...extra });
      el.focus();
      typeAll(el, name === 'en-US' ? '1234567.5' : '1234567,5');
      const before = log.length;
      el.blur();
      expect(log.length).toBe(before);
      pin('log', log);
      pin('sta', state(el));
    });
  }
  it('Change mode: focus does not strip; blur is a no-op', () => {
    const { el } = make({ formatOn: FormatOn.Change, defaultValue: '1234567' });
    el.focus();
    expect(el.value).toBe('1,234,567');
    el.blur();
    expect(el.value).toBe('1,234,567');
    expect(log).toEqual([]);
  });
  it('Blur: caret at end of grouped value is mapped to end of stripped value', () => {
    const { el } = make({ defaultValue: '1234567' });
    el.focus();
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          7,
          7,
        ],
        "value": "1234567",
      }
    `);
    el.blur();
    el.setSelectionRange(9, 9);
    el.focus();
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          7,
          7,
        ],
        "value": "1234567",
      }
    `);
  });
});

describe('mouse focus', () => {
  const md = (el: HTMLInputElement, button = 0) =>
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button }));
  const click = (el: HTMLInputElement) =>
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  it('left mousedown -> focus keeps grouping; click strips and maps the caret; no onChange', () => {
    const { el } = make({ defaultValue: '1234567' });
    md(el);
    el.focus();
    expect(el.value).toBe('1,234,567');
    el.setSelectionRange(3, 3);
    click(el);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          2,
          2,
        ],
        "value": "1234567",
      }
    `);
    expect(log).toEqual([]);
  });
  it('a second click does not strip again (flag cleared)', () => {
    const { el } = make({ defaultValue: '1234567' });
    md(el);
    el.focus();
    click(el);
    typeChar(el, '8');
    log.length = 0;
    el.setSelectionRange(0, 0);
    click(el);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          0,
          0,
        ],
        "value": "12345678",
      }
    `);
    expect(log).toEqual([]);
  });
  it('right-button mousedown does not wedge: focus still strips', () => {
    const { el } = make({ defaultValue: '1234567' });
    md(el, 2);
    el.focus();
    expect(el.value).toBe('1234567');
    expect(log).toEqual([]);
  });
  it('right-button mousedown followed by click is a no-op', () => {
    const { el } = make({ defaultValue: '1234567' });
    md(el, 2);
    click(el);
    expect(el.value).toBe('1,234,567');
  });
  it('mousedown + blur without click clears pending: next keyboard focus strips', () => {
    const { el } = make({ defaultValue: '1234567' });
    md(el);
    el.focus();
    el.blur();
    expect(el.value).toBe('1,234,567');
    el.focus();
    expect(el.value).toBe('1234567');
  });
  it('click without mousedown is a no-op', () => {
    const { el } = make({ defaultValue: '1234567' });
    click(el);
    expect(el.value).toBe('1,234,567');
  });
  it('Change mode: mouse focus + click never strip', () => {
    const { el } = make({ formatOn: FormatOn.Change, defaultValue: '1234567' });
    md(el);
    el.focus();
    click(el);
    expect(el.value).toBe('1,234,567');
  });
  it('de-DE: click strips de-DE grouping', () => {
    const { el } = make({ locale: 'de-DE', defaultValue: '1234567.5' });
    expect(el.value).toBe('1.234.567,5');
    md(el);
    el.focus();
    el.setSelectionRange(11, 11);
    click(el);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          9,
          9,
        ],
        "value": "1234567,5",
      }
    `);
  });
});

describe('blur cases', () => {
  it('Blur mode with grouping off still settles on blur (same as React)', () => {
    const { el } = make({ formatOn: 'blur', groupingStyle: 'none' });
    el.focus();
    typeAll(el, '1.');
    log.length = 0;
    el.blur();
    expect(el.value).toBe('1');
    expect(log).toEqual([{ ev: 'onChange', value: '1', formattedValue: '1', dom: '1' }]);
  });

  it('trailing separator "1." is stripped on blur', () => {
    const { el } = make();
    el.focus();
    typeAll(el, '1.');
    log.length = 0;
    el.blur();
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1",
          "ev": "onChange",
          "formattedValue": "1",
          "value": "1",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          1,
          1,
        ],
        "value": "1",
      }
    `);
  });
  it('de-DE trailing separator "1," is stripped on blur', () => {
    const { el } = make({ locale: 'de-DE' });
    el.focus();
    typeAll(el, '1,');
    log.length = 0;
    el.blur();
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1",
          "ev": "onChange",
          "formattedValue": "1",
          "value": "1",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          1,
          1,
        ],
        "value": "1",
      }
    `);
  });
  for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
    it(`${formatOn}: decimalMinLength pads on blur`, () => {
      const { el } = make({ formatOn, decimalMinLength: 2 });
      el.focus();
      typeAll(el, '1234.5');
      log.length = 0;
      el.blur();
      expect(log).toMatchInlineSnapshot(`
        [
          {
            "dom": "1,234.50",
            "ev": "onChange",
            "formattedValue": "1,234.50",
            "value": "1234.50",
          },
        ]
      `);
      expect(state(el)).toMatchInlineSnapshot(`
        {
          "caret": [
            8,
            8,
          ],
          "value": "1,234.50",
        }
      `);
    });
    it(`de-DE ${formatOn}: decimalMinLength pads on blur`, () => {
      const { el } = make({ formatOn, decimalMinLength: 2, locale: 'de-DE' });
      el.focus();
      typeAll(el, '1234,5');
      log.length = 0;
      el.blur();
      expect(log).toMatchInlineSnapshot(`
        [
          {
            "dom": "1.234,50",
            "ev": "onChange",
            "formattedValue": "1.234,50",
            "value": "1234.50",
          },
        ]
      `);
      expect(state(el)).toMatchInlineSnapshot(`
        {
          "caret": [
            8,
            8,
          ],
          "value": "1.234,50",
        }
      `);
    });
    it(`${formatOn}: allowNegative "-0" normalizes on blur`, () => {
      const { el } = make({ formatOn, allowNegative: true });
      el.focus();
      typeAll(el, '-0');
      log.length = 0;
      el.blur();
      expect(log).toMatchInlineSnapshot(`
        [
          {
            "dom": "0",
            "ev": "onChange",
            "formattedValue": "0",
            "value": "0",
          },
        ]
      `);
      expect(state(el)).toMatchInlineSnapshot(`
        {
          "caret": [
            1,
            1,
          ],
          "value": "0",
        }
      `);
    });
    it(`${formatOn}: allowNegative "-0.00" normalizes on blur`, () => {
      const { el } = make({ formatOn, allowNegative: true });
      el.focus();
      typeAll(el, '-0.00');
      log.length = 0;
      el.blur();
      expect(log).toMatchInlineSnapshot(`
        [
          {
            "dom": "0.00",
            "ev": "onChange",
            "formattedValue": "0.00",
            "value": "0.00",
          },
        ]
      `);
      expect(state(el)).toMatchInlineSnapshot(`
        {
          "caret": [
            4,
            4,
          ],
          "value": "0.00",
        }
      `);
    });
  }
  it('decimalMinLength: integer gets padded on blur', () => {
    const { el } = make({ decimalMinLength: 2 });
    el.focus();
    typeAll(el, '7');
    log.length = 0;
    el.blur();
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "7.00",
          "ev": "onChange",
          "formattedValue": "7.00",
          "value": "7.00",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          4,
          4,
        ],
        "value": "7.00",
      }
    `);
  });
  it('allowNegative + decimalMinLength: "-0" blur', () => {
    const { el } = make({ allowNegative: true, decimalMinLength: 2 });
    el.focus();
    typeAll(el, '-0');
    log.length = 0;
    el.blur();
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "0.00",
          "ev": "onChange",
          "formattedValue": "0.00",
          "value": "0.00",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          4,
          4,
        ],
        "value": "0.00",
      }
    `);
  });
  it('allowNegative: "-5" blur is untouched', () => {
    const { el } = make({ allowNegative: true });
    el.focus();
    typeAll(el, '-5');
    log.length = 0;
    el.blur();
    expect(log).toEqual([]);
    expect(el.value).toBe('-5');
  });
  it('Change mode without decimalMinLength/allowNegative: no blur handling, trailing "." stays', () => {
    const { el } = make({ formatOn: FormatOn.Change });
    el.focus();
    typeAll(el, '12.');
    log.length = 0;
    el.blur();
    expect(log).toEqual([]);
    expect(el.value).toBe('12.');
  });
  it('no-op blur on an empty field writes nothing', () => {
    const { el } = make({ decimalMinLength: 2, allowNegative: true });
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    el.focus();
    el.blur();
    expect(spy).not.toHaveBeenCalled();
    expect(log).toEqual([]);
    expect(el.value).toBe('');
  });
  it('no-op blur on an already formatted Change-mode value writes nothing', () => {
    const { el } = make({
      formatOn: FormatOn.Change,
      allowNegative: true,
      defaultValue: '1234.5',
    });
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    el.focus();
    el.blur();
    expect(spy).not.toHaveBeenCalled();
    expect(log).toEqual([]);
  });
  it('blur after typing "1234" in Blur mode regroups the display but fires no onChange', () => {
    const { el } = make();
    el.focus();
    typeAll(el, '1234');
    log.length = 0;
    el.blur();
    expect(el.value).toBe('1,234');
    expect(log).toEqual([]);
  });
});

describe('undo / redo input events', () => {
  for (const inputType of ['historyUndo', 'historyRedo']) {
    for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
      it(`${inputType} ${formatOn}: broadcasts the restored string, no rewrite`, () => {
        const { el } = make({ formatOn, defaultValue: '5' });
        el.focus();
        const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
        nativeInput(el, '1234', 4, 4, inputType);
        expect(spy).not.toHaveBeenCalled();
        expect(log).toMatchInlineSnapshot(`
          [
            {
              "dom": "1234",
              "ev": "onChange",
              "formattedValue": "1234",
              "value": "1234",
            },
          ]
        `);
        expect(state(el)).toMatchInlineSnapshot(`
          {
            "caret": [
              4,
              4,
            ],
            "value": "1234",
          }
        `);
      });
    }
  }
  it('de-DE historyUndo: raw is canonical, formattedValue is the restored display text', () => {
    const { el } = make({ locale: 'de-DE' });
    el.focus();
    nativeInput(el, '1.234,5', 7, 7, 'historyUndo');
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1.234,5",
          "ev": "onChange",
          "formattedValue": "1.234,5",
          "value": "1234.5",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          7,
          7,
        ],
        "value": "1.234,5",
      }
    `);
  });
});

describe('input fallback', () => {
  it('focused Blur mode: ungrouped value, broadcast, no rewrite when already formatted', () => {
    const { el } = make();
    el.focus();
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    nativeInput(el, '1234.5', 6);
    expect(spy).not.toHaveBeenCalled();
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1234.5",
          "ev": "onChange",
          "formattedValue": "1234.5",
          "value": "1234.5",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          6,
          6,
        ],
        "value": "1234.5",
      }
    `);
  });
  it('focused Change mode: groups and maps the caret', () => {
    const { el } = make({ formatOn: FormatOn.Change });
    el.focus();
    nativeInput(el, '1234', 4);
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1,234",
          "ev": "onChange",
          "formattedValue": "1,234",
          "value": "1234",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          5,
          5,
        ],
        "value": "1,234",
      }
    `);
  });
  it('focused: non-numeric junk is stripped', () => {
    const { el } = make();
    el.focus();
    nativeInput(el, '12ab3', 5);
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "123",
          "ev": "onChange",
          "formattedValue": "123",
          "value": "123",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          3,
          3,
        ],
        "value": "123",
      }
    `);
  });
  it('focused with decimalMinLength: trailing "." is kept (typing-time rules, vanilla)', () => {
    const { el } = make({ decimalMinLength: 2 });
    el.focus();
    nativeInput(el, '1.', 2, 2, 'insertCompositionText');
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1.",
          "ev": "onChange",
          "formattedValue": "1.",
          "value": "1.",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          2,
          2,
        ],
        "value": "1.",
      }
    `);
  });
  it('unfocused (autofill) Blur mode: lands grouped, onChange fires', () => {
    const { el } = make();
    nativeInput(el, '1234567.5', 0);
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1,234,567.5",
          "ev": "onChange",
          "formattedValue": "1,234,567.5",
          "value": "1234567.5",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          11,
          11,
        ],
        "value": "1,234,567.5",
      }
    `);
  });
  it('unfocused de-DE autofill of an en-US string is read as foreign', () => {
    const { el } = make({ locale: 'de-DE' });
    nativeInput(el, '1,234.56', 8);
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "1.234,56",
          "ev": "onChange",
          "formattedValue": "1.234,56",
          "value": "1234.56",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          8,
          8,
        ],
        "value": "1.234,56",
      }
    `);
  });
  it('unfocused with decimalMinLength: padded, trailing separator stripped (resting rules)', () => {
    const { el } = make({ decimalMinLength: 2 });
    nativeInput(el, '12.', 3);
    expect(log).toMatchInlineSnapshot(`
      [
        {
          "dom": "12.00",
          "ev": "onChange",
          "formattedValue": "12.00",
          "value": "12.00",
        },
      ]
    `);
    expect(state(el)).toMatchInlineSnapshot(`
      {
        "caret": [
          5,
          5,
        ],
        "value": "12.00",
      }
    `);
  });
  describe('allowScientificNotation:false', () => {
    it('focused: restores the previous value, no onChange', () => {
      const { el } = make({ allowScientificNotation: false, defaultValue: '5' });
      el.focus();
      typeAll(el, '7');
      log.length = 0;
      nativeInput(el, '1.5e-7', 6);
      expect(log).toEqual([]);
      expect(state(el)).toMatchInlineSnapshot(`
        {
          "caret": [
            2,
            2,
          ],
          "value": "75",
        }
      `);
    });
    it('unfocused: restores the previous value, no onChange', () => {
      const { el } = make({ allowScientificNotation: false, defaultValue: '1234' });
      expect(el.value).toBe('1,234');
      nativeInput(el, '1.5e-7', 6);
      expect(log).toEqual([]);
      expect(state(el)).toMatchInlineSnapshot(`
        {
          "caret": [
            5,
            5,
          ],
          "value": "1,234",
        }
      `);
    });
    it('restores the value remembered after a blur regroup (lastValue tracks writes)', () => {
      const { el } = make({ allowScientificNotation: false });
      el.focus();
      typeAll(el, '1234');
      el.blur();
      log.length = 0;
      nativeInput(el, '2e5', 3);
      expect(log).toEqual([]);
      // Caret at the end: the browser's caret pointed into the refused text.
      expect(state(el)).toMatchInlineSnapshot(`
        {
          "caret": [
            5,
            5,
          ],
          "value": "1,234",
        }
      `);
    });
  });
});

describe('setValue / destroy', () => {
  it('setValue writes the formatted value and fires no onChange', () => {
    const { numora, el } = make();
    numora.setValue('1234567.5');
    expect(log).toEqual([]);
    expect(el.value).toBe('1,234,567.5');
  });
  it('after destroy, events are inert', () => {
    const { numora, el } = make();
    numora.destroy();
    el.focus();
    typeChar(el, '5');
    expect(log).toEqual([]);
  });
});
