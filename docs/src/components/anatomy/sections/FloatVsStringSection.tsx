import { FloatVsString } from '../FloatVsString';

export function FloatVsStringSection() {
  return (
    <section id="float-vs-string" className="space-y-4 scroll-mt-24">
      <h2>
        Why <code>Number</code> is the wrong type
      </h2>
      <p>
        JavaScript stores every number as a 64-bit IEEE 754 float. Most decimals you use in a
        financial UI, such as prices, ratios and percentages, have no exact binary representation.
        Add two of them and you get the result every developer eventually meets:
      </p>
      <FloatVsString />
      <p>
        On a price field, <code>0.30000000000000004</code> is not the number the user meant. Numora
        has one rule here. Every value in the input is <strong>a string</strong>. Numora never
        converts it to a <code>Number</code>. What the user typed is what your code reads back.
      </p>
    </section>
  );
}
