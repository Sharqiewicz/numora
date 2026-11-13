import { appValue } from '@/utils/app-value';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NumoraOptions } from '@/types';
import { FormatOn, GroupingStyle, InputType } from '@/types';
import {
  applyInputFallback,
  attachFocusStrip,
  type ResolvedNumoraOptions,
} from '@/utils/dom-events';
import { handleOnBeforeInputNumoraInput, handleOnPasteNumoraInput } from '@/utils/event-handlers';
import { sanitizeAndTrim } from '@/utils/format-utils';
import { getSeparatorsFromLocale } from '@/utils/locale';

/** Second round of pins for src/utils: survivors of the r3 mutation run. */

const en = (over: Partial<ResolvedNumoraOptions> = {}): ResolvedNumoraOptions => ({
  decimalMaxLength: 18,
  decimalSeparator: '.',
  thousandSeparator: ',',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Blur,
  ...over,
});

function mk(value: string, start = value.length, end = start): HTMLInputElement {
  const el = document.createElement('input');
  el.value = value;
  document.body.appendChild(el);
  el.focus();
  el.setSelectionRange(start, end);
  return el;
}
function bi(el: HTMLInputElement, inputType: string, data: string | null): InputEvent {
  const e = new InputEvent('beforeinput', { inputType, data, cancelable: true });
  Object.defineProperty(e, 'target', { value: el });
  return e;
}
const type = (
  el: HTMLInputElement,
  data: string | null,
  max: number,
  opts: NumoraOptions,
  inputType: string = InputType.InsertText
) => handleOnBeforeInputNumoraInput(bi(el, inputType, data), max, opts);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('event-handlers.ts', () => {
  it('L130: the preventive decimal cap only applies to a single ASCII digit', () => {
    // "55" is not /^\d$/, so it is trimmed after the fact ("1.5523" -> "1.55") instead of refused.
    const el = mk('1.23', 2);
    expect(type(el, '55', 2, en())).toMatchObject({ type: 'handled', formatted: '1.55' });
    // the single digit at the same spot is refused up front
    expect(type(mk('1.23', 2), '5', 2, en())).toEqual({ type: 'reject' });
  });

  it('L229-240: maxLength is checked on the sanitized intended value, and rejects', () => {
    // Without the up-front check, sanitization would truncate the TAIL ("4123" -> "412") and
    // the keystroke would land. maxLength is refused as a whole.
    const el = mk('123', 0);
    expect(type(el, '4', 18, en({ maxLength: 3 }))).toEqual({ type: 'reject' });
    // a keystroke that fits is still accepted
    expect(type(mk('12', 0), '4', 18, en({ maxLength: 3 }))).toMatchObject({
      type: 'handled',
      formatted: '412',
    });
  });

  it('L353: paste always strips grouping from the existing value, even in Blur mode', () => {
    // a grouping glyph that is also a decimal-key glyph would be read as a decimal if kept
    const el = mk('1，234');
    const e = {
      target: el,
      preventDefault() {},
      clipboardData: { getData: () => '5' },
    } as unknown as ClipboardEvent;
    expect(handleOnPasteNumoraInput(e, 18, en({ thousandSeparator: '，' }))).toMatchObject({
      type: 'handled',
      formatted: '12345',
      raw: '12345',
    });
  });
});

describe('format-utils.ts sanitizeAndTrim', () => {
  it('L46: works without any formatting options', () => {
    expect(sanitizeAndTrim('1,234.567', 2)).toBe('1234.56');
  });
  it('L53: a foreign or canonical source keeps the configured separators for detection', () => {
    // a Swiss-style field read in Blur mode: the field's own grouping mark is still stripped
    const ch = en({ thousandSeparator: "'" });
    expect(sanitizeAndTrim("1'234,5", 8, ch, false, 'foreign')).toBe('1234.5');
    // a canonical value never loses its decimal to the grouping glyph
    const wide = en({ thousandSeparator: '，' });
    expect(sanitizeAndTrim('1.5', 8, wide, false, 'canonical')).toBe('1.5');
  });
});

