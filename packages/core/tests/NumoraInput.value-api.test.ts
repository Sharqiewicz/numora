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

  it('value getter returns the raw value, getFormattedValue the display string', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change, value: '1234567.5' });
    expect(n.value).toBe('1234567.5');
    expect(n.getFormattedValue()).toBe('1,234,567.5');
  });

  it('value setter takes a canonical raw value and formats it like setValue', () => {
    const n = new NumoraInput(container, {
      formatOn: FormatOn.Change,
      thousandSeparator: '.',
      decimalSeparator: ',',
    });
    n.value = '1234.5';
    expect(n.getElement().value).toBe('1.234,5');
    expect(n.value).toBe('1234.5');
  });

  it('setValue sanitizes through the pipeline (decimalMaxLength, allowNegative)', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change, decimalMaxLength: 2 });
    n.setValue('-12.3456');
    expect(n.value).toBe('12.34');
  });

  it('setValue writes through setRangeText by default (undoable)', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change });
    const spy = vi.spyOn(n.getElement(), 'setRangeText');
    n.setValue('1000');
    expect(spy).toHaveBeenCalled();
    expect(n.getElement().value).toBe('1,000');
  });

  it('setValue({ undoable: false }) assigns .value directly and skips setRangeText', () => {
    const n = new NumoraInput(container, { formatOn: FormatOn.Change });
    const spy = vi.spyOn(n.getElement(), 'setRangeText');
    n.setValue('1000', { undoable: false });
    expect(spy).not.toHaveBeenCalled();
    expect(n.getElement().value).toBe('1,000');
    expect(n.value).toBe('1000');
  });

  it('setValue does not fire onChange (programmatic writes are not user edits)', () => {
    const onChange = vi.fn();
    const n = new NumoraInput(container, { formatOn: FormatOn.Change, onChange });
    n.setValue('5');
    n.setValue('6', { undoable: false });
    expect(onChange).not.toHaveBeenCalled();
  });
});
