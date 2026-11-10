import { describe, expect, it } from 'vitest';
import * as config from '@/config';
import { NumoraInput } from '@/NumoraInput';
import { FormatOn, GroupingStyle } from '@/types';
import { validateNumoraInputOptions } from '@/validation';

/** Behaviour that mutation testing showed no other test pins (validation.ts, NumoraInput.ts, config.ts). */

const v = (o: object) => () => validateNumoraInputOptions(o as never);
const mk = (options: object = {}) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const n = new NumoraInput(host, options as never);
  return { n, el: n.getElement() };
};

describe('validateNumoraInputOptions throw branches', () => {
  it('accepts an empty options object and explicit undefined values', () => {
    expect(v({})).not.toThrow();
    expect(
      v({
        decimalMaxLength: undefined,
        decimalMinLength: undefined,
        maxLength: undefined,
        isAllowed: undefined,
        onChange: undefined,
        formatOn: undefined,
        groupingStyle: undefined,
        thousandSeparator: undefined,
        decimalSeparator: undefined,
        allowNegative: undefined,
      })
    ).not.toThrow();
  });

  // assertInt(non-negative): 0 is the boundary and is valid
  it('decimalMaxLength: non-negative integer, names the option', () => {
    expect(v({ decimalMaxLength: -1 })).toThrow(
      /decimalMaxLength must be a non-negative integer\. Received: -1/
    );
    expect(v({ decimalMaxLength: 1.5 })).toThrow(
      /decimalMaxLength must be a non-negative integer\. Received: 1\.5/
    );
    expect(v({ decimalMaxLength: 0 })).not.toThrow();
    expect(v({ decimalMaxLength: 18 })).not.toThrow();
  });
  it('decimalMinLength: non-negative integer, names the option', () => {
    expect(v({ decimalMinLength: -1 })).toThrow(
      /decimalMinLength must be a non-negative integer\. Received: -1/
    );
    expect(v({ decimalMinLength: 1.5 })).toThrow(/decimalMinLength must be a non-negative integer/);
    expect(v({ decimalMinLength: 0 })).not.toThrow();
    expect(v({ decimalMinLength: 3 })).not.toThrow();
  });
  it('maxLength: positive integer, 0 rejected', () => {
    expect(v({ maxLength: 0 })).toThrow(
      /maxLength must be a positive integer \(>= 1\)\. Received: 0/
    );
    expect(v({ maxLength: -3 })).toThrow(/maxLength must be a positive integer/);
    expect(v({ maxLength: 1.5 })).toThrow(/maxLength must be a positive integer/);
    expect(v({ maxLength: 1 })).not.toThrow();
  });

  // assertSeparator
  it('decimalSeparator: single character, empty rejected', () => {
    expect(v({ decimalSeparator: 'ab' })).toThrow(
      /decimalSeparator must be a single character\. Received: "ab"/
    );
    expect(v({ decimalSeparator: '' })).toThrow(/decimalSeparator must be a single character/);
    expect(v({ decimalSeparator: ',' })).not.toThrow();
  });
  it('thousandSeparator: multi-char and empty rejected', () => {
    expect(v({ thousandSeparator: 'ab' })).toThrow(
      /thousandSeparator must be a single character\. Received: "ab"/
    );
    expect(v({ thousandSeparator: '' })).toThrow(
      /thousandSeparator cannot be empty\. Use groupingStyle: 'none'/
    );
    expect(v({ thousandSeparator: ' ' })).not.toThrow();
  });
  it('separator that is a digit or reserved char is rejected, naming the option', () => {
    expect(v({ decimalSeparator: '5' })).toThrow(/decimalSeparator cannot be a digit/);
    expect(v({ thousandSeparator: '0' })).toThrow(/thousandSeparator cannot be a digit/);
    expect(v({ thousandSeparator: 'k' })).toThrow(
      /thousandSeparator cannot be one of the reserved characters/
    );
    expect(v({ decimalSeparator: '-' })).toThrow(
      /decimalSeparator cannot be one of the reserved characters/
    );
  });
  it('non-string separator is rejected', () => {
    expect(v({ decimalSeparator: 1 })).toThrow(/decimalSeparator must be a single character/);
  });
  it('equal separators conflict', () => {
    expect(v({ thousandSeparator: '.', decimalSeparator: '.' })).toThrow(
      /decimalSeparator cannot equal thousandSeparator\. Both were "\."/
    );
    expect(v({ thousandSeparator: '.', decimalSeparator: ',' })).not.toThrow();
  });

  // assertType
  it.each([
    'allowCompactNotation',
    'allowScientificNotation',
    'allowNegative',
    'allowLeadingZeros',
    'padLeadingZero',
  ])('%s must be a boolean', (name) => {
    expect(v({ [name]: 'yes' })).toThrow(
      new RegExp(`${name} must be a boolean\\. Received: "yes"`)
    );
    expect(v({ [name]: 1 })).toThrow(new RegExp(`${name} must be a boolean`));
    expect(v({ [name]: true })).not.toThrow();
    expect(v({ [name]: false })).not.toThrow();
  });
  it.each(['isAllowed', 'onChange'])('%s must be a function', (name) => {
    expect(v({ [name]: 'x' })).toThrow(new RegExp(`${name} must be a function\\. Received: "x"`));
    expect(v({ [name]: 1 })).toThrow(new RegExp(`${name} must be a function`));
    expect(v({ [name]: () => true })).not.toThrow();
  });

  // assertEnumValue
  it('formatOn / groupingStyle must be one of the enum values', () => {
    expect(v({ formatOn: 'x' })).toThrow(
      /formatOn must be one of: 'blur', 'change'\. Received: "x"/
    );
    expect(v({ groupingStyle: 'x' })).toThrow(/groupingStyle must be one of: .*Received: "x"/);
    expect(v({ formatOn: FormatOn.Change })).not.toThrow();
    for (const g of Object.values(GroupingStyle)) expect(v({ groupingStyle: g })).not.toThrow();
  });

  // assertDecimalLengths
  it('decimalMinLength may not exceed decimalMaxLength', () => {
    expect(v({ decimalMinLength: 5, decimalMaxLength: 2 })).toThrow(
      /decimalMinLength \(5\) cannot be greater than decimalMaxLength \(2\)/
    );
    expect(v({ decimalMinLength: 2, decimalMaxLength: 2 })).not.toThrow();
    expect(v({ decimalMinLength: 5 })).not.toThrow(); // max defaults to unbounded
    expect(v({ decimalMaxLength: 0 })).not.toThrow(); // min defaults to 0
  });
});

