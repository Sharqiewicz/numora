import type React from 'react';
import {
  handleOnChangeNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
  formatValueForDisplay,
  type CaretPositionInfo,
  type FormattingOptions,
  FormatOn,
} from 'numora';

type ChangeResult = {
  value: string;
  rawValue?: string;
};

type PasteResult = ChangeResult;
type BlurResult = ChangeResult;

type BaseOptions = {
  decimalMaxLength: number;
  caretPositionBeforeChange?: CaretPositionInfo;
  formattingOptions: FormattingOptions & { rawValueMode?: boolean };
};

export function handleNumoraOnChange(
  e: React.ChangeEvent<HTMLInputElement>,
  options: BaseOptions
): ChangeResult {
  const { formatted, raw } = handleOnChangeNumoraInput(
    e.nativeEvent as unknown as Event,
    options.decimalMaxLength,
    options.caretPositionBeforeChange,
    options.formattingOptions
  );

  return {
    value: formatted,
    rawValue: raw,
  };
}

export function handleNumoraOnPaste(
  e: React.ClipboardEvent<HTMLInputElement>,
  options: Omit<BaseOptions, 'caretPositionBeforeChange'>
): PasteResult {
  const { formatted, raw } = handleOnPasteNumoraInput(
    e.nativeEvent as ClipboardEvent,
    options.decimalMaxLength,
    options.formattingOptions
  );

  return {
    value: formatted,
    rawValue: raw,
  };
}

export function handleNumoraOnKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  formattingOptions: FormattingOptions
): CaretPositionInfo | undefined {
  return handleOnKeyDownNumoraInput(
    e.nativeEvent as unknown as KeyboardEvent,
    formattingOptions
  );
}

export function handleNumoraOnBlur(
  e: React.FocusEvent<HTMLInputElement>,
  options: {
    decimalMaxLength: number;
    formattingOptions: FormattingOptions & { rawValueMode?: boolean };
  }
): BlurResult {
  if (options.formattingOptions.formatOn === FormatOn.Blur) {
    const { formatted, raw } = formatValueForDisplay(
      e.target.value,
      options.decimalMaxLength,
      { ...options.formattingOptions, formatOn: FormatOn.Change }
    );
    return {
      value: formatted,
      rawValue: raw,
    };
  }

  return {
    value: e.target.value,
    rawValue: undefined,
  };
}
