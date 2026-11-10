/**
 * Sweeps every `Intl.NumberFormat` locale tag and checks, per tag, that separator derivation
 * matches Intl, the constructor never throws, and the locale's own formatted positive and
 * negative numbers survive the core paste handler with the right value and sign.
 *
 * The oracle uses `formatToParts` (fine under Node); the library itself must not.
 */
import { describe, expect, it } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { getSeparatorsFromLocale } from '../src/utils/locale';
import { handleOnPasteNumoraInput } from '../src/utils/event-handlers';
import { normalizeDigits } from '../src/features/fullwidth-digits';
import { sanitizeNumoraInput } from '../src/features/sanitization';
import { FormatOn, GroupingStyle } from '../src/types';
import type { NumoraOptions } from '../src/types';

const supported = (tag: string): boolean => {
  try {
    return new Intl.NumberFormat(tag).resolvedOptions().locale === tag;
  } catch {
    return false;
  }
};

function collectTags(): string[] {
  const tags = new Set<string>();
  const langs: string[] = [];
  for (let a = 97; a <= 122; a++) {
    for (let b = 97; b <= 122; b++) {
      const l = String.fromCharCode(a, b);
      if (supported(l)) langs.push(l);
    }
  }
  const three =
    'fil ckb kok haw gsw yue nds ast ceb chr cym dsb hsb jbo kab kea khq kln lag lkt mas mer mfe mgh mua nmg nnh nus osa rof rwk saq sbp seh ses shi smn teo twq tzm vai vun wae xog yav yrl zgh asa bas bem bez brx cgg dav dje dua dyo ebu ewo ksb ksf ksh lrc luo luy mgo mzn naq nd nyn pcm qu sah sat sdh sg sn tok ug xnr bgc bho raj mai mni sc scn syr tig vec wo'.split(
      ' '
    );
  for (const l of [...langs, ...three]) if (supported(l)) tags.add(l);

  const regions: string[] = ['001', '150', '419', '029'];
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) regions.push(String.fromCharCode(a, b));
  }
  for (const l of [...tags]) {
    for (const r of regions) if (supported(`${l}-${r}`)) tags.add(`${l}-${r}`);
  }

  const extra = [
    'zh-Hans', 'zh-Hant', 'sr-Latn', 'sr-Cyrl', 'uz-Cyrl', 'pa-Arab', 'ks-Arab', 'ff-Adlm',
    'ar-u-nu-latn', 'ar-EG-u-nu-latn', 'fa-u-nu-latn', 'ur-u-nu-arabext', 'hi-u-nu-deva',
    'bn-u-nu-beng', 'th-u-nu-thai', 'my-u-nu-mymr', 'km-u-nu-khmr', 'lo-u-nu-laoo',
    'en-u-nu-arab', 'en-u-nu-deva', 'en-u-nu-fullwide', 'en-u-nu-tibt', 'en-u-nu-mong',
    'en-u-nu-adlm', 'en-u-nu-mathbold', 'en-u-nu-olck', 'en-u-nu-nkoo', 'en-u-nu-osma',
    'en-u-nu-brah', 'en-u-nu-mtei', 'en-u-nu-sinh', 'en-u-nu-mathdbl', 'en-u-nu-mathsans',
    'en-u-nu-mathsanb', 'en-u-nu-mathmono', 'de-u-nu-arab', 'en-u-nu-hanidec',
    'ja-u-nu-hanidec', 'zh-u-nu-hanidec', 'de-DE-u-nu-hanidec', 'sat-u-nu-olck', 'sat-u-nu-latn',
    'ckb-u-nu-latn', 'sd-u-nu-latn', 'ks-u-nu-latn', 'mni-u-nu-mtei', 'en-IN-u-nu-deva',
    'es-419', 'es-MX', 'es-ES', 'pt-PT', 'pt-BR',
  ];
  for (const t of extra) {
    try {
      new Intl.NumberFormat(t);
      tags.add(t);
    } catch {
      // not supported by this runtime
    }
  }
  return [...tags];
}

