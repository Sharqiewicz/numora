import { act, render, screen } from '@testing-library/react';
import { NumoraInput as VanillaNumoraInput, type NumoraOptions, type NumoraValues } from 'numora';
import { afterEach, describe, expect, it } from 'vitest';
import { NumoraInput, type NumoraHTMLInputElement } from '../src/index';

/**
 * The vanilla class and the React component are two wrappers over the same core. The same
 * edits must produce the same `onValueChange` payloads and the same handle values.
 */

type Step = { type: string } | { paste: string } | 'focus' | 'blur';

const CASES: [string, NumoraOptions, Step[]][] = [
  ['defaults', {}, ['focus', { type: '1234567.5' }, 'blur']],
  ['format on change', { formatOn: 'change' }, ['focus', { type: '1234567.5' }, 'blur']],
  ['de-DE', { locale: 'de-DE' }, ['focus', { type: '1234,5' }, 'blur']],
  ['de-DE, typed dot', { locale: 'de-DE', formatOn: 'change' }, ['focus', { type: '1234.5' }, 'blur']],
  ['en-IN', { locale: 'en-IN', formatOn: 'change' }, ['focus', { type: '1234567' }, 'blur']],
  ['min decimals pad on blur', { decimalMinLength: 2 }, ['focus', { type: '5' }, 'blur']],
  ['max decimals', { decimalMaxLength: 2 }, ['focus', { type: '1.239' }, 'blur']],
  ['negative zero', { allowNegative: true }, ['focus', { type: '-0' }, 'blur']],
  ['trailing separator', {}, ['focus', { type: '12.' }, 'blur']],
  ['paste foreign format', { locale: 'en-US' }, ['focus', { paste: '1.234.567,89' }, 'blur']],
  ['paste compact', { allowCompactNotation: true }, ['focus', { paste: '1.5k' }, 'blur']],
  ['rejected characters', {}, ['focus', { type: '1a2,b3' }, 'blur']],
];

function run(el: HTMLInputElement, steps: Step[]): void {
  for (const step of steps) {
    if (step === 'focus') {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    } else if (step === 'blur') {
      el.blur();
    } else if ('type' in step) {
      for (const data of step.type) {
        el.dispatchEvent(
          new InputEvent('beforeinput', { data, inputType: 'insertText', bubbles: true, cancelable: true })
        );
      }
    } else {
      const event = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', { value: { getData: () => step.paste } });
      el.dispatchEvent(event);
    }
  }
}

describe('vanilla / React parity', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each(CASES)('%s', (_name, options, steps) => {
    const vanillaCalls: NumoraValues[] = [];
    const host = document.body.appendChild(document.createElement('div'));
    const vanilla = new VanillaNumoraInput(host, {
      ...options,
      onValueChange: (values) => vanillaCalls.push(values),
    });
    run(vanilla.element, steps);

    const reactCalls: NumoraValues[] = [];
    render(
      <NumoraInput data-testid="amount" {...options} onValueChange={(values) => reactCalls.push(values)} />
    );
    const el = screen.getByTestId('amount') as NumoraHTMLInputElement;
    act(() => run(el, steps));

    expect(reactCalls).toEqual(vanillaCalls);
    expect(vanillaCalls.length).toBeGreaterThan(0);
    expect(el.rawValue).toBe(vanilla.rawValue);
    expect(el.formattedValue).toBe(vanilla.formattedValue);
    expect(el.value).toBe(vanilla.element.value);
  });
});
