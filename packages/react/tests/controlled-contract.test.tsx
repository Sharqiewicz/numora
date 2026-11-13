import { act, render, screen } from '@testing-library/react';
import { StrictMode, useLayoutEffect, useRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput, type NumoraHTMLInputElement } from '../src/index';

/**
 * The controlled contract: after every change the field shows the `value` prop. A parent that
 * does not accept an edit (it keeps its state) gets the field put back.
 */

function typeChar(el: HTMLInputElement, char: string): void {
  act(() => {
    const be = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: char,
    });
    el.dispatchEvent(be);
  });
}
function paste(el: HTMLInputElement, text: string): Event {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  act(() => {
    el.dispatchEvent(ev);
  });
  return ev;
}
function nativeInput(el: HTMLInputElement, value: string, inputType: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set!;
  setter.call(el, value);
  el.setSelectionRange(value.length, value.length);
  act(() => {
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
  });
}
const field = () => screen.getByTestId('i') as HTMLInputElement;

afterEach(() => vi.restoreAllMocks());

/** Accepts a change only while the number is at most 100. */
function Capped({ via = 'onValueChange' }: { via?: 'onValueChange' | 'onChange' }) {
  const [v, setV] = useState('5');
  const accept = (value: string) => {
    if (Number(value) <= 100) setV(value);
  };
  return (
    <>
      <NumoraInput
        data-testid="i"
        value={v}
        {...(via === 'onChange'
          ? { onChange: (e) => accept(e.target.value) }
          : { onValueChange: ({ value }) => accept(value) })}
      />
      <output data-testid="state">{v}</output>
    </>
  );
}

describe('controlled field: the field shows the value prop after every change', () => {
  it.each(['onValueChange', 'onChange'] as const)(
    'a typed edit the parent does not accept is put back (%s)',
    (via) => {
      render(<Capped via={via} />);
      const el = field();
      act(() => el.focus());
      el.setSelectionRange(1, 1);
      typeChar(el, '0');
      expect(el.value).toBe('50');
      typeChar(el, '0');
      expect(screen.getByTestId('state').textContent).toBe('50');
      expect(el.value).toBe('50');
      // The caret is at the end, as in a native controlled <input> whose edit was refused.
      expect(el.selectionStart).toBe(2);
    }
  );

  it('an accepted edit is left alone: no rewrite, caret stays where the edit put it', () => {
    render(<Capped />);
    const el = field();
    act(() => el.focus());
    el.setSelectionRange(0, 0);
    typeChar(el, '1');
    expect(el.value).toBe('15');
    expect(el.selectionStart).toBe(1);
  });

  it('a paste the parent does not accept is put back', () => {
    render(<Capped />);
    const el = field();
    act(() => el.focus());
    el.setSelectionRange(0, 1);
    paste(el, '777');
    expect(el.value).toBe('5');
  });

  it('a browser-made change (input fallback) the parent does not accept is put back', () => {
    render(<Capped />);
    const el = field();
    act(() => el.focus());
    nativeInput(el, '900', 'historyUndo');
    expect(el.value).toBe('5');
  });

  it('a parent that never updates its state keeps the field fixed', () => {
    const onValueChange = vi.fn();
    render(<NumoraInput data-testid="i" value="12" onValueChange={onValueChange} />);
    const el = field();
    act(() => el.focus());
    el.setSelectionRange(2, 2);
    typeChar(el, '3');
    expect(onValueChange).toHaveBeenCalledWith({ value: '123', formattedValue: '123' });
    expect(el.value).toBe('12');
  });

  it('mid-entry text survives the echo: "1." and "0.0" are not collapsed', () => {
    function Echo() {
      const [v, setV] = useState('');
      return <NumoraInput data-testid="i" value={v} onValueChange={({ value }) => setV(value)} />;
    }
    render(<Echo />);
    const el = field();
    act(() => el.focus());
    for (const ch of '1.') typeChar(el, ch);
    expect(el.value).toBe('1.');
    for (const ch of '05') typeChar(el, ch);
    expect(el.value).toBe('1.05');
  });

  it('text still being composed by an IME is not touched', () => {
    render(<Capped />);
    const el = field();
    act(() => el.focus());
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set!;
    setter.call(el, '5９');
    act(() => {
      el.dispatchEvent(
        new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', isComposing: true })
      );
    });
    expect(el.value).toBe('5９');
  });

  it('an uncontrolled field does not re-render on a keystroke', () => {
    let renders = 0;
    function Probe() {
      renders++;
      return <NumoraInput data-testid="i" defaultValue="1" />;
    }
    render(<Probe />);
    const before = renders;
    typeChar(field(), '2');
    expect(renders).toBe(before);
    expect(field().value).toBe('12');
  });
});

