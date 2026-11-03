import type { ReactNode } from 'react';

interface OverlayExplainerProps {
  /** Describes the visible animated layer, e.g. "a <TextMorph> that animates the formatted string." */
  visibleLayer: ReactNode;
  /** Names the input in the keyboard layer, e.g. "the vanilla NumoraInput". */
  input: ReactNode;
  /** Page-specific paragraph describing how onChange feeds the visible layer. */
  children?: ReactNode;
}

export function OverlayExplainer({ visibleLayer, input, children }: OverlayExplainerProps) {
  return (
    <>
      <h2>How the overlay works</h2>
      <p>
        Native <code>&lt;input&gt;</code> elements render their <code>value</code> as a string with
        no child DOM, so animation libraries can't inject animated spans into them directly. The
        overlay stacks two layers in the same box to get around that:
      </p>
      <ul>
        <li>
          <strong>Visible layer:</strong> {visibleLayer}
        </li>
        <li>
          <strong>Keyboard layer:</strong> {input} positioned on top with{' '}
          <code>color: transparent</code> and a visible cursor. It still owns focus, keystrokes,
          selection, undo, IME and mobile <code>inputmode</code>, so paste and native form
          submission keep working too.
        </li>
      </ul>
      {children}
    </>
  );
}
