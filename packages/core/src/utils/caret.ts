/**
 * Caret placement computed from the edit itself.
 *
 * The caret rank after an edit is the rank of the text that stood BEFORE the caret, as it
 * would look after sanitization: everything left of the edit plus the inserted text, run
 * through the same pipeline as the full value (separators removed, leading zeros dropped,
 * notation expanded, decimals trimmed). That rank is then selected in the final display
 * string. Because the prefix is rebuilt from the edit rather than guessed from a diff, edits
 * that change the value in several places (paste with a decimal trim, a leading zero that
 * vanishes, `1k` expanding) land correctly.
 *
 * Callers pass text that is already in the field's own locale format (typed text is remapped
 * to the field's decimal key, pasted text is normalized before being combined). Foreign-format
 * detection is whole-token, so a prefix is never re-detected in isolation: see
 * {@link computeCaretAfterRewrite} for the one path that has no pre-normalized text.
 */
import { positionAfterMatchedPrefix } from '../features/formatting/rank-select';
import { sanitizeAndTrim } from './format-utils';
import type { NumoraOptions } from '../types';

/**
 * @param textBeforeCaret - the post-edit text up to the caret: left part + inserted text
 * @param formatted - the final display string
 * @param shouldRemoveThousandSeparators - same flag the full value was formatted with
 * @returns the caret index in `formatted`
 */
export function computeCaretFromEdit(
  textBeforeCaret: string,
  formatted: string,
  decimalMaxLength: number,
  formattingOptions: NumoraOptions | undefined,
  shouldRemoveThousandSeparators?: boolean
): number {
  const prefix = sanitizeAndTrim(
    textBeforeCaret,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators
  );
  const pos = positionAfterMatchedPrefix(formatted, prefix, formattingOptions?.thousandSeparator ?? '');
  // Nothing matched although the caret had a non-zero digit to its left: the edit re-read the
  // whole value (`1e|5` + `-` -> `0.00001`), so no character of the old left context survives.
  // The end is the only sensible place; a prefix of zeros only (leading-zero removal) keeps 0.
  if (pos === 0 && /[1-9]/.test(prefix)) return formatted.length;
  return pos;
}

/**
 * Caret for an `input` event that `beforeinput` did not handle (autofill, IME commit,
 * programmatic dispatch): there is no edit, only the browser's value and caret. Shared by the
 * vanilla class and the React component.
 *
 * The value may be foreign-formatted, and detection looks at the whole token, so the prefix
 * can only be read in isolation when reading the full value as the field's own text gives the
 * same result as detecting it. When they differ the text was re-interpreted wholesale and no
 * per-character mapping exists, so the caret goes to the end.
 *
 * @param focused - unfocused fields have no typing caret: it goes to the end
 */
export function computeCaretAfterRewrite(
  value: string,
  caret: number,
  formatted: string,
  decimalMaxLength: number,
  formattingOptions: NumoraOptions | undefined,
  focused: boolean
): number {
  if (!focused || caret >= value.length) return formatted.length;
  const asDisplay = sanitizeAndTrim(
    value,
    decimalMaxLength,
    formattingOptions,
    undefined,
    'display'
  );
  const asForeign = sanitizeAndTrim(
    value,
    decimalMaxLength,
    formattingOptions,
    undefined,
    'foreign'
  );
  if (asDisplay !== asForeign) return formatted.length;
  return computeCaretFromEdit(
    value.slice(0, caret),
    formatted,
    decimalMaxLength,
    formattingOptions
  );
}
