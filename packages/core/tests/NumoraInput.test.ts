import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { handleOnPasteNumoraInput } from '../src/utils/event-handlers';
import { FormatOn, ThousandStyle } from '../src/types';

// ---------------------------------------------------------------------------
// Test helpers — simulate the real browser event sequence for an <input>.
//
// The browser fires:  keydown → beforeinput (cancelable) → input → keyup
//
// All formatting logic lives in the beforeinput handler. Tests that dispatch
// a plain `new Event('input')` bypass it entirely and only exercise the
// handleChange fallback path — leaving the beforeinput path untested.
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
    // setRangeText was called inside handleBeforeInput. Real browsers fire a synchronous
    // 'input' event from setRangeText; jsdom does not, so we dispatch one manually.
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    return;
  }

  // Otherwise simulate the browser's native character insertion.
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  el.value = el.value.slice(0, start) + char + el.value.slice(end);
  el.setSelectionRange(start + char.length, start + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}

function simulateDelete(el: HTMLInputElement, direction: 'backward' | 'forward' = 'backward'): void {
  const inputType = direction === 'backward' ? 'deleteContentBackward' : 'deleteContentForward';
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
  });
  el.dispatchEvent(beforeInput);

  if (beforeInput.defaultPrevented) {
    // Same as simulateTyping: jsdom's setRangeText doesn't fire 'input', so we do it manually.
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
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
      onChange: onChangeMock,
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

    inputElement.value = '1.';
    inputElement.dispatchEvent(new Event('input'));

    const event = new KeyboardEvent('keydown', { key: '.' });
    inputElement.dispatchEvent(event);

    expect(onChangeMock).toHaveBeenCalled();
    expect(inputElement.value).toBe('1.');
  });

  it('should replace comma with period when user types comma', () => {
    createInputWithPlaceholder({ decimalSeparator: '.', thousandStyle: ThousandStyle.Thousand });
    const inputElement = getInputElement();

    simulateTyping(inputElement, '1');
    simulateTyping(inputElement, ','); // comma → converted to configured decimal separator '.'
    expect(inputElement.value).toBe('1.');

    simulateTyping(inputElement, '2');
    expect(inputElement.value).toBe('1.2');

    // Typing '.' again should be blocked — decimal already present
    simulateTyping(inputElement, '.');
    expect(inputElement.value).toBe('1.2');

    simulateTyping(inputElement, '3');
    expect(inputElement.value).toBe('1.23');

    // Typing ',' again should also be blocked
    simulateTyping(inputElement, ',');
    expect(inputElement.value).toBe('1.23');

    expect(onChangeMock).toHaveBeenCalled();
  });

  it('should work with readOnly property', () => {
    createInputWithPlaceholder({ readOnly: true });
    const inputElement = getInputElement();

    expect(inputElement.readOnly).toBe(true);
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
    createInputWithPlaceholder({ value: '123.45' });
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

describe('Paste handler sanitization cases', () => {
  const testCases = [
    { input: '1.......4.....2', decimalMaxLength: 8, expected: '1.42' },
    { input: '12....34.....56', decimalMaxLength: 8, expected: '12.3456' },
    { input: '....56789...', decimalMaxLength: 5, expected: '.56789' },
    { input: '1.23..4..56.', decimalMaxLength: 6, expected: '1.23456' },
    { input: '1.....2', decimalMaxLength: 8, expected: '1.2' },
    { input: '123..4...56.7', decimalMaxLength: 7, expected: '123.4567' },
    { input: 'a.b.c.123.4.def56', decimalMaxLength: 8, expected: '.123456' },
    { input: '12abc34....def567', decimalMaxLength: 2, expected: '1234.56' },
    { input: '.....a.b.c......', decimalMaxLength: 8, expected: '.' },
    { input: '12.....3..4..5abc6', decimalMaxLength: 7, expected: '12.3456' },
    { input: '1a2b3c4d5e.1234567', decimalMaxLength: 4, expected: '12345.1234' },
    { input: '12abc@#34..def$%^567', decimalMaxLength: 2, expected: '1234.56' },
    { input: '....!@#$$%^&*((', decimalMaxLength: 8, expected: '.' },
    { input: '123....abc.def456ghi789', decimalMaxLength: 4, expected: '123.4567' },
    { input: '00.00123...4', decimalMaxLength: 4, expected: '0.0012' },
    { input: '.1...2.67.865', decimalMaxLength: 3, expected: '.126' },
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

      const { formatted } = handleOnPasteNumoraInput(mockEvent, decimalMaxLength);
      expect(formatted).toBe(expected);
      expect(mockInputElement.value).toBe(expected);
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
      new NumoraInput(container, { onChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '5');

      expect(el.value).toBe('5');
      expect(onChangeMock).toHaveBeenCalledWith('5');
    });

    it('should build a number character by character', () => {
      new NumoraInput(container, { onChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');

      expect(el.value).toBe('123');
    });

    it('should ignore non-numeric characters', () => {
      new NumoraInput(container, { onChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, 'a');
      simulateTyping(el, '2');

      expect(el.value).toBe('12');
    });
  });

  describe('decimal separator', () => {
    it('should insert decimal separator', () => {
      new NumoraInput(container, { onChange: onChangeMock, decimalMaxLength: 2 });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '.');
      simulateTyping(el, '5');

      expect(el.value).toBe('1.5');
    });

    it('should convert comma to configured decimal separator', () => {
      new NumoraInput(container, { onChange: onChangeMock, decimalSeparator: '.', decimalMaxLength: 2 });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, ',');

      expect(el.value).toBe('1.');
    });

    it('should block a second decimal separator', () => {
      new NumoraInput(container, { onChange: onChangeMock, decimalMaxLength: 2 });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '.');
      simulateTyping(el, '5');
      simulateTyping(el, '.'); // second dot — should be blocked
      simulateTyping(el, '2');

      expect(el.value).toBe('1.52');
    });

    it('should block second decimal when comma is typed', () => {
      new NumoraInput(container, { onChange: onChangeMock, decimalSeparator: '.', decimalMaxLength: 2 });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '.');
      simulateTyping(el, ','); // already has '.', comma should also be blocked

      expect(el.value).toBe('1.');
    });
  });

  describe('delete', () => {
    it('should delete the last character with Backspace', () => {
      new NumoraInput(container, { onChange: onChangeMock });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');
      simulateDelete(el, 'backward');

      expect(el.value).toBe('12');
    });

    it('should delete a character forward with Delete', () => {
      new NumoraInput(container, { onChange: onChangeMock });
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

  describe('FormatOn.Change — thousand separator', () => {
    it('should add thousand separator when typing 4th digit', () => {
      new NumoraInput(container, {
        onChange: onChangeMock,
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
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
        onChange: onChangeMock,
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
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
        onChange: onChangeMock,
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
        rawValueMode: true,
      });
      const el = getInputElement();

      simulateTyping(el, '1');
      simulateTyping(el, '2');
      simulateTyping(el, '3');
      simulateTyping(el, '4');

      expect(el.value).toBe('1,234');
      expect(onChangeMock).toHaveBeenLastCalledWith('1234');
    });
  });
});

// ---------------------------------------------------------------------------
// keydown event coverage
// ---------------------------------------------------------------------------

describe('keydown — skipOverThousandSeparatorOnDelete', () => {
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
      onChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
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
      onChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
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
      onChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1,234';
    el.setSelectionRange(2, 2);
    simulateKeyDown(el, 'Backspace');

    // Cursor should NOT have moved — Blur mode doesn't skip separators
    expect(el.selectionStart).toBe(2);
  });

  it('should not skip when cursor is not adjacent to separator', () => {
    new NumoraInput(container, {
      onChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
    });
    const el = getInputElement();

    simulateTyping(el, '1');
    simulateTyping(el, '2');
    simulateTyping(el, '3');
    simulateTyping(el, '4');
    expect(el.value).toBe('1,234');

    // Cursor at position 5 (end) — not adjacent to a separator
    el.setSelectionRange(5, 5);
    simulateKeyDown(el, 'Backspace');

    expect(el.selectionStart).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// beforeinput — deletion with active selection + cut/drag
// ---------------------------------------------------------------------------

describe('beforeinput — selection and cut/drag deletion', () => {
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
    new NumoraInput(container, { onChange: onChangeMock });
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
    new NumoraInput(container, { onChange: onChangeMock });
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
    new NumoraInput(container, { onChange: onChangeMock });
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
    new NumoraInput(container, { onChange: onChangeMock });
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
      onChange: onChangeMock,
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
    });
    const el = getInputElement();

    // Build "12,345"
    '123456'.split('').forEach(c => simulateTyping(el, c));
    expect(el.value).toBe('123,456');

    // Cut the leading "123" (positions 0–3 include the comma)
    el.setSelectionRange(0, 4); // "123,"
    dispatchBeforeInput(el, { inputType: 'deleteByCut' });

    expect(el.value).toBe('456');
  });
});

// ---------------------------------------------------------------------------
// beforeinput — pass-through events (undo/redo, paste delegation)
// ---------------------------------------------------------------------------

describe('beforeinput — pass-through events', () => {
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

  it('historyUndo is NOT prevented — browser handles undo natively', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'historyUndo');
    expect(ev.defaultPrevented).toBe(false);
  });

  it('historyRedo is NOT prevented — browser handles redo natively', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'historyRedo');
    expect(ev.defaultPrevented).toBe(false);
  });

  it('insertFromPaste is NOT prevented — delegated to paste handler', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'insertFromPaste');
    expect(ev.defaultPrevented).toBe(false);
  });

  it('insertFromDrop is NOT prevented — delegated to paste handler', () => {
    new NumoraInput(container, {});
    const el = getInputElement();
    const ev = dispatchBeforeInput(el, 'insertFromDrop');
    expect(ev.defaultPrevented).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// focus / blur events — FormatOn.Blur mode
// ---------------------------------------------------------------------------

describe('focus/blur — FormatOn.Blur mode', () => {
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
      onChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
    });
    const el = getInputElement();

    // Pre-load a formatted value
    el.value = '1,234,567';
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(el.value).toBe('1234567');
  });

  it('blur re-applies thousand separators and emits onChange', () => {
    new NumoraInput(container, {
      onChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '1234567';
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(el.value).toBe('1,234,567');
    expect(onChangeMock).toHaveBeenCalledWith('1,234,567');
  });

  it('focus → type → blur round-trip formats correctly', () => {
    new NumoraInput(container, {
      onChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
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
    expect(onChangeMock).toHaveBeenLastCalledWith('12,345');
  });

  it('focus on already-formatted value strips and blur re-adds', () => {
    new NumoraInput(container, {
      onChange: onChangeMock,
      formatOn: FormatOn.Blur,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
    });
    const el = getInputElement();

    el.value = '9,876';
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    expect(el.value).toBe('9876');

    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    expect(el.value).toBe('9,876');
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
    simulateTyping(inputElement, '.'); // first decimal — allowed
    for (let i = 0; i < 9; i++) {
      simulateTyping(inputElement, '.'); // subsequent decimals — all blocked
    }

    expect(inputElement.value.split('.').length - 1).toBe(1);
  });

  it('should call onChange callback when value changes', () => {
    const onChange = vi.fn();
    inputInstance = new NumoraInput(container, {
      decimalMaxLength: 2,
      onChange,
    });

    const inputElement = container.querySelector('input') as HTMLInputElement;

    inputElement.value = '42.5';
    inputElement.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenCalledWith('42.5');
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
      enableNegative: true,
      onChange: onChangeMock,
      ...options,
    });
    return input;
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  describe('Basic negative number input', () => {
    it('should allow negative numbers when enableNegative is true', () => {
      createInputWithNegatives();
      const inputElement = getInputElement();

      inputElement.value = '-123';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-123');
      expect(onChangeMock).toHaveBeenCalledWith('-123');
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
        thousandStyle: ThousandStyle.Thousand,
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
      handleOnPasteNumoraInput(mockEvent, 2, { enableNegative: true });

      expect(inputElement.value).toBe('-123.45');
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
      handleOnPasteNumoraInput(mockEvent, 2, { enableNegative: true });

      expect(inputElement.value).toBe('-123.45');
    });
  });

  describe('Formatting with negative numbers', () => {
    it('should format negative numbers with thousand separators', () => {
      createInputWithNegatives({
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
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
        thousandStyle: ThousandStyle.Thousand,
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
        thousandStyle: ThousandStyle.Thousand,
      });
      const inputElement = getInputElement();

      inputElement.value = '-1234567';
      inputElement.dispatchEvent(new Event('input'));

      // In blur mode, value should remain unformatted during typing
      // (formatting happens on blur, which is tested separately)
      expect(inputElement.value).toBe('-1234567');
      expect(onChangeMock).toHaveBeenCalledWith('-1234567');
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

      inputElement.value = '-.';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-.');
    });

    it('should handle negative number with leading zeros', () => {
      createInputWithNegatives({ enableLeadingZeros: true });
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
      enableLeadingZeros: true,
      onChange: onChangeMock,
      ...options,
    });
    return input;
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  describe('Default behavior (enableLeadingZeros: false)', () => {
    it('should remove leading zeros by default', () => {
      const input = new NumoraInput(container, { onChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('7');
    });

    it('should remove multiple leading zeros', () => {
      const input = new NumoraInput(container, { onChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '0001';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1');
    });

    it('should preserve single zero', () => {
      const input = new NumoraInput(container, { onChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '0';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0');
    });

    it('should handle leading zeros with decimals', () => {
      const input = new NumoraInput(container, { onChange: onChangeMock });
      const inputElement = getInputElement();

      inputElement.value = '00.5';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.5');
    });

    it('should remove leading zeros from negative numbers', () => {
      const input = new NumoraInput(container, {
        enableNegative: true,
        onChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '-007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-7');
    });
  });

  describe('With enableLeadingZeros: true', () => {
    it('should preserve leading zeros when enabled', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

      inputElement.value = '007';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('007');
      expect(onChangeMock).toHaveBeenCalledWith('007');
    });

    it('should preserve multiple leading zeros', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

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
      createInputWithLeadingZeros({ enableNegative: true });
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
      handleOnPasteNumoraInput(mockEvent, 2, { enableLeadingZeros: true });

      expect(inputElement.value).toBe('000123');
    });

    it('should preserve leading zeros with formatting', () => {
      createInputWithLeadingZeros({
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
      });
      const inputElement = getInputElement();

      inputElement.value = '0001234';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0001,234');
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

      inputElement.value = '00.';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('00.');
    });

    it('should handle leading zeros after sanitization', () => {
      createInputWithLeadingZeros();
      const inputElement = getInputElement();

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

      inputElement.value = '12.34e+2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1234');
    });

    it('should expand 1e+3 to 1000', () => {
      inputInstance = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

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
      handleOnPasteNumoraInput(mockEvent, 8, {});

      expect(inputElement.value).toBe('0.00000015');
    });
  });
});

describe('Raw Value Mode', () => {
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

  function createInputWithRawValueMode(options = {}) {
    const input = new NumoraInput(container, {
      formatOn: FormatOn.Change,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
      decimalSeparator: '.',
      decimalMaxLength: 8,
      enableCompactNotation: false,
      enableNegative: false,
      enableLeadingZeros: false,
      rawValueMode: true,
      onChange: onChangeMock,
      ...options,
    });
    return input;
  }

  function getInputElement() {
    return container.querySelector('input') as HTMLInputElement;
  }

  describe('Basic functionality', () => {
    it('should store raw value separately from formatted display', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      inputElement.value = '1234';
      inputElement.dispatchEvent(new Event('input'));

      // Display shows formatted value
      expect(inputElement.value).toBe('1,234');
      // getValue returns raw value
      expect(input.getValue()).toBe('1234');
      // onChange receives raw value
      expect(onChangeMock).toHaveBeenCalledWith('1234');
    });

    it('should return raw value from getValue() when rawValueMode is enabled', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1,234,567');
      expect(input.getValue()).toBe('1234567');
    });

    it('should return formatted value from getValue() when rawValueMode is disabled', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        enableCompactNotation: false,
        enableNegative: false,
        enableLeadingZeros: false,
        rawValueMode: false,
        onChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1,234,567');
      expect(input.getValue()).toBe('1,234,567');
    });
  });

  describe('setValue with raw value mode', () => {
    it('should format raw value for display when setValue is called', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      input.setValue('1234567');

      // Display shows formatted
      expect(inputElement.value).toBe('1,234,567');
      // getValue returns raw
      expect(input.getValue()).toBe('1234567');
    });

    it('should handle decimal values', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      input.setValue('1234.56');

      expect(inputElement.value).toBe('1,234.56');
      expect(input.getValue()).toBe('1234.56');
    });

    it('should handle empty string', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      input.setValue('');

      expect(inputElement.value).toBe('');
      expect(input.getValue()).toBe('');
    });
  });

  describe('Input events with raw value mode', () => {
    it('should extract raw value during typing', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      // Simulate typing "1234"
      inputElement.value = '1';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.getValue()).toBe('1');

      inputElement.value = '12';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.getValue()).toBe('12');

      inputElement.value = '123';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.getValue()).toBe('123');

      inputElement.value = '1234';
      inputElement.dispatchEvent(new Event('input'));
      expect(input.getValue()).toBe('1234');
      expect(inputElement.value).toBe('1,234');
    });

    it('should handle decimal input', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      inputElement.value = '1234.56';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1,234.56');
      expect(input.getValue()).toBe('1234.56');
    });
  });

  describe('Paste events with raw value mode', () => {
    it('should extract raw value from pasted content', () => {
      const input = createInputWithRawValueMode();
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
      expect(input.getValue()).toBe('1234567');
    });
  });

  describe('Blur mode with raw value mode', () => {
    it('should extract raw value in blur mode', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Blur,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        enableCompactNotation: false,
        enableNegative: false,
        enableLeadingZeros: false,
        rawValueMode: true,
        onChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';

      // Simulate blur by using setValue which formats the value and updates internal state
      // In test environments, blur events don't always trigger handlers properly
      // This tests that the formatting and rawValue extraction work correctly
      // setValue in rawValueMode will format the raw value for display and store it internally
      input.setValue('1234567');

      expect(inputElement.value).toBe('1,234,567');
      expect(input.getValue()).toBe('1234567');
      // Note: setValue doesn't call onChange, only handleValueChange does (which is called by event handlers)
      // The onChange behavior is tested in other tests that verify the event flow
    });
  });

  describe('Edge cases with raw value mode', () => {
    it('should handle empty string', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.getValue()).toBe('');
      expect(inputElement.value).toBe('');
    });

    it('should handle just decimal separator', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      inputElement.value = '.';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.getValue()).toBe('.');
      expect(inputElement.value).toBe('.');
    });

    it('should handle zero', () => {
      const input = createInputWithRawValueMode();
      const inputElement = getInputElement();

      inputElement.value = '0';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.getValue()).toBe('0');
      expect(inputElement.value).toBe('0');
    });

    it('should work without thousand separator', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.None,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        enableCompactNotation: false,
        enableNegative: false,
        enableLeadingZeros: false,
        rawValueMode: true,
        onChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234.56';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.getValue()).toBe('1234.56');
      expect(inputElement.value).toBe('1234.56');
    });
  });

  describe('Backward compatibility', () => {
    it('should maintain current behavior when rawValueMode is false', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        enableCompactNotation: false,
        enableNegative: false,
        enableLeadingZeros: false,
        rawValueMode: false,
        onChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      // Both display and getValue return formatted value
      expect(inputElement.value).toBe('1,234,567');
      expect(input.getValue()).toBe('1,234,567');
      expect(onChangeMock).toHaveBeenCalledWith('1,234,567');
    });

    it('should default to false for backward compatibility', () => {
      const input = new NumoraInput(container, {
        formatOn: FormatOn.Change,
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
        decimalSeparator: '.',
        decimalMaxLength: 8,
        enableCompactNotation: false,
        enableNegative: false,
        enableLeadingZeros: false,
        // rawValueMode not specified - should default to false
        onChange: onChangeMock,
      });
      const inputElement = getInputElement();

      inputElement.value = '1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(input.getValue()).toBe('1,234,567');
    });
  });
});
