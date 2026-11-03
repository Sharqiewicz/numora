import { type RefObject, useEffect } from 'react';

/**
 * Closes a popover on Escape or on a pointer press outside `ref`.
 * Listeners are only attached while `open` is true.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void
) {
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, open, onDismiss]);
}
