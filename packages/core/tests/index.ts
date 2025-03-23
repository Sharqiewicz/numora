import { describe, it, expect } from 'vitest';
import { Numora } from '../src';

describe('Numora', () => {
  it('parses correctly', () => {
    const numora = new Numora({ decimals: 18 });
    expect(numora.parse('1.23').toString()).toBe('1230000000000000000');
  });

  it('validates correctly', () => {
    const numora = new Numora({ maxDecimals: 2 });
    expect(numora.validate('1.23')).toBe(true);
    expect(numora.validate('1.234')).toBe(false);
  });
});