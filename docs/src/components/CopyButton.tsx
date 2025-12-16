import { useState } from "react";
import { AnimatedCopyIcon } from "./AnimatedCopyIcon";


import { useMemo } from "react";

export function useClipboard() {
  return useMemo(
    () => ({
      async copyToClipboard(value: string) {
        try {
          await navigator.clipboard.writeText(value);
        } catch (error) {
          console.error("Failed to copy: ", error);
        }
      }
    }),
    []
  );
}


interface CopyButtonProps {
  text: string;
  className?: string;
  noBorder?: boolean;
  iconPosition?: "left" | "right";
  onClick?: () => void;
}

const getButtonClasses = (noBorder: boolean, className: string) => {
  const baseClasses = "active:scale-105 transition-transform duration-200 m-0 flex justify-center items-center inline-flex items-center break-all rounded transition-colors cursor-pointer px-2 py-3";
  const borderClasses = noBorder
    ? "border-none bg-transparent hover:bg-gray-900"
    : "bg-[#181a1b] hover:bg-[#212324] shadow-secondary/50 shadow-xs hover:shadow-secondary/80";

  return `${baseClasses} ${borderClasses} ${className}`;
};

const getIconClasses = (iconPosition: "left" | "right") => {
  return `h-4 w-4 mt-0.5 ${iconPosition === "left" ? "mr-1" : "ml-1"}`;
};

export const CopyButton = ({ text, className = "", noBorder = false, iconPosition = "right", onClick }: CopyButtonProps) => {

  const clipboard = useClipboard();
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  const handleClick = () => {
    clipboard.copyToClipboard(text);
    setTriggerAnimation(true);
    onClick?.();
  };

  const handleAnimationComplete = () => {
    setTriggerAnimation(false);
  };

  const buttonClasses = getButtonClasses(noBorder, className);
  const iconClasses = getIconClasses(iconPosition);

  return (
    <button aria-label="Copy to clipboard" className={buttonClasses} onClick={handleClick} type="button">
      {iconPosition === "left" && (
        <AnimatedCopyIcon className={iconClasses} onAnimationComplete={handleAnimationComplete} trigger={triggerAnimation} />
      )}
      {text}
      {iconPosition === "right" && (
        <AnimatedCopyIcon className={iconClasses} onAnimationComplete={handleAnimationComplete} trigger={triggerAnimation} />
      )}
    </button>
  );
};
