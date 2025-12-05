import { thousandStyle } from "./utils/formatting";

export type FormatOn = 'blur' | 'change';

export interface FormattingOptions {
    formatOn?: 'blur' | 'change';
    thousandSeparator?: string;
    thousandStyle?: thousandStyle;
    enableCompactNotation?: boolean;
    enableNegative?: boolean;
    enableLeadingZeros?: boolean;
    decimalSeparator?: string;
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