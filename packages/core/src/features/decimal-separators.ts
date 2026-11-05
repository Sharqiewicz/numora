/**
 * Non-ASCII glyphs that function as a decimal separator on some keyboard/locale but are
 * not the plain `.` or `,` this library's `beforeinput` keystroke remap already
 * understands (see `handleOnBeforeInputNumoraInput` in `utils/event-handlers.ts`).
 * `removeNonNumericCharacters` treats anything outside `[0-9<decimalSeparator>]` as noise,
 * so without this normalization one of these glyphs is silently dropped rather than
 * parsed as a decimal point - e.g. pasting "٫٥" (Arabic decimal separator + Arabic-Indic
 * five) under an en-US config became "5", a 10x value error.
 *
 * - U+066B ARABIC DECIMAL SEPARATOR (٫) - the native decimal mark for ar-EG/fa-IR;
 *   `getSeparatorsFromLocale` can configure this as the resolved `decimalSeparator`, in
 *   which case normalizing it below is a harmless no-op.
 * - U+060C ARABIC COMMA (،)
 * - U+FF0C FULLWIDTH COMMA (，)
 * - U+FF0E FULLWIDTH FULL STOP (．)
 * - U+3002 IDEOGRAPHIC FULL STOP (。)
 *
 * Deliberately NOT included: U+066C ARABIC THOUSANDS SEPARATOR (٬) - it is a grouping
 * mark, never a decimal mark, and must never be remapped to the decimal separator.
 */
export const NON_ASCII_DECIMAL_SEPARATOR_GLYPHS = [
  '٫', // ٫ ARABIC DECIMAL SEPARATOR
  '،', // ، ARABIC COMMA
  '，', // ， FULLWIDTH COMMA
  '．', // ． FULLWIDTH FULL STOP
  '。', // 。 IDEOGRAPHIC FULL STOP
] as const;

/**
 * Maps the non-ASCII decimal-separator glyphs above to the configured `decimalSeparator`.
 *
 * A glyph is left untouched when it is itself the configured `thousandSeparator` - a
 * config that (unusually) reuses one of these glyphs as its grouping mark must still be
 * respected, and ar-EG's real thousands mark (U+066C) is not in the table at all so it is
 * never a concern here. A glyph that already equals `decimalSeparator` maps to itself
 * (no-op).
 *
 * Runs in `sanitizeNumoraInput` right after digit/minus normalization and before
 * compact/scientific-notation expansion, so an expandable token like "١٫٥k" already has
 * its separator in the configured form by the time those expanders run.
 *
 * @example
 * normalizeDecimalSeparators("٫٥", ".") // Returns: ".5"
 * normalizeDecimalSeparators("１２３．４５", ".") // Returns: "123.45" (paired with normalizeDigits)
 */
export function normalizeDecimalSeparators(
  value: string,
  decimalSeparator: string = '.',
  thousandSeparator?: string
): string {
  let result = value;

  for (const glyph of NON_ASCII_DECIMAL_SEPARATOR_GLYPHS) {
    if (glyph === thousandSeparator) continue;
    if (glyph === decimalSeparator) continue;
    if (result.indexOf(glyph) === -1) continue;
    result = result.split(glyph).join(decimalSeparator);
  }

  return result;
}