const TAGS = collectTags();

// Separators whose group/decimal glyph Intl reports; the oracle reads them from parts.
function oracle(tag: string) {
  const nf = new Intl.NumberFormat(tag);
  const parts = nf.formatToParts(1234567.89);
  const group = parts.find((p) => p.type === 'group')?.value ?? '';
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '';
  const ints = parts.filter((p) => p.type === 'integer').map((p) => Array.from(p.value).length);
  const style = ints.length >= 3 && ints[ints.length - 2] === 2 ? 'lakh' : 'thousand';
  return { group, decimal, style, nf };
}

// `tok` (toki pona) groups 2-2-2, which Numora does not model.
const UNSUPPORTED_GROUPING = /^tok(-|$)/;

/**
 * Normalizes a raw value so the assertion passes whether raw keeps the locale decimal
 * separator (today) or is canonical `.` (after the canonical-raw change).
 */
const canonicalRaw = (raw: string, decimalSeparator: string): string =>
  decimalSeparator === '.' ? raw : raw.split(decimalSeparator).join('.');

function paste(text: string, options: NumoraOptions): string {
  const input = document.createElement('input');
  const event = { target: input, clipboardData: { getData: () => text } } as unknown as ClipboardEvent;
  const result = handleOnPasteNumoraInput(event, 20, options);
  if (result.type !== 'handled') throw new Error('paste rejected');
  return canonicalRaw(result.raw, options.decimalSeparator ?? '.');
}

describe('locale sweep', () => {
  it('covers a meaningful number of tags', () => {
    expect(TAGS.length).toBeGreaterThan(300);
  });

  it('derives separators, constructs, and pastes its own numbers for every tag', () => {
    const failures: string[] = [];
    for (const tag of TAGS) {
      try {
        const { group, decimal, style, nf } = oracle(tag);
        const d = getSeparatorsFromLocale(tag);
        // Separators are exactly one character. Intl may report '' for the group in
        // locales without grouping; derivation then falls back to ','.
        if (d.decimalSeparator !== decimal) failures.push(`${tag}: decimal ${d.decimalSeparator} != ${decimal}`);
        if (group && d.thousandSeparator !== group) failures.push(`${tag}: group ${d.thousandSeparator} != ${group}`);
        if (!UNSUPPORTED_GROUPING.test(tag) && d.groupingStyle !== style) {
          failures.push(`${tag}: style ${d.groupingStyle} != ${style}`);
        }
        if (d.groupingStyle === GroupingStyle.Wan) failures.push(`${tag}: derived Wan`);
        if (Array.from(d.decimalSeparator).length !== 1 || Array.from(d.thousandSeparator).length !== 1) {
          failures.push(`${tag}: separator not one char`);
        }
        if (d.decimalSeparator === d.thousandSeparator) failures.push(`${tag}: separators collide`);

        const host = document.createElement('div');
        try {
          new NumoraInput(host, { locale: tag, formatOn: FormatOn.Change, allowNegative: true });
        } catch (e) {
          failures.push(`${tag}: constructor threw ${(e as Error).message}`);
          continue;
        }

        const options: NumoraOptions = {
          ...d,
          formatOn: FormatOn.Change,
          allowNegative: true,
        };
        const pos = paste(nf.format(1234567.89), options);
        if (pos !== '1234567.89') failures.push(`${tag}: paste positive -> ${pos}`);
        const neg = paste(nf.format(-1234.5), options);
        if (neg !== '-1234.5') failures.push(`${tag}: paste negative ${JSON.stringify(nf.format(-1234.5))} -> ${neg}`);
      } catch (e) {
        failures.push(`${tag}: threw ${(e as Error).message}`);
      }
    }
    if (process.env.SWEEP_DEBUG) console.log('TAGS', TAGS.length, 'FAILS', new Set(failures.map((f) => f.split(':')[0])).size, failures.slice(0, 400).join('\n'));
    expect(failures).toEqual([]);
  });

  it('never derives Wan grouping for zh/ja/ko', () => {
    for (const tag of TAGS.filter((t) => /^(zh|ja|ko)(-|$)/.test(t))) {
      expect(getSeparatorsFromLocale(tag).groupingStyle, tag).not.toBe(GroupingStyle.Wan);
    }
  });

  it('keeps grouping 4-digit numbers where Intl minimumGroupingDigits=2 does not', () => {
    for (const tag of ['es', 'pl', 'it', 'pt-PT']) {
      const d = getSeparatorsFromLocale(tag);
      const input = new NumoraInput(document.createElement('div'), {
        locale: tag,
        formatOn: FormatOn.Change,
        value: '1234',
      });
      expect(input.element.value, tag).toContain(d.thousandSeparator);
      expect(new Intl.NumberFormat(tag).format(1234), tag).not.toContain(d.thousandSeparator);
    }
  });
});

