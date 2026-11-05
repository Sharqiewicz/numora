import { useState } from 'react';
import { FormatOn, GroupingStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { InputPair } from '../InputPair';
import { CursorAnchorDiagram } from '../diagrams';

const inputClass =
  'w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring';

function NaiveFormattedInput() {
  const [value, setValue] = useState('1,234,567');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setValue(formatted);
  };

  return <input type="text" value={value} onChange={onChange} className={inputClass} />;
}

export function CursorPreservationSection() {
  return (
    <section id="cursor-preservation" className="space-y-4 scroll-mt-24">
      <h2>Cursor preservation</h2>
      <p>
        The classic input-mask bug: a user clicks into the middle of <code>1,234,567</code> to
        insert a digit, the formatter rebuilds the string with a new comma in a different place, and
        the cursor lands several characters away from where it should be.
      </p>
      <CursorAnchorDiagram />
      <p>
        Numora computes the caret from the edit itself. The text left of the edit plus the
        inserted text is run through the same sanitizer as the whole value (separators removed,
        leading zeros dropped, <code>1k</code> expanded, decimals trimmed). Its length is the
        caret's <em>rank</em>: the number of significant characters (digits, the decimal
        separator, a leading minus) before it. <code>positionAfterMatchedPrefix</code> then walks
        the formatted string, skipping injected thousand separators, until it has passed that many
        characters, and parks the cursor there. The user feels the caret stay "between the same
        two digits" no matter how the separators rearranged around it, and a paste whose tail was
        trimmed leaves the caret right after the last pasted character that survived. The grouping
        style only changes <em>where</em> the separators sit, so Thousand, Lakh and Wan need no
        per-style code. Separators are always exactly one character, so every comparison is a
        single-character comparison.
      </p>
      <p>
        Click between the <code>3</code> and the <code>4</code> in both inputs below and type a
        digit. The naive formatter jumps your cursor; Numora keeps it pinned:
      </p>
      <InputPair
        left={{
          label: 'Naive formatter (rebuilds the string)',
          tone: 'bad',
          input: <NaiveFormattedInput />,
          note: 'Reformats on every change. Cursor is restored to its old index, but the index now points at a different character.',
        }}
        right={{
          label: 'NumoraInput',
          tone: 'good',
          input: (
            <NumoraInput
              formatOn={FormatOn.Change}
              thousandSeparator=","
              groupingStyle={GroupingStyle.Thousand}
              decimalMaxLength={2}
              defaultValue="1234567"
              className={inputClass}
            />
          ),
          note: 'Counts meaningful digits before the caret, then re-anchors. The cursor stays between the same two digits.',
        }}
      />
    </section>
  );
}
