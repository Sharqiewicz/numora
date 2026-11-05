/**
 * Caret benchmarks. Run with `pnpm bench` (root) or `pnpm --filter numora bench`.
 * Deliberately NOT part of `pnpm test` or CI: `vitest run` only collects `*.test.ts`.
 *
 * - "caret mapping": `computeCaretFromEdit` alone, for a digit typed mid-value.
 * - "keystroke": the whole `beforeinput` path (sanitize + format + caret).
 */
import { bench, describe } from 'vitest';
import { computeCaretFromEdit } from '../src/utils/caret';
import { formatInputValue } from '../src/utils/format-utils';
import { handleOnBeforeInputNumoraInput } from '../src/utils/event-handlers';
import { FormatOn, GroupingStyle } from '../src/types';
import type { FormattingOptions } from '../src/types';

const DEC_MAX = 8;
const options: FormattingOptions = {
  thousandSeparator: ',',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Change,
  decimalSeparator: '.',
};

const digits = (n: number) => Array.from({ length: n }, (_, i) => String((i % 9) + 1)).join('');
const group = (d: string) => d.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

for (const n of [30, 100, 1000]) {
  const base = group(digits(n));
  const mid = base.length >> 1;
  const typed = base.slice(0, mid) + '7' + base.slice(mid);
  const { formatted } = formatInputValue(typed, DEC_MAX, options, true);

  describe(`${n} digits`, () => {
    bench('caret mapping', () => {
      computeCaretFromEdit(typed.slice(0, mid + 1), formatted, DEC_MAX, options, true);
    });

    const input = document.createElement('input');
    input.value = base;
    input.setSelectionRange(mid, mid);
    const event = {
      inputType: 'insertText',
      data: '7',
      target: input,
      preventDefault() {},
    } as unknown as InputEvent;
    bench('full keystroke (sanitize + format + caret)', () => {
      handleOnBeforeInputNumoraInput(event, DEC_MAX, options);
    });
  });
}
