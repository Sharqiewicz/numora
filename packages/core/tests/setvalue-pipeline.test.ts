import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { FormatOn, GroupingStyle } from '../src/types';

/**
 * Regression: in the default config  `setValue` used to write its
 * argument to the DOM verbatim — no sanitization, no grouping, no decimal/length caps —
 * diverging from both the typed path and the initial-value path. It now runs the full
 * display pipeline, so a programmatic write formats identically to construction.
 */
describe('setValue runs the full pipeline in default mode', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
  });

  const make = (opts = {}) =>
    new NumoraInput(container, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalSeparator: '.',
      ...opts,
    });
  const el = () => container.querySelector('input') as HTMLInputElement;

  it('applies thousand grouping (matches construction)', () => {
    const input = make();
    input.setValue('7654321');
    expect(el().value).toBe('7,654,321');
  });

  it('strips non-numeric characters', () => {
    const input = make();
    input.setValue('abc123');
    expect(el().value).toBe('123');
  });

  it('enforces decimalMaxLength', () => {
    const input = make({ decimalMaxLength: 2 });
    input.setValue('1.23456789');
    expect(el().value).toBe('1.23');
  });

  it('enforces maxLength (raw character cap)', () => {
    const input = make({ maxLength: 5 });
    input.setValue('1234567890');
    // 5 raw chars -> "12345", then grouped
    expect(input.getValue()).toBe('12345');
  });

  it('strips a sign when allowNegative is false', () => {
    const input = make({ allowNegative: false });
    input.setValue('-1234');
    expect(el().value).toBe('1,234');
  });

  it('setValue output equals the initial-value (construction) output for the same string', () => {
    const viaSet = make();
    viaSet.setValue('1234.5');
    const setResult = el().value;

    document.body.removeChild(container);
    container = document.createElement('div');
    document.body.appendChild(container);
    const host = document.createElement('input');
    host.value = '1234.5';
    container.appendChild(host);
    new NumoraInput(host, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalSeparator: '.',
    });
    expect(setResult).toBe(host.value);
  });
});
