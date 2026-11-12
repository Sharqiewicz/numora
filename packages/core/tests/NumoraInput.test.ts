import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { handleOnPasteNumoraInput } from '../src/utils/event-handlers';
import { FormatOn, GroupingStyle } from '../src/types';

// ---------------------------------------------------------------------------
// Test helpers - simulate the real browser event sequence for an <input>.
//
// The browser fires:  keydown → beforeinput (cancelable) → input → keyup
//
// All formatting logic lives in the beforeinput handler. Tests that dispatch
// a plain `new Event('input')` bypass it entirely and only exercise the
// handleChange fallback path - leaving the beforeinput path untested.
//
// Use simulateTyping / simulateDelete for tests that should exercise the
// actual formatting code path. Use the plain `value = x` + Event('input')
// pattern only when explicitly testing programmatic / fallback behaviour.
// ---------------------------------------------------------------------------

function simulateTyping(el: HTMLInputElement, char: string): void {
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  el.dispatchEvent(beforeInput);

  if (beforeInput.defaultPrevented) {
    // setRangeText does not synchronously dispatch 'input' in real browsers or jsdom
    // (verified) - handleBeforeInput already broadcast the change itself, so there is
    // nothing left to simulate. Dispatching a synthetic 'input' here would reach
    // handleChange a second time and double-fire onValueChange for every keystroke.
    return;
  }

  // Otherwise simulate the browser's native character insertion.
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  el.value = el.value.slice(0, start) + char + el.value.slice(end);
  el.setSelectionRange(start + char.length, start + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}

function simulateDelete(
  el: HTMLInputElement,
  direction: 'backward' | 'forward' = 'backward'
): void {
  const inputType = direction === 'backward' ? 'deleteContentBackward' : 'deleteContentForward';
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
  });
  el.dispatchEvent(beforeInput);

  if (beforeInput.defaultPrevented) {
    // Same as simulateTyping: handleBeforeInput already broadcast the change; a synthetic
    // 'input' dispatch here would only double-fire onValueChange via handleChange.
    return;
  }

  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  if (start !== end) {
    el.value = el.value.slice(0, start) + el.value.slice(end);
    el.setSelectionRange(start, start);
  } else if (direction === 'backward' && start > 0) {
    el.value = el.value.slice(0, start - 1) + el.value.slice(start);
    el.setSelectionRange(start - 1, start - 1);
  } else if (direction === 'forward') {
    el.value = el.value.slice(0, start) + el.value.slice(start + 1);
    el.setSelectionRange(start, start);
  }
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
}

describe('NumoraInput Component', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function createInputWithPlaceholder(options = {}) {
    const input = new NumoraInput(container, {
      placeholder: '0.0',
      onValueChange: onChangeMock,
      ...options,
    });
    return input;
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('should render the component', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();
    expect(inputElement).not.toBeNull();
    expect(inputElement.placeholder).toBe('0.0');
  });

  it('should allow numeric input', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    inputElement.value = '123';
    inputElement.dispatchEvent(new Event('input'));

    expect(inputElement.value).toBe('123');
  });

  it('should prevent non-numeric input', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    inputElement.value = 'abc';
    inputElement.dispatchEvent(new Event('input'));

    expect(onChangeMock).toHaveBeenCalled();
    expect(inputElement.value).toBe('');
  });

  it('should prevent multiple decimal points', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    // A2-07: an unfocused native input event is formatted for resting display (which
    // strips a trailing separator), so focus first to exercise the typing path.
    inputElement.focus();
    inputElement.value = '1.';
    inputElement.dispatchEvent(new Event('input'));

    const event = new KeyboardEvent('keydown', { key: '.' });
    inputElement.dispatchEvent(event);

    expect(onChangeMock).toHaveBeenCalled();
    expect(inputElement.value).toBe('1.');
  });

  it('should reject comma (default thousand separator) and still block a second period', () => {
    createInputWithPlaceholder({ decimalSeparator: '.', groupingStyle: GroupingStyle.Thousand });
    const inputElement = getInputElement();

    simulateTyping(inputElement, '1');
    simulateTyping(inputElement, ','); // A2-04: comma == thousandSeparator -> rejected, not converted
    expect(inputElement.value).toBe('1');

    simulateTyping(inputElement, '.');
    expect(inputElement.value).toBe('1.');

    simulateTyping(inputElement, '2');
    expect(inputElement.value).toBe('1.2');

    // Typing '.' again should be blocked - decimal already present
    simulateTyping(inputElement, '.');
    expect(inputElement.value).toBe('1.2');

    simulateTyping(inputElement, '3');
    expect(inputElement.value).toBe('1.23');

    // Comma stays rejected
    simulateTyping(inputElement, ',');
    expect(inputElement.value).toBe('1.23');

    expect(onChangeMock).toHaveBeenCalled();
  });

  it('should work with readOnly property', () => {
    createInputWithPlaceholder({ readOnly: true });
    const inputElement = getInputElement();

    expect(inputElement.readOnly).toBe(true);
  });

  // A2-02: a readOnly/disabled field must reject a paste outright, like a native <input> -
  // no write to the field and no onValueChange, even though the handler still preventDefault()s
  // the paste (there is no native paste behaviour to fall back to once we've cancelled it).
  it('should ignore paste and not call onValueChange when readOnly', () => {
    createInputWithPlaceholder({ readOnly: true, defaultValue: '5' });
    const inputElement = getInputElement();

    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(pasteEvent, 'clipboardData', { value: { getData: () => '999' } });
    inputElement.focus();
    inputElement.setSelectionRange(1, 1);
    inputElement.dispatchEvent(pasteEvent);

    expect(inputElement.value).toBe('5');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('should ignore paste and not call onValueChange when disabled', () => {
    createInputWithPlaceholder({ disabled: true, defaultValue: '5' });
    const inputElement = getInputElement();

    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(pasteEvent, 'clipboardData', { value: { getData: () => '999' } });
    inputElement.dispatchEvent(pasteEvent);

    expect(inputElement.value).toBe('5');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('should apply additional className', () => {
    createInputWithPlaceholder({ className: 'extra-style' });
    const inputElement = getInputElement();

    expect(inputElement.className).toBe('extra-style');
  });

  it('should remove leading zeros by default', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    inputElement.value = '007';
    inputElement.dispatchEvent(new Event('input'));

    expect(onChangeMock).toHaveBeenCalled();
    expect(inputElement.value).toBe('7');
  });

  it('should not allow negative numbers by default', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    inputElement.value = '-123';
    inputElement.dispatchEvent(new Event('input'));

    expect(inputElement.value).toBe('123');
  });

  it('should not allow more decimals than decimalMaxLength', () => {
    createInputWithPlaceholder({ decimalMaxLength: 2 });
    const inputElement = getInputElement();

    inputElement.value = '123.456';
    inputElement.dispatchEvent(new Event('input'));

    expect(inputElement.value).toBe('123.45');
  });

  it('should initialize with default value', () => {
    createInputWithPlaceholder({ defaultValue: '123.45' });
    const inputElement = getInputElement();

    expect(inputElement.value).toBe('123.45');
  });

  it('should handle paste events', () => {
    createInputWithPlaceholder({ decimalMaxLength: 3 });
    const inputElement = getInputElement();

    inputElement.value = '123.4567';

    inputElement.dispatchEvent(new Event('paste'));

    expect(inputElement.value).toContain('123.456');
  });

  it('should handle paste events with multiple dots and commas', () => {
    createInputWithPlaceholder({ decimalMaxLength: 2 });
    const inputElement = getInputElement();

    inputElement.value = '123...45,,67.897';
    inputElement.dispatchEvent(new Event('paste'));

    expect(inputElement.value).toContain('123.45');
  });
});

