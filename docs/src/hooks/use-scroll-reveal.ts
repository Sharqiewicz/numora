import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggered = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        if (triggerOnce && hasTriggered.current) return;

        setIsVisible(true);
        hasTriggered.current = true;
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, handleIntersection]);

  return { ref, isVisible };
}

/**
 * Hook for staggered reveal of multiple elements
 */
export function useStaggeredReveal(
  _itemCount: number,
  options: UseScrollRevealOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...scrollOptions } = options;
  const { ref, isVisible } = useScrollReveal(scrollOptions);

  const getStaggerDelay = useCallback(
    (index: number) => {
      if (!isVisible) return 0;
      return index * staggerDelay;
    },
    [isVisible, staggerDelay]
  );

  const getStaggerStyle = useCallback(
    (index: number): React.CSSProperties => ({
      transitionDelay: `${getStaggerDelay(index)}ms`,
    }),
    [getStaggerDelay]
  );

  return {
    ref,
    isVisible,
    getStaggerDelay,
    getStaggerStyle,
  };
}
