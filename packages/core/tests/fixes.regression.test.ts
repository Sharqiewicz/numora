import { describe, it, expect, vi } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { FormatOn, GroupingStyle } from '../src/types';

// Regression tests for the code-review fix pass. Each block references the finding it locks in.

describe('Validation runs against resolved options (#3)', () => {
  it('throws when decimalSeparator collides with an explicit thousandSeparator', () => {
    const container = document.createElement('div');
    // A lone decimalSeparator ',' now resolves a '.' thousand separator instead (see
    // review-fixes.vanilla.test.ts); only an explicit conflict throws.
    expect(
      () => new NumoraInput(container, { decimalSeparator: ',', thousandSeparator: ',' })
    ).toThrow(
      /decimalSeparator cannot equal thousandSeparator/
    );
  });

  it('accepts an EU config when a non-colliding thousandSeparator is supplied', () => {
    const container = document.createElement('div');
    expect(
      () => new NumoraInput(container, { decimalSeparator: ',', thousandSeparator: '.' })
    ).not.toThrow();
  });

  it('throws when decimalMinLength exceeds the DEFAULT decimalMaxLength', () => {
    const container = document.createElement('div');
    // Default decimalMaxLength is 18 (DeFi-safe); 20 exceeds it.
    expect(() => new NumoraInput(container, { decimalMinLength: 20 })).toThrow(
      /decimalMinLength .* cannot be greater than decimalMaxLength/
    );
  });

  it('accepts decimalMinLength when an explicit compatible decimalMaxLength is given', () => {
    const container = document.createElement('div');
    expect(
      () => new NumoraInput(container, { decimalMinLength: 5, decimalMaxLength: 8 })
    ).not.toThrow();
  });
});

describe('Empty-string thousandSeparator is rejected (#6, reversed in v5)', () => {
  it("throws and points to groupingStyle: 'none'", () => {
    const container = document.createElement('div');
    expect(() => new NumoraInput(container, { thousandSeparator: '' })).toThrow(
      /groupingStyle: 'none'/
    );
    expect(() => new NumoraInput(container, { groupingStyle: 'none' })).not.toThrow();
  });
});

describe('destroy() removes Numora-internal listeners (#8)', () => {
  it('stops firing onChange after destroy()', () => {
    const container = document.createElement('div');
    const onChange = vi.fn();
    const numora = new NumoraInput(container, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      onChange,
    });
    const input = numora.element;

    input.value = '1234';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledTimes(1);

    numora.destroy();
    onChange.mockClear();

    input.value = '5678';
    input.dispatchEvent(new Event('input'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is idempotent', () => {
    const container = document.createElement('div');
    const numora = new NumoraInput(container, { onChange: vi.fn() });
    expect(() => {
      numora.destroy();
      numora.destroy();
    }).not.toThrow();
  });

  it('does not stack duplicate listeners when re-initialised on an adopted input', () => {
    const input = document.createElement('input');
    const onChangeA = vi.fn();
    const first = new NumoraInput(input, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      onChange: onChangeA,
    });
    first.destroy();

    const onChangeB = vi.fn();
    // eslint-disable-next-line no-new
    new NumoraInput(input, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      onChange: onChangeB,
    });

    input.value = '1234';
    input.dispatchEvent(new Event('input'));

    // Only the live instance's onChange fires; the destroyed one is fully detached.
    expect(onChangeA).not.toHaveBeenCalled();
    expect(onChangeB).toHaveBeenCalledTimes(1);
  });
});
