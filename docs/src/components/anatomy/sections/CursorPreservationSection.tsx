import { CaretJumpDemo } from '../CaretJumpDemo';
import { CursorAnchorDiagram } from '../diagrams';

export function CursorPreservationSection() {
  return (
    <section id="cursor-preservation" className="space-y-4 scroll-mt-24">
      <h2>Cursor preservation</h2>
      <p>
        Input masks tend to get this wrong. A user clicks into the middle of <code>1,234,567</code>{' '}
        and types a digit. The formatter rebuilds the string with the commas in new places, and the
        cursor ends up several characters from where it should be.
      </p>
      <CursorAnchorDiagram />
      <p>
        Numora computes the caret from the edit itself. It runs the text left of the edit, plus the
        inserted text, through the same sanitizer as the whole value: separators removed, leading
        zeros dropped, <code>1k</code> expanded, decimals trimmed. The length of the result is the
        caret's <em>rank</em>, the number of digits, decimal separators and leading minus signs
        before it. <code>positionAfterMatchedPrefix</code> then walks the formatted string, skipping
        injected thousand separators, until it has passed that many characters. It puts the cursor
        there.
      </p>
      <p>
        The caret stays between the same two digits however the separators move around it. A paste
        whose tail was trimmed leaves the caret after the last pasted character that survived. The
        grouping style only changes <em>where</em> the separators sit, so Thousand, Lakh and Wan
        need no per-style code. A separator is always one character, so every comparison is a
        single-character comparison.
      </p>
      <p>
        Here is that keystroke again, an <code>8</code> typed after the <code>3</code>, one step at
        a time for both formatters:
      </p>
      <CaretJumpDemo />
    </section>
  );
}
