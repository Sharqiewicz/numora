import { useEffect, useRef } from 'react';
import type { TocHeading } from './DocsToc';

const ANCHOR_ATTR = 'data-heading-anchor';

function slugify(text: string): string {
  return (
    text
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

function headingText(heading: Element): string {
  const clone = heading.cloneNode(true) as Element;
  for (const anchor of clone.querySelectorAll(`[${ANCHOR_ATTR}]`)) anchor.remove();
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Renders nothing. Mounted at the end of each page, it gives the page's h2/h3
 * headings ids (existing ids win), adds a `#` link to each, reports them for the
 * table of contents, and scrolls to the URL hash once the ids exist.
 */
export function ArticleHeadings({
  onHeadings,
  isInitialLoad,
}: {
  onHeadings: (headings: TocHeading[]) => void;
  isInitialLoad: boolean;
}) {
  const marker = useRef<HTMLSpanElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per mounted page
  useEffect(() => {
    const root = marker.current?.parentElement;
    if (!root) return;

    // Any h2/h3 under .docs-prose (the Anatomy page nests them in <section>s), minus
    // demo titles and cards: anything inside a figure, a .not-prose block or an aside.
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>('.docs-prose h2, .docs-prose h3')
    ).filter((el) => !el.closest('figure, .not-prose, aside'));
    const used = new Set<string>();
    for (const el of root.querySelectorAll('[id]')) used.add(el.id);

    const headings: TocHeading[] = [];
    const anchors: HTMLAnchorElement[] = [];
    for (const node of nodes) {
      const text = headingText(node);
      if (!text) continue;
      if (!node.id) {
        const base = slugify(text);
        let id = base;
        for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
        used.add(id);
        node.id = id;
      }
      // styles.css sets scroll-margin only on direct children of .docs-prose.
      if (node.parentElement && !node.parentElement.classList.contains('docs-prose')) {
        node.classList.add('scroll-mt-24');
      }
      const link = document.createElement('a');
      link.href = `#${node.id}`;
      link.className = 'heading-anchor';
      link.setAttribute(ANCHOR_ATTR, '');
      link.setAttribute('aria-label', `Link to section: ${text}`);
      link.textContent = '#';
      node.append(link);
      anchors.push(link);
      headings.push({ id: node.id, text, level: node.tagName === 'H3' ? 3 : 2 });
    }

    const h2Count = headings.filter((h) => h.level === 2).length;
    onHeadings(h2Count >= 2 ? headings.filter((h) => h.level === 2) : headings);

    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash && (isInitialLoad || window.scrollY === 0)) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }

    return () => {
      for (const link of anchors) link.remove();
    };
  }, []);

  return <span ref={marker} hidden />;
}
