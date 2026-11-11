import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { applyLocale, getSeparatorsFromLocale } from '../src/utils/locale';
import { GroupingStyle } from '../src/types';

describe('✅ getSeparatorsFromLocale', () => {
  describe('✅ separators', () => {
    it('should derive en-US separators', () => {
      const seps = getSeparatorsFromLocale('en-US');
      expect(seps.thousandSeparator).toBe(',');
      expect(seps.decimalSeparator).toBe('.');
    });

    it('should derive de-DE separators', () => {
      const seps = getSeparatorsFromLocale('de-DE');
      expect(seps.thousandSeparator).toBe('.');
      expect(seps.decimalSeparator).toBe(',');
    });
  });

  describe('✅ grouping style', () => {
    it('should derive Lakh for hi-IN', () => {
      expect(getSeparatorsFromLocale('hi-IN').groupingStyle).toBe(GroupingStyle.Lakh);
    });

    it('should derive Lakh for en-IN', () => {
      expect(getSeparatorsFromLocale('en-IN').groupingStyle).toBe(GroupingStyle.Lakh);
    });

    it('should derive Lakh for bn-IN (non-ASCII digits read by part length)', () => {
      expect(getSeparatorsFromLocale('bn-IN').groupingStyle).toBe(GroupingStyle.Lakh);
    });

    it.each(['en-US', 'de-DE', 'fr-FR'])('should derive Thousand for %s', (locale) => {
      expect(getSeparatorsFromLocale(locale).groupingStyle).toBe(GroupingStyle.Thousand);
    });

    // Guards the deliberate scope decision: GroupingStyle.Wan is NOT derivable from Intl.
    // zh-CN and ja-JP both report Western 3-3-3 grouping, not 4-4-4, so locale inference
    // can only ever produce Thousand or Lakh. Wan stays opt-in via explicit groupingStyle.
    it.each(['zh-CN', 'ja-JP'])('should derive Thousand (never Wan) for %s', (locale) => {
      expect(getSeparatorsFromLocale(locale).groupingStyle).toBe(GroupingStyle.Thousand);
    });

    it('should fall back to Thousand for an undefined locale', () => {
      expect(getSeparatorsFromLocale(undefined).groupingStyle).toBe(GroupingStyle.Thousand);
    });

    it('should fall back to Thousand for an unknown tag without throwing', () => {
      expect(() => getSeparatorsFromLocale('xx-INVALID')).not.toThrow();
      expect(getSeparatorsFromLocale('xx-INVALID').groupingStyle).toBe(GroupingStyle.Thousand);
    });

    it('should fall back to Thousand for a malformed tag without throwing', () => {
      expect(() => getSeparatorsFromLocale('!!')).not.toThrow();
      expect(getSeparatorsFromLocale('!!')).toEqual({
        thousandSeparator: ',',
        decimalSeparator: '.',
        groupingStyle: GroupingStyle.Thousand,
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Hermes / constrained-engine simulation.
//
// Hermes on iOS implements Intl.NumberFormat#format but NOT #formatToParts
// (hermes#1188). The stub below reproduces exactly that shape: a real formatter with
// formatToParts removed. Any implementation that reaches for formatToParts throws a
// TypeError here, gets swallowed by the try/catch, and silently returns US separators -
// which is the bug these tests exist to prevent from coming back.
// ---------------------------------------------------------------------------
function withFormatToPartsMissing<T>(fn: () => T): T {
  const RealNumberFormat = Intl.NumberFormat;
  const stub = function (locale?: string, options?: Intl.NumberFormatOptions) {
    const real = new RealNumberFormat(locale, options);
    return { format: (value: number) => real.format(value) };
  };
  (Intl as { NumberFormat: unknown }).NumberFormat = stub;
  try {
    return fn();
  } finally {
    (Intl as { NumberFormat: unknown }).NumberFormat = RealNumberFormat;
  }
}

describe('✅ getSeparatorsFromLocale without Intl.formatToParts (Hermes/iOS)', () => {
  it('should still derive de-DE separators', () => {
    const seps = withFormatToPartsMissing(() => getSeparatorsFromLocale('de-DE'));
    expect(seps.thousandSeparator).toBe('.');
    expect(seps.decimalSeparator).toBe(',');
  });

  it('should still derive fr-FR narrow-no-break-space grouping', () => {
    const seps = withFormatToPartsMissing(() => getSeparatorsFromLocale('fr-FR'));
    expect(seps.thousandSeparator).toBe('\u202f');
    expect(seps.decimalSeparator).toBe(',');
  });

  it('should still derive lakh grouping for en-IN', () => {
    const seps = withFormatToPartsMissing(() => getSeparatorsFromLocale('en-IN'));
    expect(seps.groupingStyle).toBe(GroupingStyle.Lakh);
    expect(seps.thousandSeparator).toBe(',');
  });

  it('should still derive separators for a non-ASCII numbering system (ar-EG)', () => {
    const seps = withFormatToPartsMissing(() => getSeparatorsFromLocale('ar-EG'));
    // Arabic-Indic digits with U+066C group and U+066B decimal separators.
    expect(seps.thousandSeparator).toBe('\u066c');
    expect(seps.decimalSeparator).toBe('\u066b');
  });

  it('should agree with the formatToParts-capable result for every probed locale', () => {
    const locales = [
      'en-US',
      'de-DE',
      'fr-FR',
      'de-CH',
      'hi-IN',
      'en-IN',
      'bn-IN',
      'ar-EG',
      'zh-CN',
    ];
    for (const locale of locales) {
      expect(withFormatToPartsMissing(() => getSeparatorsFromLocale(locale))).toEqual(
        getSeparatorsFromLocale(locale)
      );
    }
  });

  it('should fall back to defaults when Intl is unusable entirely', () => {
    // Some React Native iOS releases ship with Intl wholly undefined
    // (reactwg/react-native-releases#290, #623). Nothing is derivable, so the documented
    // ',' / '.' fallback stands - but it must not throw.
    const RealNumberFormat = Intl.NumberFormat;
    (Intl as { NumberFormat: unknown }).NumberFormat = function () {
      throw new TypeError('Intl is not available');
    };
    try {
      expect(getSeparatorsFromLocale('de-DE')).toEqual({
        thousandSeparator: ',',
        decimalSeparator: '.',
        groupingStyle: GroupingStyle.Thousand,
      });
    } finally {
      (Intl as { NumberFormat: unknown }).NumberFormat = RealNumberFormat;
    }
  });
});

describe('✅ applyLocale', () => {
  it('should return options untouched when no locale is given', () => {
    const options = { thousandSeparator: ' ', groupingStyle: GroupingStyle.Wan };
    expect(applyLocale(undefined, options)).toBe(options);
  });

  it('should derive groupingStyle from the locale when unset', () => {
    expect(applyLocale('hi-IN', {}).groupingStyle).toBe(GroupingStyle.Lakh);
  });

  it('should let an explicit groupingStyle win over the locale-derived one', () => {
    const resolved = applyLocale('hi-IN', { groupingStyle: GroupingStyle.Thousand });
    expect(resolved.groupingStyle).toBe(GroupingStyle.Thousand);
    // Separators still come from the locale.
    expect(resolved.thousandSeparator).toBe(',');
  });

  it('should let an explicit Wan survive an Indic locale', () => {
    expect(applyLocale('hi-IN', { groupingStyle: GroupingStyle.Wan }).groupingStyle).toBe(
      GroupingStyle.Wan
    );
  });
});

describe('✅ locale-driven grouping end to end', () => {
  let container: HTMLDivElement;
  let instance: NumoraInput | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    instance?.destroy();
    instance = undefined;
    container.remove();
  });

  it('should format 12345678 as 1,23,45,678 for locale hi-IN', () => {
    instance = new NumoraInput(container, { locale: 'hi-IN', value: '12345678' });
    expect(instance.element.value).toBe('1,23,45,678');
  });

  it('should format 12345678 as 12,345,678 for locale en-US', () => {
    instance = new NumoraInput(container, { locale: 'en-US', value: '12345678' });
    expect(instance.element.value).toBe('12,345,678');
  });

  it('should keep an explicit groupingStyle over the hi-IN default', () => {
    instance = new NumoraInput(container, {
      locale: 'hi-IN',
      groupingStyle: GroupingStyle.Thousand,
      value: '12345678',
    });
    expect(instance.element.value).toBe('12,345,678');
  });

  it('should still emit the raw value unchanged under lakh grouping', () => {
    instance = new NumoraInput(container, {
      locale: 'hi-IN',
      value: '12345678',
    });
    expect(instance.element.value).toBe('1,23,45,678');
    expect(instance.rawValue).toBe('12345678');
  });
});

describe('getSeparatorsFromLocale: underscore tags', () => {
  it('reads de_DE (Java/Python/Android style) the same as de-DE', () => {
    expect(getSeparatorsFromLocale('de_DE')).toEqual(getSeparatorsFromLocale('de-DE'));
    expect(getSeparatorsFromLocale('de_DE').decimalSeparator).toBe(',');
  });
  it('reads pt_BR the same as pt-BR', () => {
    expect(getSeparatorsFromLocale('pt_BR')).toEqual(getSeparatorsFromLocale('pt-BR'));
  });
});

describe('getSeparatorsFromLocale: invalid tags', () => {
  it('warns once in development and falls back to en-US separators', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getSeparatorsFromLocale('not a locale!')).toMatchObject({
      thousandSeparator: ',',
      decimalSeparator: '.',
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('not a locale!');
    warn.mockRestore();
  });
  it('does not warn for a valid tag', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getSeparatorsFromLocale('de-DE');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
