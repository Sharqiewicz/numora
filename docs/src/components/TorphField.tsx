import { formatValue } from 'numora';
import { NumoraInput, type NumoraInputProps } from 'numora-react';
import { type Ref, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { cn } from '@/lib/utils';
import { demoOverlayInput } from './DemoFrame';

const EASE = { stiffness: 400, damping: 30 };

type TorphFieldProps = NumoraInputProps & {
  ref?: Ref<HTMLInputElement>;
  /**
   * Pass Torph the caret only while the field has real focus. For a field the app rewrites
   * with a different number while the user is elsewhere: a caret left over from the last
   * edit would match the wrong digits.
   */
  focusedCaretOnly?: boolean;
};

/**
 * A Numora field drawn by Torph. The real input sits on top with transparent text and keeps
 * the caret, selection and keyboard; the layer under it shows the same text and morphs it.
 * Renders the two layers only: the parent is the positioned box and sets the typography,
 * which the input inherits.
 */
export function TorphField({
  ref,
  focusedCaretOnly,
  className,
  onFormattedValueChange,
  ...props
}: TorphFieldProps) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  // The first text: onFormattedValueChange does not fire on mount.
  const [text, setText] = useState(() =>
    formatValue(props.value ?? props.defaultValue ?? '', props)
  );
  const [caret, setCaret] = useState<number>();
  // Numora also takes `locale: true` (the browser's); Torph takes a tag only.
  const morphLocale = typeof props.locale === 'string' ? { locale: props.locale } : undefined;

  return (
    <>
      <span aria-hidden="true" className="pointer-events-none whitespace-pre">
        {/* The caret tells Torph where the edit was, so digits move instead of renumbering. */}
        <TextMorph cursorIndex={caret} ease={EASE} {...morphLocale}>
          {text || '0'}
        </TextMorph>
      </span>
      <NumoraInput
        {...props}
        ref={(el) => {
          innerRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        // Every rewrite of the field: typing, the focus strip, the blur regroup, a new value.
        onFormattedValueChange={(next) => {
          const el = innerRef.current;
          const hasCaret = el && (!focusedCaretOnly || document.activeElement === el);
          setCaret(hasCaret ? (el.selectionStart ?? undefined) : undefined);
          setText(next);
          onFormattedValueChange?.(next);
        }}
        className={cn(demoOverlayInput, className)}
      />
    </>
  );
}