// Paste is read with foreign-format detection (ADR 0006): a run of the same mark more than
// once is grouping, so repeated dots in this junk-input fixture collapse instead of keeping
// the first as a decimal point. Cases with a single dot or stray letters are unchanged.
describe('Paste handler sanitization cases', () => {
  const testCases = [
    { input: '1.......4.....2', decimalMaxLength: 8, expected: '142' },
    { input: '12....34.....56', decimalMaxLength: 8, expected: '123456' },
    { input: '....56789...', decimalMaxLength: 5, expected: '56789' },
    { input: '1.23..4..56.', decimalMaxLength: 6, expected: '123456' },
    { input: '1.....2', decimalMaxLength: 8, expected: '12' },
    { input: '123..4...56.7', decimalMaxLength: 7, expected: '1234567' },
    { input: 'a.b.c.123.4.def56', decimalMaxLength: 8, expected: '.123456' },
    { input: '12abc34....def567', decimalMaxLength: 2, expected: '1234.56' },
    { input: '.....a.b.c......', decimalMaxLength: 8, expected: '.' },
    { input: '12.....3..4..5abc6', decimalMaxLength: 7, expected: '123456' },
    { input: '1a2b3c4d5e.1234567', decimalMaxLength: 4, expected: '12345.1234' },
    { input: '12abc@#34..def$%^567', decimalMaxLength: 2, expected: '1234.56' },
    { input: '....!@#$$%^&*((', decimalMaxLength: 8, expected: '.' },
    { input: '123....abc.def456ghi789', decimalMaxLength: 4, expected: '123.4567' },
    { input: '00.00123...4', decimalMaxLength: 4, expected: '1234' },
    { input: '.1...2.67.865', decimalMaxLength: 3, expected: '1267865' },
    { input: '123abc...', decimalMaxLength: 6, expected: '123.' },
  ];

  it.each(testCases)(
    'should sanitize "$input" to "$expected" with max $decimalMaxLength decimals',
    async ({ input, decimalMaxLength, expected }) => {
      const mockInputElement = document.createElement('input');
      mockInputElement.setSelectionRange = vi.fn();

      const mockEvent = {
        target: mockInputElement,
        preventDefault: vi.fn(),
        clipboardData: {
          getData: vi.fn().mockReturnValue(input),
        },
      } as unknown as ClipboardEvent;

      const result = handleOnPasteNumoraInput(mockEvent, decimalMaxLength);
      expect(result.type).toBe('handled');
      if (result.type === 'handled') {
        expect(result.formatted).toBe(expected);
      }
    }
  );
});

describe('beforeinput event path', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  describe('digit insertion', () => {
    it('should insert a digit via beforeinput', () => {
      new NumoraInput(container, { onValueChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '5');

      expect(el.value).toBe('5');
      expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ value: '5' }));
    });

    it('should build a number character by character', () => {
      new NumoraInput(container, { onValueChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');

      expect(el.value).toBe('123');
    });

    it('should ignore non-numeric characters', () => {
      new NumoraInput(container, { onValueChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, 'a');
      simulateTyping(el, '2');

      expect(el.value).toBe('12');
    });
  });

  describe('decimal separator', () => {
    it('should insert decimal separator', () => {
      new NumoraInput(container, { onValueChange: onChangeMock, decimalMaxLength: 2 });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '.');
      simulateTyping(el, '5');

      expect(el.value).toBe('1.5');
    });

    it('should reject comma when it equals the default thousand separator (A2-04)', () => {
      new NumoraInput(container, {
        onValueChange: onChangeMock,
        decimalSeparator: '.',
        decimalMaxLength: 2,
      });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, ',');

      expect(el.value).toBe('1');
    });

    it('should map a typed dot to the decimal separator in a comma-decimal locale (ADR 0005)', () => {
      new NumoraInput(container, {
        onValueChange: onChangeMock,
        decimalSeparator: ',',
        thousandSeparator: '.',
        decimalMaxLength: 2,
      });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '.'); // ADR 0005: '.' is the decimal key in a comma-decimal locale
      expect(el.value).toBe('1,');
      simulateTyping(el, '.'); // a second decimal is ignored
      expect(el.value).toBe('1,');
      simulateTyping(el, ',');
      expect(el.value).toBe('1,');
    });

    it('should block a second decimal separator', () => {
      new NumoraInput(container, { onValueChange: onChangeMock, decimalMaxLength: 2 });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '.');
      simulateTyping(el, '5');
      simulateTyping(el, '.'); // second dot - should be blocked
      simulateTyping(el, '2');

      expect(el.value).toBe('1.52');
    });

    it('should reject comma as the thousand separator even with a decimal already present', () => {
      new NumoraInput(container, {
        onValueChange: onChangeMock,
        decimalSeparator: '.',
        decimalMaxLength: 2,
      });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '.');
      simulateTyping(el, ','); // comma == thousandSeparator -> rejected (A2-04)

      expect(el.value).toBe('1.');
    });
  });

  describe('delete', () => {
    it('should delete the last character with Backspace', () => {
      new NumoraInput(container, { onValueChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');
      simulateDelete(el, 'backward');

      expect(el.value).toBe('12');
    });

    it('should delete a character forward with Delete', () => {
      new NumoraInput(container, { onValueChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');
      // Move cursor to position 0
      el.setSelectionRange(0, 0);
      simulateDelete(el, 'forward');

      expect(el.value).toBe('23');
    });
  });

  describe('FormatOn.Change - thousand separator', () => {
    it('should add thousand separator when typing 4th digit', () => {
      new NumoraInput(container, {
        onValueChange: onChangeMock,
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
      });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');
      simulateTyping(el, '4');

      expect(el.value).toBe('1,234');
    });

    it('should not select all text when thousand separator is inserted', () => {
      // Regression: setRangeText with 'preserve' mode selected the entire value
      // when the formatted result was longer than the raw input (e.g. 1234 → 1,234).
      new NumoraInput(container, {
        onValueChange: onChangeMock,
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
      });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');
      simulateTyping(el, '4');

      expect(el.value).toBe('1,234');
      // Selection should NOT be the whole string
      expect(el.selectionStart === 0 && el.selectionEnd === el.value.length).toBe(false);
    });

    it('should correctly emit raw value without thousand separators', () => {
      new NumoraInput(container, {
        onValueChange: onChangeMock,
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
      });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');
      simulateTyping(el, '4');

      expect(el.value).toBe('1,234');
      expect(onChangeMock).toHaveBeenLastCalledWith(expect.objectContaining({ value: '1234' }));
    });
  });
});

// ---------------------------------------------------------------------------
// keydown event coverage
// ---------------------------------------------------------------------------

describe('keydown - skipOverThousandSeparatorOnDelete', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  function simulateKeyDown(el: HTMLInputElement, key: string): void {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  it('should skip cursor over thousand separator on Backspace', () => {
    // In FormatOn.Change mode, "1,234" has a comma at index 1.
    // If cursor is at position 2 (right after the comma) and user presses Backspace,
    // the keydown handler should reposition the cursor to position 1 (before the comma)
    // so the subsequent beforeinput deletes the digit '1' instead of the separator.
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    simulateTyping(el, '4');
    expect(el.value).toBe('1,234');

    // Place cursor immediately after the comma (position 2)
    el.setSelectionRange(2, 2);
    simulateKeyDown(el, 'Backspace');

    // Cursor should have been moved to position 1 (before the comma)
    expect(el.selectionStart).toBe(1);
    expect(el.selectionEnd).toBe(1);
  });

  it('should skip cursor over thousand separator on Delete', () => {
    // Place cursor immediately before the comma (position 1) and press Delete.
    // The keydown handler should move cursor to position 2 (past the comma) so
    // the subsequent beforeinput deletes the digit '2' instead of the separator.
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    simulateTyping(el, '4');
    expect(el.value).toBe('1,234');

    // Place cursor immediately before the comma (position 1)
    el.setSelectionRange(1, 1);
    simulateKeyDown(el, 'Delete');

    // Cursor should have moved past the comma to position 2
    expect(el.selectionStart).toBe(2);
    expect(el.selectionEnd).toBe(2);
  });

  it('should not skip in FormatOn.Blur mode', () => {
    // skipOverThousandSeparatorOnDelete only applies in FormatOn.Change mode.
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234';
    el.setSelectionRange(2, 2);
    simulateKeyDown(el, 'Backspace');

    // Cursor should NOT have moved - Blur mode doesn't skip separators
    expect(el.selectionStart).toBe(2);
  });

  it('should not skip when cursor is not adjacent to separator', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    simulateTyping(el, '4');
    expect(el.value).toBe('1,234');

    // Cursor at position 5 (end) - not adjacent to a separator
    el.setSelectionRange(5, 5);
    simulateKeyDown(el, 'Backspace');

    expect(el.selectionStart).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// beforeinput - deletion with active selection + cut/drag
// ---------------------------------------------------------------------------

describe('beforeinput - selection and cut/drag deletion', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  function dispatchBeforeInput(el: HTMLInputElement, init: InputEventInit): boolean {
    const ev = new InputEvent('beforeinput', { bubbles: true, cancelable: true, ...init });
    el.dispatchEvent(ev);
    return ev.defaultPrevented;
  }

  it('deleteContentBackward with selection removes the selected range', () => {
    new NumoraInput(container, { onValueChange: onChangeMock });
    const el = getInputElement();

    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    simulateTyping(el, '4');
    simulateTyping(el, '5');
    expect(el.value).toBe('12345');

    // Select "234"
    el.setSelectionRange(1, 4);
    dispatchBeforeInput(el, { inputType: 'deleteContentBackward' });

    expect(el.value).toBe('15');
  });

  it('deleteContentForward with selection removes the selected range', () => {
    new NumoraInput(container, { onValueChange: onChangeMock });
    const el = getInputElement();

    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    expect(el.value).toBe('123');

    // Select "12"
    el.setSelectionRange(0, 2);
    dispatchBeforeInput(el, { inputType: 'deleteContentForward' });

    expect(el.value).toBe('3');
  });

  it('deleteByCut removes the selected range', () => {
    new NumoraInput(container, { onValueChange: onChangeMock });
    const el = getInputElement();

    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    simulateTyping(el, '4');
    expect(el.value).toBe('1234');

    // Select "23"
    el.setSelectionRange(1, 3);
    dispatchBeforeInput(el, { inputType: 'deleteByCut' });

    expect(el.value).toBe('14');
  });

  it('deleteByDrag removes the selected range', () => {
    new NumoraInput(container, { onValueChange: onChangeMock });
    const el = getInputElement();

    simulateTyping(el, '9');
    simulateTyping(el, '8');
    simulateTyping(el, '7');
    expect(el.value).toBe('987');

    // Select "87"
    el.setSelectionRange(1, 3);
    dispatchBeforeInput(el, { inputType: 'deleteByDrag' });

    expect(el.value).toBe('9');
  });

  it('deleteByCut on formatted value re-formats the remainder', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    // Build "12,345"
    '123456'.split('').forEach((c) => simulateTyping(el, c));
    expect(el.value).toBe('123,456');

    // Cut the leading "123" (positions 0–3 include the comma)
    el.setSelectionRange(0, 4); // "123,"
    dispatchBeforeInput(el, { inputType: 'deleteByCut' });

    expect(el.value).toBe('456');
  });
});

// ---------------------------------------------------------------------------
// beforeinput - pass-through events (undo/redo, paste delegation)
// ---------------------------------------------------------------------------

describe('beforeinput - pass-through events', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  function dispatchBeforeInput(el: HTMLInputElement, inputType: string): InputEvent {
    const ev = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType });
    el.dispatchEvent(ev);
    return ev;
  }

  it('historyUndo is NOT prevented - browser handles undo natively', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'historyUndo');
    expect(ev.defaultPrevented).toBe(false);
  });

  it('historyRedo is NOT prevented - browser handles redo natively', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'historyRedo');
    expect(ev.defaultPrevented).toBe(false);
  });

  it('insertFromPaste is NOT prevented - delegated to paste handler', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'insertFromPaste');
    expect(ev.defaultPrevented).toBe(false);
  });

  it('insertFromDrop is NOT prevented - delegated to paste handler', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'insertFromDrop');
    expect(ev.defaultPrevented).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// focus / blur events - FormatOn.Blur mode
