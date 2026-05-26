/**
 * Purity contract tests.
 *
 * The v3 architecture requires that `handleOnBeforeInputNumoraInput` and
 * `handleOnPasteNumoraInput` be pure: they compute a result but do not mutate the
 * input element, do not call `preventDefault()`, and do not dispatch events. The
 * caller (vanilla `NumoraInput` class, React component) owns those side effects.
 *
 * If these tests fail, an unintentional side effect has crept back into a helper.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  handleOnBeforeInputNumoraInput,
  handleOnPasteNumoraInput,
} from '@/utils/event-handlers';
import { InputType } from '@/types';

function makeInput(initialValue = '', selectionStart = 0, selectionEnd = 0): HTMLInputElement {
  const input = document.createElement('input');
  input.value = initialValue;
  document.body.appendChild(input);
  input.focus();
  input.setSelectionRange(selectionStart, selectionEnd);
  return input;
}

describe('event-handler purity contract', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    input = makeInput();
  });

  afterEach(() => {
    input.remove();
  });

  describe('handleOnBeforeInputNumoraInput', () => {
    it('does not mutate input.value when result is handled', () => {
      input.value = '12';
      input.setSelectionRange(2, 2);
      const before = input.value;

      const e = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: '3',
      });
      Object.defineProperty(e, 'target', { value: input });

      const result = handleOnBeforeInputNumoraInput(e, 10);

      expect(result.type).toBe('handled');
      expect(input.value).toBe(before);
    });

    it('does not mutate input.value when result is reject', () => {
      input.value = '1.5';
      input.setSelectionRange(3, 3);
      const before = input.value;

      const e = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: '.',
      });
      Object.defineProperty(e, 'target', { value: input });

      const result = handleOnBeforeInputNumoraInput(e, 10);

      expect(result.type).toBe('reject');
      expect(input.value).toBe(before);
    });

    it('does not call preventDefault', () => {
      input.value = '1';
      input.setSelectionRange(1, 1);

      const e = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: '2',
      });
      Object.defineProperty(e, 'target', { value: input });
      const preventDefaultSpy = vi.spyOn(e, 'preventDefault');

      handleOnBeforeInputNumoraInput(e, 10);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('does not dispatch any events on the input', () => {
      input.value = '1';
      input.setSelectionRange(1, 1);

      const listener = vi.fn();
      input.addEventListener('input', listener);
      input.addEventListener('change', listener);
      input.addEventListener('beforeinput', listener);

      const e = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: '2',
      });
      Object.defineProperty(e, 'target', { value: input });

      handleOnBeforeInputNumoraInput(e, 10);

      expect(listener).not.toHaveBeenCalled();
    });

    it('returns skip for InsertFromPaste without touching the input', () => {
      input.value = 'abc';
      const e = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: InputType.InsertFromPaste,
      });
      Object.defineProperty(e, 'target', { value: input });
      const preventDefaultSpy = vi.spyOn(e, 'preventDefault');

      const result = handleOnBeforeInputNumoraInput(e, 10);

      expect(result.type).toBe('skip');
      expect(input.value).toBe('abc');
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('produces deterministic results for the same input (idempotent)', () => {
      input.value = '12';
      input.setSelectionRange(2, 2);

      const makeEvent = () => {
        const e = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: '3',
        });
        Object.defineProperty(e, 'target', { value: input });
        return e;
      };

      const first = handleOnBeforeInputNumoraInput(makeEvent(), 10);
      const second = handleOnBeforeInputNumoraInput(makeEvent(), 10);

      expect(first).toEqual(second);
    });
  });

  describe('handleOnPasteNumoraInput', () => {
    const makePasteEvent = (
      el: HTMLInputElement,
      pasted: string,
      overrides: Partial<ClipboardEvent> = {}
    ): ClipboardEvent => ({
      target: el,
      preventDefault: vi.fn(),
      clipboardData: { getData: vi.fn().mockReturnValue(pasted) },
      ...overrides,
    } as unknown as ClipboardEvent);

    it('does not mutate input.value', () => {
      input.value = '1';
      input.setSelectionRange(1, 1);
      const before = input.value;

      const e = makePasteEvent(input, '234');
      const result = handleOnPasteNumoraInput(e, 10);

      expect(result.type).toBe('handled');
      expect(input.value).toBe(before);
    });

    it('does not call preventDefault', () => {
      input.value = '';
      input.setSelectionRange(0, 0);

      const preventDefault = vi.fn();
      const e = makePasteEvent(input, '42', { preventDefault });

      handleOnPasteNumoraInput(e, 10);

      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('does not dispatch any events on the input', () => {
      input.value = '';
      input.setSelectionRange(0, 0);

      const listener = vi.fn();
      input.addEventListener('input', listener);
      input.addEventListener('change', listener);
      input.addEventListener('paste', listener);

      const e = makePasteEvent(input, '42');
      handleOnPasteNumoraInput(e, 10);

      expect(listener).not.toHaveBeenCalled();
    });

    it('rejects via isAllowed without mutating the input', () => {
      input.value = '';
      const before = input.value;

      const e = makePasteEvent(input, '9999');
      const result = handleOnPasteNumoraInput(e, 10, {
        isAllowed: (raw) => Number(raw) <= 100,
      });

      expect(result.type).toBe('reject');
      expect(input.value).toBe(before);
    });
  });
});
