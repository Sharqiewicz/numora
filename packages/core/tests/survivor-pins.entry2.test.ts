import { describe, expect, it } from 'vitest';
import { NumoraInput } from '@/NumoraInput';
import { validateNumoraInputOptions } from '@/validation';

const mk = (options: object = {}, value?: string) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const input = document.createElement('input');
  if (value !== undefined) input.value = value;
  host.appendChild(input);
  const n = new NumoraInput(input, options as never);
  return { n, el: input };
};

describe('entry survivors (round 3)', () => {
  it('validation.ts:51 - a multi-char or empty separator is rejected with the "single character" message', () => {
    // 'ab' hits the reserved-char branch with the guard removed; '' passes every later check.
    expect(() => validateNumoraInputOptions({ decimalSeparator: '' })).toThrow(
      /single character\. Received: ""/
    );
    expect(() => validateNumoraInputOptions({ decimalSeparator: 'xy' })).toThrow(
      /single character\. Received: "xy"/
    );
  });

  it('NumoraInput.ts:91 - lastValue is seeded from the (formatted) initial value, so a refused edit restores it', () => {
    const { el } = mk({ allowScientificNotation: false }, '1234.5');
    expect(el.value).toBe('1,234.5');
    el.value = '1e5';
    el.dispatchEvent(new Event('input'));
    expect(el.value).toBe('1,234.5');
  });

  it('NumoraInput.ts:168 / :314 - initial and setValue input is canonical (dot decimal) under a comma locale', () => {
    const { n, el } = mk({ locale: 'de-DE' }, '1234.5');
    expect(el.value).toBe('1.234,5');
    n.setValue('9876.25');
    expect(el.value).toBe('9.876,25');
    expect(n.value).toBe('9876.25');
  });

});
