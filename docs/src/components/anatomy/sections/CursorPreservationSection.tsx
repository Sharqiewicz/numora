import { CursorLanes } from '../CursorLanes';

export function CursorPreservationSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="cursor-preservation" className="space-y-4 scroll-mt-24">
      <h2>Cursor preservation</h2>
      <p>
        Input masks tend to get this wrong. A user clicks into the middle of <code>1,234,567</code>{' '}
        and types a digit. The formatter rebuilds the string with the commas in new places, and the
        cursor ends up several characters from where it should be.
      </p>
      <p>
        Numora keeps the cursor between the same two digits however the separators move around it:
      </p>
      <CursorLanes />
      <p>
        It does this by counting. Numora sanitizes the text left of the edit, plus the inserted
        text, the same way it sanitizes the whole value. The length of the result is the number of
        digits, decimal separators and leading minus signs that belong before the cursor. Numora
        then walks the formatted string, skipping the thousand separators it added, until it has
        passed that many characters. It puts the cursor there.
      </p>
      <p>
        A paste whose tail was trimmed leaves the cursor after the last pasted character that
        survived. The grouping style only changes where the separators sit, so Thousand, Lakh and
        Wan need no per-style code.
      </p>
    </section>
  );
}
