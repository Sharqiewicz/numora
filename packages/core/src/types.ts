
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
    decimalSeparator?: string;
    decimalMaxLength?: number;
    decimalMinLength?: number;
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