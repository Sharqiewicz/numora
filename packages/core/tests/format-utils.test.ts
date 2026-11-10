import { describe, it, expect } from 'vitest';
import { formatInputValue, formatValueForDisplay } from '../src/utils/format-utils';
import { FormatOn } from '../src/types';

// decimalMinLength pads on display/blur only, never on the typing path (ticket 03) -
// formatInputValue is the typing path, formatValueForDisplay the display/blur path.
describe('✅ formatInputValue - decimalMinLength stays out of the typing path', () => {
  it('does not pad a bare digit', () => {
    expect(formatInputValue('1', 2, { decimalMinLength: 2 }).raw).toBe('1');
    expect(formatInputValue('1', 2, { decimalMinLength: 2 }).formatted).toBe('1');
  });

  it('lets a keystroke after the integer still reach the fraction', () => {
    // '1' then '5' -> '15' (not rejected because padding never inserted '.00' first).
    expect(formatInputValue('15', 2, { decimalMinLength: 2 }).raw).toBe('15');
    // '1.' then '5' -> '1.5'
    expect(formatInputValue('1.5', 2, { decimalMinLength: 2 }).raw).toBe('1.5');
  });

  it('leaves empty and sign-only values alone', () => {
    expect(formatInputValue('', 2, { decimalMinLength: 2 }).raw).toBe('');
    expect(formatInputValue('-', 2, { allowNegative: true, decimalMinLength: 2 }).raw).toBe('-');
  });
});

describe('✅ formatValueForDisplay - decimalMinLength pads on display/blur', () => {
  it('pads a bare digit', () => {
    const { formatted } = formatValueForDisplay('1', 2, { decimalMinLength: 2 });
    expect(formatted).toBe('1.00');
  });

  it('leaves empty and sign-only values unpadded', () => {
    expect(formatValueForDisplay('', 2, { decimalMinLength: 2 }).formatted).toBe('');
    expect(
      formatValueForDisplay('-', 2, { allowNegative: true, decimalMinLength: 2 }).formatted
    ).toBe('-');
  });

  it('pads both formatted and raw', () => {
    const { formatted, raw } = formatValueForDisplay('1', 2, { decimalMinLength: 2 });
    expect(formatted).toBe('1.00');
    expect(raw).toBe('1.00');
  });
});

// decimalMaxLength: 0 and a trailing separator surviving to display (ticket 08).
describe('✅ formatValueForDisplay - decimalMaxLength: 0 and trailing separator', () => {
  it('drops a trailing separator entirely when no decimals are allowed', () => {
    expect(formatValueForDisplay('1.', 0, {}).formatted).toBe('1');
    expect(formatValueForDisplay('1.5', 0, {}).formatted).toBe('1');
  });

  it('strips a trailing separator before padding to decimalMinLength', () => {
    const { formatted, raw } = formatValueForDisplay('1234', 2, {
      decimalMinLength: 2,
    });
    // Sanity check the padding path independent of grouping.
    expect(formatted).toBe('1234.00');
    expect(raw).toBe('1234.00');
  });

  it('strips trailing separator then pads, even after grouping is applied', () => {
    // formatForDisplay in both packages forces formatOn: Change so resting/blurred values
    // always show grouping; formatValueForDisplay itself only groups when the caller asks
    // for Change mode, mirroring that call shape here.
    const { formatted, raw } = formatValueForDisplay('1234.', 2, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      decimalMinLength: 2,
    });
    expect(formatted).toBe('1,234.00');
    expect(raw).toBe('1234.00');
  });
});

// String value contract (ticket 04): string inputs to the display pipeline are already
// in the field's *display* format - locale separators allowed, grouping optional. A
// string is display text, not a canonical numeric value; formatValueForDisplay does not
// (and cannot) know that a bare '.' in the input was meant as a decimal point rather than
// a thousand separator. This test documents that behavior explicitly rather than leaving
// it as an accidental side effect of the sanitizer. Callers who hold a real JS number
// must convert it themselves before handing it to a de-DE-configured field - see
// `numberToDisplayString` in the React package, which does this for numeric inputs.
describe('✅ formatValueForDisplay - string value contract under locale separators', () => {
  // formatOn: Change mirrors formatForDisplay in both packages (see the comment on the
  // decimalMaxLength describe block above) so the regrouped result is visible below.
  const deOptions = { formatOn: FormatOn.Change, thousandSeparator: '.', decimalSeparator: ',' };

  it('reads a dot-decimal string as de-DE display text, not as a canonical number', () => {
    const { formatted } = formatValueForDisplay('1234.5', 18, deOptions);
    // Under de-DE separators '.' is the *thousand* separator, so sanitization strips it
    // as grouping and concatenates the digits either side of it: '1234' + '5' -> the
    // integer 12345. Formatted for display, that regroups as '12.345' - a silent 10x
    // error if the caller actually meant the JS number 1234.5.
    expect(formatted).toBe('12.345');
  });
});
