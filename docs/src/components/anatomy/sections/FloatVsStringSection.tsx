import { FloatVsString } from '../FloatVsString'

export function FloatVsStringSection() {
  return (
    <section className="space-y-4">
      <h2>Why <code>Number</code> is the enemy</h2>
      <p>
        JavaScript stores all numbers as 64-bit IEEE 754 floats. The decimals you reach
        for in a financial UI - money, ratios, percentages - don't fit cleanly into binary
        fractions. Add two innocent values and you get the famous result every developer
        eventually meets:
      </p>
      <FloatVsString />
      <p>
        On a price field, that <code>0.30000000000000004</code> isn't a rounding bug - it
        is a corruption of user intent. Numora's central design rule is that every value
        flowing through the input is <strong>a string</strong>. We never call{' '}
        <code>parseFloat</code>, never coerce with <code>+</code>, never store a{' '}
        <code>Number</code> anywhere in the pipeline. The string the user typed is the
        string the consumer reads back.
      </p>
    </section>
  )
}
