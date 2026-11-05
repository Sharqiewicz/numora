/**
 * Behavioral tests for the audit-2 fixes to `handleOnBeforeInputNumoraInput`:
 *
 * - A2-04: a typed key that equals the configured `thousandSeparator` (and differs from
 *   `decimalSeparator`) is rejected outright instead of being remapped to the decimal
 *   separator. Typing "1,000,000" under an en-US config (thousand ',', decimal '.') must
 *   no longer parse each comma as a decimal point.
 * - A2-05: the same remap-or-reject rule applies to the non-ASCII glyphs that function as
 *   a decimal mark on some keyboard/locale (Arabic decimal separator, Arabic comma,
 *   fullwidth comma, fullwidth full stop, ideographic full stop).
 * - A2-08: a throwing `isAllowed` is treated as "not allowed" (reject) instead of
 *   propagating out of the handler, and the error is reported via `console.error` rather
 *   than swallowed silently.
 */
import { describe, expect, it, vi } from 'vitest';
import { handleOnBeforeInputNumoraInput } from '@/utils/event-handlers';
import { InputType } from '@/types';
import type { FormattingOptions } from '@/types';

function makeInput(
  value = '',
  selectionStart = 0,
  selectionEnd = selectionStart
): HTMLInputElement {
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

describe('A2-04 — thousand-separator key is rejected, not remapped to decimal', () => {
  it('en-US (thousand ",", decimal "."): "," typed is rejected', () => {
    const input = makeInput('1', 1, 1);
    const opts: FormattingOptions = { thousandSeparator: ',', decimalSeparator: '.' };
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, ','),
      18,
      opts
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('en-US: "." typed still inserts the decimal separator', () => {
    const input = makeInput('1', 1, 1);
    const opts: FormattingOptions = { thousandSeparator: ',', decimalSeparator: '.' };
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '.'),
      18,
      opts
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.raw).toBe('1.');
    }
  });

  it('de-DE (thousand ".", decimal ","): "." typed is the decimal key (ADR 0005, supersedes A2-04)', () => {
    const input = makeInput('1', 1, 1);
    const opts: FormattingOptions = { thousandSeparator: '.', decimalSeparator: ',' };
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '.'),
      18,
      opts
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('1,');
      expect(result.raw).toBe('1.');
    }
  });

  it('de-DE: "," typed still inserts the decimal separator', () => {
    const input = makeInput('1', 1, 1);
    const opts: FormattingOptions = { thousandSeparator: '.', decimalSeparator: ',' };
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, ','),
      18,
      opts
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.raw).toBe('1.');
    }
  });

  it('thousandSeparator "" (unset/empty): both "," and "." still map to the decimal separator', () => {
    const input = makeInput('1', 1, 1);
    const opts: FormattingOptions = { thousandSeparator: '', decimalSeparator: '.' };
    for (const key of [',', '.']) {
      const el = makeInput('1', 1, 1);
      const result = handleOnBeforeInputNumoraInput(
        makeBeforeInput(el, InputType.InsertText, key),
        18,
        opts
      );
      expect(result.type).toBe('handled');
      if (result.type === 'handled') {
        expect(result.raw).toBe('1.');
      }
    }
  });

  it('thousandSeparator " " (space): both "," and "." still map to the decimal separator', () => {
    const opts: FormattingOptions = { thousandSeparator: ' ', decimalSeparator: '.' };
    for (const key of [',', '.']) {
      const el = makeInput('1', 1, 1);
      const result = handleOnBeforeInputNumoraInput(
        makeBeforeInput(el, InputType.InsertText, key),
        18,
        opts
      );
      expect(result.type).toBe('handled');
      if (result.type === 'handled') {
        expect(result.raw).toBe('1.');
      }
    }
  });

  it('custom decimal "·" with thousand ",": "." maps to "·", "," is rejected', () => {
    const opts: FormattingOptions = { thousandSeparator: ',', decimalSeparator: '·' };

    const dot = makeInput('1', 1, 1);
    const dotResult = handleOnBeforeInputNumoraInput(
      makeBeforeInput(dot, InputType.InsertText, '.'),
      18,
      opts
    );
    expect(dotResult.type).toBe('handled');
    if (dotResult.type === 'handled') {
      expect(dotResult.raw).toBe('1.');
    }

    const comma = makeInput('1', 1, 1);
    const commaResult = handleOnBeforeInputNumoraInput(
      makeBeforeInput(comma, InputType.InsertText, ','),
      18,
      opts
    );
    expect(commaResult).toEqual({ type: 'reject' });
  });

  it('typing "1,000,000" digit-by-digit in en-US Change mode never inserts a decimal point', () => {
    const opts: FormattingOptions = { thousandSeparator: ',', decimalSeparator: '.' };
    const input = makeInput('', 0, 0);
    let raw = '';
    for (const ch of '1,000,000') {
      const result = handleOnBeforeInputNumoraInput(
        makeBeforeInput(input, InputType.InsertText, ch),
        18,
        opts
      );
      if (result.type === 'handled') {
        raw = result.raw;
        input.value = result.formatted;
        input.setSelectionRange(result.cursorPos, result.cursorPos);
      }
      // 'reject' keystrokes (the commas) leave `input`/`raw` untouched.
    }
    expect(raw).toBe('1000000');
  });
});

