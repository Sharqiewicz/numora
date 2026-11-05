import { describe, it, expect } from 'vitest';
import {
  writeValuePreservingUndo,
  writeStripPreservingUndo,
} from '../src/features/formatting/dom-writes';

/**
 * Testing module: features/formatting/dom-writes.ts
 *
 * `setRangeText` fires no `input` event in jsdom (browsers agree per spec). These tests
 * pin that fact so the comments describing `withInternalWrite`'s guard in both packages
 * stay honest: the guard protects against environments that *would* dispatch one, not
 * against a real synchronous event from `setRangeText` itself.
 */

describe('writeValuePreservingUndo', () => {
  it('fires no input event on the element', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    el.value = '123';

    let inputEventCount = 0;
    el.addEventListener('input', () => {
      inputEventCount += 1;
    });

    writeValuePreservingUndo(el, '1,234', 5);

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

    writeValuePreservingUndo(el, '1,234', 5);

    expect(inputEventCount).toBe(0);

    document.body.removeChild(el);
  });
});

describe('writeStripPreservingUndo', () => {
  it('fires no input event on the element', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    el.value = '1,234';

    let inputEventCount = 0;
    el.addEventListener('input', () => {
      inputEventCount += 1;
    });

    writeStripPreservingUndo(el, '1234', 4, 4);

    expect(el.value).toBe('1234');
    expect(inputEventCount).toBe(0);

    document.body.removeChild(el);
  });
});
