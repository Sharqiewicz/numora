/**
 * Contract tests for the discriminated-union return types of
 * `handleOnBeforeInputNumoraInput` and `handleOnPasteNumoraInput`.
 *
 * These pin the shape of the public API. Any change to the variants (renaming, dropping,
 * adding fields) will break a wrapper component's switch statement, so this file fails
 * loudly when the contract drifts.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  handleOnBeforeInputNumoraInput,
  handleOnPasteNumoraInput,
  type BeforeInputResult,
  type PasteResult,
} from '@/utils/event-handlers';
import { InputType } from '@/types';

function makeInput(value = '', selectionStart = 0, selectionEnd = selectionStart): HTMLInputElement {
  const el = document.createElement('input');
  el.value = value;
  document.body.appendChild(el);
  el.focus();
  el.setSelectionRange(selectionStart, selectionEnd);
  return el;
}

function makeBeforeInput(
  input: HTMLInputElement,
  inputType: string,
  data: string | null = null
): InputEvent {
  const e = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
    data,
  });
  Object.defineProperty(e, 'target', { value: input });
  return e;
}

function makePasteEvent(input: HTMLInputElement, pasted: string): ClipboardEvent {
  return {
    target: input,
    preventDefault: vi.fn(),
    clipboardData: { getData: vi.fn().mockReturnValue(pasted) },
  } as unknown as ClipboardEvent;
}

describe('BeforeInputResult contract', () => {
  it('returns skip for InsertFromPaste inputType', () => {
    const input = makeInput();
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertFromPaste),
      10
    );
    expect(result).toEqual({ type: 'skip' });
  });

  it('returns skip for InsertFromDrop inputType', () => {
    const input = makeInput();
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertFromDrop),
      10
    );
    expect(result).toEqual({ type: 'skip' });
  });

  it('returns skip for unrecognized inputType', () => {
    const input = makeInput();
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, 'insertReplacementText', 'foo'),
      10
    );
    expect(result).toEqual({ type: 'skip' });
  });

  it('returns reject for duplicate decimal separator', () => {
    const input = makeInput('1.5', 0, 0);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '.'),
      10
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('returns reject when typed digit would overflow maxDecimals', () => {
    const input = makeInput('1.99', 4, 4);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '9'),
      2
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('returns handled with formatted/raw/cursorPos for valid insertion', () => {
    const input = makeInput('12', 2, 2);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '3'),
      10
    );

    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(typeof result.formatted).toBe('string');
      expect(typeof result.raw).toBe('string');
      expect(typeof result.cursorPos).toBe('number');
      expect(result.formatted).toBe('123');
      expect(result.raw).toBe('123');
      expect(result.cursorPos).toBeGreaterThanOrEqual(0);
    }
  });

  it('result type is one of the four declared variants', () => {
    const input = makeInput('1', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '2'),
      10
    );
    const validTypes: BeforeInputResult['type'][] = ['handled', 'reject', 'skip'];
    expect(validTypes).toContain(result.type);
  });

});

describe('PasteResult contract', () => {
  it('returns handled with formatted/raw/cursorPos for normal paste', () => {
    const input = makeInput('', 0, 0);
    const result = handleOnPasteNumoraInput(makePasteEvent(input, '42'), 10);
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(typeof result.formatted).toBe('string');
      expect(typeof result.raw).toBe('string');
      expect(typeof result.cursorPos).toBe('number');
      expect(result.formatted).toBe('42');
      expect(result.raw).toBe('42');
    }
  });

  it('returns reject when isAllowed rejects the resulting raw value', () => {
    const input = makeInput('', 0, 0);
    const result = handleOnPasteNumoraInput(makePasteEvent(input, '9999'), 10, {
      isAllowed: (raw) => Number(raw) <= 100,
    });
    expect(result).toEqual({ type: 'reject' });
  });

  it('result type is one of the two declared variants', () => {
    const input = makeInput();
    const result = handleOnPasteNumoraInput(makePasteEvent(input, '1'), 10);
    const validTypes: PasteResult['type'][] = ['handled', 'reject'];
    expect(validTypes).toContain(result.type);
  });

});