// ---------------------------------------------------------------------------

describe('focus/blur - FormatOn.Blur mode', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('focus strips thousand separators so the user edits raw digits', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    // Pre-load a formatted value
    el.value = '1,234,567';
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(el.value).toBe('1234567');
  });

  it('focus maps the click caret from display to raw position', () => {
    new NumoraInput(container, {
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    // Click between `2` and `3` (display pos 3)
    el.setSelectionRange(3, 3);
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(el.value).toBe('1234567');
    // Should land between `2` and `3` in raw (pos 2), not between `3` and `4` (pos 3)
    expect(el.selectionStart).toBe(2);
    expect(el.selectionEnd).toBe(2);
  });

  it('focus maps a click just before a thousand separator to the digit boundary', () => {
    new NumoraInput(container, {
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    // Click between `4` and `,` (display pos 5)
    el.setSelectionRange(5, 5);
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(el.value).toBe('1234567');
    expect(el.selectionStart).toBe(4);
  });

  it('focus preserves a select-all range across the strip', () => {
    new NumoraInput(container, {
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.setSelectionRange(0, el.value.length);
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(el.value).toBe('1234567');
    expect(el.selectionStart).toBe(0);
    expect(el.selectionEnd).toBe(7);
  });

  it('blur re-applies thousand separators without firing onValueChange (raw is unchanged, A2-06)', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1234567';
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234,567');
    // Purely cosmetic re-grouping - the underlying digits never changed, so onValueChange must
    // not fire (A2-06); a consumer would otherwise be told the value changed when it didn't.
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('focus → type → blur round-trip formats correctly', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    // Simulate a full editing cycle
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    simulateTyping(el, '4');
    simulateTyping(el, '5');
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('12,345');
    // Blur only re-groups here - the raw digits ('12345') were already set by the last
    // keystroke, so onValueChange does not fire again on blur (A2-06); the last notification a
    // consumer sees is the typed (ungrouped, Blur-mode-typing) value.
    expect(onChangeMock).toHaveBeenLastCalledWith(expect.objectContaining({ value: '12345' }));
  });

  it('focus on already-formatted value strips and blur re-adds', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '9,876';
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    expect(el.value).toBe('9876');

    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    expect(el.value).toBe('9,876');
  });

  // Mouse-driven focus: the browser commits the click→selection mapping AFTER `focus`
  // fires, using the input's CURRENT value. If we strip in `focus`, the mapping runs
  // against the shorter (stripped) string and lands +N positions too far right (N =
  // separators before the click point). The fix defers the strip to `click`, which
  // fires after the browser has finalised the caret position.
  it('mousedown → focus does not strip (deferred to click)', () => {
    new NumoraInput(container, {
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    // Still formatted - strip is pending until click so the browser can map the
    // click X-coord against the formatted layout.
    expect(el.value).toBe('1,234,567');
  });

  it('click after mousedown strips separators and maps caret', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    // Browser commits the click between `5` and `6` in the FORMATTED value (display pos 7).
    el.setSelectionRange(7, 7);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(el.value).toBe('1234567');
    // Raw pos 5 → between `5` and `6`, not raw pos 7 which would be past the end.
    expect(el.selectionStart).toBe(5);
    expect(el.selectionEnd).toBe(5);
    // Stripping separators only changes the display, not the underlying digits, so
    // onValueChange must not fire for it (A2-06) - the value hasn't actually changed.
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('click without preceding mousedown is a no-op', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(el.value).toBe('1,234,567');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('keyboard focus (no mousedown) still strips on focus', () => {
    new NumoraInput(container, {
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(el.value).toBe('1234567');
  });

  it('click strip clears the pending flag so a second click is a no-op', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    el.setSelectionRange(3, 3);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(el.value).toBe('1234567');
    // Stripping separators only changes the display, not the underlying digits, so
    // onValueChange must not fire for it (A2-06) - the value hasn't actually changed.
    expect(onChangeMock).toHaveBeenCalledTimes(0);

    // Synthetic spurious click - should not re-broadcast or alter the raw value.
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onChangeMock).toHaveBeenCalledTimes(0);
  });
});

// ---------------------------------------------------------------------------
// handleBlur no longer re-groups an already-formatted value, and only fires
// onValueChange when the value actually changed (ticket 02).
// ---------------------------------------------------------------------------

describe('handleBlur - no double-grouping, no spurious onValueChange', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('setValue while focused then blur groups correctly, never doubling separators', () => {
    const numora = new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    // setValue already runs the full display pipeline, so the DOM shows the correctly
    // grouped string immediately - this is the exact "MAX button that keeps focus" repro
    // from the ticket. blur must not re-group an already-formatted value into
    // '1,2,34,,567.89', and since nothing actually changes at blur time it must not
    // spuriously re-fire onValueChange either.
    numora.setValue('1234567.89');
    onChangeMock.mockClear();
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234,567.89');
    expect(el.value).not.toContain(',,');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('an externally-set formatted value is left unchanged on blur (no re-grouping)', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    // Simulates a value that arrived already grouped by some means other than typing or
    // setValue (e.g. a framework adapter writing the DOM value directly).
    el.value = '1,234,567.89';
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234,567.89');
    expect(el.value).not.toContain(',,');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('an unformatted value present at blur time is grouped without a spurious onValueChange (A2-06)', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    for (const char of '1234567.89') {
      simulateTyping(el, char);
    }
    onChangeMock.mockClear();
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234,567.89');
    // Blur only adds grouping here - the raw digits were already set by the last keystroke,
    // so onValueChange does not fire again on blur (A2-06); a consumer would otherwise be told
    // the value changed when only its display did.
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('mousedown + focus + blur without a click leaves the value unchanged and does not fire onValueChange', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    // No 'click' - pendingMouseStrip stays set until blur clears it, so focus never
    // stripped separators and the value blurs back out unchanged.
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234,567');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('blur on an already-formatted, unchanged value does not fire onValueChange', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234,567';
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234,567');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('onValueChange emits the canonical raw value (and the display string) after blur', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    for (const char of '1234567.89') {
      simulateTyping(el, char);
    }
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(onChangeMock).toHaveBeenLastCalledWith(expect.objectContaining({ value: '1234567.89' }));
  });
});

// ---------------------------------------------------------------------------
// decimalMinLength pads on display/blur only, never on the typing path (ticket 03).
// ---------------------------------------------------------------------------

describe('decimalMinLength - pads on blur/display only', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('typing 1, 2, ., 5 shows 12.5 and pads to 12.50 only on blur', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      decimalMinLength: 2,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '.');
    simulateTyping(el, '5');

    expect(el.value).toBe('12.5');

    onChangeMock.mockClear();
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('12.50');
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ value: '12.50' }));
  });

  it('select-all + delete clears the field instead of leaving a bare separator', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      decimalMinLength: 2,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    simulateTyping(el, '1');
    simulateTyping(el, '2');
    el.setSelectionRange(0, el.value.length);
    simulateDelete(el, 'backward');

    expect(el.value).toBe('');
  });

  it('blur on an empty field stays empty and does not fire onValueChange', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      decimalMinLength: 2,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('');
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('Change mode + decimalMinLength + grouping pads on blur', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMinLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    for (const char of '1234.5') {
      simulateTyping(el, char);
    }
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234.50');
    expect(onChangeMock).toHaveBeenLastCalledWith({ value: '1234.50', formattedValue: '1,234.50' });
  });

  it('Change mode does not strip separators on focus (no grouping-specific listener regression)', () => {
    new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMinLength: 2,
    });
    const el = getInputElement();

    el.value = '1,234.50';
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(el.value).toBe('1,234.50');
  });
});

