import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { handleOnPasteNumoraInput } from '../src/utils/event-handlers';
import { displayToRawValue } from '../src/utils/format-utils';
import { FormatOn, GroupingStyle } from '../src/types';

// ADR 0004: the raw value is canonical (ASCII digits, '.' decimal, '-' sign, no grouping)
// for every locale. ADR 0005: typed '.' is the decimal in comma-decimal locales.
// ADR 0006: pasted text is format-detected; app-supplied values are not.

function typeChar(el: HTMLInputElement, char: string): void {
  const e = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  el.dispatchEvent(e);
  if (e.defaultPrevented) return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  el.value = el.value.slice(0, start) + char + el.value.slice(end);
  el.setSelectionRange(start + 1, start + 1);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}

function typeString(el: HTMLInputElement, text: string): void {
  for (const ch of text) typeChar(el, ch);
}

function pasteInto(el: HTMLInputElement, text: string): void {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  el.dispatchEvent(ev);
}

describe('canonical raw value', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
  });

  const make = (opts: ConstructorParameters<typeof NumoraInput>[1] = {}) => {
    const onChange = vi.fn();
    const n = new NumoraInput(container, { formatOn: FormatOn.Change, onChange, ...opts });
    return { n, onChange, el: container.querySelector('input') as HTMLInputElement };
  };

  describe('focus strip (Blur mode)', () => {
    it('de-DE: focusing a value with decimals does not fire onChange (raw is unchanged)', () => {
      const { n, el, onChange } = make({
        locale: 'de-DE',
        formatOn: FormatOn.Blur,
        groupingStyle: GroupingStyle.Thousand,
        value: '1234567.89',
      });
      expect(el.value).toBe('1.234.567,89');
      onChange.mockClear();
      el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(el.value).toBe('1234567,89');
      expect(n.value).toBe('1234567.89');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('typing (ADR 0005)', () => {
    it('de-DE: typing 1234567.89 with the "." key gives 1.234.567,89 and raw 1234567.89', () => {
      const { n, el, onChange } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      typeString(el, '1234567.89');
      expect(el.value).toBe('1.234.567,89');
      expect(n.value).toBe('1234567.89');
      expect(n.formattedValue).toBe('1.234.567,89');
      expect(onChange).toHaveBeenLastCalledWith({
        value: '1234567.89',
        formattedValue: '1.234.567,89',
      });
    });

    it('de-DE: a second "." is ignored once a decimal exists', () => {
      const { el, n } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      typeString(el, '1.5.');
      expect(el.value).toBe('1,5');
      typeChar(el, '.');
      expect(el.value).toBe('1,5');
      expect(n.value).toBe('1.5');
    });

    it('de-DE: the native "," key still works as the decimal', () => {
      const { el, n } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      typeString(el, '1234,5');
      expect(el.value).toBe('1.234,5');
      expect(n.value).toBe('1234.5');
    });

    it('en-US: typing "," is rejected', () => {
      const { el, onChange } = make({ locale: 'en-US', groupingStyle: GroupingStyle.Thousand });
      typeString(el, '12');
      onChange.mockClear();
      typeChar(el, ',');
      expect(el.value).toBe('12');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('de-DE trailing decimal keeps raw "1."', () => {
      const { el, n } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      typeString(el, '1,');
      expect(el.value).toBe('1,');
      expect(n.value).toBe('1.');
    });
  });

  describe('app-supplied values are canonical (never locale text)', () => {
    it('setValue("1234.5") in de-DE displays 1.234,5 and getValue is canonical', () => {
      const { n, el } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      n.setValue('1234.5');
      expect(el.value).toBe('1.234,5');
      expect(n.value).toBe('1234.5');
      expect(n.formattedValue).toBe('1.234,5');
    });

    it('setValue("1.234") in de-DE is the number 1.234, not 1234', () => {
      const { n, el } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      n.setValue('1.234');
      expect(el.value).toBe('1,234');
      expect(n.value).toBe('1.234');
    });

    it('setValue round-trips a negative canonical value', () => {
      const { n, el } = make({ locale: 'de-DE', allowNegative: true, groupingStyle: GroupingStyle.Thousand });
      n.setValue('-1234.5');
      expect(el.value).toBe('-1.234,5');
      expect(n.value).toBe('-1234.5');
    });
  });

  describe('one value API', () => {
    it('the value property mirrors getValue()', () => {
      const { n } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      n.setValue('9876.5');
      expect(n.value).toBe('9876.5');
    });

    it('en-US raw has no grouping', () => {
      const { n, el } = make({ groupingStyle: GroupingStyle.Thousand });
      typeString(el, '1234567.5');
      expect(el.value).toBe('1,234,567.5');
      expect(n.value).toBe('1234567.5');
    });
  });

  describe('paste (ADR 0006)', () => {
    it.each([
      ['de-DE', '1.234', '1.234', '1234'],
      ['de-DE', '1.234.567', '1.234.567', '1234567'],
      ['de-DE', '1.5', '1,5', '1.5'],
      ['de-DE', '12.34', '12,34', '12.34'],
      ['de-DE', '1,5', '1,5', '1.5'],
      ['de-DE', '1,234', '1,234', '1.234'],
      ['de-DE', '1.234,56', '1.234,56', '1234.56'],
      ['de-DE', '1,234,567.89', '1.234.567,89', '1234567.89'],
      ['en-US', '1.234', '1.234', '1.234'],
      ['en-US', '1,234', '1,234', '1234'],
      ['en-US', '1,5', '1.5', '1.5'],
      ['en-US', '1.234,56', '1,234.56', '1234.56'],
    ])('%s paste %s displays %s with raw %s', (locale, clip, display, raw) => {
      const { el, n } = make({ locale, groupingStyle: GroupingStyle.Thousand });
      pasteInto(el, clip);
      expect(el.value).toBe(display);
      expect(n.value).toBe(raw);
    });

    it('core paste handler returns canonical raw for de-DE 1.234,56', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      const res = handleOnPasteNumoraInput(
        {
          target: input,
          clipboardData: { getData: () => '1.234,56' },
          preventDefault() {},
        } as unknown as ClipboardEvent,
        8,
        { locale: 'de-DE', decimalSeparator: ',', thousandSeparator: '.', groupingStyle: GroupingStyle.Thousand, formatOn: FormatOn.Change }
      );
      document.body.removeChild(input);
      expect(res.type).toBe('handled');
      if (res.type === 'handled') {
        expect(res.raw).toBe('1234.56');
        expect(res.formatted).toBe('1.234,56');
      }
    });

    it('de-DE paste 1,5e3 expands scientific notation to 1500', () => {
      const { el, n } = make({ locale: 'de-DE', groupingStyle: GroupingStyle.Thousand });
      pasteInto(el, '1,5e3');
      expect(n.value).toBe('1500');
    });

    it('de-DE paste 1.5k expands compact notation to 1500', () => {
      const { el, n } = make({
        locale: 'de-DE',
        allowCompactNotation: true,
        groupingStyle: GroupingStyle.Thousand,
      });
      pasteInto(el, '1.5k');
      expect(n.value).toBe('1500');
    });
  });

  describe('displayToRawValue', () => {
    it('strips the thousand separator before swapping the decimal', () => {
      expect(
        displayToRawValue('1.234.567,89', { decimalSeparator: ',', thousandSeparator: '.' })
      ).toBe('1234567.89');
    });
    it('leaves en-US text untouched apart from grouping', () => {
      expect(displayToRawValue('1,234.5', { decimalSeparator: '.', thousandSeparator: ',' })).toBe(
        '1234.5'
      );
    });
  });
});
