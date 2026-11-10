import { render, screen } from '@testing-library/react';
import { useEffect, useLayoutEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput, type NumoraInputChangeEvent } from '../src/index';

/** Behaviour that the second mutation round found untested (packages/react/src). */

function typeChar(el: HTMLInputElement, char: string): void {
  const be = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: char,
  });
  el.dispatchEvent(be);
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('synthetic change event', () => {
  it('its nativeEvent is a non-cancelable change event (index.tsx:82)', () => {
    let ev: NumoraInputChangeEvent | undefined;
    render(
      <NumoraInput
        data-testid="i"
        onChange={(e) => {
          ev = e;
        }}
      />
    );
    typeChar(screen.getByTestId('i') as HTMLInputElement, '1');
    expect(ev?.nativeEvent.cancelable).toBe(false);
    expect(ev?.nativeEvent.bubbles).toBe(true);
  });

  it('functions read through e.target are bound to the real input, other props pass through (index.tsx:87)', () => {
    let self: unknown;
    let plain: unknown;
    const el0 = { current: null as (HTMLInputElement & { probe?: () => unknown }) | null };
    render(
      <NumoraInput
        data-testid="i"
        ref={el0 as never}
        onChange={(e) => {
          const t = e.target as unknown as { probe: () => unknown; id: string };
          self = t.probe();
          plain = t.id;
        }}
        id="x"
      />
    );
    const el = screen.getByTestId('i') as HTMLInputElement & { probe?: () => unknown };
    el.probe = function (this: unknown) {
      return this;
    };
    typeChar(el, '1');
    expect(self).toBe(el);
    expect(plain).toBe('x');
  });
});

describe("initial display value (index.tsx:273, the `?? ''` literal is otherwise equivalent)", () => {
  it('a letter separator is not fed the stringified `undefined` of a missing value', () => {
    // Pins the empty field when no value or defaultValue is given (the `?? ''` fallback;
    // letters of a stringified `undefined` must not be read as separators).
    render(<NumoraInput data-testid="i" decimalSeparator="n" thousandSeparator="," />);
    expect((screen.getByTestId('i') as HTMLInputElement).value).toBe('');
  });
});

describe('controlled value sync (index.tsx:311)', () => {
  it('a parent value that formats to what is already shown does not rewrite the field', () => {
    const { rerender } = render(<NumoraInput data-testid="i" value="1" onChange={() => {}} />);
    const el = screen.getByTestId('i') as HTMLInputElement;
    // writeValuePreservingUndo only skips an identical write when the caret already sits at
    // the end, so a caret elsewhere shows whether the field was touched.
    el.setSelectionRange(0, 0);
    // "1." differs from "1" as a number string, but its display form is "1" (trailing
    // separator stripped), which the field already shows.
    rerender(<NumoraInput data-testid="i" value="1." onChange={() => {}} />);
    expect(el.value).toBe('1');
    expect(el.selectionStart).toBe(0);
  });
});

describe('useIsomorphicLayoutEffect (use-isomorphic-layout-effect.ts:4)', () => {
  it('is useLayoutEffect where a window exists', async () => {
    const m = await import('../src/use-isomorphic-layout-effect');
    expect(m.useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });
  it('is useEffect on the server (no window)', async () => {
    vi.stubGlobal('window', undefined);
    vi.resetModules();
    const m = await import('../src/use-isomorphic-layout-effect');
    expect(m.useIsomorphicLayoutEffect).toBe(useEffect);
  });
});