// ---------------------------------------------------------------------------
// decimalMaxLength: 0 drops the separator; trailing separator does not survive
// blur (ticket 08, steps 1 and 3 - the beforeinput reject is ticket 08 step 2,
// owned by another agent's work on event-handlers.ts).
// ---------------------------------------------------------------------------

describe('decimalMaxLength: 0 and trailing separator on blur', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('blur strips a trailing separator: 1234. -> 1,234', () => {
    const numora = new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMaxLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    numora.setValue('1234.', { undoable: false });
    // setValue already runs the display pipeline, which now also strips a trailing
    // separator - confirm blur (idempotent re-entry) doesn't reintroduce it.
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234');
    expect(el.value.endsWith('.')).toBe(false);
  });

  it('blur strips a trailing separator and pads when decimalMinLength is set: 1234. -> 1,234.00', () => {
    const numora = new NumoraInput(container, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalMaxLength: 2,
      decimalMinLength: 2,
    });
    const el = getInputElement();

    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    numora.setValue('1234.', { undoable: false });
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234.00');
  });
});

describe('NumoraInput edge cases', () => {
  let container: HTMLElement;
  let inputInstance: NumoraInput;

  beforeEach(() => {
    vi.restoreAllMocks();

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should accept only one decimal point', () => {
    inputInstance = new NumoraInput(container, { decimalMaxLength: 3 });
    const inputElement = container.querySelector('input') as HTMLInputElement;

    simulateTyping(inputElement, '1');
    simulateTyping(inputElement, '.'); // first decimal - allowed
    for (let i = 0; i < 9; i++) {
      simulateTyping(inputElement, '.'); // subsequent decimals - all blocked
    }

    expect(inputElement.value.split('.').length - 1).toBe(1);
  });

  it('should call onValueChange callback when value changes', () => {
    const onValueChange = vi.fn();
    inputInstance = new NumoraInput(container, {
      decimalMaxLength: 2,
      onValueChange,
    });

    const inputElement = container.querySelector('input') as HTMLInputElement;

    inputElement.value = '42.5';
    inputElement.dispatchEvent(new Event('input'));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: '42.5' }));
  });

  it('should allow navigation keys', () => {
    inputInstance = new NumoraInput(container, { decimalMaxLength: 2 });
    const inputElement = container.querySelector('input') as HTMLInputElement;

    const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const preventDefaultSpy = vi.spyOn(arrowEvent, 'preventDefault');

    inputElement.dispatchEvent(arrowEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});

describe('Negative Number Support', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function createInputWithNegatives(options = {}) {
    const input = new NumoraInput(container, {
      allowNegative: true,
      onValueChange: onChangeMock,
      ...options,
    });
    return input;
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  describe('Basic negative number input', () => {
    it('should allow negative numbers when allowNegative is true', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-123';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-123');
      expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ value: '-123' }));
    });

    it('should allow negative decimal numbers', () => {
      createInputWithNegatives({ decimalMaxLength: 2 });
      const inputElement = getInputElement();

      inputElement.value = '-123.45';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-123.45');
    });

    it('should allow typing minus sign at the start', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-');
    });

    it('should allow negative zero', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-0';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-0');
    });
  });

  describe('Minus sign position and multiple minus signs', () => {
    it('should only allow minus sign at the start', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      // Focused: this exercises the typing-path sanitizer, not the resting/display
      // formatter handleChange falls back to for a value set while unfocused (A2-07).
      inputElement.focus();
      inputElement.value = '123-45';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('12345');
    });

    it('should prevent multiple minus signs', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '--123';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-123');
    });

    it('should handle minus sign in the middle by removing it', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      // Focused: see the comment in 'should only allow minus sign at the start' above.
      inputElement.focus();
      inputElement.value = '12-34';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1234');
    });

    it('should preserve minus sign when typing after it', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-';
      inputElement.dispatchEvent(new Event('input'));
      inputElement.value = '-1';
      inputElement.dispatchEvent(new Event('input'));
      inputElement.value = '-12';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-12');
    });
  });

  describe('Sanitization with negative numbers', () => {
    it('should preserve minus sign during sanitization', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-abc123def';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-123');
    });

    it('should remove minus sign if no digits follow', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-abc';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('');
    });

    it('should handle negative numbers with commas', () => {
      createInputWithNegatives({
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
      });
      const inputElement = getInputElement();

      inputElement.value = '-1,234.56';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-1,234.56');
    });
  });

  describe('Paste events with negative numbers', () => {
    it('should handle pasting negative numbers', () => {
      createInputWithNegatives({ decimalMaxLength: 2 });
      const inputElement = getInputElement();

      const mockEvent = {
        target: inputElement,
        preventDefault: vi.fn(),
        clipboardData: {
          getData: vi.fn().mockReturnValue('-123.45'),
        },
      } as unknown as ClipboardEvent;

      inputElement.value = '';
      const result = handleOnPasteNumoraInput(mockEvent, 2, { allowNegative: true });

      expect(result.type).toBe('handled');
      if (result.type === 'handled') expect(result.formatted).toBe('-123.45');
    });

    it('should handle pasting negative numbers with invalid characters', () => {
      createInputWithNegatives({ decimalMaxLength: 2 });
      const inputElement = getInputElement();

      const mockEvent = {
        target: inputElement,
        preventDefault: vi.fn(),
        clipboardData: {
          getData: vi.fn().mockReturnValue('-abc123.45def'),
        },
      } as unknown as ClipboardEvent;

      inputElement.value = '';
      const result = handleOnPasteNumoraInput(mockEvent, 2, { allowNegative: true });

      expect(result.type).toBe('handled');
      if (result.type === 'handled') expect(result.formatted).toBe('-123.45');
    });
  });

  describe('Formatting with negative numbers', () => {
    it('should format negative numbers with thousand separators', () => {
      createInputWithNegatives({
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
      });
      const inputElement = getInputElement();

      inputElement.value = '-1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-1,234,567');
    });

    it('should format negative decimal numbers with separators', () => {
      createInputWithNegatives({
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
        decimalMaxLength: 2,
      });
      const inputElement = getInputElement();

      inputElement.value = '-1234567.89';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-1,234,567.89');
    });

    it('should handle negative numbers in blur mode', () => {
      createInputWithNegatives({
        formatOn: FormatOn.Blur,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
      });
      const inputElement = getInputElement();

      // Focused: this represents a value arriving mid-typing, not a resting/unfocused
      // value - see the comment in 'should only allow minus sign at the start' above.
      inputElement.focus();
      inputElement.value = '-1234567';
      inputElement.dispatchEvent(new Event('input'));

      // In blur mode, value should remain unformatted during typing
      // (formatting happens on blur, which is tested separately)
      expect(inputElement.value).toBe('-1234567');
      expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ value: '-1234567' }));
    });
  });

  describe('Edge cases', () => {
    it('should handle just minus sign', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-');
    });

    it('should handle minus sign with decimal point', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      // Focused: see the comment in 'should only allow minus sign at the start' above.
      inputElement.focus();
      inputElement.value = '-.';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-.');
    });

    it('should handle negative number with leading zeros', () => {
      createInputWithNegatives({ allowLeadingZeros: true });
      const inputElement = getInputElement();

      inputElement.value = '-007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-007');
    });

    it('should respect decimalMaxLength for negative numbers', () => {
      createInputWithNegatives({ decimalMaxLength: 2 });
      const inputElement = getInputElement();

      inputElement.value = '-123.456';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-123.45');
    });
  });
});

