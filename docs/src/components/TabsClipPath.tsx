import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect warns on the server; it only matters before first paint.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function TabsClipPath({
  tabs,
  onChange,
  activeTab,
}: {
  tabs: string[];
  onChange: (tab: string) => void;
  activeTab: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabElementRef = useRef<HTMLButtonElement>(null);
  // null until measured. Server and first client render are identical: the
  // overlay is hidden and the active tab paints its own highlight, so there
  // is no frame where the overlay covers the wrong tab.
  const [clipPath, setClipPath] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const tab = activeTabElementRef.current;
      if (!container || !tab) return;
      const left = tab.offsetLeft;
      const right = container.offsetWidth - (left + tab.offsetWidth);
      setClipPath(`inset(0 ${right}px 0 ${left}px round 12px)`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeTab]);

  // Enable the slide only after the first measurement has painted.
  useEffect(() => {
    if (clipPath === null || animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [clipPath, animate]);

  const measured = clipPath !== null;

  return (
    <div className="relative mr-auto flex rounded-xl bg-surface-5 shadow-xs">
      <ul className="relative flex items-center justify-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <li key={tab}>
              <button
                type="button"
                aria-pressed={isActive}
                className={`relative flex h-[28px] cursor-pointer items-center gap-2 rounded-xl px-2 font-semibold text-xs outline-hidden ring-ring ring-offset-surface-5 transition-[color,background-color,transform,scale] duration-150 ease-out-expo after:absolute after:-inset-x-1 after:-inset-y-2 after:content-[''] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96] ${
                  !measured && isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-white [@media(hover:hover)]:hover:bg-secondary/50'
                }`}
                data-tab={tab}
                onClick={() => onChange(tab)}
                ref={isActive ? activeTabElementRef : null}
              >
                {tab}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Decorative copy of the tabs, clipped to the active one. It never takes
          pointer input: the real buttons underneath do, and their focus ring
          is drawn outside the box so the overlay can't hide it. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 overflow-hidden ${
          measured ? '' : 'invisible'
        } ${animate ? 'transition-[clip-path] duration-250 ease-out-expo motion-reduce:duration-0' : ''}`}
        ref={containerRef}
        style={clipPath ? { clipPath } : undefined}
      >
        <ul className="relative flex w-full items-center justify-center gap-2 bg-secondary">
          {tabs.map((tab) => (
            <li key={tab}>
              <span className="flex h-[28px] items-center gap-2 px-2 font-semibold text-xs text-foreground">
                {tab}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
