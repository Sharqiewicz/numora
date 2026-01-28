/**
 * Performance benchmarks for Numora formatting functions.
 * Run with: npx vitest bench
 */
import { bench, describe } from 'vitest';
import { formatWithSeparators } from '../src/features/formatting';
import { removeThousandSeparators, sanitizeNumoraInput } from '../src/features/sanitization';
import { removeNonNumericCharacters } from '../src/features/non-numeric-characters';
import { expandCompactNotation } from '../src/features/compact-notation';
import { expandScientificNotation } from '../src/features/scientific-notation';
import { calculateCursorPositionAfterFormatting } from '../src/features/formatting/cursor-position';
import { ThousandStyle } from '../src/types';

describe('Formatting Benchmarks', () => {
  describe('formatWithSeparators', () => {
    bench('small number (1234)', () => {
      formatWithSeparators('1234', ',', ThousandStyle.Thousand);
    });

    bench('medium number (1234567)', () => {
      formatWithSeparators('1234567', ',', ThousandStyle.Thousand);
    });

    bench('large number (1234567890123)', () => {
      formatWithSeparators('1234567890123', ',', ThousandStyle.Thousand);
    });

    bench('very large number (19 digits)', () => {
      formatWithSeparators('1234567890123456789', ',', ThousandStyle.Thousand);
    });

    bench('with decimals (1234567.89)', () => {
      formatWithSeparators('1234567.89', ',', ThousandStyle.Thousand, false, '.');
    });

    bench('lakh style (1234567)', () => {
      formatWithSeparators('1234567', ',', ThousandStyle.Lakh);
    });

    bench('wan style (12345678)', () => {
      formatWithSeparators('12345678', ',', ThousandStyle.Wan);
    });
  });

  describe('removeThousandSeparators', () => {
    bench('small formatted (1,234)', () => {
      removeThousandSeparators('1,234', ',');
    });

    bench('medium formatted (1,234,567)', () => {
      removeThousandSeparators('1,234,567', ',');
    });

    bench('large formatted (1,234,567,890,123)', () => {
      removeThousandSeparators('1,234,567,890,123', ',');
    });

    bench('with different separator (.)', () => {
      removeThousandSeparators('1.234.567', '.');
    });

    bench('with space separator', () => {
      removeThousandSeparators('1 234 567', ' ');
    });
  });

  describe('removeNonNumericCharacters', () => {
    bench('clean numeric input', () => {
      removeNonNumericCharacters('1234567890');
    });

    bench('mixed alphanumeric', () => {
      removeNonNumericCharacters('a1b2c3d4e5f6g7h8i9j0');
    });

    bench('mostly non-numeric', () => {
      removeNonNumericCharacters('abcdefghij1klmnopqrs2tuvwxyz3');
    });

    bench('with special characters', () => {
      removeNonNumericCharacters('$1,234.56!@#%^&*()');
    });

    bench('with negative sign enabled', () => {
      removeNonNumericCharacters('-123abc456', true);
    });
  });

  describe('expandCompactNotation', () => {
    bench('thousand (1k)', () => {
      expandCompactNotation('1k');
    });

    bench('million (1m)', () => {
      expandCompactNotation('1m');
    });

    bench('billion (1b)', () => {
      expandCompactNotation('1b');
    });

    bench('trillion (1t)', () => {
      expandCompactNotation('1t');
    });

    bench('with decimal (1.5k)', () => {
      expandCompactNotation('1.5k');
    });

    bench('no expansion needed', () => {
      expandCompactNotation('12345');
    });
  });

  describe('expandScientificNotation', () => {
    bench('positive exponent (1e5)', () => {
      expandScientificNotation('1e5');
    });

    bench('negative exponent (1e-5)', () => {
      expandScientificNotation('1e-5');
    });

    bench('with decimal (1.5e5)', () => {
      expandScientificNotation('1.5e5');
    });

    bench('large exponent (1e20)', () => {
      expandScientificNotation('1e20');
    });

    bench('small exponent (1e-20)', () => {
      expandScientificNotation('1e-20');
    });

    bench('no expansion needed', () => {
      expandScientificNotation('12345');
    });
  });

  describe('sanitizeNumoraInput', () => {
    bench('clean input', () => {
      sanitizeNumoraInput('1234567', {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
    });

    bench('with thousand separators', () => {
      sanitizeNumoraInput('1,234,567', {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
    });

    bench('with compact notation', () => {
      sanitizeNumoraInput('1.5k', {
        thousandSeparator: ',',
        decimalSeparator: '.',
        enableCompactNotation: true,
      });
    });

    bench('with scientific notation', () => {
      sanitizeNumoraInput('1.5e5', {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
    });

    bench('mixed input', () => {
      sanitizeNumoraInput('$1,234.56abc', {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
    });
  });

  describe('Cursor Position Calculation', () => {
    bench('insertion - no separator change', () => {
      calculateCursorPositionAfterFormatting(
        '123',
        '1234',
        3,
        ',',
        ThousandStyle.Thousand
      );
    });

    bench('insertion - separator added', () => {
      calculateCursorPositionAfterFormatting(
        '999',
        '1,000',
        3,
        ',',
        ThousandStyle.Thousand
      );
    });

    bench('deletion - separator removed', () => {
      calculateCursorPositionAfterFormatting(
        '1,000',
        '100',
        2,
        ',',
        ThousandStyle.Thousand
      );
    });

    bench('large number insertion', () => {
      calculateCursorPositionAfterFormatting(
        '123,456,789',
        '1,234,567,890',
        11,
        ',',
        ThousandStyle.Thousand
      );
    });

    bench('with decimal values', () => {
      calculateCursorPositionAfterFormatting(
        '1,234.5',
        '12,345.5',
        5,
        ',',
        ThousandStyle.Thousand,
        undefined,
        '.'
      );
    });
  });

  describe('Full Pipeline Simulation', () => {
    bench('typical user input flow', () => {
      // Simulate what happens on each keystroke
      const value = '1,234,567.89';
      const sanitized = sanitizeNumoraInput(value, {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
      formatWithSeparators(sanitized, ',', ThousandStyle.Thousand, false, '.');
    });

    bench('paste with compact notation', () => {
      const value = '1.5k';
      const sanitized = sanitizeNumoraInput(value, {
        thousandSeparator: ',',
        decimalSeparator: '.',
        enableCompactNotation: true,
      });
      formatWithSeparators(sanitized, ',', ThousandStyle.Thousand, false, '.');
    });

    bench('paste with scientific notation', () => {
      const value = '1.5e6';
      const sanitized = sanitizeNumoraInput(value, {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
      formatWithSeparators(sanitized, ',', ThousandStyle.Thousand, false, '.');
    });
  });
});
