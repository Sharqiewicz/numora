
export enum FormatOn {
    Blur = 'blur',
    Change = 'change',
}

export enum ThousandStyle {
    None = 'none',
    Thousand = 'thousand',
    Lakh = 'lakh',
    Wan = 'wan',
}

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
    HistoryUndo: 'historyUndo',
    HistoryRedo: 'historyRedo',
} as const;
export type InputType = (typeof InputType)[keyof typeof InputType];


export interface FormattingOptions {
    formatOn?: FormatOn;
    thousandSeparator?: string;
    thousandStyle?: ThousandStyle;
    enableCompactNotation?: boolean;
    enableNegative?: boolean;
    enableLeadingZeros?: boolean;
    /**
     * When true, a bare leading decimal separator gets a `0` prepended (`.5` → `0.5`,
     * `-.5` → `-0.5`). Useful for currency-style fields where leading-decimal entry is
     * common but `0.` form is the canonical representation.
     */
    autoAddLeadingZero?: boolean;
    decimalSeparator?: string;
    decimalMaxLength?: number;
    decimalMinLength?: number;
    /**
     * Maximum length of the raw (unformatted) value. Counts digits, the decimal separator,
     * and a leading `-`. Thousand separators are NOT counted. Applied at the end of the
     * sanitization pipeline and enforced at keystroke time so the user cannot type past it.
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
    rawValueMode?: boolean;
}


export interface CaretPositionInfo {
    selectionStart?: number;
    selectionEnd?: number;
    endOffset?: number;
}

export interface SeparatorOptions {
    decimalSeparator?: string;
    thousandSeparator?: string;
}

export interface Separators {
    decimalSeparator: string;
    thousandSeparator?: string;
}