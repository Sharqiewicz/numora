import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumericInput } from '../src/NumericInput';
import { handleOnPasteNumericInput } from '../src/utils/event-handlers';

describe('NumericInput Component', () => {
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
    const input = new NumericInput(container, {
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

  it('should replace comma with period', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    inputElement.value = '1,1';
    inputElement.dispatchEvent(new Event('input'));

    expect(onChangeMock).toHaveBeenCalled();
    expect(inputElement.value).toBe('1.1');
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

  it('should handle leading zeros correctly', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    inputElement.value = '007';
    inputElement.dispatchEvent(new Event('input'));

    expect(onChangeMock).toHaveBeenCalled();
    expect(inputElement.value).toBe('007');
  });

  it('should not allow negative numbers', () => {
    createInputWithPlaceholder();
    const inputElement = getInputElement();

    const event = new KeyboardEvent('keydown', { key: '-' });
    inputElement.dispatchEvent(event);

    expect(inputElement.value).toBe('');
  });

  it('should not allow more decimals than maxDecimals', () => {
    createInputWithPlaceholder({ maxDecimals: 2 });
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
    createInputWithPlaceholder({ maxDecimals: 3 });
    const inputElement = getInputElement();

    inputElement.value = '123.4567';

    inputElement.dispatchEvent(new Event('paste'));

    expect(inputElement.value).toContain('123.456');
  });

  it('should handle paste events with multiple dots and commas', () => {
    createInputWithPlaceholder({ maxDecimals: 2 });
    const inputElement = getInputElement();

    inputElement.value = '123...45,,67.897';
    inputElement.dispatchEvent(new Event('paste'));

    expect(inputElement.value).toContain('123.45');
  });
});

describe('Paste handler sanitization cases', () => {
  const testCases = [
    { input: '1.......4.....2', maxDecimals: 8, expected: '1.42' },
    { input: '12....34.....56', maxDecimals: 8, expected: '12.3456' },
    { input: '....56789...', maxDecimals: 5, expected: '.56789' },
    { input: '1.23..4..56.', maxDecimals: 6, expected: '1.23456' },
    { input: '1.....2', maxDecimals: 8, expected: '1.2' },
    { input: '123..4...56.7', maxDecimals: 7, expected: '123.4567' },
    { input: 'a.b.c.123.4.def56', maxDecimals: 8, expected: '.123456' },
    { input: '12abc34....def567', maxDecimals: 2, expected: '1234.56' },
    { input: '.....a.b.c......', maxDecimals: 8, expected: '.' },
    { input: '12.....3..4..5abc6', maxDecimals: 7, expected: '12.3456' },
    { input: '1a2b3c4d5e.1234567', maxDecimals: 4, expected: '12345.1234' },
    { input: '12abc@#34..def$%^567', maxDecimals: 2, expected: '1234.56' },
    { input: '....!@#$$%^&*((', maxDecimals: 8, expected: '.' },
    { input: '123....abc.def456ghi789', maxDecimals: 4, expected: '123.4567' },
    { input: '00.00123...4', maxDecimals: 4, expected: '00.0012' },
    { input: '.1...2.67.865', maxDecimals: 3, expected: '.126' },
    { input: '123abc...', maxDecimals: 6, expected: '123.' },
  ];

  it.each(testCases)(
    'should sanitize "$input" to "$expected" with max $maxDecimals decimals',
    async ({ input, maxDecimals, expected }) => {
      const mockInputElement = document.createElement('input');
      mockInputElement.setSelectionRange = vi.fn();

      const mockEvent = {
        target: mockInputElement,
        preventDefault: vi.fn(),
        clipboardData: {
          getData: vi.fn().mockReturnValue(input),
        },
      } as unknown as ClipboardEvent;

      const result = handleOnPasteNumericInput(mockEvent, maxDecimals);
      expect(result).toBe(expected);
      expect(mockInputElement.value).toBe(expected);
    }
  );
});

describe('NumericInput edge cases', () => {
  let container: HTMLElement;
  let numericInput: NumericInput;

  beforeEach(() => {
    vi.restoreAllMocks();

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should accept only one decimal point', () => {
    numericInput = new NumericInput(container, { maxDecimals: 3 });
    const inputElement = container.querySelector('input') as HTMLInputElement;

    for (let i = 0; i < 10; i++) {
      const event = new KeyboardEvent('keydown', { key: '.' });
      inputElement.dispatchEvent(event);
      if (i === 0) {
        inputElement.value += '.';
      }
      inputElement.dispatchEvent(new Event('input'));
    }

    expect(inputElement.value.split('.').length - 1).toBe(1);
  });

  it('should call onChange callback when value changes', () => {
    const onChange = vi.fn();
    numericInput = new NumericInput(container, {
      maxDecimals: 2,
      onChange,
    });

    const inputElement = container.querySelector('input') as HTMLInputElement;

    inputElement.value = '42.5';
    inputElement.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenCalledWith('42.5');
  });

  it('should allow navigation keys', () => {
    numericInput = new NumericInput(container, { maxDecimals: 2 });
    const inputElement = container.querySelector('input') as HTMLInputElement;

    const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const preventDefaultSpy = vi.spyOn(arrowEvent, 'preventDefault');

    inputElement.dispatchEvent(arrowEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