describe('dom-events.ts', () => {
  it('L123: an already formatted value leaves the selection alone', () => {
    const el = mk('1,234', 1, 3);
    expect(applyInputFallback(el, true, '', en({ formatOn: FormatOn.Change }))).toEqual({
      value: '1234',
      formattedValue: '1,234',
    });
    expect([el.selectionStart, el.selectionEnd]).toEqual([1, 3]);
  });

  it('L125: a lagging selectionStart larger than selectionEnd still wins (max of both)', () => {
    const el = mk('1234.5');
    Object.defineProperty(el, 'selectionStart', { value: 3, configurable: true });
    Object.defineProperty(el, 'selectionEnd', { value: 1, configurable: true });
    const set = vi.spyOn(el, 'setSelectionRange');
    applyInputFallback(el, true, '', en({ formatOn: FormatOn.Change }));
    expect(set).toHaveBeenCalledWith(4, 4); // 1,23|4.5, not 1|,234.5
  });

  it('L220: the detach function removes the focus-strip listeners', () => {
    const el = mk('1,234', 1);
    const onStrip = vi.fn();
    const detach = attachFocusStrip(el, () => en(), onStrip);
    detach();
    el.dispatchEvent(new Event('focus'));
    el.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
    el.dispatchEvent(new Event('click'));
    expect(el.value).toBe('1,234');
    expect(onStrip).not.toHaveBeenCalled();
  });
});

describe('locale.ts', () => {
  /** Replaces Intl.NumberFormat: `fake(tag, n)` answers every `format(n)`. */
  const stubIntl = (fake: (tag: string | undefined, n: number) => string) =>
    vi.spyOn(Intl, 'NumberFormat').mockImplementation(
      ((tag?: string | string[]) =>
        ({
          format: (n: number) => fake(tag as string | undefined, n),
          resolvedOptions: () => ({ locale: 'en-US' }),
        }) as unknown as Intl.NumberFormat) as unknown as typeof Intl.NumberFormat
    );
  const PROBE = 1234567.89;
  const latin = (n: number) => String(n);

  it('L104: a non-contiguous locale without an nu keyword is re-targeted with -u-nu-latn', () => {
    const tags: (string | undefined)[] = [];
    stubIntl((tag, n) => {
      tags.push(tag);
      if (tag === 'de-u-nu-latn') return n === PROBE ? '1.234.567,89' : latin(n);
      return n === PROBE ? 'x' : ('〇一二三四五六七八九'[n] ?? latin(n));
    });
    expect(getSeparatorsFromLocale('de')).toMatchObject({
      thousandSeparator: '.',
      decimalSeparator: ',',
    });
    expect(tags).toContain('de-u-nu-latn');
  });

  it('L138: bidi marks around the probe are not separators', () => {
    stubIntl((_tag, n) => (n === PROBE ? '‎1,234,567.89‏' : latin(n)));
    expect(getSeparatorsFromLocale('xx')).toMatchObject({
      thousandSeparator: ',',
      decimalSeparator: '.',
    });
  });

  it('L53: a multi-character separator is one separator, not extra empty digit runs', () => {
    // Lakh 12,,34,,567.89 with a two-character group separator
    stubIntl((_tag, n) => (n === PROBE ? '12,,34,,567.89' : latin(n)));
    expect(getSeparatorsFromLocale('xx')).toEqual({
      thousandSeparator: ',,',
      decimalSeparator: '.',
      groupingStyle: GroupingStyle.Lakh,
    });
  });

  it('L143-144: a probe without grouping or without a fraction falls back to "," and "."', () => {
    stubIntl((_tag, n) => (n === PROBE ? '1234567' : latin(n)));
    expect(getSeparatorsFromLocale('xx')).toMatchObject({
      thousandSeparator: ',',
      decimalSeparator: '.',
    });
    stubIntl((_tag, n) => (n === PROBE ? '1234567;89' : latin(n)));
    expect(getSeparatorsFromLocale('xx')).toMatchObject({
      thousandSeparator: ',',
      decimalSeparator: ';',
    });
    // exactly two separators: the first is the group one
    stubIntl((_tag, n) => (n === PROBE ? '1 234567,89' : latin(n)));
    expect(getSeparatorsFromLocale('xx')).toMatchObject({
      thousandSeparator: ' ',
      decimalSeparator: ',',
    });
  });

  it('development warnings are on when NODE_ENV cannot be read, off in production', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('process', {
      get env(): never {
        throw new Error('no env');
      },
    });
    appValue(5, 'setValue()');
    expect(warn).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();

    vi.stubEnv('NODE_ENV', 'production');
    appValue(5, 'setValue()');
    expect(warn).toHaveBeenCalledTimes(1);
    vi.stubEnv('NODE_ENV', 'test');
    appValue(5, 'setValue()');
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
