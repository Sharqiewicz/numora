import { DEFAULT_GROUPING_STYLE } from '../config';
import { GroupingStyle } from '../types';

// Probe value: wide enough that every locale groups it, and it carries a fraction, so a
// single formatted string exposes the group separator, the decimal separator, and the
// grouping pattern at once.
const GROUPING_PROBE = 1234567.89;

// Indic (lakh/crore) grouping is 3-2-2: the group immediately left of the last one is two
// digits wide. Western 3-3-3 grouping puts 3 there. That single width is the whole test.
const LAKH_PENULTIMATE_GROUP_WIDTH = 2;

interface ProbeShape {
  /** Width of each run of digits, left to right, fraction run included. */
  digitRuns: number[];
  /** Each run of non-digit characters between the digit runs, left to right. */
  separators: string[];
}

/**
 * Splits a formatted probe into digit runs and the separators between them.
 *
 * Deliberately does NOT use `Intl.NumberFormat.prototype.formatToParts`, which would make
 * this trivial. `formatToParts` is not implemented in Hermes on iOS (hermes#1188, and it
 * is listed unsupported in Hermes' own IntlAPIs.md), and Android has reported the `group`
 * part missing in cases (hermes#788). The old implementation called it inside the
 * try/catch below, so on iOS the `TypeError` was swallowed and every locale silently
 * resolved to US separators - no throw, no warning, wrong output. `format()` IS
 * implemented there, so deriving from the formatted string instead makes this function
 * correct on iOS, Android, old browsers and any other constrained engine at once.
 *
 * `zeroCode` is the code point of the locale's own zero digit, so this classifies digits
 * for non-ASCII numbering systems too (`ar-EG` -> `١٬٢٣٤٬٥٦٧٫٨٩`, `bn-IN` -> `১২,৩৪,৫৬৭.৮৯`).
 * Every Unicode decimal-digit set is contiguous from its zero by definition, so a simple
 * range test is enough - no `\p{Nd}` escape, which Hermes also may not support.
 */
function parseProbe(formatted: string, zeroCode: number): ProbeShape {
  const digitRuns: number[] = [];
  const separators: string[] = [];
  let digitRun = 0;
  let separatorRun = '';

  // Array.from iterates by code point, so astral-plane digit sets survive intact.
  for (const char of Array.from(formatted)) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= zeroCode && code <= zeroCode + 9) {
      if (separatorRun) {
        separators.push(separatorRun);
        separatorRun = '';
      }
      digitRun++;
    } else {
      if (digitRun) {
        digitRuns.push(digitRun);
        digitRun = 0;
      }
      separatorRun += char;
    }
  }
  if (digitRun) digitRuns.push(digitRun);
  if (separatorRun) separators.push(separatorRun);

  return { digitRuns, separators };
}

/**
 * Infers the grouping style from the widths of the integer digit runs.
 *
 * Only `Thousand` and `Lakh` are inferrable. `GroupingStyle.Wan` is NOT derivable from
 * `Intl`: `zh-CN` and `ja-JP` both report Western 3-3-3 grouping, not 4-4-4 (verified),
 * so Wan stays opt-in via an explicit `groupingStyle`. Do not special-case CJK tags here.
 *
 * Reads run *lengths*, not digit values, so non-ASCII numbering systems are unaffected.
 */
function deriveGroupingStyle({ digitRuns, separators }: ProbeShape): GroupingStyle {
  // The final run is the fraction ("89"), which says nothing about integer grouping. It is
  // only there if the probe actually produced a decimal separator.
  const integerWidths = separators.length > 0 ? digitRuns.slice(0, -1) : digitRuns;
  const penultimateWidth = integerWidths[integerWidths.length - 2];
  if (penultimateWidth === undefined) return DEFAULT_GROUPING_STYLE;
  return penultimateWidth === LAKH_PENULTIMATE_GROUP_WIDTH
    ? GroupingStyle.Lakh
    : GroupingStyle.Thousand;
}

