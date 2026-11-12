import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { StrictMode, useState } from 'react';
import { NumoraInput, type NumoraInputChangeEvent } from '../src/index';
import { FormatOn } from 'numora';

// Characterization tests: pin the exact order and payload of every React callback
// (onChange, onValueChange, onFocus, onBlur, onPaste, onKeyDown) plus the element value
// and caret, so a refactor of the event wiring cannot change behaviour silently.
// Log entries are compact strings; `dom=` is the input's real value at callback time.
// Expected values for the table-driven cases live in PINNED (looped tests cannot share
// inline snapshots); `pin(value)` compares against the next entry for the running test.

let log: string[];
let el: HTMLInputElement;

beforeEach(() => {
  log = [];
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function callbacks() {
  return {
    onChange: (e: NumoraInputChangeEvent) =>
      log.push(
        `onChange value=${e.target.value} formatted=${e.target.formattedValue} dom=${el.value}`
      ),
    onValueChange: (v: { value: string; formattedValue: string }) =>
      log.push(`onValueChange value=${v.value} formatted=${v.formattedValue} dom=${el.value}`),
    onFocus: () => log.push(`onFocus dom=${el.value}`),
    onBlur: () => log.push(`onBlur dom=${el.value}`),
    onPaste: () => log.push(`onPaste dom=${el.value}`),
    onKeyDown: (e: { key: string }) => log.push(`onKeyDown ${e.key} dom=${el.value}`),
  };
}

function mount(props: Record<string, unknown> = {}, strict = false) {
  const node = <NumoraInput data-testid="i" {...callbacks()} {...props} />;
  const utils = render(strict ? <StrictMode>{node}</StrictMode> : node);
  el = utils.container.querySelector('input') as HTMLInputElement;
  return { ...utils, el };
}

const focus = () => act(() => el.focus());
const blur = () => act(() => el.blur());

function typeChar(char: string, withKeyDown = false): boolean {
  if (withKeyDown) fireEvent.keyDown(el, { key: char });
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
const typeAll = (s: string, withKeyDown = false) => {
  for (const c of s) typeChar(c, withKeyDown);
};
function paste(text: string): Event {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  el.dispatchEvent(ev);
  return ev;
}
// Native `input` event that React's value tracker sees as a change (bypasses the patched setter).
function nativeInput(
  value: string,
  start: number,
  end = start,
  inputType = 'insertReplacementText'
) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(el, value);
  el.setSelectionRange(start, end);
  act(() => {
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
  });
}
const state = () => `${el.value} caret=${el.selectionStart},${el.selectionEnd}`;
const mouseDown = (button = 0) => fireEvent.mouseDown(el, { button });
const click = () => fireEvent.click(el);

/* PINNED:START */
const PINNED: Record<string, string[]> = {
  'typing via beforeinput > en-US blur: digits and a decimal, with keydown': [
    '["onFocus dom=","onKeyDown 1 dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onKeyDown 2 dom=1","onChange value=12 formatted=12 dom=12","onValueChange value=12 formatted=12 dom=12","onKeyDown 3 dom=12","onChange value=123 formatted=123 dom=123","onValueChange value=123 formatted=123 dom=123","onKeyDown 4 dom=123","onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234","onKeyDown 5 dom=1234","onChange value=12345 formatted=12345 dom=12345","onValueChange value=12345 formatted=12345 dom=12345","onKeyDown . dom=12345","onChange value=12345. formatted=12345. dom=12345.","onValueChange value=12345. formatted=12345. dom=12345.","onKeyDown 6 dom=12345.","onChange value=12345.6 formatted=12345.6 dom=12345.6","onValueChange value=12345.6 formatted=12345.6 dom=12345.6"]',
    '"12345.6 caret=7,7"',
  ],
  'typing via beforeinput > de-DE blur: digits and a decimal': [
    '["onFocus dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onChange value=12 formatted=12 dom=12","onValueChange value=12 formatted=12 dom=12","onChange value=123 formatted=123 dom=123","onValueChange value=123 formatted=123 dom=123","onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234","onChange value=12345 formatted=12345 dom=12345","onValueChange value=12345 formatted=12345 dom=12345","onChange value=12345. formatted=12345, dom=12345,","onValueChange value=12345. formatted=12345, dom=12345,","onChange value=12345.6 formatted=12345,6 dom=12345,6","onValueChange value=12345.6 formatted=12345,6 dom=12345,6"]',
    '"12345,6 caret=7,7"',
  ],
  'typing via beforeinput > blur: typing in the middle keeps the caret after the typed digit': [
    '["onFocus dom=1234","onChange value=12934 formatted=12934 dom=12934","onValueChange value=12934 formatted=12934 dom=12934"]',
    '"12934 caret=3,3"',
  ],
  'typing via beforeinput > en-US change: digits and a decimal, with keydown': [
    '["onFocus dom=","onKeyDown 1 dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onKeyDown 2 dom=1","onChange value=12 formatted=12 dom=12","onValueChange value=12 formatted=12 dom=12","onKeyDown 3 dom=12","onChange value=123 formatted=123 dom=123","onValueChange value=123 formatted=123 dom=123","onKeyDown 4 dom=123","onChange value=1234 formatted=1,234 dom=1,234","onValueChange value=1234 formatted=1,234 dom=1,234","onKeyDown 5 dom=1,234","onChange value=12345 formatted=12,345 dom=12,345","onValueChange value=12345 formatted=12,345 dom=12,345","onKeyDown . dom=12,345","onChange value=12345. formatted=12,345. dom=12,345.","onValueChange value=12345. formatted=12,345. dom=12,345.","onKeyDown 6 dom=12,345.","onChange value=12345.6 formatted=12,345.6 dom=12,345.6","onValueChange value=12345.6 formatted=12,345.6 dom=12,345.6"]',
    '"12,345.6 caret=8,8"',
  ],
  'typing via beforeinput > de-DE change: digits and a decimal': [
    '["onFocus dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onChange value=12 formatted=12 dom=12","onValueChange value=12 formatted=12 dom=12","onChange value=123 formatted=123 dom=123","onValueChange value=123 formatted=123 dom=123","onChange value=1234 formatted=1.234 dom=1.234","onValueChange value=1234 formatted=1.234 dom=1.234","onChange value=12345 formatted=12.345 dom=12.345","onValueChange value=12345 formatted=12.345 dom=12.345","onChange value=12345. formatted=12.345, dom=12.345,","onValueChange value=12345. formatted=12.345, dom=12.345,","onChange value=12345.6 formatted=12.345,6 dom=12.345,6","onValueChange value=12345.6 formatted=12.345,6 dom=12.345,6"]',
    '"12.345,6 caret=8,8"',
  ],
  'typing via beforeinput > change: typing in the middle keeps the caret after the typed digit': [
    '["onFocus dom=1,234","onChange value=19234 formatted=19,234 dom=19,234","onValueChange value=19234 formatted=19,234 dom=19,234"]',
    '"19,234 caret=2,2"',
  ],
  'paste > en-US blur: normal paste (onPaste before the write and onChange)': [
    '["onPaste dom=","onChange value=1234567.891 formatted=1234567.891 dom=1234567.891","onValueChange value=1234567.891 formatted=1234567.891 dom=1234567.891"]',
    '"1234567.891 caret=11,11"',
  ],
  'paste > de-DE blur: paste of a de-DE string': [
    '["onPaste dom=","onChange value=1234567.89 formatted=1234567,89 dom=1234567,89","onValueChange value=1234567.89 formatted=1234567,89 dom=1234567,89"]',
    '"1234567,89 caret=10,10"',
  ],
  'paste > en-US change: normal paste (onPaste before the write and onChange)': [
    '["onPaste dom=","onChange value=1234567.891 formatted=1,234,567.891 dom=1,234,567.891","onValueChange value=1234567.891 formatted=1,234,567.891 dom=1,234,567.891"]',
    '"1,234,567.891 caret=13,13"',
  ],
  'paste > de-DE change: paste of a de-DE string': [
    '["onPaste dom=","onChange value=1234567.89 formatted=1.234.567,89 dom=1.234.567,89","onValueChange value=1234567.89 formatted=1.234.567,89 dom=1.234.567,89"]',
    '"1.234.567,89 caret=12,12"',
  ],
  'keyboard focus then blur > en-US Blur: focus strips without onChange; blur regroups without onChange':
    [
      '"1,234,567.89"',
      '["onFocus dom=1234567.89"]',
      '"1234567.89 caret=10,10"',
      '["onFocus dom=1234567.89","onBlur dom=1,234,567.89"]',
      '"1,234,567.89 caret=12,12"',
    ],
  'keyboard focus then blur > de-DE Blur: focus strips without onChange; blur regroups': [
    '"1.234.567,89"',
    '["onFocus dom=1234567,89"]',
    '"1234567,89 caret=10,10"',
    '["onFocus dom=1234567,89","onBlur dom=1.234.567,89"]',
    '"1.234.567,89 caret=12,12"',
  ],
  'keyboard focus then blur > en-US Blur: type then blur groups without a callback (raw unchanged)':
    [
      '["onBlur dom=1,234,567.5"]',
      '"1,234,567.5 caret=11,11"',
    ],
  'keyboard focus then blur > de-DE Blur: type then blur groups': [
    '["onBlur dom=1.234.567,5"]',
    '"1.234.567,5 caret=11,11"',
  ],
  'blur cases > blur: decimalMinLength pads on blur': [
    '["onChange value=1234.50 formatted=1,234.50 dom=1,234.50","onValueChange value=1234.50 formatted=1,234.50 dom=1,234.50","onBlur dom=1,234.50"]',
    '"1,234.50 caret=8,8"',
  ],
  'blur cases > de-DE blur: decimalMinLength pads on blur': [
    '["onChange value=1234.50 formatted=1.234,50 dom=1.234,50","onValueChange value=1234.50 formatted=1.234,50 dom=1.234,50","onBlur dom=1.234,50"]',
    '"1.234,50 caret=8,8"',
  ],
  'blur cases > blur: allowNegative "-0" normalizes on blur': [
    '["onChange value=0 formatted=0 dom=0","onValueChange value=0 formatted=0 dom=0","onBlur dom=0"]',
    '"0 caret=1,1"',
  ],
  'blur cases > blur: allowNegative "-0.00" normalizes on blur': [
    '["onChange value=0.00 formatted=0.00 dom=0.00","onValueChange value=0.00 formatted=0.00 dom=0.00","onBlur dom=0.00"]',
    '"0.00 caret=4,4"',
  ],
  'blur cases > change: decimalMinLength pads on blur': [
    '["onChange value=1234.50 formatted=1,234.50 dom=1,234.50","onValueChange value=1234.50 formatted=1,234.50 dom=1,234.50","onBlur dom=1,234.50"]',
    '"1,234.50 caret=8,8"',
  ],
  'blur cases > de-DE change: decimalMinLength pads on blur': [
    '["onChange value=1234.50 formatted=1.234,50 dom=1.234,50","onValueChange value=1234.50 formatted=1.234,50 dom=1.234,50","onBlur dom=1.234,50"]',
    '"1.234,50 caret=8,8"',
  ],
  'blur cases > change: allowNegative "-0" normalizes on blur': [
    '["onChange value=0 formatted=0 dom=0","onValueChange value=0 formatted=0 dom=0","onBlur dom=0"]',
    '"0 caret=1,1"',
  ],
  'blur cases > change: allowNegative "-0.00" normalizes on blur': [
    '["onChange value=0.00 formatted=0.00 dom=0.00","onValueChange value=0.00 formatted=0.00 dom=0.00","onBlur dom=0.00"]',
    '"0.00 caret=4,4"',
  ],
  'undo / redo input events > historyUndo blur: broadcasts the restored string, no rewrite': [
    '["onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234"]',
    '"1234 caret=4,4"',
  ],
  'undo / redo input events > historyUndo change: broadcasts the restored string, no rewrite': [
    '["onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234"]',
    '"1234 caret=4,4"',
  ],
  'undo / redo input events > historyRedo blur: broadcasts the restored string, no rewrite': [
    '["onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234"]',
    '"1234 caret=4,4"',
  ],
  'undo / redo input events > historyRedo change: broadcasts the restored string, no rewrite': [
    '["onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234"]',
    '"1234 caret=4,4"',
  ],
  'controlled value > parent echo while focused (Blur): no rewrite beyond the keystroke writes, no extra onChange':
    [
      '["onFocus dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onChange value=12 formatted=12 dom=12","onValueChange value=12 formatted=12 dom=12","onChange value=123 formatted=123 dom=123","onValueChange value=123 formatted=123 dom=123","onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234","onChange value=1234. formatted=1234. dom=1234.","onValueChange value=1234. formatted=1234. dom=1234.","onChange value=1234.5 formatted=1234.5 dom=1234.5","onValueChange value=1234.5 formatted=1234.5 dom=1234.5"]',
      '"1234.5 caret=6,6"',
    ],
  'controlled value > parent echo while focused (Change): grouped display is kept, one write per keystroke':
    [
      '["onFocus dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onChange value=12 formatted=12 dom=12","onValueChange value=12 formatted=12 dom=12","onChange value=123 formatted=123 dom=123","onValueChange value=123 formatted=123 dom=123","onChange value=1234 formatted=1,234 dom=1,234","onValueChange value=1234 formatted=1,234 dom=1,234","onChange value=12345 formatted=12,345 dom=12,345","onValueChange value=12345 formatted=12,345 dom=12,345"]',
      '"12,345 caret=6,6"',
    ],
  'controlled value > parent echo with decimalMinLength: mid-entry "1." is not stripped or padded':
    [
      '["onFocus dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onChange value=1. formatted=1. dom=1.","onValueChange value=1. formatted=1. dom=1."]',
      '"1. caret=2,2"',
    ],
  'controlled value > parent echo then blur: regroup/pad is emitted and echoed without a further rewrite':
    [
      '["onChange value=1234.50 formatted=1,234.50 dom=1,234.50","onValueChange value=1234.50 formatted=1,234.50 dom=1,234.50","onBlur dom=1,234.50"]',
      '"1,234.50 caret=8,8"',
    ],
  'controlled value > external parent change > de-DE focused vs unfocused': [
    '["onFocus dom=1234567,5"]',
    '"7654321,5 caret=9,9"',
  ],
  'controlled value > external parent change > same number, extra trailing zero from the parent: IS rewritten (raw strings differ)':
    ['"1,234.50 caret=8,8"'],
  'StrictMode > typing, paste, focus and blur each fire exactly once': [
    '["onFocus dom=","onKeyDown 1 dom=","onChange value=1 formatted=1 dom=1","onValueChange value=1 formatted=1 dom=1","onKeyDown 2 dom=1","onChange value=12 formatted=12 dom=12","onValueChange value=12 formatted=12 dom=12","onPaste dom=12","onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234","onBlur dom=1,234"]',
    '"1,234 caret=5,5"',
  ],
  'StrictMode > undo/redo and autofill fallbacks fire once': [
    '["onFocus dom=","onChange value=1234 formatted=1234 dom=1234","onValueChange value=1234 formatted=1234 dom=1234","onChange value=5678 formatted=5678 dom=5678","onValueChange value=5678 formatted=5678 dom=5678"]',
  ],
};
/* PINNED:END */
const pinCounts = new Map<string, number>();
function pin(v: unknown) {
  const name = expect.getState().currentTestName as string;
  const n = pinCounts.get(name) ?? 0;
  pinCounts.set(name, n + 1);
  const actual = JSON.stringify(v);
  if (process.env.PIN_RECORD) console.log('DUMP\t' + name + '\t' + actual);
  else expect(actual).toBe(PINNED[name]?.[n]);
}

describe('typing via beforeinput', () => {
  for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
    it(`en-US ${formatOn}: digits and a decimal, with keydown`, () => {
      mount({ formatOn });
      focus();
      typeAll('12345.6', true);
      pin(log);
      pin(state());
    });
    it(`de-DE ${formatOn}: digits and a decimal`, () => {
      mount({ formatOn, locale: 'de-DE' });
      focus();
      typeAll('12345,6');
      pin(log);
      pin(state());
    });
    it(`${formatOn}: typing in the middle keeps the caret after the typed digit`, () => {
      mount({ formatOn, defaultValue: '1234' });
      focus();
      el.setSelectionRange(2, 2);
      typeChar('9');
      pin(log);
      pin(state());
    });
  }
  it('a rejected keystroke is prevented and logs only keydown', () => {
    mount({ defaultValue: '1' });
    focus();
    log.length = 0;
    expect(typeChar('a', true)).toBe(true);
    expect(log).toEqual(['onKeyDown a dom=1']);
    expect(el.value).toBe('1');
  });
  it('isAllowed rejection: prevented, no onChange/onValueChange', () => {
    mount({ defaultValue: '12', isAllowed: (r: string) => r.length < 3 });
    focus();
    log.length = 0;
    expect(typeChar('3')).toBe(true);
    expect(log).toEqual([]);
    expect(el.value).toBe('12');
  });
});

describe('paste', () => {
  for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
    it(`en-US ${formatOn}: normal paste (onPaste before the write and onChange)`, () => {
      mount({ formatOn });
      focus();
      log.length = 0;
      const ev = paste('1234567.891');
      expect(ev.defaultPrevented).toBe(true);
      pin(log);
      pin(state());
    });
    it(`de-DE ${formatOn}: paste of a de-DE string`, () => {
      mount({ formatOn, locale: 'de-DE' });
      focus();
      log.length = 0;
      paste('1.234.567,89');
      pin(log);
      pin(state());
    });
  }
  it('paste replaces the selection', () => {
    mount({ formatOn: FormatOn.Change, defaultValue: '123456' });
    focus();
    el.setSelectionRange(1, 3);
    log.length = 0;
    paste('99');
    expect(log).toMatchInlineSnapshot(`
      [
        "onPaste dom=123,456",
        "onChange value=199456 formatted=199,456 dom=199,456",
        "onValueChange value=199456 formatted=199,456 dom=199,456",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"199,456 caret=3,3"`);
  });
  it('readOnly: prevented, no write, no callbacks at all (not even onPaste)', () => {
    mount({ defaultValue: '5', readOnly: true });
    const ev = paste('123');
    expect(ev.defaultPrevented).toBe(true);
    expect(log).toEqual([]);
    expect(el.value).toBe('5');
  });
  it('disabled: prevented, no write, no callbacks at all', () => {
    mount({ defaultValue: '5', disabled: true });
    const ev = paste('123');
    expect(ev.defaultPrevented).toBe(true);
    expect(log).toEqual([]);
    expect(el.value).toBe('5');
  });
  it('rejected by isAllowed: prevented, value untouched, onPaste still fires, no onChange', () => {
    mount({ defaultValue: '5', isAllowed: (r: string) => r.length < 3 });
    focus();
    log.length = 0;
    const ev = paste('123');
    expect(ev.defaultPrevented).toBe(true);
    expect(log).toMatchInlineSnapshot(`
      [
        "onPaste dom=5",
      ]
    `);
    expect(el.value).toBe('5');
  });
  it('rejected scientific notation: onPaste fires, no write, no onChange', () => {
    mount({ defaultValue: '5', allowScientificNotation: false });
    focus();
    log.length = 0;
    paste('1.5e-7');
    expect(log).toMatchInlineSnapshot(`
      [
        "onPaste dom=5",
      ]
    `);
    expect(el.value).toBe('5');
  });
  it('paste of non-numeric text (pinned as-is)', () => {
    mount({ defaultValue: '5' });
    focus();
    log.length = 0;
    paste('abc');
    expect(log).toMatchInlineSnapshot(`
      [
        "onPaste dom=5",
        "onChange value=5 formatted=5 dom=5",
        "onValueChange value=5 formatted=5 dom=5",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"5 caret=1,1"`);
  });
});

