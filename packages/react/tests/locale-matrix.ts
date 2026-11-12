import { act } from '@testing-library/react';

/** Shared by the locale-matrix tests (react-hook-form, Torph, NumberFlow). */

export const LOCALES = [
  'en-US', // 1,234,567.89
  'de-DE', // 1.234.567,89
  'fr-FR', // narrow no-break space group, comma decimal
  'pl-PL', // no-break space group, comma decimal
  'de-CH', // apostrophe group, dot decimal
  'es-ES',
  'pt-BR',
  'sv-SE',
  'ja-JP',
  'en-IN', // lakh grouping: 12,34,567.89
  'hi-IN',
  'ar-EG', // Arabic separators ٬ ٫ and Arabic-Indic digits in Intl output
  'fa-IR', // Persian digits in Intl output
] as const;

export const RAW = '1234567.89';
export const RAW_2 = '9876543.21';

/** What a user of that locale would copy from another app: native digits and all. */
export function native(locale: string, raw: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 18 }).format(Number(raw));
}
/**
 * What the field displays: the locale's own separators and grouping with ASCII digits
 * (Numora never displays native digits).
 */
export function display(locale: string, raw: string): string {
  return native(locale, raw).replace(/\p{Nd}/gu, (d) => {
    const cp = d.codePointAt(0) as number;
    // Unicode decimal digits come in contiguous runs of ten starting at a zero.
    for (let zero = cp; zero > cp - 10; zero--) {
      if (!/\p{Nd}/u.test(String.fromCodePoint(zero - 1))) return String(cp - zero);
    }
    return d;
  });
}
export function decimalOf(locale: string): string {
  return (
    new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === 'decimal')?.value ??
    '.'
  );
}

export function typeChar(el: HTMLInputElement, char: string): void {
  const be = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  el.dispatchEvent(be);
  if (be.defaultPrevented) return;
  const s = el.selectionStart ?? el.value.length;
  const e = el.selectionEnd ?? s;
  el.value = el.value.slice(0, s) + char + el.value.slice(e);
  el.setSelectionRange(s + char.length, s + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}
export function typeText(el: HTMLInputElement, text: string): void {
  act(() => {
    for (const c of text) typeChar(el, c);
  });
}
export function paste(el: HTMLInputElement, text: string): void {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  act(() => {
    el.dispatchEvent(ev);
  });
}
