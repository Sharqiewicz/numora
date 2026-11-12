import { isProduction } from './locale';

/**
 * An app-supplied value as a string. The types only allow a string; a number that gets past
 * them (plain JS, `as any`) is still shown, with a development warning, because it may
 * already have lost precision (`0.1 + 0.2` is `0.30000000000000004`).
 */
export function appValue(value: unknown, where: string): string {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return '';
  if (!isProduction())
    console.warn(
      `[numora] ${where} received a ${typeof value} (${String(value)}); pass a string such as "1234.5". A number may already have lost precision.`
    );
  return String(value);
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
