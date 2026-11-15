import { UserInputLoop } from '../UserInputLoop';

export function UserInputSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="user-input" className="space-y-4 scroll-mt-24">
      <h2>What users actually type</h2>
      <p>
        The usual fix is <code>&lt;input type="text"&gt;</code> plus a regex like{' '}
        <code>value.replace(/[^0-9.]/g, '')</code>. It removes letters and currency symbols, and it
        silently corrupts everything else:
      </p>
      <UserInputLoop />
      <p>
        A character-class regex cannot tell that <code>1.5e-7</code> is a number or that German{' '}
        <code>1.234,56</code> is about a thousand times larger than <code>1.23456</code>. Numora
        reads a pasted value whole, so it expands scientific notation and checks for another
        locale's format first. Typed text is read one key at a time, with the separators you
        configured.
      </p>
    </section>
  );
}
