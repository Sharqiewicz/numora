import { afterEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput, type NumoraInputOptions } from '../src/NumoraInput';

// Options renamed or removed since v4 are not aliased: ignored, warned about in development,
// and kept off the element.
describe('options removed since v4 (vanilla)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  const make = (options: Record<string, unknown>) =>
    new NumoraInput(document.createElement('div'), options as NumoraInputOptions);

  it.each([
    ['enableNegative', true, 'allowNegative'],
    ['enableLeadingZeros', true, 'allowLeadingZeros'],
    ['enableCompactNotation', true, 'allowCompactNotation'],
    ['enableScientificNotation', false, 'allowScientificNotation'],
    ['autoAddLeadingZero', true, 'padLeadingZero'],
    ['thousandStyle', 'lakh', 'groupingStyle'],
    ['maxDecimals', 2, 'decimalMaxLength'],
    ['emitRawValue', true, 'onChange'],
  ])('warns for %s, names the replacement, and keeps it off the element', (name, val, hint) => {
    vi.stubEnv('NODE_ENV', 'development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const input = make({ [name]: val });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(`${name} is removed in v5`);
    expect(warn.mock.calls[0][0]).toContain(hint);
    expect(name in input.getElement()).toBe(false);
  });

  it('an old name has no effect: enableNegative does not allow a minus', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(make({ enableNegative: true, value: '-5' }).getValue()).toBe('5');
    expect(make({ allowNegative: true, value: '-5' }).getValue()).toBe('-5');
  });

  it('does not warn in production, and still keeps the option off the element', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const input = make({ maxDecimals: 2 });
    expect(warn).not.toHaveBeenCalled();
    expect('maxDecimals' in input.getElement()).toBe(false);
  });

  it('does not warn for current options, and native attributes still reach the element', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const input = make({ allowNegative: true, padLeadingZero: true, placeholder: '0.0', maxLength: 5 });
    expect(warn).not.toHaveBeenCalled();
    expect(input.getElement().placeholder).toBe('0.0');
    expect(input.getElement().maxLength).toBe(-1);
  });
});
