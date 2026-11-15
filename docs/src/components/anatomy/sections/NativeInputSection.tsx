import type { SectionProps } from './types';

export function NativeInputSection(_props: SectionProps) {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="native-input" className="space-y-4 scroll-mt-24">
      <h2>
        Why not <code>&lt;input type="number"&gt;</code>
      </h2>
      <p>
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
        So every Numora input is a real <code>&lt;input type="text"&gt;</code>. There is no
        contenteditable div, no shadow DOM and no virtual cursor. Numora listens to events on this
        element and writes back to it, using the input's own <code>value</code>,{' '}
        <code>selectionStart</code> / <code>selectionEnd</code>, <code>setRangeText</code> and{' '}
        <code>inputMode</code>.
      </p>
      <p>
        Numora sets no <code>pattern</code> attribute, so native constraint validation never rejects
        a value the field itself produced. Add your own if you need one.
      </p>
    </section>
  );
}