describe('keyboard focus then blur', () => {
  it('en-US Blur: focus strips without onChange; blur regroups without onChange', () => {
    mount({ formatOn: 'blur', defaultValue: '1234567.89' });
    pin(el.value);
    focus();
    pin(log);
    pin(state());
    blur();
    pin(log);
    pin(state());
  });
  it('de-DE Blur: focus strips without onChange; blur regroups', () => {
    mount({ formatOn: 'blur', defaultValue: '1234567.89', locale: 'de-DE' });
    pin(el.value);
    focus();
    pin(log);
    pin(state());
    blur();
    pin(log);
    pin(state());
  });
  it('en-US Blur: type then blur groups without a callback (raw unchanged)', () => {
    mount();
    focus();
    typeAll('1234567.5');
    log.length = 0;
    blur();
    pin(log);
    pin(state());
  });
  it('de-DE Blur: type then blur groups', () => {
    mount({ locale: 'de-DE' });
    focus();
    typeAll('1234567,5');
    log.length = 0;
    blur();
    pin(log);
    pin(state());
  });
  it('Change mode: focus does not strip; blur is a no-op (only onBlur)', () => {
    mount({ formatOn: FormatOn.Change, defaultValue: '1234567' });
    focus();
    blur();
    expect(log).toEqual(['onFocus dom=1,234,567', 'onBlur dom=1,234,567']);
    expect(el.value).toBe('1,234,567');
  });
  it('focus -> blur with an already-stripped ungrouped short value logs only focus/blur', () => {
    mount({ defaultValue: '123' });
    focus();
    blur();
    expect(log).toEqual(['onFocus dom=123', 'onBlur dom=123']);
  });
});

