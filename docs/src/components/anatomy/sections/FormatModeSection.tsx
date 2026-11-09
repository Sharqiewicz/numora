import { FormatOn, GroupingStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { useState } from 'react';
import { FormatTimingStrip } from '../FormatTimingStrip';
import { DiagramFrame, demoInputClass } from '../kit';

export function FormatModeSection() {
  const [keystrokes, setKeystrokes] = useState(0);
  const [blurFocused, setBlurFocused] = useState<boolean | null>(null);
  return (
    <section id="format-mode" className="space-y-4 scroll-mt-24">
      <h2>Format on change vs format on blur</h2>
      <p>
        <code>FormatOn.Change</code> groups on every keystroke. <code>FormatOn.Blur</code> groups only
        when the input loses focus and shows the raw value without separators while the user edits.
        Both modes run the same pipeline. Only the <em>moment</em> of formatting differs.
      </p>
      <p>
        Type <code>1234567.89</code> in both inputs and compare:
      </p>
      <DiagramFrame variant="demo">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <div className="block space-y-2">
<span className="block font-mono text-[13px] font-medium text-foreground">FormatOn.Change</span>
<NumoraInput aria-label="FormatOn.Change"
              formatOn={FormatOn.Change}
              thousandSeparator=","
              groupingStyle={GroupingStyle.Thousand}
              decimalMaxLength={2}
              placeholder="1234567.89"
              className={demoInputClass}
              onChange={() => setKeystrokes((n) => n + 1)}
            />
</div>
            <FormatTimingStrip mode="change" keystrokes={keystrokes} />
            <p className="text-[13px] text-muted-foreground">
              Best when users should see grouped digits while typing.
            </p>
          </div>
          <div className="space-y-2">
            <div className="block space-y-2">
<span className="block font-mono text-[13px] font-medium text-foreground">FormatOn.Blur</span>
<NumoraInput aria-label="FormatOn.Blur"
              formatOn={FormatOn.Blur}
              thousandSeparator=","
              groupingStyle={GroupingStyle.Thousand}
              decimalMaxLength={2}
              placeholder="1234567.89"
              className={demoInputClass}
              onFocus={() => setBlurFocused(true)}
              onBlur={() => setBlurFocused(false)}
            />
</div>
            <FormatTimingStrip mode="blur" focused={blurFocused} />
            <p className="text-[13px] text-muted-foreground">
              Best when users edit existing values and separators should not move under the cursor.
            </p>
          </div>
        </div>
      </DiagramFrame>
    </section>
  );
}
