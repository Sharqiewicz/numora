/**
 * When to apply thousand-separator grouping. Defined as an `as const` object (not a TS
 * `enum`) so callers can pass the string literal (`formatOn: 'blur'`) without importing
 * anything, while `FormatOn.Blur` still works as a value. Also avoids a runtime enum
 * artifact and stays tree-shakable.
 */
export const FormatOn = {
  Blur: 'blur',
  Change: 'change',
} as const;
export type FormatOn = (typeof FormatOn)[keyof typeof FormatOn];

/**
 * Digit-grouping style. `thousand` = Western 1,234,567; `lakh` = Indian 12,34,567;
 * `wan` = East-Asian myriad 123,4567; `none` = no grouping. `as const` object for the
 * same reasons as {@link FormatOn} - `GroupingStyle.Lakh` and the literal `'lakh'` both work.
 */
export const GroupingStyle = {
  None: 'none',
  Thousand: 'thousand',
  Lakh: 'lakh',
  Wan: 'wan',
} as const;
export type GroupingStyle = (typeof GroupingStyle)[keyof typeof GroupingStyle];

/**
 * Loose autocomplete for the `locale` option. Separators are derived from
 * `Intl.NumberFormat`, so ANY valid BCP-47 tag is accepted - the listed tags are only
 * IDE suggestions. The `(string & {})` member keeps the type open while still surfacing
 * the common cases in autocomplete.
 */
export type LocaleTag =
  | 'en-US'
  | 'en-GB'
  | 'de-DE'
  | 'fr-FR'
  | 'es-ES'
  | 'it-IT'
  | 'nl-NL'
  | 'ja-JP'
  | 'zh-CN'
  | 'hi-IN'
  | 'pt-BR'
  | 'ru-RU'
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

/**
 * Named constants for the W3C InputEvent `inputType` strings used by NumoraInput's
 * beforeinput/input handlers. Defined as an `as const` object (not a TS `enum`) to
 * avoid a runtime artifact and to stay tree-shakable.
 *
 * Reference for the full set of `inputType` values:
 *   - MDN: https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/inputType
 *   - W3C Input Events spec: https://w3c.github.io/input-events/
 */
export const InputType = {
  InsertText: 'insertText',
  InsertFromPaste: 'insertFromPaste',
  InsertFromDrop: 'insertFromDrop',
  DeleteContentBackward: 'deleteContentBackward',
  DeleteContentForward: 'deleteContentForward',
  DeleteByCut: 'deleteByCut',
  DeleteByDrag: 'deleteByDrag',
  DeleteSoftLineBackward: 'deleteSoftLineBackward',
  DeleteHardLineBackward: 'deleteHardLineBackward',
  DeleteSoftLineForward: 'deleteSoftLineForward',
  DeleteHardLineForward: 'deleteHardLineForward',
  DeleteWordBackward: 'deleteWordBackward',
  DeleteWordForward: 'deleteWordForward',
  HistoryUndo: 'historyUndo',
  HistoryRedo: 'historyRedo',
} as const;
export type InputType = (typeof InputType)[keyof typeof InputType];

/**
 * Every Numora option, defined once. The vanilla `NumoraInputOptions`, the React
 * `NumoraInputProps` and the headless helpers all take this same shape.
 */
export interface NumoraOptions {
  /**
   * Derive `thousandSeparator`, `decimalSeparator` and `groupingStyle` from a BCP 47 tag
   * (`'de-DE'`), or from the runtime's own locale (`true`). An explicitly passed separator
   * or grouping style still wins.
   */
  locale?: LocaleTag | true;
  formatOn?: FormatOn;
  /**
   * Grouping mark. Exactly ONE character (UTF-16 code unit), or `''` for none; anything else
   * throws in `validateNumoraInputOptions`. Caret and sanitization code relies on this and
   * compares one character at a time.
   */
  thousandSeparator?: string;
  /**
   * Digit-grouping style. When `locale` is set and this is left unset, the style is derived
   * from the locale (Indic locales -> `lakh`).
   * @defaultValue 'thousand'
   */
  groupingStyle?: GroupingStyle;
  enableCompactNotation?: boolean;
  /**
   * When true (the default), pasted scientific notation is expanded (`1.5e-7` →
   * `0.00000015`). When false, such a paste is rejected and the field is left unchanged,
   * because dropping the `e` would silently change the number (`1.5e-7` → `1.57`). Values supplied by
   * the app (`value`, `defaultValue`, `setValue`) are always expanded, since JS prints large
   * and small numbers this way (`String(1e21)` is `"1e+21"`).
   */
  enableScientificNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  /**
   * When true, a bare leading decimal separator gets a `0` prepended (`.5` → `0.5`,
   * `-.5` → `-0.5`). Useful for currency-style fields where leading-decimal entry is
   * common but `0.` form is the canonical representation.
   */
  autoAddLeadingZero?: boolean;
  /** Decimal mark. Exactly ONE character (enforced by `validateNumoraInputOptions`). */
  decimalSeparator?: string;
  /**
   * Maximum number of decimal places; extra digits are truncated, never rounded. Defaults to
   * 18 (most ERC-20 tokens). Fiat/checkout fields typically set this to 2.
   */
  decimalMaxLength?: number;
  /** Minimum decimal places, zero-padded on display/blur only - never per keystroke. */
  decimalMinLength?: number;
  /**
   * Maximum length of the raw (unformatted) value. Counts digits, the decimal separator,
   * and a leading `-`. Thousand separators are NOT counted. Applied at the end of the
   * sanitization pipeline and enforced at keystroke time so the user cannot type past it.
   *
   * Counts raw characters *after sanitization* - i.e. the length of the value once
   * grouping separators are stripped and before `decimalMinLength` padding is applied.
   * Grouping separators and `decimalMinLength` padding never count against the cap.
   *
   * This is a hard cap on TOTAL raw characters and is applied before decimal trimming, so
   * it can reduce the number of decimal places below `decimalMaxLength`. Example:
   * `maxLength: 4` with `decimalMaxLength: 18` truncates `1.23456789` to `1.23` (4 chars),
   * not to 18 decimals. If you only mean to cap the fractional part, use `decimalMaxLength`
   * and leave `maxLength` unset.
   *
   * Do not also pass `maxLength` as a native HTML attribute - that one counts formatted
   * characters (commas included) and would double-count.
   */
  maxLength?: number;
  /**
   * Custom keystroke/paste validator. Called with the post-sanitization raw value the
   * input would have after the user's action. Return false to reject the edit (no value
   * change, no onChange fires, undo history is untouched).
   */
  isAllowed?: (rawValue: string) => boolean;
}

/**
 * Payload of every change notification (vanilla `onChange`, React `onValueChange`).
 * `value` is the canonical raw value (ASCII digits, `.` decimal, `-` sign, no grouping, the
 * same for every locale); `formattedValue` is the string shown in the field.
 */
export interface NumoraValues {
  value: string;
  formattedValue: string;
}

export interface SeparatorOptions {
  decimalSeparator?: string;
  thousandSeparator?: string;
}

export interface Separators {
  decimalSeparator: string;
  thousandSeparator?: string;
}
