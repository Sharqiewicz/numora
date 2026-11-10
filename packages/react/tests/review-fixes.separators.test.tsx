import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { NumoraInput, FormatOn, type NumoraInputChangeEvent } from '../src/index';

afterEach(cleanup);

describe('decimalSeparator alone', () => {
  it("',' resolves a '.' thousand separator", () => {
    let last: NumoraInputChangeEvent | undefined;
    const { container } = render(
      <NumoraInput
        decimalSeparator=","
        formatOn={FormatOn.Change}
        defaultValue="1234.5"
        onChange={(e) => {
          last = e;
        }}
      />
    );
    const el = container.querySelector('input') as HTMLInputElement;
    expect(el.value).toBe('1.234,5');
    expect(last).toBeUndefined();
  });
  it('explicit conflict still throws', () => {
    const spy = console.error;
    console.error = () => {};
    try {
      expect(() => render(<NumoraInput decimalSeparator="," thousandSeparator="," />)).toThrow();
    } finally {
      console.error = spy;
    }
  });
  it("'.' alone is unchanged", () => {
    const { container } = render(<NumoraInput decimalSeparator="." defaultValue="1234.5" />);
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('1,234.5');
  });
  it('locale-derived separators are unchanged', () => {
    const { container } = render(<NumoraInput locale="de-DE" defaultValue="1234.5" />);
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('1.234,5');
  });
});
