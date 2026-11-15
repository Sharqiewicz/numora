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
        Numora takes the text left of the edit, plus the inserted text, and runs it through the same
        pipeline as the whole value: separators removed, leading zeros dropped, notation expanded,
        decimals trimmed. The result is the text that belongs before the cursor. Numora then walks
        the final display string and matches that text character by character, skipping the thousand
        separators it added. It puts the cursor where the match ends.
      </p>
      <p>
        Sometimes nothing matches, because the edit made Numora read the whole value again. Pasting{' '}
        <code>e-</code> into <code>1|5</code> gives <code>0.00001</code>, and no character left of
        the cursor survives. The cursor then goes to the end of the text.
      </p>
      <p>
        A paste whose tail was trimmed leaves the cursor after the last pasted character that
        survived. The grouping style only changes where the separators sit, so{' '}
        <code>'thousand'</code>, <code>'lakh'</code> and <code>'wan'</code> need no per-style code.
      </p>
    </section>
  );
}
