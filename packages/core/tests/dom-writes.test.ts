import { describe, it, expect } from 'vitest';
import { writeValue } from '../src/features/formatting/dom-writes';

/**
 * Testing module: features/formatting/dom-writes.ts
 *
 * `setRangeText` fires no `input` event (HTML spec; verified in jsdom and Chrome). Both
 * packages rely on this: internal writes call onValueChange themselves and have no guard
 * against a second `onValueChange` from an `input` event, so these tests pin the fact.
 */

describe('writeValue', () => {
  it('fires no input event on the element', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    el.value = '123';

    let inputEventCount = 0;
    el.addEventListener('input', () => {
      inputEventCount += 1;
    });

    writeValue(el, '1,234', 5);

    expect(el.value).toBe('1,234');
    expect(inputEventCount).toBe(0);

    document.body.removeChild(el);
  });

  it('is a no-op (and still fires no input event) when value and caret already match', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    el.value = '1,234';
    el.setSelectionRange(5, 5);

    let inputEventCount = 0;
    el.addEventListener('input', () => {
      inputEventCount += 1;
    });

    writeValue(el, '1,234', 5);

    expect(inputEventCount).toBe(0);

    document.body.removeChild(el);
  });
});

describe("writeValue with selectMode 'preserve' (focus-strip)", () => {
  it('fires no input event on the element', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    el.value = '1,234';

    let inputEventCount = 0;
    el.addEventListener('input', () => {
      inputEventCount += 1;
    });

    writeValue(el, '1234', 4, 4, 'preserve');

    expect(el.value).toBe('1234');
    expect(inputEventCount).toBe(0);

    document.body.removeChild(el);
  });
});
