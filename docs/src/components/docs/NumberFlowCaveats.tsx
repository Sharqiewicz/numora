const BOX = 'bg-muted/50 border border-border rounded-lg p-4 my-4';

export function NumberFlowCaveats() {
  return (
    <>
      <h2>Caveats</h2>

      <div className={BOX}>
        <p className="m-0">
          <strong>Partial-input states.</strong> NumberFlow takes a <code>number</code>. While the
          user is typing <code>"1."</code> (a digit then a dot, no decimals yet),{' '}
          <code>Number("1.")</code> is <code>1</code> and NumberFlow renders <code>"1"</code> with
          no dot. The cursor sits just past the invisible input's dot, one character beyond the
          visible <code>"1"</code>. It lasts until the user types a fractional digit.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Precision ceiling.</strong> Numora handles strings of any length.{' '}
          <code>Number()</code> is safe up to 15 significant digits. For DeFi token amounts at
          18-decimal precision the overlay loses tail digits at the display layer, but the editable
          string you pass to your math or contracts is untouched. The overlay only changes what is
          displayed.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Cursor drift during animation.</strong> The cursor's pixel position is computed
          from the input's invisible text layout, which jumps to the new value instantly. NumberFlow
          animates digits into that final position over ~150ms. During the animation, the cursor
          sits next to characters that haven't arrived yet.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Mid-string editing is limited.</strong> Clicking the overlay span passes the click
          through to the input, but the browser's hit-test runs against the input's invisible text.
          During NumberFlow's mid-animation width transitions, click-to-cursor lands on the wrong
          character. This doesn't matter for append-only fields. If users edit mid-number, don't
          use this pattern.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Mobile selection handles.</strong> iOS draws magnifier loupes and selection
          handles anchored to the input's text. With the text invisible, the loupe shows
          transparent characters. This is fine for short numeric entry, but test on real devices.
        </p>
      </div>
    </>
  );
}
