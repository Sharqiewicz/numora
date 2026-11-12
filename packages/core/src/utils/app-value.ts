import { isProduction } from './locale';

/**
 * An app-supplied value as a string. A value that is not a Raw value (digits, at most one
 * `.`, an optional leading `-`, an optional exponent, a compact suffix when `compact`) is
 * still read, with a development warning each time (ADR 0015). So is a number that gets
 * past the types (plain JS, `as any`): it may already have lost precision (`0.1 + 0.2` is
 * `0.30000000000000004`).
 */
export function appValue(value: unknown, where: string, compact?: boolean): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (!isProduction()) {
    if (typeof value !== 'string')
      console.warn(
        `[numora] ${where} received a ${typeof value} (${text}); pass a string such as "1234.5". A number may already have lost precision.`
      );
    else if (!(compact ? /^-?\d*\.?\d*(e[+-]?\d+|[kmbt])?$/i : /^-?\d*\.?\d*(e[+-]?\d+)?$/i).test(text))
      console.warn(
        `[numora] ${where} received ${JSON.stringify(text)}; pass a raw value such as "1234.5" (parseValue() turns formatted text into one).`
      );
  }
  return text;
}

let warnedServerLocale = false;

/**
 * Development-only, once: `locale: true` reads the locale of whatever machine renders. On a
 * server that is the server's, so the HTML can differ from what the browser hydrates.
 */
export function warnServerLocale(locale: unknown): void {
  if (locale !== true || typeof window !== 'undefined' || warnedServerLocale || isProduction()) return;
  warnedServerLocale = true;
  console.warn(
    '[numora] locale={true} was rendered on the server, so the field uses the server\'s locale and may not match the browser on hydration. Pass an explicit tag such as locale="de-DE".'
  );
}
