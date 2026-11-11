import { describe, it, expect } from 'vitest';
import { NumoraInput, FormatOn } from '../src/index';

const mk = () => {
  const el = document.createElement('input');
  document.body.appendChild(el);
  return el;
};

describe('decimalSeparator alone', () => {
  it("',' resolves a '.' thousand separator", () => {
    const el = mk();
    const n = new NumoraInput(el, { decimalSeparator: ',', formatOn: FormatOn.Change });
    n.setValue('1234.5');
    expect(el.value).toBe('1.234,5');
    expect(n.rawValue).toBe('1234.5');
  });
  it('explicit conflict still throws', () => {
    expect(() => new NumoraInput(mk(), { decimalSeparator: ',', thousandSeparator: ',' })).toThrow();
  });
  it("'.' alone is unchanged", () => {
    const el = mk();
    const n = new NumoraInput(el, { decimalSeparator: '.' });
    n.setValue('1234.5');
    expect(el.value).toBe('1,234.5');
  });
  it('locale-derived separators are unchanged', () => {
    const el = mk();
    const n = new NumoraInput(el, { locale: 'de-DE' });
    n.setValue('1234.5');
    expect(el.value).toBe('1.234,5');
  });
});

describe('re-init after destroy', () => {
  it('re-init with the same locale keeps the value', () => {
    const el = mk();
    el.value = '1234.56';
    const a = new NumoraInput(el, { locale: 'de-DE' });
    expect(el.value).toBe('1.234,56');
    a.destroy();
    const b = new NumoraInput(el, { locale: 'de-DE' });
    expect(el.value).toBe('1.234,56');
    expect(b.rawValue).toBe('1234.56');
  });
  it('re-init with a different locale reformats the raw value', () => {
    const el = mk();
    el.value = '1234.56';
    new NumoraInput(el, { locale: 'de-DE' }).destroy();
    const b = new NumoraInput(el, { locale: 'en-US' });
    expect(el.value).toBe('1,234.56');
    expect(b.rawValue).toBe('1234.56');
  });
  it('a value the app wrote after destroy is read as canonical', () => {
    const el = mk();
    el.value = '1234.56';
    const a = new NumoraInput(el, { locale: 'de-DE' });
    a.destroy();
    el.value = '99.5';
    const b = new NumoraInput(el, { locale: 'de-DE' });
    expect(el.value).toBe('99,5');
    expect(b.rawValue).toBe('99.5');
  });
  it('a second destroy() after an app write does not record the app text', () => {
    const el = mk();
    el.value = '1234.56';
    const a = new NumoraInput(el, { locale: 'de-DE' });
    a.destroy();
    el.value = '1234.5';
    a.destroy();
    const b = new NumoraInput(el, { locale: 'de-DE' });
    expect(el.value).toBe('1.234,5');
  });
  it('a fresh adopted element is still read as canonical', () => {
    const el = mk();
    el.value = '1234.5';
    new NumoraInput(el, { locale: 'de-DE' });
    expect(el.value).toBe('1.234,5');
  });
});
