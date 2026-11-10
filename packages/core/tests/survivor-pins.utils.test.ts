import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NumoraOptions } from '@/types';
import { FormatOn, GroupingStyle, InputType } from '@/types';
import { computeCaretAfterRewrite } from '@/utils/caret';
import {
  applyBlur,
  applyInputFallback,
  attachFocusStrip,
  type ResolvedNumoraOptions,
} from '@/utils/dom-events';
import { handleOnBeforeInputNumoraInput, handleOnPasteNumoraInput } from '@/utils/event-handlers';
import { formatValueForDisplay, sanitizeAndTrim } from '@/utils/format-utils';
import { applyLocale, getSeparatorsFromLocale } from '@/utils/locale';
import {
  failedMantissaResumeIndex,
  matchMantissaAt,
  trimTrailingZeroRun,
} from '@/utils/mantissa-scan';

/** Behaviour in src/utils that mutation testing showed no other test pins. */

const en = (over: Partial<ResolvedNumoraOptions> = {}): ResolvedNumoraOptions => ({
  decimalMaxLength: 18,
  decimalSeparator: '.',
  thousandSeparator: ',',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Blur,
  ...over,
});
const de = (over: Partial<ResolvedNumoraOptions> = {}) =>
  en({ thousandSeparator: '.', decimalSeparator: ',', ...over });

function mk(value: string, start = value.length, end = start): HTMLInputElement {
  const el = document.createElement('input');
  el.value = value;
  document.body.appendChild(el);
  el.focus();
  el.setSelectionRange(start, end);
  return el;
}
function bi(el: HTMLInputElement, inputType: string, data: string | null = null): InputEvent {
  const e = new InputEvent('beforeinput', { inputType, data, cancelable: true });
  Object.defineProperty(e, 'target', { value: el });
  return e;
}
const before = (
  el: HTMLInputElement,
  inputType: string,
  data: string | null,
  max: number,
  opts: NumoraOptions
) => handleOnBeforeInputNumoraInput(bi(el, inputType, data), max, opts);
const type = (el: HTMLInputElement, data: string, max: number, opts: NumoraOptions) =>
  before(el, InputType.InsertText, data, max, opts);
function paste(el: HTMLInputElement, text: string | null, opts: NumoraOptions) {
  const e = {
    target: el,
    preventDefault() {},
    clipboardData:
      text === null ? undefined : { getData: (k: string) => (k === 'text/plain' ? text : '') },
  } as unknown as ClipboardEvent;
  return handleOnPasteNumoraInput(e, 18, opts);
}

describe('caret.ts', () => {
  it('L71: caret at the end of the value goes to the end of the formatted text', () => {
    expect(
      computeCaretAfterRewrite(
        '1234',
        4,
        '1,234.00',
        18,
        en({ formatOn: FormatOn.Change }),
        true
      )
    ).toBe(8);
  });
  it('L77: a value read differently as display and as foreign text sends the caret to the end', () => {
    // de-DE '1.5': display = grouping (15), foreign = decimal (1,5)
    expect(
      computeCaretAfterRewrite('1.5', 1, '1,5', 18, de({ formatOn: FormatOn.Change }), true)
    ).toBe(3);
  });
});

