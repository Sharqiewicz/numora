import { BackspaceSkipDiagram } from '../diagrams';

export function KeydownSection() {
  return (
    <section id="keydown" className="space-y-4 scroll-mt-24">
      <h2>
        <code>keydown</code> stays out of the way
      </h2>
      <p>
        Many input-mask libraries format in <code>keydown</code>. Numora's handler does{' '}
        <em>one</em> thing:
      </p>
      <ul>
        <li>
          <strong>Skip the cursor over thousand separators on Backspace and Delete</strong> (in{' '}
          <code>'change'</code> mode only). With the cursor just after the comma in{' '}
          <code>1,234</code> (<code>1,|234</code>), Backspace first moves the cursor to the left of
          the comma, so the digit <code>1</code> gets deleted, not the comma.
        </li>
      </ul>
      <BackspaceSkipDiagram />
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