describe('Leading Zeros Support', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function createInputWithLeadingZeros(options = {}) {
    const input = new NumoraInput(container, {
      allowLeadingZeros: true,
      onValueChange: onChangeMock,
      ...options,
    });
    return input;
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  describe('Default behavior (allowLeadingZeros: false)', () => {
    it('should remove leading zeros by default', () => {
      const input = new NumoraInput(container, { onValueChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('7');
    });

    it('should remove multiple leading zeros', () => {
      const input = new NumoraInput(container, { onValueChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '0001';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1');
    });

    it('should preserve single zero', () => {
      const input = new NumoraInput(container, { onValueChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '0';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0');
    });

    it('should handle leading zeros with decimals', () => {
      const input = new NumoraInput(container, { onValueChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '00.5';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.5');
    });

    it('should remove leading zeros from negative numbers', () => {
      const input = new NumoraInput(container, {
        allowNegative: true,
        onValueChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '-007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-7');
    });
  });

  describe('With allowLeadingZeros: true', () => {
    it('should preserve leading zeros when enabled', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      inputElement.value = '007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('007');
      expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ value: '007' }));
    });

    it('should preserve multiple leading zeros', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      // Focused: a resting/unfocused 'input' event formats for display (A2-07), which
      // would group this 4-digit value; focus exercises the typing path instead.
      inputElement.focus();
      inputElement.value = '0001';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0001');
    });

    it('should preserve leading zeros with decimals', () => {
      createInputWithLeadingZeros({ decimalMaxLength: 2 });
      const inputElement = getInputElement();

      inputElement.value = '00.5';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('00.5');
    });

    it('should preserve leading zeros in negative numbers', () => {
      createInputWithLeadingZeros({ allowNegative: true });
      const inputElement = getInputElement();

      inputElement.value = '-007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-007');
    });

    it('should preserve leading zeros when typing', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      inputElement.value = '0';
      inputElement.dispatchEvent(new Event('input'));
      inputElement.value = '00';
      inputElement.dispatchEvent(new Event('input'));
      inputElement.value = '007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('007');
    });

    it('should handle paste events with leading zeros', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      const mockEvent = {
        target: inputElement,
        preventDefault: vi.fn(),
        clipboardData: {
          getData: vi.fn().mockReturnValue('000123'),
        },
      } as unknown as ClipboardEvent;

      inputElement.value = '';
      const result = handleOnPasteNumoraInput(mockEvent, 2, { allowLeadingZeros: true });

      expect(result.type).toBe('handled');
      if (result.type === 'handled') expect(result.formatted).toBe('000123');
    });

    it('should preserve leading zeros with formatting', () => {
      createInputWithLeadingZeros({
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
      });
      const inputElement = getInputElement();

      inputElement.value = '0001234';
      inputElement.dispatchEvent(new Event('input'));

      // Leading zeros are grouped as part of the full integer ("0,001,234"), not left
      // ungrouped in front of a separately-grouped remainder ("0001,234"). The latter
      // applied thousand grouping inconsistently across the same integer.
      expect(inputElement.value).toBe('0,001,234');
    });
  });

  describe('Edge cases', () => {
    it('should handle just zeros', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      inputElement.value = '000';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('000');
    });

    it('should handle zero with decimal point', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      // Focused: a resting/unfocused 'input' event formats for display (A2-07), which
      // strips a trailing decimal separator - a mid-typing-only concern; focus exercises
      // the typing path instead.
      inputElement.focus();
      inputElement.value = '00.';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('00.');
    });

    it('should handle leading zeros after sanitization', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      // Focused: a resting/unfocused 'input' event formats for display (A2-07), which
      // would group this 5-digit value; focus exercises the typing path instead.
      inputElement.focus();
      inputElement.value = '00abc123';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('00123');
    });
  });
});

