const BOX = 'bg-muted/50 border border-border rounded-lg p-4 my-4';

export function NumberFlowCaveats() {
  return (
    <>
      <h2>Caveats</h2>

      <div className={BOX}>
        <p className="m-0">
          <strong>Text NumberFlow cannot show.</strong> NumberFlow always draws a number, so an
          empty field shows <code>0</code> in the overlay. With <code>allowNegative</code>, a lone{' '}
          <code>"-"</code> shows <code>0</code> until a digit follows. With{' '}
          <code>allowLeadingZeros</code>, <code>"007"</code> shows as <code>7</code> and the caret
          sits two characters past it.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Precision in older browsers.</strong> Before Chrome 106, Safari 15.4 and Firefox
          116, <code>Intl</code> reads the raw string as a <code>Number</code>, which is exact up to
          about 15 significant digits. Longer amounts lose their tail digits in the overlay there.
          The string you get from <code>onValueChange</code> is untouched either way. The overlay
          only changes what is displayed.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Locales.</strong> NumberFlow formats the number itself with <code>Intl</code>, so
          give it the same locale as the input and keep <code>useGrouping: true</code>. Left to its
          default, <code>Intl</code> does not group a four-digit number in Spanish and Polish (
          <code>1234,5</code>) while Numora does (<code>1.234,5</code> in Spanish,{' '}
          <code>1 234,5</code> in Polish).
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Locales with their own digits are not supported.</strong> For <code>ar-EG</code>,{' '}
          <code>fa-IR</code>, <code>bn-BD</code> and other tags where <code>Intl</code> prints
          non-ASCII digits, NumberFlow 0.6 draws the separators and no digits. The language alone
          does not decide it. The bare tag <code>ar</code> prints ASCII digits and works. Numora
          shows ASCII digits there (<code>1٬234</code>). Passing{' '}
          <code>numberingSystem: 'latn'</code> brings the digits back, but <code>Intl</code> then
          writes <code>1,234.5</code> where the field shows <code>1٬234٫5</code>, so the layers
          still differ. A locale is affected when{' '}
          <code>new Intl.NumberFormat(locale).resolvedOptions().numberingSystem</code> is not{' '}
          <code>'latn'</code>. Use Torph for those.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Custom separators and grouping.</strong> NumberFlow can only draw what{' '}
          <code>Intl</code> can format. With <code>groupingStyle="none"</code>, pass{' '}
          <code>useGrouping: false</code> and the layers agree. A <code>thousandSeparator</code> or{' '}
          <code>decimalSeparator</code> that is not the locale's own, and{' '}
          <code>groupingStyle="wan"</code> (<code>123,4567</code>), have no <code>Intl</code>{' '}
          equivalent, so the overlay cannot match the field.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Caret drift during animation.</strong> The browser places the caret from the
          input's invisible text, which jumps to the new value at once. NumberFlow takes most of a
          second, by default, to move its digits there. Until it finishes, the caret sits next to
          characters that haven't arrived yet.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Mid-string editing is limited.</strong> A click on the overlay passes through to
          the input, and the browser places the caret by the input's invisible text. While
          NumberFlow is still animating, that click puts the caret next to the wrong character.
          Fields where users only add digits at the end are not affected. If users edit mid-number,
          don't use the overlay.
        </p>
      </div>

      <div className={BOX}>
        <p className="m-0">
          <strong>Mobile selection handles.</strong> iOS draws magnifier loupes and selection
          handles anchored to the input's text. The text is transparent, so the loupe shows nothing.
          Short amounts are usable, but test on a real device.
        </p>
      </div>
    </>
  );
}
