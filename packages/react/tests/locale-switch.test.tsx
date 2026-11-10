import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

// A formatting-prop change keeps the raw value and re-runs it through the new options;
// callbacks fire only when the raw value itself changed (ADR 0008).
describe('formatting props changing on a mounted field: notifications', () => {
  it('a repaint alone (locale) fires nothing', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const ui = (locale: string) => (
      <NumoraInput data-testid="amount" defaultValue={RAW} locale={locale} onChange={onChange} onValueChange={onValueChange} />
    );
    const { rerender } = render(ui('en-US'));
    rerender(ui('de-DE'));
    expect(field().value).toBe('1.234.567,89');
    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('uncontrolled: a smaller decimalMaxLength cuts digits and reports the new raw value', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const ui = (decimalMaxLength: number) => (
      <NumoraInput
        data-testid="amount"
        defaultValue="1234.56789"
        decimalMaxLength={decimalMaxLength}
        onChange={onChange}
        onValueChange={onValueChange}
      />
    );
    const { rerender } = render(ui(8));
    rerender(ui(2));
    expect(field().value).toBe('1,234.56');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ value: '1234.56', formattedValue: '1,234.56' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe('1234.56');
    expect((field() as HTMLInputElement & { formattedValue?: string }).formattedValue).toBe('1,234.56');
  });

  it('controlled: the parent is told its value was cut, once', () => {
    const onValueChange = vi.fn();
    const ui = (value: string, decimalMaxLength: number) => (
      <NumoraInput data-testid="amount" value={value} decimalMaxLength={decimalMaxLength} onValueChange={onValueChange} />
    );
    const { rerender } = render(ui('0.123456', 6));
    rerender(ui('0.123456', 2));
    expect(field().value).toBe('0.12');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ value: '0.12', formattedValue: '0.12' });
    // The parent echoes the new raw value back: nothing more to report.
    rerender(ui('0.12', 2));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('dropping allowNegative removes the sign and reports it', () => {
    const onValueChange = vi.fn();
    const ui = (allowNegative: boolean) => (
      <NumoraInput data-testid="amount" defaultValue="-5" allowNegative={allowNegative} onValueChange={onValueChange} />
    );
    const { rerender } = render(ui(true));
    rerender(ui(false));
    expect(field().value).toBe('5');
    expect(onValueChange).toHaveBeenCalledWith({ value: '5', formattedValue: '5' });
  });

  it('a value change with unchanged options is the parent\'s own: not echoed back', () => {
    const onValueChange = vi.fn();
    const ui = (value: string) => <NumoraInput data-testid="amount" value={value} decimalMaxLength={2} onValueChange={onValueChange} />;
    const { rerender } = render(ui('1'));
    rerender(ui('2.999'));
    expect(field().value).toBe('2.99');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
