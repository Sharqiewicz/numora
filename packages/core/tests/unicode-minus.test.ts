import { describe, it, expect } from 'vitest';
import { normalizeUnicodeMinus } from '../src/features/unicode-minus';
import { sanitizeNumoraInput } from '../src/features/sanitization';

describe('normalizeUnicodeMinus', () => {
  it('converts U+2212 MINUS SIGN to ASCII hyphen-minus', () => {
    expect(normalizeUnicodeMinus('−5')).toBe('-5');
  });

  it('converts U+FF0D FULLWIDTH HYPHEN-MINUS', () => {
    expect(normalizeUnicodeMinus('－5')).toBe('-5');
  });

  it('converts U+FE63 SMALL HYPHEN-MINUS', () => {
    expect(normalizeUnicodeMinus('﹣5')).toBe('-5');
  });

  it('leaves ASCII hyphen-minus and dashes untouched', () => {
    expect(normalizeUnicodeMinus('-5')).toBe('-5');
    // en dash / em dash are punctuation, not a numeric sign — not normalized.
    expect(normalizeUnicodeMinus('–5')).toBe('–5');
  });
});

describe('sanitizeNumoraInput preserves a non-ASCII minus sign', () => {
  it('U+2212 leading minus is preserved when enableNegative is on (regression: was silently dropped)', () => {
    expect(sanitizeNumoraInput('−5', { enableNegative: true } as never)).toBe('-5');
    expect(sanitizeNumoraInput('−1234.56', { enableNegative: true } as never)).toBe('-1234.56');
  });

  it('matches ASCII-minus behavior exactly', () => {
    const opts = { enableNegative: true } as never;
    expect(sanitizeNumoraInput('−5', opts)).toBe(sanitizeNumoraInput('-5', opts));
  });
});
