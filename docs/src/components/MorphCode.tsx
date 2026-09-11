import { useEffect, useRef } from 'react';
import { useTextMorph } from 'torph/react';
import { type ColorRange, highlightToHtml, tokenColorRanges } from '@/lib/prism-tokens';

interface MorphCodeProps {
  code: string;
  language: string;
}

/**
 * Syntax-highlighted text that morphs between values with Torph.
 *
 * Torph owns the DOM: it splits the text into `[torph-item]` spans and animates
 * them. After every update we colour each item from the Prism token that covers
 * its first character, so highlighting survives the morph.
 */
export function MorphCode({ code, language }: MorphCodeProps) {
  const { ref, update } = useTextMorph({});
  // Server-rendered markup. Torph replaces it on the first update and React
  // never reconciles it (stable object, like torph's own TextMorph component).
  const initialHtml = useRef({ __html: highlightToHtml(code, language) });

  useEffect(() => {
    update(code);
    const root = ref.current;
    if (root) applyTokenColors(root, code, language, tokenColorRanges(code, language));
  }, [code, language, update, ref]);

  // biome-ignore lint/security/noDangerouslySetInnerHtml: escaped markup built from our own static snippets
  return <span ref={ref} dangerouslySetInnerHTML={initialHtml.current} />;
}

function applyTokenColors(root: HTMLElement, code: string, language: string, ranges: ColorRange[]) {
  const items = root.querySelectorAll<HTMLElement>(':scope > [torph-item]:not([torph-exiting])');

  // Reduced motion / disabled: torph writes plain text instead of items.
  if (items.length === 0) {
    root.innerHTML = highlightToHtml(code, language);
    return;
  }

  let offset = 0;
  let rangeIndex = 0;
  for (const item of items) {
    while (rangeIndex < ranges.length && ranges[rangeIndex].end <= offset) rangeIndex++;
    const range = ranges[rangeIndex];
    if (item.tagName !== 'BR') {
      item.style.color = range && range.start <= offset ? range.color : '';
    }
    offset += item.tagName === 'BR' ? 1 : (item.textContent ?? '').length;
  }
}
