import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { FormatOn } from '../src/types';

describe('NumoraInput value API', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => container.remove());

  it('rawValue returns the raw value, formattedValue the display string', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change, defaultValue: '1234567.5' });
    expect(n.rawValue).toBe('1234567.5');
    expect(n.formattedValue).toBe('1,234,567.5');
  });

  it('setValue takes a canonical raw value and formats it for the locale', () => {
    const n = new NumoraInput(container, {
      formatOn: FormatOn.Change,
      thousandSeparator: '.',
      decimalSeparator: ',',
    });
    n.setValue('1234.5');
    expect(n.element.value).toBe('1.234,5');
    expect(n.rawValue).toBe('1234.5');
  });

  it('setValue sanitizes through the pipeline (decimalMaxLength, allowNegative)', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change, decimalMaxLength: 2 });
    n.setValue('-12.3456');
    expect(n.rawValue).toBe('12.34');
  });

  it('setValue writes through setRangeText by default (undoable)', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change });
    const spy = vi.spyOn(n.element, 'setRangeText');
    n.setValue('1000');
    expect(spy).toHaveBeenCalled();
    expect(n.element.value).toBe('1,000');
  });

  it('setValue({ undoable: false }) assigns .value directly and skips setRangeText', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change });
    const spy = vi.spyOn(n.element, 'setRangeText');
    n.setValue('1000', { undoable: false });
    expect(spy).not.toHaveBeenCalled();
    expect(n.element.value).toBe('1,000');
    expect(n.rawValue).toBe('1000');
  });

  it('setValue does not fire onValueChange (programmatic writes are not user edits)', () => {
    const onValueChange = vi.fn();
    const n = new NumoraInput(container, { formatOn: FormatOn.Change, onValueChange });
    n.setValue('5');
    n.setValue('6', { undoable: false });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
