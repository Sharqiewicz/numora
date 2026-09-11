import { useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatedCopyIcon } from './AnimatedCopyIcon';

export function useClipboard() {
  return useMemo(
    () => ({
      async copyToClipboard(value: string) {
        try {
          await navigator.clipboard.writeText(value);
        } catch (error) {
          console.error('Failed to copy: ', error);
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
    ? 'border-none bg-transparent hover:bg-gray-900'
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
  const resetFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (resetFallbackTimeoutRef.current) clearTimeout(resetFallbackTimeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    clipboard.copyToClipboard(text);
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
  const accessibleLabel = triggerAnimation ? 'Copied to clipboard' : 'Copy to clipboard';

  return (
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
      <span aria-live="polite" className="sr-only">
        {triggerAnimation ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
};