describe('dom-events.ts applyInputFallback', () => {
  it('L120: focused Change mode groups, focused Blur mode does not', () => {
    const c = mk('1234.5', 3);
    expect(applyInputFallback(c, 'x', true, '', en({ formatOn: FormatOn.Change }))).toEqual({
      value: '1234.5',
      formattedValue: '1,234.5',
    });
    expect(c.value).toBe('1,234.5');
    const b = mk('1234.5', 3);
    expect(applyInputFallback(b, 'x', true, '', en())).toEqual({
      value: '1234.5',
      formattedValue: '1234.5',
    });
    expect(b.value).toBe('1234.5');
  });
  it('L120: unfocused text lands with the resting format even in Blur mode', () => {
    const el = mk('1234.5');
    expect(applyInputFallback(el, 'x', false, '', en())?.formattedValue).toBe('1,234.5');
    expect(el.value).toBe('1,234.5');
  });
  it('L122: a focused Blur-mode value is read as foreign-format text', () => {
    // Change mode reads a focused field's text as its own grouping (review-fixes.fallback).
    const el = mk('1.234,5');
    expect(applyInputFallback(el, 'x', true, '', en())).toEqual({
      value: '1234.5',
      formattedValue: '1234.5',
    });
  });
  it('L124: an already formatted value is reported without a write', () => {
    const el = mk('1,234', 1);
    const spy = vi.spyOn(el, 'setRangeText');
    expect(applyInputFallback(el, 'x', true, '', en({ formatOn: FormatOn.Change }))).toEqual({
      value: '1234',
      formattedValue: '1,234',
    });
    expect(spy).not.toHaveBeenCalled();
  });
  it('L126: the caret is the larger of selectionStart and selectionEnd', () => {
    const el = mk('1234.5', 1, 3);
    applyInputFallback(el, 'x', true, '', en({ formatOn: FormatOn.Change }));
    expect([el.selectionStart, el.selectionEnd]).toEqual([4, 4]); // 1,23|4.5
  });
});

describe('dom-events.ts applyBlur', () => {
  it('L160: a display that did not change is not rewritten', () => {
    const el = mk('1,234');
    const spy = vi.spyOn(el, 'setRangeText');
    expect(applyBlur(el, en())).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });
  it('early return: Change mode without decimalMinLength/allowNegative leaves the value alone', () => {
    const el = mk('1234');
    expect(applyBlur(el, en({ formatOn: FormatOn.Change }))).toBeUndefined();
    expect(el.value).toBe('1234');
  });
});

describe('dom-events.ts attachFocusStrip', () => {
  const setup = (over: Partial<ResolvedNumoraOptions> = {}, value = '1,234') => {
    const el = mk(value, 1);
    const onStrip = vi.fn();
    attachFocusStrip(el, () => en(over), onStrip);
    return { el, onStrip };
  };
  const mouse = (el: HTMLElement, button: number) =>
    el.dispatchEvent(new MouseEvent('mousedown', { button }));
  const ev = (el: HTMLElement, t: string) => el.dispatchEvent(new Event(t));

  it('L185: no strip with GroupingStyle.None', () => {
    for (const over of [{ groupingStyle: GroupingStyle.None }]) {
      const { el, onStrip } = setup(over);
      ev(el, 'focus');
      expect(el.value).toBe('1,234');
      expect(onStrip).not.toHaveBeenCalled();
    }
  });
  it('a keyboard focus (no mousedown) strips right away', () => {
    const { el, onStrip } = setup();
    ev(el, 'focus');
    expect(el.value).toBe('1234');
    expect(onStrip).toHaveBeenCalledTimes(1);
  });
  it('L208: the pending mouse flag clears once the click has stripped', () => {
    const { el, onStrip } = setup();
    mouse(el, 0);
    ev(el, 'click');
    expect(el.value).toBe('1234');
    el.value = '1,234';
    ev(el, 'focus');
    expect(el.value).toBe('1234');
    expect(onStrip).toHaveBeenCalledTimes(2);
  });
  it('L221: blur clears a pending mouse strip', () => {
    const { el } = setup();
    mouse(el, 0);
    ev(el, 'blur');
    ev(el, 'focus');
    expect(el.value).toBe('1234');
  });
  it('a primary-button mousedown defers the strip to click; other buttons do not', () => {
    const a = setup();
    mouse(a.el, 0);
    ev(a.el, 'focus');
    expect(a.el.value).toBe('1,234');
    ev(a.el, 'click');
    expect(a.el.value).toBe('1234');
    const b = setup();
    mouse(b.el, 1);
    ev(b.el, 'focus');
    expect(b.el.value).toBe('1234');
  });
  it('a click without a pending mousedown does not strip', () => {
    const { el } = setup();
    ev(el, 'click');
    expect(el.value).toBe('1,234');
  });
});