describe('Scientific Notation Expansion', () => {
  let container: HTMLElement;
  let inputInstance: NumoraInput;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Negative exponents (small numbers)', () => {
    it('should expand 1.5e-7 to 0.00000015', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 8 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e-7';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.00000015');
    });

    it('should expand 1.5e-1 to 0.15', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e-1';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.15');
    });

    it('should expand 1.23e-4 to 0.000123', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 6 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.23e-4';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.000123');
    });

    it('should expand 2e-3 to 0.002', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 3 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '2e-3';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.002');
    });

    it('should expand 0.5e-2 to 0.005', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 3 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '0.5e-2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.005');
    });

    it('should expand 1e-10 to 0.0000000001', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 10 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1e-10';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.0000000001');
    });

    it('should expand 123.456e-2 to 1.23456', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 5 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '123.456e-2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1.23456');
    });
  });

  describe('Positive exponents (large numbers)', () => {
    it('should expand 2e+5 to 200000', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      // Focused: a resting/unfocused 'input' event formats for display (A2-07), which
      // would group this value with the default thousand separator.
      inputElement.focus();
      inputElement.value = '2e+5';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('200000');
    });

    it('should expand 1.5e+2 to 150', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e+2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('150');
    });

    it('should expand 1.5e+1 to 15', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e+1';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('15');
    });

    it('should expand 12.34e+1 to 123.4', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 1 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '12.34e+1';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('123.4');
    });

    it('should expand 12.34e+2 to 1234', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      // Focused: a resting/unfocused 'input' event formats for display (A2-07), which
      // would group this value with the default thousand separator.
      inputElement.focus();
      inputElement.value = '12.34e+2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1234');
    });

    it('should expand 1e+3 to 1000', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      // Focused: a resting/unfocused 'input' event formats for display (A2-07), which
      // would group this value with the default thousand separator.
      inputElement.focus();
      inputElement.value = '1e+3';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1000');
    });
  });

  describe('Edge cases', () => {
    it('should handle exponent of 0', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e0';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1.5');
    });

    it('should handle uppercase E', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 8 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5E-7';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.00000015');
    });

    it('should handle integer base without decimal point', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 3 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '5e-3';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.005');
    });

    it('should respect decimalMaxLength when expanding', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.234567e-2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.01');
    });

    it('should not expand non-scientific notation', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '123.45';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('123.45');
    });

    it('should handle paste events with scientific notation', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 8 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      const mockEvent = {
        target: inputElement,
        preventDefault: vi.fn(),
        clipboardData: {
          getData: vi.fn().mockReturnValue('1.5e-7'),
        },
      } as unknown as ClipboardEvent;

      inputElement.value = '';
      const result = handleOnPasteNumoraInput(mockEvent, 8, {});

      expect(result.type).toBe('handled');
      if (result.type === 'handled') expect(result.formatted).toBe('0.00000015');
    });
  });
});

describe('Canonical raw value + getFormattedValue', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function createChangeModeInput(options = {}) {
    const input = new NumoraInput(container, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      decimalSeparator: '.',
      decimalMaxLength: 8,
      allowCompactNotation: false,
      allowNegative: false,
      allowLeadingZeros: false,
      onValueChange: onChangeMock,
      ...options,
    });
    return input;
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  describe('Basic functionality', () => {
    it('should store raw value separately from formatted display', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      inputElement.value = '1234';
      inputElement.dispatchEvent(new Event('input'));

      // Display shows formatted value
      expect(inputElement.value).toBe('1,234');
      // getValue returns raw value
      expect(input.rawValue).toBe('1234');
      // onValueChange receives raw value
      expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ value: '1234' }));
    });

    it('should return the raw value from getValue() and display from getFormattedValue()', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1,234,567');
      expect(input.rawValue).toBe('1234567');
      expect(input.formattedValue).toBe('1,234,567');
    });

    it('getValue() is raw regardless of any option (there is no emitRawValue switch)', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        allowCompactNotation: false,
        allowNegative: false,
        allowLeadingZeros: false,
        onValueChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1,234,567');
      expect(input.rawValue).toBe('1234567');
    });
  });

  describe('setValue with raw value mode', () => {
    it('should format raw value for display when setValue is called', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      input.setValue('1234567');

      // Display shows formatted
      expect(inputElement.value).toBe('1,234,567');
      // getValue returns raw
      expect(input.rawValue).toBe('1234567');
    });

    it('should handle decimal values', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      input.setValue('1234.56');

      expect(inputElement.value).toBe('1,234.56');
      expect(input.rawValue).toBe('1234.56');
    });

    it('should handle empty string', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      input.setValue('');

      expect(inputElement.value).toBe('');
      expect(input.rawValue).toBe('');
    });
  });

  describe('Input events with raw value mode', () => {
    it('should extract raw value during typing', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      // Simulate typing "1234"
      inputElement.value = '1';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.rawValue).toBe('1');

      inputElement.value = '12';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.rawValue).toBe('12');

      inputElement.value = '123';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.rawValue).toBe('123');

      inputElement.value = '1234';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.rawValue).toBe('1234');
      expect(inputElement.value).toBe('1,234');
    });

    it('should handle decimal input', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      inputElement.value = '1234.56';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1,234.56');
      expect(input.rawValue).toBe('1234.56');
    });
  });

  describe('Paste events with raw value mode', () => {
    it('should extract raw value from pasted content', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      inputElement.value = '';
      inputElement.setSelectionRange(0, 0);

      // Create a proper Event that can be dispatched
      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });

      // Add clipboardData property to the event
      Object.defineProperty(pasteEvent, 'target', {
        value: inputElement,
        enumerable: true,
        writable: false,
      });

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          getData: vi.fn().mockReturnValue('1234567'),
        },
        enumerable: true,
        writable: false,
      });

      Object.defineProperty(pasteEvent, 'preventDefault', {
        value: vi.fn(),
        enumerable: true,
        writable: false,
      });

      // Dispatch the paste event - this should trigger NumoraInput's handlePaste method
      // which will update the internal rawValue state
      inputElement.dispatchEvent(pasteEvent);

      expect(inputElement.value).toBe('1,234,567');
      expect(input.rawValue).toBe('1234567');
    });
  });

  describe('Blur mode with raw value mode', () => {
    it('should extract raw value in blur mode', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Blur,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        allowCompactNotation: false,
        allowNegative: false,
        allowLeadingZeros: false,
        onValueChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';

      // Simulate blur by using setValue which formats the value and updates internal state
      // In test environments, blur events don't always trigger handlers properly
      // This tests that the formatting and rawValue extraction work correctly
      // setValue takes a canonical raw value, formats it for display and stores it internally
      input.setValue('1234567');

      expect(inputElement.value).toBe('1,234,567');
      expect(input.rawValue).toBe('1234567');
      // Note: setValue doesn't call onValueChange, only handleValueChange does (which is called by event handlers)
      // The onValueChange behavior is tested in other tests that verify the event flow
    });
  });

  describe('Edge cases with raw value mode', () => {
    it('should handle empty string', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.rawValue).toBe('');
      expect(inputElement.value).toBe('');
    });

    it('should handle just decimal separator', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      // Focused: a resting/unfocused 'input' event formats for display (A2-07), which
      // strips a trailing decimal separator - a mid-typing-only concern; focus exercises
      // the typing path instead.
      inputElement.focus();
      inputElement.value = '.';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.rawValue).toBe('.');
      expect(inputElement.value).toBe('.');
    });

    it('should handle zero', () => {
      const input = createChangeModeInput();
      const inputElement = getInputElement();

      inputElement.value = '0';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.rawValue).toBe('0');
      expect(inputElement.value).toBe('0');
    });

    it('should work without thousand separator', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.None,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        allowCompactNotation: false,
        allowNegative: false,
        allowLeadingZeros: false,
        onValueChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234.56';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.rawValue).toBe('1234.56');
      expect(inputElement.value).toBe('1234.56');
    });
  });

  describe('One value API (Q11)', () => {
    it('onValueChange receives { value, formattedValue }', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        allowCompactNotation: false,
        allowNegative: false,
        allowLeadingZeros: false,
        onValueChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1,234,567');
      expect(input.rawValue).toBe('1234567');
      expect(input.formattedValue).toBe('1,234,567');
      expect(onChangeMock).toHaveBeenCalledWith({ value: '1234567', formattedValue: '1,234,567' });
    });

    it('getValue() is raw by default', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        groupingStyle: GroupingStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        allowCompactNotation: false,
        allowNegative: false,
        allowLeadingZeros: false,
        onValueChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.rawValue).toBe('1234567');
    });
  });
});