describe('ref properties are there for the first layout effect', () => {
  it('rawValue / formattedValue in a parent useLayoutEffect and in a callback ref', () => {
    const seen: Array<[string, string, string]> = [];
    function Parent() {
      const ref = useRef<NumoraHTMLInputElement>(null);
      useLayoutEffect(() => {
        const el = ref.current as NumoraHTMLInputElement;
        seen.push(['layout', el.rawValue, el.formattedValue]);
      }, []);
      return (
        <>
          <NumoraInput ref={ref} defaultValue="1234.5" />
          <NumoraInput
            defaultValue="99"
            ref={(el: NumoraHTMLInputElement | null) => {
              if (el) seen.push(['callback', el.rawValue, el.formattedValue]);
            }}
          />
        </>
      );
    }
    render(
      <StrictMode>
        <Parent />
      </StrictMode>
    );
    expect(seen).toContainEqual(['layout', '1234.5', '1,234.5']);
    expect(seen).toContainEqual(['callback', '99', '99']);
    expect(seen.every(([, raw]) => raw !== undefined)).toBe(true);
  });
});

describe('native props and handlers of the app win', () => {
  it('autoComplete and spellCheck can be overridden; type and inputMode cannot', () => {
    render(
      <NumoraInput
        data-testid="i"
        autoComplete="cc-number"
        spellCheck
        {...({ type: 'number', inputMode: 'text' } as object)}
      />
    );
    const el = field();
    expect(el.getAttribute('autocomplete')).toBe('cc-number');
    expect(el.getAttribute('spellcheck')).toBe('true');
    expect(el.type).toBe('text');
    expect(el.getAttribute('inputmode')).toBe('decimal');
  });

  it('defaults stay autocomplete=off and spellcheck=false', () => {
    render(<NumoraInput data-testid="i" />);
    expect(field().getAttribute('autocomplete')).toBe('off');
    expect(field().getAttribute('spellcheck')).toBe('false');
  });

  it('onPaste runs first; preventDefault() in it stops the paste', () => {
    const onChange = vi.fn();
    render(
      <NumoraInput
        data-testid="i"
        defaultValue="5"
        onChange={onChange}
        onPaste={(e) => {
          expect(e.currentTarget.value).toBe('5');
          e.preventDefault();
        }}
      />
    );
    const ev = paste(field(), '123');
    expect(ev.defaultPrevented).toBe(true);
    expect(field().value).toBe('5');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('onKeyDown runs first; preventDefault() in it stops the separator skip', () => {
    const run = (prevent: boolean) => {
      const { unmount } = render(
        <NumoraInput
          data-testid="i"
          formatOn="change"
          defaultValue="1234"
          onKeyDown={(e) => prevent && e.preventDefault()}
        />
      );
      const el = field();
      act(() => el.focus());
      el.setSelectionRange(2, 2);
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
      });
      const caret = el.selectionStart;
      unmount();
      return caret;
    };
    expect(run(false)).toBe(1);
    expect(run(true)).toBe(2);
  });
});

describe('ref.setValue() is the app\'s own write', () => {
  const setup = (props: Record<string, unknown> = {}) => {
    const ref = { current: null as NumoraHTMLInputElement | null };
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const isAllowed = vi.fn(() => false);
    render(
      <NumoraInput
        data-testid="i"
        ref={ref}
        onChange={onChange}
        onValueChange={onValueChange}
        isAllowed={isAllowed}
        {...props}
      />
    );
    return { ref, onChange, onValueChange, isAllowed };
  };

  it('writes an uncontrolled field, grouped at rest, without callbacks or isAllowed', () => {
    const { ref, onChange, onValueChange, isAllowed } = setup();
    act(() => ref.current?.setValue('1234567.5'));
    expect(field().value).toBe('1,234,567.5');
    expect(ref.current?.rawValue).toBe('1234567.5');
    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(isAllowed).not.toHaveBeenCalled();
  });

  it('keeps the edit format on a focused blur-mode field', () => {
    const { ref } = setup({ formatOn: 'blur' });
    act(() => field().focus());
    act(() => ref.current?.setValue('1234567'));
    expect(field().value).toBe('1234567');
    act(() => field().blur());
    expect(field().value).toBe('1,234,567');
  });

  it('reads the value as canonical raw in a comma-decimal locale', () => {
    const { ref } = setup({ locale: 'de-DE' });
    act(() => ref.current?.setValue('1234.5'));
    expect(field().value).toBe('1.234,5');
  });

  it('a controlled field goes back to its value prop', () => {
    const { ref } = setup({ value: '5' });
    act(() => ref.current?.setValue('999'));
    expect(field().value).toBe('5');
  });
});