describe('numbering systems', () => {
  const systems = Intl.supportedValuesOf('numberingSystem');
  it('exposes systems to test', () => {
    expect(systems.length).toBeGreaterThan(50);
  });

  it('folds 0123456789 for every decimal numbering system Intl exposes', () => {
    const failures: string[] = [];
    for (const ns of systems) {
      const nf = new Intl.NumberFormat(`en-u-nu-${ns}`, { useGrouping: false });
      const digits = Array.from({ length: 10 }, (_, i) => nf.format(i)).join('');
      if (ns !== 'latn' && !normalizeDigits(digits).includes('0123456789')) {
        if (normalizeDigits(digits) !== '0123456789') failures.push(`${ns}: ${digits}`);
      }
      // Whole-number round trip, to catch surrogate-pair mishandling.
      if (normalizeDigits(nf.format(9081726354)) !== '9081726354') failures.push(`${ns}: number`);
    }
    expect(failures).toEqual([]);
  });
});

describe('targeted regressions', () => {
  it.each(['\u200E', '\u200F', '\u061C', '\u202A', '\u202E', '\u2066', '\u2069', '\u200C', '\u200D', '\u2060'])(
    'keeps the sign when an invisible mark (case %#) precedes the minus',
    (mark) => {
      expect(sanitizeNumoraInput(`${mark}-1,234.5${mark}`, { thousandSeparator: ',', allowNegative: true })).toBe('-1234.5');
    }
  );

  it('pastes sat (Ol Chiki) and astral digit sets', () => {
    const options = { ...getSeparatorsFromLocale('sat'), allowNegative: true };
    expect(paste(new Intl.NumberFormat('sat').format(1234.5), options)).toBe('1234.5');
    const adlm = { ...getSeparatorsFromLocale('ff-Adlm'), allowNegative: true };
    expect(paste(new Intl.NumberFormat('ff-Adlm').format(-1234.5), adlm)).toBe('-1234.5');
  });

  it('derives from Latin digits for non-contiguous hanidec and constructs', () => {
    for (const tag of ['zh-u-nu-hanidec', 'ja-u-nu-hanidec', 'en-u-nu-hanidec', 'de-DE-u-nu-hanidec']) {
      const latn = tag.replace('hanidec', 'latn');
      expect(getSeparatorsFromLocale(tag), tag).toEqual(getSeparatorsFromLocale(latn));
      expect(() => new NumoraInput(document.createElement('div'), { locale: tag }), tag).not.toThrow();
    }
  });

  it('folds hanidec digits on input', () => {
    expect(normalizeDigits('〇一二三四五六七八九')).toBe('0123456789');
    expect(sanitizeNumoraInput('一,二三四.五', { thousandSeparator: ',', decimalSeparator: '.' })).toBe('1234.5');
  });
});