// ---------------------------------------------------------------------------
// beforeinput - preventive decimal-cap keystroke check
// ---------------------------------------------------------------------------

describe('beforeinput - preventive decimal-cap', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  function dispatchInsert(el: HTMLInputElement, data: string): InputEvent {
    const ev = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data,
    });
    el.dispatchEvent(ev);
    return ev;
  }

  it('rejects a digit appended past decimalMaxLength', () => {
    new NumoraInput(container, { decimalMaxLength: 2 });
    const el = getInputElement();
    el.value = '1.23';
    el.setSelectionRange(4, 4);

    const ev = dispatchInsert(el, '4');

    expect(ev.defaultPrevented).toBe(true);
    expect(el.value).toBe('1.23');
  });

  it('rejects a digit inserted into the middle of a full fractional part', () => {
    new NumoraInput(container, { decimalMaxLength: 2 });
    const el = getInputElement();
    el.value = '1.23';
    el.setSelectionRange(3, 3);

    const ev = dispatchInsert(el, '5');

    expect(ev.defaultPrevented).toBe(true);
    expect(el.value).toBe('1.23');
  });

  it('allows a digit that replaces a selected fractional digit', () => {
    new NumoraInput(container, { decimalMaxLength: 2 });
    const el = getInputElement();
    el.value = '1.23';
    el.setSelectionRange(3, 4);

    dispatchInsert(el, '9');

    expect(el.value).toBe('1.29');
  });

  it('allows a digit typed in the integer part even when fractional is full', () => {
    new NumoraInput(container, { decimalMaxLength: 2 });
    const el = getInputElement();
    el.value = '1.23';
    el.setSelectionRange(1, 1);

    dispatchInsert(el, '9');

    expect(el.value).toBe('19.23');
  });

  it('does not interfere when no decimal separator is present', () => {
    new NumoraInput(container, { decimalMaxLength: 2 });
    const el = getInputElement();
    el.value = '123';
    el.setSelectionRange(3, 3);

    dispatchInsert(el, '4');

    expect(el.value).toBe('1234');
  });
});

// ---------------------------------------------------------------------------
// beforeinput - whole-line delete inputTypes (Cmd/Ctrl+Backspace, Cmd/Ctrl+Delete)
// ---------------------------------------------------------------------------

describe('beforeinput - whole-line deletes', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  function dispatchDelete(el: HTMLInputElement, inputType: string): InputEvent {
    const ev = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType });
    el.dispatchEvent(ev);
    // handleBeforeInput already broadcast the change when defaultPrevented - no synthetic
    // 'input' dispatch needed (and dispatching one would double-fire onValueChange via
    // handleChange; see the same fix in simulateTyping/simulateDelete above).
    return ev;
  }

  it('deleteSoftLineBackward removes everything before the cursor', () => {
    new NumoraInput(container, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
    });
    const el = getInputElement();
    el.value = '1,234,567';
    el.setSelectionRange(5, 5); // between '3' and '4' in formatted

    const ev = dispatchDelete(el, 'deleteSoftLineBackward');

    expect(ev.defaultPrevented).toBe(true);
    expect(el.value).toBe('567');
  });

  it('deleteHardLineBackward behaves the same as deleteSoftLineBackward', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    el.value = '123456';
    el.setSelectionRange(3, 3);

    const ev = dispatchDelete(el, 'deleteHardLineBackward');

    expect(ev.defaultPrevented).toBe(true);
    expect(el.value).toBe('456');
  });

  it('deleteSoftLineForward removes everything after the cursor', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    el.value = '123456';
    el.setSelectionRange(3, 3);

    const ev = dispatchDelete(el, 'deleteSoftLineForward');

    expect(ev.defaultPrevented).toBe(true);
    expect(el.value).toBe('123');
  });

  it('deleteHardLineForward behaves the same as deleteSoftLineForward', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    el.value = '123456';
    el.setSelectionRange(2, 2);

    const ev = dispatchDelete(el, 'deleteHardLineForward');

    expect(ev.defaultPrevented).toBe(true);
    expect(el.value).toBe('12');
  });

  it('deleteSoftLineBackward with selection deletes the selection only', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    el.value = '123456';
    el.setSelectionRange(2, 4);

    dispatchDelete(el, 'deleteSoftLineBackward');

    expect(el.value).toBe('1256');
  });
});

describe('Adopt existing <input> element', () => {
  let host: HTMLInputElement;

  beforeEach(() => {
    host = document.createElement('input');
    document.body.appendChild(host);
  });

  afterEach(() => {
    if (host.parentNode) host.parentNode.removeChild(host);
  });

  it('adopts the passed input instead of creating a new one', () => {
    const instance = new NumoraInput(host, {});
    expect(instance.element).toBe(host);
  });

  it('does not append a child input when the container is itself an input', () => {
    new NumoraInput(host, {});
    expect(host.querySelector('input')).toBeNull();
  });

  it('forces required attributes on an adopted input', () => {
    host.setAttribute('type', 'number');
    host.setAttribute('spellcheck', 'true');
    host.setAttribute('autocomplete', 'on');

    new NumoraInput(host, {});

    expect(host.getAttribute('type')).toBe('text');
    expect(host.getAttribute('inputmode')).toBe('decimal');
    expect(host.getAttribute('spellcheck')).toBe('false');
    expect(host.getAttribute('autocomplete')).toBe('off');
  });

  it('preserves pre-set value attribute on adopted input when no options.value is given', () => {
    host.value = '1000';
    new NumoraInput(host, { groupingStyle: GroupingStyle.Thousand, formatOn: FormatOn.Change });
    expect(host.value).toBe('1,000');
  });

  it('preserves non-numora attributes set on the adopted input', () => {
    host.setAttribute('placeholder', 'Amount');
    host.setAttribute('aria-label', 'Price');

    new NumoraInput(host, {});

    expect(host.getAttribute('placeholder')).toBe('Amount');
    expect(host.getAttribute('aria-label')).toBe('Price');
  });

  it('formats typed input correctly when attached to existing element', () => {
    const onChangeMock = vi.fn();
    new NumoraInput(host, {
      onValueChange: onChangeMock,
      formatOn: FormatOn.Change,
      groupingStyle: GroupingStyle.Thousand,
    });

    host.focus();
    simulateTyping(host, '1');
    simulateTyping(host, '2');
    simulateTyping(host, '3');
    simulateTyping(host, '4');

    expect(host.value).toBe('1,234');
  });
});

