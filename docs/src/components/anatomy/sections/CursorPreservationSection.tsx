import { useState } from 'react';
import { FormatOn, ThousandStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { CursorAnchorDiagram } from '../diagrams';
import { DiagramFrame, demoInputClass } from '../kit';

function NaiveFormattedInput() {
  const [value, setValue] = useState('1,234,567');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setValue(formatted);
  };

  return <input type="text" value={value} onChange={onChange} className={demoInputClass} />;
}

export function CursorPreservationSection() {
  return (
    <section id="cursor-preservation" className="space-y-4 scroll-mt-24">
      <h2>Cursor preservation</h2>
      <p>
        Input masks tend to get this wrong. A user clicks into the middle of <code>1,234,567</code>
        and types a digit. The formatter rebuilds the string with the commas in new places, and the
        cursor ends up several characters from where it should be.
      </p>
      <CursorAnchorDiagram />
      <p>
        Numora's <code>computeCursorPosition</code> anchors on <em>meaningful characters</em>{' '}
        instead of character index. <code>countMeaningfulDigitsBeforePosition</code> counts
        everything before the cursor that is not a thousand separator, and{' '}
        <code>findPositionWithMeaningfulDigitCount</code> walks the newly formatted string until it
        has counted the same number, then puts the cursor there. The cursor stays between the same
        two digits, wherever the separators move.
      </p>
      <p>
        Click between the <code>3</code> and the <code>4</code> in both inputs below and type a
        digit. The naive formatter sends the cursor to the end. Numora keeps it between the same two digits:
      </p>
      <DiagramFrame variant="demo">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the input is nested */}
            <label className="block space-y-2">
<span className="block text-[13px] font-medium text-signal-red-fg">Naive formatter (rebuilds the string)</span>
<NaiveFormattedInput />
</label>
            <p className="text-[13px] text-muted-foreground">
              Rewrites the controlled value on every change, so the browser moves the cursor to the end of the input.
            </p>
          </div>
          <div className="space-y-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the input is nested */}
            <label className="block space-y-2">
<span className="block text-[13px] font-medium text-signal-violet-fg">NumoraInput</span>
<NumoraInput
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={ThousandStyle.Thousand}
              maxDecimals={2}
              defaultValue="1234567"
              className={demoInputClass}
            />
</label>
            <p className="text-[13px] text-muted-foreground">
              Counts the digits before the cursor, then places the cursor after the same count in the new string.
            </p>
          </div>
        </div>
      </DiagramFrame>
    </section>
  );
}
