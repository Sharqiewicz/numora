
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


export interface FormattingOptions {
    formatOn?: 'blur' | 'change';
    thousandSeparator?: string;
    ThousandStyle?: ThousandStyle;
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