describe('mouse focus', () => {
  it('left mousedown -> focus keeps grouping; click strips and maps the caret; no onChange', () => {
    mount({ formatOn: 'blur', defaultValue: '1234567' });
    mouseDown();
    focus();
    expect(el.value).toBe('1,234,567');
    el.setSelectionRange(3, 3);
    click();
    expect(log).toMatchInlineSnapshot(`
      [
        "onFocus dom=1,234,567",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1234567 caret=2,2"`);
  });
  it('a second click does not strip again (flag cleared)', () => {
    mount({ formatOn: 'blur', defaultValue: '1234567' });
    mouseDown();
    focus();
    click();
    typeChar('8');
    log.length = 0;
    el.setSelectionRange(0, 0);
    click();
    expect(log).toEqual([]);
    expect(state()).toMatchInlineSnapshot(`"12345678 caret=0,0"`);
  });
  it('right-button mousedown does not wedge: focus still strips', () => {
    mount({ formatOn: 'blur', defaultValue: '1234567' });
    mouseDown(2);
    focus();
    expect(el.value).toBe('1234567');
    expect(log).toEqual(['onFocus dom=1234567']);
  });
  it('right-button mousedown followed by click is a no-op', () => {
    mount({ defaultValue: '1234567' });
    mouseDown(2);
    click();
    expect(el.value).toBe('1,234,567');
    expect(log).toEqual([]);
  });
  it('mousedown + blur without click clears pending: next keyboard focus strips', () => {
    mount({ formatOn: 'blur', defaultValue: '1234567' });
    mouseDown();
    focus();
    blur();
    expect(el.value).toBe('1,234,567');
    focus();
    expect(el.value).toBe('1234567');
    expect(log).toMatchInlineSnapshot(`
      [
        "onFocus dom=1,234,567",
        "onBlur dom=1,234,567",
        "onFocus dom=1234567",
      ]
    `);
  });
  it('click without mousedown is a no-op', () => {
    mount({ defaultValue: '1234567' });
    click();
    expect(el.value).toBe('1,234,567');
    expect(log).toEqual([]);
  });
  it('Change mode: mouse focus + click never strip', () => {
    mount({ formatOn: FormatOn.Change, defaultValue: '1234567' });
    mouseDown();
    focus();
    click();
    expect(el.value).toBe('1,234,567');
    expect(log).toEqual(['onFocus dom=1,234,567']);
  });
  it('de-DE: click strips de-DE grouping', () => {
    mount({ formatOn: 'blur', locale: 'de-DE', defaultValue: '1234567.5' });
    expect(el.value).toBe('1.234.567,5');
    mouseDown();
    focus();
    el.setSelectionRange(11, 11);
    click();
    expect(state()).toMatchInlineSnapshot(`"1234567,5 caret=9,9"`);
  });
});

