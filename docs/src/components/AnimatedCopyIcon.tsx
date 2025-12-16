import { CheckCircleIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FC, ReactNode, useEffect, useState } from "react";


interface AnimatedCopyIconProps {
  className?: string;
  successIcon?: ReactNode;
  defaultIcon?: ReactNode;
  trigger?: boolean;
  onAnimationComplete?: () => void;
}

const animationProps = {
  animate: { filter: "blur(0px)", opacity: 1, scale: 1.1 },
  transition: { duration: 0.1 }
};

const defaultIconProps = {
  ...animationProps,
  exit: { filter: "blur(10px)", scale: 0.6 },
  initial: { filter: "blur(10px)", scale: 1 }
};

const successIconProps = {
  animate: {
    filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"],
    opacity: [0, 1, 1, 0],
    scale: [0.75, 1.1, 1.1, 0.75],
    transition: {
      duration: 0.8,
      times: [0, 0.125, 0.875, 1]
    }
  },
  initial: { filter: "blur(10px)", opacity: 0, scale: 0.75 }
};

export const AnimatedCopyIcon: FC<AnimatedCopyIconProps> = ({
  className = "h-4 w-4",
  trigger,
  onAnimationComplete,
  successIcon,
  defaultIcon
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowSuccess(true);
    }
  }, [trigger]);

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <span className={className}>
      <AnimatePresence initial={false} mode="wait">
        {!showSuccess ? (
          <motion.div key="default" {...defaultIconProps}>
            {defaultIcon || <CopyIcon className="h-3.5 w-3.5" />}
          </motion.div>
        ) : (
          <motion.span key="success" {...successIconProps} onAnimationComplete={handleAnimationComplete}>
            {successIcon || <CheckCircleIcon className="h-4 w-4" />}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};
