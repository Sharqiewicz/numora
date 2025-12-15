import { useEffect, useRef } from "react";

export function TabsClipPath({
  tabs,
  onChange,
  activeTab
}: {
  tabs: string[];
  onChange: (tab: string) => void;
  activeTab: string;
}) {
  const containerRef = useRef(null);
  const activeTabElementRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current as HTMLElement | null;

    if (activeTab && container) {
      const activeTabElement = activeTabElementRef.current;

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        const clipLeft = offsetLeft;
        const clipRight = offsetLeft + offsetWidth;
        container.style.clipPath = `inset(0 ${Number(100 - (clipRight / container.offsetWidth) * 100).toFixed()}% 0 ${Number((clipLeft / container.offsetWidth) * 100).toFixed()}% round 17px)`;
      }
    }
  }, [activeTab]);

  return (
    <div className="relative ml-3 mr-auto flex rounded-xl bg-gray-800 shadow-xs">
      <ul className="relative flex items-center justify-center gap-2 ">
        {tabs.map(tab => (
          <li key={tab}>
            <button
              className="flex h-[28px] cursor-pointer items-center gap-2 rounded-xl  px-2 font-semibold text-white text-xs hover:bg-secondary/50"
              data-tab={tab}
              onClick={() => {
                onChange(tab);
              }}
              ref={activeTab === tab ? activeTabElementRef : null}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div aria-hidden className="ease absolute z-10 overflow-hidden transition-clip-path duration-250" ref={containerRef}>
        <ul className="relative flex w-full items-center justify-center gap-2 bg-secondary">
          {tabs.map(tab => (
            <li key={tab}>
              <button
                className="flex h-[28px] items-center gap-2 rounded-xl px-2 font-semibold text-xs text-foreground"
                data-tab={tab}
                onClick={() => {
                  onChange(tab);
                }}
                tabIndex={-1}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