describe('A2-05 — non-ASCII decimal-separator glyphs follow the same remap-or-reject rule', () => {
  const NON_ASCII_GLYPHS = ['٫', '،', '，', '．', '。'];

  it.each(NON_ASCII_GLYPHS)(
    'en-US: typing %s inserts the configured decimal separator',
    (glyph) => {
      const input = makeInput('12', 2, 2);
      const opts: FormattingOptions = { thousandSeparator: ',', decimalSeparator: '.' };
      const result = handleOnBeforeInputNumoraInput(
        makeBeforeInput(input, InputType.InsertText, glyph),
        18,
        opts
      );
      expect(result.type).toBe('handled');
      if (result.type === 'handled') {
        expect(result.raw).toBe('12.');
      }
    }
  );

  it('ar-EG (decimal "٫", thousand "٬"): typing the native decimal glyph keeps working', () => {
    const input = makeInput('12', 2, 2);
    const opts: FormattingOptions = { thousandSeparator: '٬', decimalSeparator: '٫' };
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '٫'),
      18,
      opts
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.raw).toBe('12.');
    }
  });

  it('a config whose thousandSeparator IS one of the glyphs rejects that glyph as a keystroke', () => {
    const input = makeInput('12', 2, 2);
    const opts: FormattingOptions = { thousandSeparator: '，', decimalSeparator: '.' };
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '，'),
      18,
      opts
    );
    expect(result).toEqual({ type: 'reject' });
  });
});

describe('A2-08 — a throwing isAllowed is treated as reject, not swallowed', () => {
  it('returns reject when isAllowed throws', () => {
    const input = makeInput('1', 1, 1);
    const opts: FormattingOptions = {
      isAllowed: () => {
        throw new Error('boom');
      },
    };
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '2'),
      18,
      opts
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('reports the thrown error via console.error rather than swallowing it', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const input = makeInput('1', 1, 1);
      const err = new Error('boom');
      const opts: FormattingOptions = {
        isAllowed: () => {
          throw err;
        },
      };
      handleOnBeforeInputNumoraInput(makeBeforeInput(input, InputType.InsertText, '2'), 18, opts);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]).toContain(err);
    } finally {
      spy.mockRestore();
    }
  });

  it('does not throw synchronously (the caller can safely call preventDefault)', () => {
    const input = makeInput('1', 1, 1);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const opts: FormattingOptions = {
        isAllowed: () => {
          throw new Error('boom');
        },
      };
      expect(() =>
        handleOnBeforeInputNumoraInput(makeBeforeInput(input, InputType.InsertText, '2'), 18, opts)
      ).not.toThrow();
    } finally {
      spy.mockRestore();
    }
  });
});
