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
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Headings in the top band of the viewport; the first in document order wins.
        const current = elements.find((el) => visible.has(el.id));
        if (current) setActiveId(current.id);
      },
      { rootMargin: '0px 0px -70% 0px' }
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
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
