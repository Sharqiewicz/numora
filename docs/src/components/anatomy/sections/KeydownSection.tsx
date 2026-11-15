import { BackspaceSkipFigure } from '../BackspaceSkipFigure';

export function KeydownSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="keydown" className="space-y-4 scroll-mt-24">
      <h2>
        <code>keydown</code> stays out of the way
      </h2>
      <p>
        Many input-mask libraries format in <code>keydown</code>. Numora's handler does <em>one</em>{' '}
        thing:
      </p>
      <p>
        It moves the cursor over a thousand separator on Backspace and Delete. It deletes nothing.
        It acts only when three things hold: <code>formatOn</code> is <code>'change'</code>, so the
        separators are on screen while the user edits; a thousand separator is set; and no text is
        selected. With the cursor just after the comma in <code>1,234</code> (<code>1,|234</code>),{' '}
        <code>keydown</code> moves the cursor to the left of the comma. <code>beforeinput</code>{' '}
        then deletes the digit <code>1</code>, not the comma, and the field shows <code>234</code>.
      </p>
      <BackspaceSkipFigure />
      <p>
        Android soft keyboards often send <code>keydown</code> with the key{' '}
        <code>Unidentified</code>, or no <code>keydown</code> at all. So <code>beforeinput</code>{' '}
        has its own path: when a delete arrives with the cursor still next to a thousand separator,
        it deletes the digit on the far side of the separator. The result is the same{' '}
        <code>234</code>.
      </p>
      <p>
        Everything else, including decimal separators and character insertion, happens in{' '}
        <a href="#before-input">
          <code>beforeinput</code>
        </a>
        .
      </p>
    </section>
  );
}