describe('event-handlers.ts beforeinput', () => {
  const e18 = en() as NumoraOptions;
  it('L100: insertCompositionText "." is skipped, not treated as a decimal key', () => {
    expect(before(mk('1.5'), InputType.InsertCompositionText, '.', 18, e18)).toEqual({
      type: 'skip',
    });
  });
  it('L117: decimalMaxLength 0 rejects the decimal key even over a selection', () => {
    expect(type(mk('15', 1, 2), '.', 0, e18)).toEqual({ type: 'reject' });
  });
  it('L121: a decimal separator inside the replaced selection does not count', () => {
    expect(type(mk('1.5', 1, 3), '.', 18, e18)).toMatchObject({ type: 'handled', formatted: '1.' });
  });
  it('L130: the digit cap applies to a single typed digit only', () => {
    expect(type(mk('1.5', 2), '12', 1, e18)).toMatchObject({ type: 'handled', formatted: '1.1' });
    expect(type(mk('1.5', 2), '1a', 1, e18)).toMatchObject({ type: 'handled', formatted: '1.1' });
  });
  it('L130: the digit cap does not apply to non-digits or to deletions', () => {
    expect(type(mk('1.5', 2, 3), 'x', 0, e18)).toMatchObject({ type: 'handled', formatted: '1' });
    expect(before(mk('1.5', 3), InputType.DeleteContentBackward, null, 1, e18)).toMatchObject({
      type: 'handled',
      formatted: '1.',
    });
  });
  it('L223: the scientific-notation rejection is for insertText only', () => {
    const o = { ...e18, allowScientificNotation: false };
    expect(before(mk('1e55', 4), InputType.DeleteContentBackward, null, 18, o).type).toBe(
      'handled'
    );
    expect(type(mk('1', 1), 'e5', 18, o)).toEqual({ type: 'reject' });
  });
  it('L229-237: maxLength rejects an insertText whose sanitized length is over, not deletions', () => {
    const o = { ...e18, maxLength: 3 };
    expect(type(mk('123'), '4', 18, o)).toEqual({ type: 'reject' });
    expect(type(mk('123'), '4', 18, { ...e18, maxLength: 4 }).type).toBe('handled');
    expect(before(mk('12345'), InputType.DeleteContentBackward, null, 18, o).type).toBe('handled');
  });
  it('L233: the maxLength check sanitizes with the field options (decimal separator counts)', () => {
    const o = { ...de(), maxLength: 3 } as NumoraOptions;
    expect(type(mk('1,2'), '3', 18, o)).toEqual({ type: 'reject' });
    expect(type(mk('1,2'), '3', 18, { ...o, maxLength: 4 })).toMatchObject({
      type: 'handled',
      formatted: '1,23',
    });
  });
  it('L242: separators are stripped before reformatting in Change mode only', () => {
    expect(type(mk('1,234'), '5', 18, en({ formatOn: FormatOn.Change }))).toMatchObject({
      formatted: '12,345',
      cursorPos: 6,
    });
    expect(type(mk('1,234'), '5', 18, e18)).toMatchObject({ formatted: '12345', cursorPos: 5 });
  });
  it('L266: caret stays at the edit when the intended value is already the final display', () => {
    const q = {
      ...en({ thousandSeparator: "'", formatOn: FormatOn.Change }),
      allowLeadingZeros: true,
    } as NumoraOptions;
    expect(
      before(mk("07'2997111", 3, 7), InputType.DeleteContentBackward, null, 18, q)
    ).toMatchObject({ formatted: "07'111", cursorPos: 3 });
  });
});

describe('event-handlers.ts paste', () => {
  it('L318: reads text/plain; a missing clipboardData pastes nothing', () => {
    expect(paste(mk('1,234', 2), '5', en())).toMatchObject({
      type: 'handled',
      formatted: '15234',
      cursorPos: 2,
    });
    expect(paste(mk('1', 1), null, en())).toMatchObject({
      type: 'handled',
      formatted: '1',
      cursorPos: 1,
    });
  });
  it('L336: pasting always strips separators from the combined value', () => {
    expect(paste(mk('1,234', 5), '5', en())).toMatchObject({
      formatted: '12345',
      raw: '12345',
      cursorPos: 5,
    });
    expect(paste(mk('1,', 2), 'e3', en())).toMatchObject({ formatted: '1000', raw: '1000' });
  });
  it('isAllowed rejects a paste', () => {
    expect(paste(mk(''), '5', { ...en(), isAllowed: () => false })).toEqual({ type: 'reject' });
  });
});

