import { CheckCircleIcon, CopyIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type FC, type ReactNode, useEffect, useState } from 'react';

interface AnimatedCopyIconProps {
  className?: string;
  successIcon?: ReactNode;
  defaultIcon?: ReactNode;
  trigger?: boolean;
  onAnimationComplete?: () => void;
}

// How long the checkmark stays fully visible (read time) before it morphs
// back to the default icon. Kept separate from the morph transitions below
// so trimming the "beat" never eats into the reading window.
const SUCCESS_HOLD_MS = 1200;

// Critically damped spring (bounce: 0) with a 0.3s perceptual duration: the
// icon morphs (scale 0.25 -> 1, blur 4px -> 0px, opacity 0 -> 1) with no
// overshoot and settles quickly.
const MORPH_TRANSITION = { type: 'spring' as const, duration: 0.3, bounce: 0 };

const animationProps = {
  animate: { filter: 'blur(0px)', opacity: 1, scale: 1 },
  transition: MORPH_TRANSITION,
};

const defaultIconProps = {
  ...animationProps,
  exit: { filter: 'blur(4px)', opacity: 0, scale: 0.25 },
  initial: { filter: 'blur(4px)', opacity: 0, scale: 0.25 },
};

const successIconProps = {
  animate: {
    filter: 'blur(0px)',
    opacity: 1,
    scale: 1,
    transition: MORPH_TRANSITION,
  },
  exit: {
    filter: 'blur(4px)',
    opacity: 0,
    scale: 0.25,
    transition: MORPH_TRANSITION,
  },
  initial: { filter: 'blur(4px)', opacity: 0, scale: 0.25 },
};

const reducedDefaultIconProps = {
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0 },
  initial: { opacity: 0 },
};

const reducedSuccessIconProps = {
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
  initial: { opacity: 0 },
};

export const AnimatedCopyIcon: FC<AnimatedCopyIconProps> = ({
  className = 'h-4 w-4',
  trigger,
  onAnimationComplete,
  successIcon,
  defaultIcon,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (trigger) setShowSuccess(true);
  }, [trigger]);

  useEffect(() => {
    if (!showSuccess) return;

    const holdTimer = setTimeout(() => {
      setShowSuccess(false);
    }, SUCCESS_HOLD_MS);

    return () => clearTimeout(holdTimer);
  }, [showSuccess]);

  // AnimatePresence's onExitComplete fires for both swaps (default -> success
  // and success -> default). Only the second one means the copied state is
  // done; by then showSuccess is already false. (An element's own
  // onAnimationComplete does not fire for its exit animation.)
  const handleExitComplete = () => {
    if (!showSuccess) onAnimationComplete?.();
  };

  return (
    <span className={className}>
      <AnimatePresence initial={false} mode="wait" onExitComplete={handleExitComplete}>
        {!showSuccess ? (
          <motion.div
            key="default"
            {...(prefersReducedMotion ? reducedDefaultIconProps : defaultIconProps)}
          >
            {defaultIcon || <CopyIcon className="h-3.5 w-3.5" />}
          </motion.div>
        ) : (
          <motion.span
            key="success"
            {...(prefersReducedMotion ? reducedSuccessIconProps : successIconProps)}
          >
            {successIcon || <CheckCircleIcon className="h-4 w-4" />}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};
