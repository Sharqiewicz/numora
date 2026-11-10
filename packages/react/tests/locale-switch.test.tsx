import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NumoraInput } from '../src/index';

/**
 * Changing `locale` (or a separator prop) on a mounted field must repaint it in the new
 * format. The text in the DOM is in the OLD format, so it cannot be compared or re-read
 * under the new options: `1.234.567,89` (de-DE) read as fr-FR looked "equal" and stayed.
 */

const RAW = '1234567.89';
const SHOWN: [string, string][] = [
  ['en-US', '1,234,567.89'],
  ['de-DE', '1.234.567,89'],
  ['fr-FR', '1 234 567,89'],
  ['pl-PL', '1 234 567,89'],
  ['de-CH', "1'234'567.89"],
  ['en-IN', '12,34,567.89'],
  ['ar-EG', '1٬234٬567٫89'],
  ['fa-IR', '1٬234٬567٫89'],
  ['en-US', '1,234,567.89'],
];

const field = () => screen.getByTestId('amount') as HTMLInputElement;

describe('switching locale on a mounted field', () => {
  it('controlled: repaints in each new locale', () => {
    const { rerender } = render(<NumoraInput data-testid="amount" value={RAW} locale="en-US" />);
    for (const [locale, shown] of SHOWN) {
      rerender(<NumoraInput data-testid="amount" value={RAW} locale={locale} />);
      expect(field().value, locale).toBe(shown);
      expect(field().formattedValue, locale).toBe(shown);
    }
  });

  it('uncontrolled: carries the number over into each new locale', () => {
    const { rerender } = render(<NumoraInput data-testid="amount" defaultValue={RAW} locale="en-US" />);
    for (const [locale, shown] of SHOWN) {
      rerender(<NumoraInput data-testid="amount" defaultValue={RAW} locale={locale} />);
      expect(field().value, locale).toBe(shown);
    }
  });

  it('separator props: dot-comma to space-comma', () => {
    const { rerender } = render(
      <NumoraInput data-testid="amount" value={RAW} thousandSeparator="." decimalSeparator="," />
    );
    expect(field().value).toBe('1.234.567,89');
    rerender(<NumoraInput data-testid="amount" value={RAW} thousandSeparator=" " decimalSeparator="," />);
    expect(field().value).toBe('1 234 567,89');
  });

  it('an unrelated re-render leaves a half-typed value alone', () => {
    const { rerender } = render(<NumoraInput data-testid="amount" value="12." locale="en-US" />);
    field().value = '12.';
    rerender(<NumoraInput data-testid="amount" value="12." locale="en-US" className="x" />);
    expect(field().value).toBe('12.');
  });
});
