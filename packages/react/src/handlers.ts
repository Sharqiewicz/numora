import type React from 'react';
import {
  handleOnChangeNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
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
  handleOnChangeNumoraInput(
    e.nativeEvent as unknown as Event,
    options.decimalMaxLength,
    options.caretPositionBeforeChange,
    options.formattingOptions
  );

  const target = e.target;
  const rawValue = target.getAttribute('data-raw-value') ?? undefined;
  if (rawValue) {
    target.removeAttribute('data-raw-value');
  }

  return {
    value: target.value,
    rawValue,
  };
}

export function handleNumoraOnPaste(
  e: React.ClipboardEvent<HTMLInputElement>,
  options: Omit<BaseOptions, 'caretPositionBeforeChange'>
): PasteResult {
  const value = handleOnPasteNumoraInput(
    e.nativeEvent as ClipboardEvent,
    options.decimalMaxLength,
    options.formattingOptions
  );

  const target = e.target as HTMLInputElement;
  const rawValue = target.getAttribute('data-raw-value') ?? undefined;
  if (rawValue) {
    target.removeAttribute('data-raw-value');
  }

  return {
    value,
    rawValue,
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
  // If formatOn is blur, force formatting on blur by invoking change handler logic
  if (options.formattingOptions.formatOn === FormatOn.Blur) {
    handleOnChangeNumoraInput(
      e.nativeEvent as unknown as Event,
      options.decimalMaxLength,
      undefined,
      { ...options.formattingOptions, formatOn: FormatOn.Change }
    );
  }

  const target = e.target;
  const rawValue = target.getAttribute('data-raw-value') ?? undefined;
  if (rawValue) {
    target.removeAttribute('data-raw-value');
  }

  return {
    value: target.value,
    rawValue,
  };
}