describe('blur cases', () => {
  it('trailing separator "1." is stripped on blur', () => {
    mount({ formatOn: 'blur' });
    focus();
    typeAll('1.');
    log.length = 0;
    blur();
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=1 formatted=1 dom=1",
        "onValueChange value=1 formatted=1 dom=1",
        "onBlur dom=1",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1 caret=1,1"`);
  });
  it('de-DE trailing separator "1," is stripped on blur', () => {
    mount({ formatOn: 'blur', locale: 'de-DE' });
    focus();
    typeAll('1,');
    log.length = 0;
    blur();
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=1 formatted=1 dom=1",
        "onValueChange value=1 formatted=1 dom=1",
        "onBlur dom=1",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1 caret=1,1"`);
  });
  for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
    it(`${formatOn}: decimalMinLength pads on blur`, () => {
      mount({ formatOn, decimalMinLength: 2 });
      focus();
      typeAll('1234.5');
      log.length = 0;
      blur();
      pin(log);
      pin(state());
    });
    it(`de-DE ${formatOn}: decimalMinLength pads on blur`, () => {
      mount({ formatOn, decimalMinLength: 2, locale: 'de-DE' });
      focus();
      typeAll('1234,5');
      log.length = 0;
      blur();
      pin(log);
      pin(state());
    });
    it(`${formatOn}: allowNegative "-0" normalizes on blur`, () => {
      mount({ formatOn, allowNegative: true });
      focus();
      typeAll('-0');
      log.length = 0;
      blur();
      pin(log);
      pin(state());
    });
    it(`${formatOn}: allowNegative "-0.00" normalizes on blur`, () => {
      mount({ formatOn, allowNegative: true });
      focus();
      typeAll('-0.00');
      log.length = 0;
      blur();
      pin(log);
      pin(state());
    });
  }
  it('decimalMinLength: integer gets padded on blur', () => {
    mount({ decimalMinLength: 2 });
    focus();
    typeAll('7');
    log.length = 0;
    blur();
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=7.00 formatted=7.00 dom=7.00",
        "onValueChange value=7.00 formatted=7.00 dom=7.00",
        "onBlur dom=7.00",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"7.00 caret=4,4"`);
  });
  it('allowNegative + decimalMinLength: "-0" blur', () => {
    mount({ allowNegative: true, decimalMinLength: 2 });
    focus();
    typeAll('-0');
    log.length = 0;
    blur();
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=0.00 formatted=0.00 dom=0.00",
        "onValueChange value=0.00 formatted=0.00 dom=0.00",
        "onBlur dom=0.00",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"0.00 caret=4,4"`);
  });
  it('allowNegative: "-5" blur is untouched', () => {
    mount({ allowNegative: true });
    focus();
    typeAll('-5');
    log.length = 0;
    blur();
    expect(log).toEqual(['onBlur dom=-5']);
  });
  it('Change mode without decimalMinLength/allowNegative: trailing "." stays', () => {
    mount({ formatOn: FormatOn.Change });
    focus();
    typeAll('12.');
    log.length = 0;
    blur();
    expect(log).toEqual(['onBlur dom=12.']);
    expect(el.value).toBe('12.');
  });
  it('no-op blur on an empty field writes nothing', () => {
    mount({ decimalMinLength: 2, allowNegative: true });
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    focus();
    blur();
    expect(spy).not.toHaveBeenCalled();
    expect(log).toEqual(['onFocus dom=', 'onBlur dom=']);
  });
  it('no-op blur on an already formatted Change-mode value writes nothing', () => {
    mount({ formatOn: FormatOn.Change, allowNegative: true, defaultValue: '1234.5' });
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    focus();
    blur();
    expect(spy).not.toHaveBeenCalled();
    expect(log).toEqual(['onFocus dom=1,234.5', 'onBlur dom=1,234.5']);
  });
  it('blur refreshes formattedValue even when nothing is rewritten', () => {
    const seen: string[] = [];
    mount({
      formatOn: FormatOn.Change,
      allowNegative: true,
      defaultValue: '12',
      onChange: (e: NumoraInputChangeEvent) => seen.push(e.target.formattedValue),
    });
    focus();
    typeChar('3');
    blur();
    expect(seen).toEqual(['123']);
  });
});

