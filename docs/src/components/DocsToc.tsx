import { useEffect, useState } from 'react';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function DocsToc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setActiveId(headings[0]?.id ?? null);
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Stateless on purpose: the active heading is worked out from where the page is now, so a
    // jump (Home, End, a hash link) cannot leave a stale one behind.
    let frame = 0;
    const pick = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      // The last heading above the top 30% of the viewport. At the very bottom the last section
      // may be too short to ever reach that band, so it wins outright.
      const band = window.innerHeight * 0.3;
      let current = elements[0];
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= band) current = el;
      }
      setActiveId((atBottom ? elements[elements.length - 1] : current).id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden xl:block" aria-label="On this page">
      <nav className="sticky top-16 max-h-[calc(100svh-6rem)] overflow-y-auto">
        <p className="mb-3 text-caption text-muted-foreground">On this page</p>
        <ul className="flex flex-col border-l border-border">
          {headings.map((h) => {
            const active = h.id === activeId;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  aria-current={active ? 'location' : undefined}
                  onClick={() => setActiveId(h.id)}
                  className={`-ml-px block border-l py-1.5 text-caption outline-hidden ring-ring transition-colors duration-150 ease-out-expo focus-visible:rounded-sm focus-visible:ring-2 ${
                    h.level === 3 ? 'pl-6' : 'pl-3'
                  } ${
                    active
                      ? 'border-brand text-foreground'
                      : 'border-transparent text-muted-foreground [@media(hover:hover)]:hover:text-foreground'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