describe('format-utils.ts', () => {
  const blur = en() as NumoraOptions;
  const change = en({ formatOn: FormatOn.Change }) as NumoraOptions;
  it('L46: separator removal defaults to Change mode and is overridable', () => {
    // '1,e3': with the separator removed it is 1e3, kept it is 13
    expect(sanitizeAndTrim('1,e3', 18, change)).toBe('1000');
    expect(sanitizeAndTrim('1,e3', 18, blur)).toBe('13');
    expect(sanitizeAndTrim('1,e3', 18, blur, true)).toBe('1000');
    expect(sanitizeAndTrim('1,e3', 18, change, false)).toBe('13');
  });
  it('L53: foreign and canonical sources always see the full options', () => {
    // de-DE '1.234' is grouping when the thousand separator is known to the detector
    expect(sanitizeAndTrim('1.234', 18, de(), false, 'foreign')).toBe('1234');
    expect(sanitizeAndTrim('1.5', 18, de(), false, 'canonical')).toBe('1,5');
    expect(sanitizeAndTrim('1.5', 18, de(), false, 'display')).toBe('15');
  });
  it('L139: formatValueForDisplay works with no options and strips by thousandSeparator', () => {
    expect(formatValueForDisplay('1.5', 18)).toEqual({ formatted: '1.5', raw: '1.5' });
    expect(formatValueForDisplay('1,e3', 18, { thousandSeparator: ',' })).toEqual({
      formatted: '1000',
      raw: '1000',
    });
  });
  it('L149: decimalMinLength pads, and is optional', () => {
    expect(formatValueForDisplay('1', 18, { decimalMinLength: 2 })).toEqual({
      formatted: '1.00',
      raw: '1.00',
    });
    expect(formatValueForDisplay('1.5', 18, {})).toEqual({ formatted: '1.5', raw: '1.5' });
  });
});

describe('locale.ts', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  it('L109-116: an invalid locale warns once outside production and is silent in production', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getSeparatorsFromLocale('bad!')).toMatchObject({
      thousandSeparator: ',',
      decimalSeparator: '.',
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('bad!');
    vi.stubEnv('NODE_ENV', 'production');
    getSeparatorsFromLocale('bad!');
    expect(warn).toHaveBeenCalledTimes(1);
  });
  it('L166: applyLocale(true) uses the default locale', () => {
    expect(applyLocale(true, {})).toEqual(getSeparatorsFromLocale());
    expect(applyLocale(true, { thousandSeparator: 'x' })).toMatchObject({ thousandSeparator: 'x' });
  });
  it('non-Latin digit sets are classified by their own zero', () => {
    expect(getSeparatorsFromLocale('ar-EG')).toMatchObject({
      thousandSeparator: '٬',
      decimalSeparator: '٫',
    });
    expect(getSeparatorsFromLocale('bn-IN')).toMatchObject({ groupingStyle: GroupingStyle.Lakh });
  });
});

describe('mantissa-scan.ts', () => {
  it('L51: a non-digit, non-separator start has no mantissa', () => {
    expect(matchMantissaAt('x5', 0, '.')).toBeNull();
  });
  it('L53: a separator not followed by a digit has no mantissa', () => {
    expect(matchMantissaAt('.x', 0, '.')).toBeNull();
  });
  it('L80: resume right after the first separator only when a second separator follows', () => {
    expect(failedMantissaResumeIndex('.5b', { end: 2, sepEnd: 1 }, '.')).toBe(2);
    expect(failedMantissaResumeIndex('.5.b', { end: 2, sepEnd: 1 }, '.')).toBe(1);
  });
  it('L91-92: trimTrailingZeroRun drops the separator only when the zero run follows it', () => {
    expect(trimTrailingZeroRun('1.', '.')).toBe('1.');
    expect(trimTrailingZeroRun('1.000', '.')).toBe('1');
    expect(trimTrailingZeroRun('1.500', '.')).toBe('1.5');
    expect(trimTrailingZeroRun('100', '.')).toBe('1');
    expect(trimTrailingZeroRun('123', '.')).toBe('123');
  });
});