describe('vanilla class surface', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('options are optional', () => {
    const instance = new NumoraInput(host);
    instance.setValue('1234.5');
    expect(instance.formattedValue).toBe('1,234.5');
  });

  it('rawValue, formattedValue and element are properties', () => {
    const instance = new NumoraInput(host, { locale: 'de-DE', defaultValue: '1234567.89' });
    expect(instance.rawValue).toBe('1234567.89');
    expect(instance.formattedValue).toBe('1.234.567,89');
    expect(instance.element).toBe(host.querySelector('input'));

    instance.setValue('42.5');
    expect(instance.rawValue).toBe('42.5');
    expect(instance.element.value).toBe('42,5');
  });

  it('rawValue is read-only: setValue is the one way to write', () => {
    const instance = new NumoraInput(host, { defaultValue: '5' });
    expect(() => {
      (instance as unknown as { rawValue: string }).rawValue = '9';
    }).toThrow(TypeError);
    expect(instance.rawValue).toBe('5');
  });

  it('value, the method accessors and valueAsNumber are gone', () => {
    const instance = new NumoraInput(host) as unknown as Record<string, unknown>;
    for (const name of ['value', 'getValue', 'getFormattedValue', 'getElement', 'valueAsNumber']) {
      expect(instance[name]).toBeUndefined();
    }
  });

  // Pins the handle: a new public member is a deliberate API decision, not a side effect.
  it('exposes exactly rawValue, formattedValue, element, setValue, update and destroy', () => {
    const members = Object.getOwnPropertyNames(NumoraInput.prototype).filter(
      (name) => !/^(constructor|createInputElement|applyOptions|setupEventListeners|emit)$/.test(name)
    );
    expect(members.sort()).toEqual(
      ['destroy', 'element', 'formattedValue', 'rawValue', 'setValue', 'update'].sort()
    );
  });

  it('forwards the listed native attributes and ariaLabel', () => {
    const { element } = new NumoraInput(host, {
      id: 'amount',
      name: 'amount',
      className: 'field',
      placeholder: '0.0',
      disabled: true,
      readOnly: true,
      required: true,
      tabIndex: 3,
      title: 'Amount',
      autofocus: true,
      ariaLabel: 'Amount to send',
    });
    expect(element.id).toBe('amount');
    expect(element.name).toBe('amount');
    expect(element.className).toBe('field');
    expect(element.placeholder).toBe('0.0');
    expect(element.disabled).toBe(true);
    expect(element.readOnly).toBe(true);
    expect(element.required).toBe(true);
    expect(element.tabIndex).toBe(3);
    expect(element.title).toBe('Amount');
    expect(element.autofocus).toBe(true);
    expect(element.getAttribute('aria-label')).toBe('Amount to send');
  });

  it('forwards nothing else: other attributes are set on element', () => {
    const { element } = new NumoraInput(host, { dir: 'rtl', hidden: true, type: 'number' } as never);
    expect(element.dir).toBe('');
    expect(element.hidden).toBe(false);
    expect(element.type).toBe('text');
  });

  it('an attribute left undefined does not overwrite an adopted input', () => {
    const input = document.createElement('input');
    input.placeholder = 'Amount';
    input.setAttribute('aria-label', 'Kept');
    host.appendChild(input);
    new NumoraInput(input, { placeholder: undefined });
    expect(input.placeholder).toBe('Amount');
    expect(input.getAttribute('aria-label')).toBe('Kept');
  });
});

// Numora sets no `pattern` attribute (v5): the field can only hold what Numora wrote, so a
// second validator could only disagree with the sanitizer. Native constraint validation
// therefore passes on Numora's own output, and a `pattern` the app sets is its own.
describe('no pattern attribute', () => {
  let container: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(() => {
    form = document.createElement('form');
    container = document.createElement('div');
    form.appendChild(container);
    document.body.appendChild(form);
  });

  afterEach(() => {
    document.body.removeChild(form);
  });

  it.each([
    [{ defaultValue: '1234567' }, '1,234,567'],
    [{ formatOn: FormatOn.Change, defaultValue: '1234567.5' }, '1,234,567.5'],
    [{ locale: 'de-DE', defaultValue: '1234.5' }, '1.234,5'],
    [{ locale: 'en-IN', defaultValue: '1234567' }, '12,34,567'],
    [{ allowNegative: true, defaultValue: '-1234' }, '-1,234'],
  ])('%j sets no pattern and passes native validation', (options, shown) => {
    const el = new NumoraInput(container, options).element;

    expect(el.value).toBe(shown);
    expect(el.hasAttribute('pattern')).toBe(false);
    expect(el.validity.patternMismatch).toBe(false);
    expect(form.checkValidity()).toBe(true);
  });

  it("leaves an adopted input's own pattern alone, on init and on update()", () => {
    const el = document.createElement('input');
    el.setAttribute('pattern', '[0-9]{4}');
    form.appendChild(el);
    const input = new NumoraInput(el, { defaultValue: '1234' });

    expect(el.getAttribute('pattern')).toBe('[0-9]{4}');
    input.update({ locale: 'de-DE' });
    expect(el.getAttribute('pattern')).toBe('[0-9]{4}');
  });
});

describe('setValue() is the app\'s own write', () => {
  it('keeps the edit-time format on a focused Blur-mode field', () => {
    const input = new NumoraInput(document.createElement('div'), { defaultValue: '1' });
    input.element.dispatchEvent(new FocusEvent('focus'));
    input.setValue('1234567');
    expect(input.element.value).toBe('1234567');
    input.element.dispatchEvent(new FocusEvent('blur'));
    expect(input.element.value).toBe('1,234,567');
  });

  it('groups on a focused Change-mode field and on an unfocused field', () => {
    const change = new NumoraInput(document.createElement('div'), { formatOn: FormatOn.Change });
    change.element.dispatchEvent(new FocusEvent('focus'));
    change.setValue('1234567');
    expect(change.element.value).toBe('1,234,567');

    const blur = new NumoraInput(document.createElement('div'));
    blur.setValue('1234567');
    expect(blur.element.value).toBe('1,234,567');
  });

  it('does not call onValueChange and is not checked by isAllowed', () => {
    const onValueChange = vi.fn();
    const input = new NumoraInput(document.createElement('div'), {
      onValueChange,
      isAllowed: (raw) => Number(raw) <= 100,
    });
    input.setValue('500');
    expect(input.rawValue).toBe('500');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('a number passed where a string is expected', () => {
  it('is shown, with a development warning, for the initial value and setValue()', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const host = document.createElement('div');
    const input = new NumoraInput(host, { defaultValue: 1234.5 as never });
    expect(input.rawValue).toBe('1234.5');
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/defaultValue received a number \(1234\.5\)/));

    input.setValue(7 as never);
    expect(input.rawValue).toBe('7');
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/setValue\(\) received a number/));

    warn.mockClear();
    input.setValue('8');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

// A2-06: firing onValueChange on every focus (separator strip) and blur (regroup) even when the
// underlying raw value hasn't changed is misleading - a consumer sees a "change" for a purely
// cosmetic re-formatting. onValueChange should fire only when the sanitized raw value changed.
describe('onValueChange only fires when the raw value actually changed (A2-06)', () => {
  let container: HTMLElement;
  let onChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    onChangeMock = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('does not fire onValueChange on focus (separator strip), fires once for a real edit, and not again on blur (regroup only)', () => {
    new NumoraInput(container, { defaultValue: '1234567', onValueChange: onChangeMock });
    const el = getInputElement();

    expect(el.value).toBe('1,234,567');

    el.focus();
    expect(onChangeMock).not.toHaveBeenCalled();

    simulateTyping(el, '8');
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenLastCalledWith(expect.objectContaining({ value: '12345678' }));

    el.blur();
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(el.value).toBe('12,345,678');
  });

  it('fires onValueChange on blur when the raw value actually changed (trailing separator stripped)', () => {
    new NumoraInput(container, { onValueChange: onChangeMock });
    const el = getInputElement();

    el.focus();
    simulateTyping(el, '1');
    simulateTyping(el, '.');
    onChangeMock.mockClear();

    el.blur();

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenLastCalledWith(expect.objectContaining({ value: '1' }));
    expect(el.value).toBe('1');
  });
});

// A2-07: the native `input` fallback (handleChange) used to format under the field's real
// formatOn mode even when the field isn't focused, so a programmatic/autofill `input` event
// on an unfocused Blur-mode field left the raw value sitting ungrouped at rest.
describe('handleChange formats for resting display when unfocused (A2-07)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  it('groups a programmatic input event on an unfocused Blur-mode field', () => {
    new NumoraInput(container, { formatOn: FormatOn.Blur });
    const el = getInputElement();

    expect(document.activeElement).not.toBe(el);
    el.value = '1234567';
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' })
    );

    expect(el.value).toBe('1,234,567');
  });
});