describe('config defaults', () => {
  it('pins the default values', () => {
    expect(config.DEFAULT_ALLOW_COMPACT_NOTATION).toBe(false); // config.ts:16
    expect(config.DEFAULT_ALLOW_SCIENTIFIC_NOTATION).toBe(true);
    expect(config.DEFAULT_ALLOW_NEGATIVE).toBe(false);
    expect(config.DEFAULT_ALLOW_LEADING_ZEROS).toBe(false);
    expect(config.DEFAULT_PAD_LEADING_ZERO).toBe(false);
  });
  it('does not expand "1k" by default', () => {
    const { n, el } = mk();
    el.value = '1k';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    expect(n.getValue()).not.toBe('1000');
    expect(el.value).not.toContain('000');
  });
});

describe('NumoraInput valueAsNumber setter', () => {
  it('0 and -0 do not throw with allowNegative false (num < 0, not <= 0)', () => {
    const { n } = mk();
    expect(() => {
      n.valueAsNumber = 0;
    }).not.toThrow();
    expect(n.getValue()).toBe('0');
    expect(() => {
      n.valueAsNumber = -0;
    }).not.toThrow();
    expect(n.getValue()).toBe('0');
  });
  it('negative throws only without allowNegative', () => {
    expect(() => {
      mk().n.valueAsNumber = -1;
    }).toThrow(/allowNegative is false/);
    const { n } = mk({ allowNegative: true });
    n.valueAsNumber = -1;
    expect(n.getValue()).toBe('-1');
  });
  it('Infinity, -Infinity and NaN throw a RangeError mentioning finite', () => {
    const { n } = mk();
    for (const bad of [Infinity, -Infinity, NaN]) {
      expect(() => {
        n.valueAsNumber = bad;
      }).toThrow(RangeError);
      expect(() => {
        n.valueAsNumber = bad;
      }).toThrow(/finite/);
    }
  });
  it('a non-numeric string clears the field instead of throwing', () => {
    const { n, el } = mk({ value: '5' });
    n.valueAsNumber = 'abc' as never;
    expect(el.value).toBe('');
  });
});

describe('NumoraInput canonical source', () => {
  it('setValue and the initial value are canonical in de-DE', () => {
    const { n } = mk({ locale: 'de-DE' });
    n.setValue('1234.5');
    expect(n.getFormattedValue()).toBe('1.234,5');
    expect(mk({ locale: 'de-DE', value: '1234.5' }).el.value).toBe('1.234,5');
    expect(mk({ locale: 'de-DE', defaultValue: '1234.5' }).el.value).toBe('1.234,5');
  });
});

describe('NumoraInput input-event fallback state', () => {
  it('after blur, autofill (input without beforeinput) is formatted at rest with grouping', () => {
    const { el } = mk({ formatOn: FormatOn.Blur });
    el.dispatchEvent(new Event('focus'));
    el.dispatchEvent(new Event('blur'));
    el.value = '1234567';
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' })
    );
    expect(el.value).toBe('1,234,567');
  });
  it('a refused input after a focus-strip restores the stripped text, not the pre-strip text', () => {
    const { el } = mk({ value: '1234', allowScientificNotation: false });
    expect(el.value).toBe('1,234');
    el.dispatchEvent(new Event('focus'));
    expect(el.value).toBe('1234');
    el.value = '12e34';
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' })
    );
    expect(el.value).toBe('1234');
  });
});
