import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { handleOnPasteNumoraInput } from '../src/utils/event-handlers';

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
    { input: '00.00123...4', decimalMaxLength: 4, expected: '00.0012' },
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

      const result = handleOnPasteNumoraInput(mockEvent, decimalMaxLength);
      expect(result).toBe(expected);
      expect(mockInputElement.value).toBe(expected);
    }
  );
});

describe('NumoraInput edge cases', () => {
  let container: HTMLElement;
  let NumoraInput: NumoraInput;

  beforeEach(() => {
    vi.restoreAllMocks();

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should accept only one decimal point', () => {
    NumoraInput = new NumoraInput(container, { decimalMaxLength: 3 });
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
    NumoraInput = new NumoraInput(container, {
      decimalMaxLength: 2,
      onChange,
    });

    const inputElement = container.querySelector('input') as HTMLInputElement;

    inputElement.value = '42.5';
    inputElement.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenCalledWith('42.5');
  });

  it('should allow navigation keys', () => {
    NumoraInput = new NumoraInput(container, { decimalMaxLength: 2 });
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
        formatOn: 'change',
        thousandSeparator: ',',
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
        formatOn: 'change',
        thousandSeparator: ',',
        ThousandStyle: 'thousand',
      });
      const inputElement = getInputElement();

      inputElement.value = '-1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-1,234,567');
    });

    it('should format negative decimal numbers with separators', () => {
      createInputWithNegatives({
        formatOn: 'change',
        thousandSeparator: ',',
        ThousandStyle: 'thousand',
        decimalMaxLength: 2,
      });
      const inputElement = getInputElement();

      inputElement.value = '-1234567.89';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-1,234,567.89');
    });

    it('should handle negative numbers in blur mode', () => {
      createInputWithNegatives({
        formatOn: 'blur',
        thousandSeparator: ',',
        ThousandStyle: 'thousand',
      });
      const inputElement = getInputElement();

      inputElement.value = '-1234567';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('-1234567');

      inputElement.dispatchEvent(new Event('blur'));

      expect(inputElement.value).toBe('-1,234,567');
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
        formatOn: 'change',
        thousandSeparator: ',',
        ThousandStyle: 'thousand',
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
  let NumoraInput: NumoraInput;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Negative exponents (small numbers)', () => {
    it('should expand 1.5e-7 to 0.00000015', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 8 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e-7';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.00000015');
    });

    it('should expand 1.5e-1 to 0.15', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e-1';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.15');
    });

    it('should expand 1.23e-4 to 0.000123', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 6 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.23e-4';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.000123');
    });

    it('should expand 2e-3 to 0.002', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 3 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '2e-3';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.002');
    });

    it('should expand 0.5e-2 to 0.005', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 3 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '0.5e-2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.005');
    });

    it('should expand 1e-10 to 0.0000000001', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 10 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1e-10';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.0000000001');
    });

    it('should expand 123.456e-2 to 1.23456', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 5 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '123.456e-2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1.23456');
    });
  });

  describe('Positive exponents (large numbers)', () => {
    it('should expand 2e+5 to 200000', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '2e+5';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('200000');
    });

    it('should expand 1.5e+2 to 150', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e+2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('150');
    });

    it('should expand 1.5e+1 to 15', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e+1';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('15');
    });

    it('should expand 12.34e+1 to 123.4', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 1 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '12.34e+1';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('123.4');
    });

    it('should expand 12.34e+2 to 1234', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '12.34e+2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1234');
    });

    it('should expand 1e+3 to 1000', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 0 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1e+3';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1000');
    });
  });

  describe('Edge cases', () => {
    it('should handle exponent of 0', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5e0';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('1.5');
    });

    it('should handle uppercase E', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 8 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.5E-7';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.00000015');
    });

    it('should handle integer base without decimal point', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 3 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '5e-3';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.005');
    });

    it('should respect decimalMaxLength when expanding', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '1.234567e-2';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('0.01');
    });

    it('should not expand non-scientific notation', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 2 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      inputElement.value = '123.45';
      inputElement.dispatchEvent(new Event('input'));

      expect(inputElement.value).toBe('123.45');
    });

    it('should handle paste events with scientific notation', () => {
      NumoraInput = new NumoraInput(container, { decimalMaxLength: 8 });
      const inputElement = container.querySelector('input') as HTMLInputElement;

      const mockEvent = {
        target: inputElement,
        preventDefault: vi.fn(),
        clipboardData: {
          getData: vi.fn().mockReturnValue('1.5e-7'),
        },
      } as unknown as ClipboardEvent;

      inputElement.value = '';
      handleOnPasteNumoraInput(mockEvent, 8);

      expect(inputElement.value).toBe('0.00000015');
    });
  });
});
