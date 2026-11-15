const BOX = 'bg-muted/50 border border-border rounded-lg p-4 my-4';

export function NumberFlowCaveats() {
  return (
    <>
      <h2>Caveats</h2>

      <div className={BOX}>
        <p className="m-0">
          <strong>Text NumberFlow cannot show.</strong> NumberFlow always draws a number, so an
          empty field shows <code>0</code> in the overlay. With <code>allowNegative</code>, a lone{' '}
          <code>"-"</code> shows <code>0</code>, and <code>Number()</code> drops the sign of a
          negative zero, so <code>"-0."</code> shows as <code>0.</code> until a non-zero digit
          follows. With <code>allowLeadingZeros</code>, <code>"007"</code> shows as <code>7</code>{' '}
          and the cursor sits two characters past it.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Precision.</strong> <code>Number()</code> is exact up to about 15 significant
          digits. Longer amounts lose their tail digits in the overlay unless you pass NumberFlow
          the raw string, as described above. The string you get from <code>onValueChange</code> is
          untouched either way. The overlay only changes what is displayed.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Locales.</strong> NumberFlow formats the number itself with <code>Intl</code>, so
          give it the same locale as the input and keep <code>useGrouping: true</code>. Left to its
          default, <code>Intl</code> does not group a four-digit number in Spanish and Polish (
          <code>1234,5</code>) while Numora does (<code>1.234,5</code> in Spanish,{' '}
          <code>1 234,5</code> in Polish). One difference remains. For Arabic and Persian locales
          NumberFlow prints native digits (<code>١٬٢٣٤</code>) while Numora shows ASCII digits (
          <code>1٬234</code>), so the overlay's characters do not line up with the input's.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Cursor drift during animation.</strong> The cursor's pixel position is computed
          from the input's invisible text layout, which jumps to the new value instantly. NumberFlow
          animates digits into that final position over most of a second by default. During the
          animation, the cursor sits next to characters that haven't arrived yet.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Mid-string editing is limited.</strong> Clicking the overlay span passes the click
          through to the input, but the browser's hit-test runs against the input's invisible text.
          During NumberFlow's mid-animation width transitions, click-to-cursor lands on the wrong
          character. This doesn't matter for append-only fields. If users edit mid-number, don't use
          this pattern.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Mobile selection handles.</strong> iOS draws magnifier loupes and selection
          handles anchored to the input's text. With the text invisible, the loupe shows transparent
          characters. This is fine for short numeric entry, but test on real devices.
        </p>
      </div>
    </>
  );
}
