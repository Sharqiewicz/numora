import { describe, it, expect } from 'vitest';
import { truncateToMaxLength } from '../src/features/max-length';
import { sanitizeNumoraInput } from '../src/features/sanitization';

describe('truncateToMaxLength', () => {
  it('returns value unchanged when within limit', () => {
    expect(truncateToMaxLength('123', 5)).toBe('123');
    expect(truncateToMaxLength('12345', 5)).toBe('12345');
  });

  it('truncates excess characters from the right', () => {
    expect(truncateToMaxLength('1234567', 5)).toBe('12345');
  });

  it('counts decimal separator as a character', () => {
    // "1234.56" has length 7; slice to 6 yields "1234.5" which fits.
    expect(truncateToMaxLength('1234.56', 6)).toBe('1234.5');
  });

  it('strips trailing decimal separator left after truncation', () => {
    // slice(0,5) of "1234.56" is "1234." → trailing dot stripped → "1234"
    expect(truncateToMaxLength('1234.56', 5)).toBe('1234');
  });

  it('truncates with comma decimal separator', () => {
    // slice(0,5) of "1234,56" is "1234," → trailing comma stripped → "1234"
    expect(truncateToMaxLength('1234,56', 5, ',')).toBe('1234');
  });

  it('counts leading minus as a character', () => {
    expect(truncateToMaxLength('-1234567', 5)).toBe('-1234');
  });

  it('returns empty string if truncation would leave a bare minus', () => {
    expect(truncateToMaxLength('-1234', 1)).toBe('');
  });

  it('returns empty string for maxLength 0', () => {
    expect(truncateToMaxLength('1234', 0)).toBe('');
  });

  it('handles empty input', () => {
    expect(truncateToMaxLength('', 5)).toBe('');
  });

  it('ignores negative maxLength', () => {
    expect(truncateToMaxLength('123', -1)).toBe('123');
  });
});

describe('maxLength option (pipeline integration)', () => {
  it('does nothing when option is undefined', () => {
    expect(sanitizeNumoraInput('1234567')).toBe('1234567');
  });

  it('truncates raw value to maxLength', () => {
    expect(sanitizeNumoraInput('1234567', { maxLength: 4 })).toBe('1234');
  });

  it('truncation counts decimal separator', () => {
    expect(sanitizeNumoraInput('12.345', { maxLength: 4 })).toBe('12.3');
  });

  it('strips thousand separators before counting', () => {
    expect(sanitizeNumoraInput('1,234,567', { maxLength: 5, thousandSeparator: ',' }))
      .toBe('12345');
  });

  it('applies after scientific expansion', () => {
    // 1e5 → 100000 → truncate to 4 → 1000
    expect(sanitizeNumoraInput('1e5', { maxLength: 4 })).toBe('1000');
  });
});
