import { useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatedCopyIcon } from './AnimatedCopyIcon';

export function useClipboard() {
  return useMemo(
    () => ({
      async copyToClipboard(value: string): Promise<boolean> {
        try {
          await navigator.clipboard.writeText(value);
          return true;
        } catch (error) {
          console.error('Failed to copy: ', error);
          return false;
        }
      },
    }),
    []
  );
}

interface CopyButtonProps {
  text: string;
  /** Optional visible label. Omit for an icon-only button. */
  label?: string;
  className?: string;
  noBorder?: boolean;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
}

// Reduced-motion animations run at duration 0. Some environments don't
// reliably fire onAnimationComplete for zero-duration animations, so this is
// a fallback to guarantee the copied state always resets.
const REDUCED_MOTION_RESET_FALLBACK_MS = 1200;

const getButtonClasses = (noBorder: boolean, className: string) => {
  const baseClasses =
    "active:scale-[0.96] transition-[color,background-color,opacity,transform,scale,box-shadow] duration-150 ease-out-expo m-0 flex justify-center items-center inline-flex items-center break-all rounded cursor-pointer px-2 py-3 after:absolute after:-inset-1.5 after:content-['']";
  const borderClasses = noBorder
    ? 'border-none bg-transparent hover:bg-surface-3'
    : 'bg-surface-1 hover:bg-surface-2 shadow-secondary/50 shadow-xs hover:shadow-secondary/80';

  return `${baseClasses} ${borderClasses} ${className}`;
};

const getIconClasses = (iconPosition: 'left' | 'right', hasLabel: boolean) => {
  if (!hasLabel) return 'h-4 w-4 mt-0.5';
  return `h-4 w-4 mt-0.5 ${iconPosition === 'left' ? 'mr-1' : 'ml-1'}`;
};

export const CopyButton = ({
  text,
  label,
  className = '',
  noBorder = false,
  iconPosition = 'right',
  onClick,
}: CopyButtonProps) => {
  const clipboard = useClipboard();
  const prefersReducedMotion = useReducedMotion();
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const resetFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (resetFallbackTimeoutRef.current) clearTimeout(resetFallbackTimeoutRef.current);
    };
  }, []);

  const handleClick = async () => {
    // Only confirm the copy once the clipboard write has actually succeeded.
    const copied = await clipboard.copyToClipboard(text);
    if (!copied) {
      setCopyFailed(true);
      if (resetFallbackTimeoutRef.current) clearTimeout(resetFallbackTimeoutRef.current);
      resetFallbackTimeoutRef.current = setTimeout(() => setCopyFailed(false), 3000);
      return;
    }
    setCopyFailed(false);
    setTriggerAnimation(true);
    onClick?.();

    if (prefersReducedMotion) {
      if (resetFallbackTimeoutRef.current) clearTimeout(resetFallbackTimeoutRef.current);
      resetFallbackTimeoutRef.current = setTimeout(() => {
        setTriggerAnimation(false);
      }, REDUCED_MOTION_RESET_FALLBACK_MS);
    }
  };

  const handleAnimationComplete = () => {
    setTriggerAnimation(false);
  };

  const buttonClasses = getButtonClasses(noBorder, className);
  const iconClasses = getIconClasses(iconPosition, Boolean(label));
  const accessibleLabel = label ?? 'Copy code';

  return (
    <>
    <button
      aria-label={accessibleLabel}
      className={buttonClasses}
      onClick={handleClick}
      type="button"
    >
      {iconPosition === 'left' && (
        <AnimatedCopyIcon
          className={iconClasses}
          onAnimationComplete={handleAnimationComplete}
          trigger={triggerAnimation}
        />
      )}
      {label}
      {iconPosition === 'right' && (
        <AnimatedCopyIcon
          className={iconClasses}
          onAnimationComplete={handleAnimationComplete}
          trigger={triggerAnimation}
        />
      )}
    </button>
    {/* Outside the button: a button's children are presentational, so a live
        region inside it may never be announced. */}
    <span aria-live="polite" className="sr-only">
      {copyFailed ? 'Copy failed. Select the code and copy it manually' : triggerAnimation ? 'Copied' : ''}
    </span>
    </>
  );
};