// Bidi control marks that RTL locales embed in formatted numbers. They are not separators.
const BIDI_MARKS = /[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g;

/**
 * Returns the code point of the locale's zero if its digits 0..9 are contiguous, otherwise
 * undefined (e.g. `hanidec`: 〇一二三四五六七八九).
 */
function contiguousZero(formatter: Intl.NumberFormat): number | undefined {
  let zero: number | undefined;
  for (let i = 0; i <= 9; i++) {
    const glyph = Array.from(formatter.format(i).replace(BIDI_MARKS, ''));
    if (glyph.length !== 1) return undefined;
    const code = glyph[0].codePointAt(0) ?? 0;
    if (zero === undefined) zero = code;
    else if (code !== zero + i) return undefined;
  }
  return zero;
}

/** Re-targets a tag to Latin digits. Separators do not depend on the digit set. */
function withLatinDigits(locale: string | undefined): string {
  const tag = locale ?? new Intl.NumberFormat().resolvedOptions().locale;
  if (/-u-/i.test(tag)) {
    // Replace an existing nu keyword, otherwise append one to the extension.
    return /-nu-[a-z0-9]+/i.test(tag) ? tag.replace(/-nu-[a-z0-9]+/i, '-nu-latn') : `${tag}-nu-latn`;
  }
  return `${tag}-u-nu-latn`;
}

/** Development-only: an invalid tag otherwise falls back to en-US separators silently. */
function warnInvalidLocale(locale: string | undefined): void {
  let isProduction = false;
  try {
    // Bundlers replace this; unbundled ESM has no `process`, so guard the lookup.
    isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  } catch {
    // Some environments expose a `process` without `env`.
  }
  if (isProduction) return;
  console.warn(
    `[numora] Invalid locale "${locale}": Intl.NumberFormat rejected it, so the field uses "," grouping and "." decimal. Pass a BCP 47 tag such as "de-DE".`
  );
}

export function getSeparatorsFromLocale(locale?: string): {
  thousandSeparator: string;
  decimalSeparator: string;
  groupingStyle: GroupingStyle;
} {
  // Java, Python and Android write tags with `_` (`de_DE`), which Intl rejects with a
  // RangeError. Read them as the BCP 47 tag they name instead of falling back to en-US.
  if (locale) locale = locale.replace(/_/g, '-');
  try {
    let formatter = new Intl.NumberFormat(locale);
    // The locale's own zero digit anchors digit classification for the probe.
    let zeroCode = contiguousZero(formatter);
    if (zeroCode === undefined) {
      formatter = new Intl.NumberFormat(withLatinDigits(locale));
      zeroCode = contiguousZero(formatter) ?? 0x30;
    }
    const shape = parseProbe(formatter.format(GROUPING_PROBE).replace(BIDI_MARKS, ''), zeroCode);
    const { separators } = shape;
    return {
      // Last separator is the decimal one (the probe's fraction is right of it); anything
      // before it is a group separator, all identical.
      decimalSeparator: separators[separators.length - 1] ?? '.',
      thousandSeparator: separators.length >= 2 ? separators[0] : ',',
      groupingStyle: deriveGroupingStyle(shape),
    };
  } catch {
    warnInvalidLocale(locale);
    return {
      thousandSeparator: ',',
      decimalSeparator: '.',
      groupingStyle: DEFAULT_GROUPING_STYLE,
    };
  }
}

export function applyLocale(
  locale: string | true | undefined,
  options: {
    thousandSeparator?: string;
    decimalSeparator?: string;
    groupingStyle?: GroupingStyle;
  }
): { thousandSeparator?: string; decimalSeparator?: string; groupingStyle?: GroupingStyle } {
  if (!locale) return options;
  const tag = locale === true ? undefined : locale;
  const seps = getSeparatorsFromLocale(tag);
  return {
    thousandSeparator: options.thousandSeparator ?? seps.thousandSeparator,
    decimalSeparator: options.decimalSeparator ?? seps.decimalSeparator,
    groupingStyle: options.groupingStyle ?? seps.groupingStyle,
  };
}
