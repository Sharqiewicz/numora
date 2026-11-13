import type { SectionProps } from './types';

export function NativeInputSection(_props: SectionProps) {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="native-input" className="space-y-4 scroll-mt-24">
      <h2>
        What is an <code>&lt;input&gt;</code>, really?
      </h2>
      <p>
        The HTML <code>&lt;input&gt;</code> element shipped with HTML 2.0 in 1995.{' '}
        <code>&lt;input type="number"&gt;</code> arrived with HTML5 in 2014, and it does not suit
        money or token amounts:
      </p>
      <ul>
        <li>Locale-aware thousand separators are forbidden by spec.</li>
        <li>
          Pasting <code>1,234.56</code> silently empties the field.
        </li>
        <li>Increment arrows make no sense for currency or token amounts.</li>
      </ul>
      <p>
        The 2017 addition of <code>inputmode="decimal"</code> fixed mobile keyboards but not
        formatting. Numora fills that gap.
      </p>
      <p>
        Every Numora input is therefore a real <code>&lt;input type="text"&gt;</code>, not{' '}
        <code>type="number"</code>. There is no contenteditable div, no shadow DOM and no virtual
        cursor. Numora listens to events on this element and writes back to it.
      </p>
      <p>
        It uses the input's <code>value</code>, <code>selectionStart</code> /{' '}
        <code>selectionEnd</code>, <code>setRangeText</code> and <code>inputMode</code>. See{' '}
        <a href="#before-input">beforeinput</a> and{' '}
        <a href="#cursor-preservation">cursor preservation</a> for how. Numora sets no{' '}
        <code>pattern</code> attribute, so native constraint validation never rejects a value the
        field itself produced. Add your own if you need one.
      </p>
    </section>
  );
}