describe('undo / redo input events', () => {
  for (const inputType of ['historyUndo', 'historyRedo']) {
    for (const formatOn of [FormatOn.Blur, FormatOn.Change]) {
      it(`${inputType} ${formatOn}: broadcasts the restored string, no rewrite`, () => {
        mount({ formatOn, defaultValue: '5' });
        focus();
        log.length = 0;
        const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
        nativeInput('1234', 4, 4, inputType);
        expect(spy).not.toHaveBeenCalled();
        pin(log);
        pin(state());
      });
    }
  }
  it('de-DE historyUndo: raw is canonical, formattedValue is the restored display text', () => {
    mount({ locale: 'de-DE' });
    focus();
    log.length = 0;
    nativeInput('1.234,5', 7, 7, 'historyUndo');
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=1234.5 formatted=1.234,5 dom=1.234,5",
        "onValueChange value=1234.5 formatted=1.234,5 dom=1.234,5",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1.234,5 caret=7,7"`);
  });
});

describe('input fallback', () => {
  it('focused Blur mode: ungrouped value is broadcast, no rewrite', () => {
    mount({ formatOn: 'blur' });
    focus();
    log.length = 0;
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    nativeInput('1234.5', 6);
    expect(spy).not.toHaveBeenCalled();
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=1234.5 formatted=1234.5 dom=1234.5",
        "onValueChange value=1234.5 formatted=1234.5 dom=1234.5",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1234.5 caret=6,6"`);
  });
  it('focused Change mode: groups and maps the caret', () => {
    mount({ formatOn: FormatOn.Change });
    focus();
    log.length = 0;
    nativeInput('1234', 4);
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=1234 formatted=1,234 dom=1,234",
        "onValueChange value=1234 formatted=1,234 dom=1,234",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1,234 caret=5,5"`);
  });
  it('focused: non-numeric junk is stripped', () => {
    mount();
    focus();
    log.length = 0;
    nativeInput('12ab3', 5);
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=123 formatted=123 dom=123",
        "onValueChange value=123 formatted=123 dom=123",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"123 caret=3,3"`);
  });
  it('unfocused (autofill) Blur mode: lands grouped, onChange fires, caret at end', () => {
    mount();
    nativeInput('1234567.5', 0);
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=1234567.5 formatted=1,234,567.5 dom=1,234,567.5",
        "onValueChange value=1234567.5 formatted=1,234,567.5 dom=1,234,567.5",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1,234,567.5 caret=11,11"`);
  });
  it('unfocused de-DE autofill of an en-US string is read as foreign', () => {
    mount({ locale: 'de-DE' });
    nativeInput('1,234.56', 8);
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=1234.56 formatted=1.234,56 dom=1.234,56",
        "onValueChange value=1234.56 formatted=1.234,56 dom=1.234,56",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"1.234,56 caret=8,8"`);
  });
  it('unfocused with decimalMinLength: padded, trailing separator stripped (resting rules)', () => {
    mount({ decimalMinLength: 2 });
    nativeInput('12.', 3);
    expect(log).toMatchInlineSnapshot(`
      [
        "onChange value=12.00 formatted=12.00 dom=12.00",
        "onValueChange value=12.00 formatted=12.00 dom=12.00",
      ]
    `);
    expect(state()).toMatchInlineSnapshot(`"12.00 caret=5,5"`);
  });
  describe('allowScientificNotation:false', () => {
    it('focused: restores the previous value (formattedValue), no callbacks', () => {
      mount({ allowScientificNotation: false, defaultValue: '5' });
      focus();
      typeAll('7');
      log.length = 0;
      nativeInput('1.5e-7', 6);
      expect(log).toEqual([]);
      expect(state()).toMatchInlineSnapshot(`"57 caret=2,2"`);
    });
    it('unfocused: restores the previous value, no callbacks', () => {
      mount({ allowScientificNotation: false, defaultValue: '1234' });
      expect(el.value).toBe('1,234');
      nativeInput('1.5e-7', 6);
      expect(log).toEqual([]);
      expect(state()).toMatchInlineSnapshot(`"1,234 caret=5,5"`);
    });
    it('restores the value remembered after a blur regroup', () => {
      mount({ allowScientificNotation: false });
      focus();
      typeAll('1234');
      blur();
      log.length = 0;
      nativeInput('2e5', 3);
      expect(log).toEqual([]);
      expect(state()).toMatchInlineSnapshot(`"1,234 caret=5,5"`);
    });
  });
});

describe('controlled value', () => {
  function Echo(props: Record<string, unknown>) {
    const [v, setV] = useState(String(props.initial ?? ''));
    const cb = callbacks();
    return (
      <NumoraInput
        data-testid="i"
        {...cb}
        {...props}
        value={v}
        onChange={(e: NumoraInputChangeEvent) => {
          cb.onChange(e);
          setV(e.target.value);
        }}
      />
    );
  }
  function mountEcho(props: Record<string, unknown> = {}) {
    const utils = render(<Echo {...props} />);
    el = utils.container.querySelector('input') as HTMLInputElement;
    return utils;
  }

  it('parent echo while focused (Blur): no rewrite beyond the keystroke writes, no extra onChange', () => {
    mountEcho({ formatOn: 'blur' });
    focus();
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    typeAll('1234.5');
    expect(spy).toHaveBeenCalledTimes(6);
    expect(log.filter((l) => l.startsWith('onChange')).length).toBe(6);
    pin(log);
    pin(state());
  });
  it('parent echo while focused (Change): grouped display is kept, one write per keystroke', () => {
    mountEcho({ formatOn: FormatOn.Change });
    focus();
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    typeAll('12345');
    expect(spy).toHaveBeenCalledTimes(5);
    pin(log);
    pin(state());
  });
  it('parent echo with decimalMinLength: mid-entry "1." is not stripped or padded', () => {
    mountEcho({ decimalMinLength: 2 });
    focus();
    const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
    typeAll('1.');
    expect(spy).toHaveBeenCalledTimes(2);
    pin(log);
    pin(state());
  });
  it('parent echo then blur: regroup/pad is emitted and echoed without a further rewrite', () => {
    mountEcho({ decimalMinLength: 2 });
    focus();
    typeAll('1234.5');
    log.length = 0;
    blur();
    pin(log);
    pin(state());
  });

  describe('external parent change', () => {
    const el2 = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;
    const ui = (value: string, extra: Record<string, unknown> = {}) => (
      <NumoraInput
        data-testid="i"
        {...callbacks()}
        onChange={callbacks().onChange}
        value={value}
        formatOn="blur"
        {...extra}
      />
    );
    it('while focused (Blur): formatted for editing (no grouping), no onChange', () => {
      const { rerender, container } = render(ui('1'));
      el = el2(container);
      focus();
      log.length = 0;
      rerender(ui('1234567.5'));
      expect(el.value).toBe('1234567.5');
      expect(log).toEqual([]);
    });
    it('while unfocused (Blur): formatted for resting display (grouped), no onChange', () => {
      const { rerender, container } = render(ui('1'));
      el = el2(container);
      rerender(ui('1234567.5'));
      expect(el.value).toBe('1,234,567.5');
      expect(log).toEqual([]);
    });
    it('de-DE focused vs unfocused', () => {
      const { rerender, container } = render(ui('1', { locale: 'de-DE' }));
      el = el2(container);
      rerender(ui('1234567.5', { locale: 'de-DE' }));
      expect(el.value).toBe('1.234.567,5');
      focus();
      rerender(ui('7654321.5', { locale: 'de-DE' }));
      expect(el.value).toBe('7654321,5');
      pin(log);
      pin(state());
    });
    it('Change mode focused: grouped', () => {
      const { rerender, container } = render(ui('1', { formatOn: FormatOn.Change }));
      el = el2(container);
      focus();
      rerender(ui('1234567.5', { formatOn: FormatOn.Change }));
      expect(el.value).toBe('1,234,567.5');
    });
    it('same number, extra trailing zero from the parent: IS rewritten (raw strings differ)', () => {
      const { rerender, container } = render(ui('1234.5', { formatOn: FormatOn.Change }));
      el = el2(container);
      const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
      rerender(ui('1234.50', { formatOn: FormatOn.Change }));
      expect(spy).toHaveBeenCalledTimes(1);
      pin(state());
      expect(log).toEqual([]);
    });
    it('identical value re-render: no rewrite', () => {
      const { rerender, container } = render(ui('1234.5', { formatOn: FormatOn.Change }));
      el = el2(container);
      const spy = vi.spyOn(HTMLInputElement.prototype, 'setRangeText');
      rerender(ui('1234.5', { formatOn: FormatOn.Change }));
      expect(spy).not.toHaveBeenCalled();
      expect(el.value).toBe('1,234.5');
    });
    it('clearing the value externally empties the field', () => {
      const { rerender, container } = render(ui('1234.5'));
      el = el2(container);
      rerender(ui(''));
      expect(el.value).toBe('');
      expect(log).toEqual([]);
    });
  });
});

describe('StrictMode', () => {
  it('typing, paste, focus and blur each fire exactly once', () => {
    mount({ formatOn: 'blur' }, true);
    focus();
    typeAll('12', true);
    paste('34');
    blur();
    pin(log);
    pin(state());
  });
  it('mouse focus defers the strip to click once', () => {
    mount({ formatOn: 'blur', defaultValue: '1234567' }, true);
    mouseDown();
    focus();
    expect(el.value).toBe('1,234,567');
    click();
    expect(el.value).toBe('1234567');
    expect(log).toEqual(['onFocus dom=1,234,567']);
  });
  it('undo/redo and autofill fallbacks fire once', () => {
    mount({ formatOn: 'blur' }, true);
    focus();
    nativeInput('1234', 4, 4, 'historyUndo');
    nativeInput('5678', 4);
    pin(log);
  });
});
