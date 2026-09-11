import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import { refractor } from 'refractor/all';

/**
 * Maps Prism tokens to the One Dark colours used by `CodeBlock`, so a
 * morphing code block matches the static code examples across the docs.
 */

interface HastNode {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
}

export interface ColorRange {
  start: number;
  end: number;
  color: string;
}

const BASE_COLOR = oneDark['code[class*="language-"]']?.color ?? 'inherit';

/** Innermost token class that One Dark defines a colour for, else the base text colour. */
function colorForClasses(stack: string[][]): string {
  for (let i = stack.length - 1; i >= 0; i--) {
    for (const cls of stack[i]) {
      if (cls === 'token') continue;
      const color = oneDark[cls]?.color;
      if (color) return color;
    }
  }
  return BASE_COLOR;
}

/** Contiguous character ranges of `code`, each with its token colour. */
export function tokenColorRanges(code: string, language: string): ColorRange[] {
  const tree = refractor.highlight(code, language) as unknown as HastNode;
  const ranges: ColorRange[] = [];
  let offset = 0;

  const walk = (node: HastNode, stack: string[][]) => {
    if (node.type === 'text') {
      const value = node.value ?? '';
      ranges.push({ start: offset, end: offset + value.length, color: colorForClasses(stack) });
      offset += value.length;
      return;
    }
    const className = node.properties?.className;
    const next = className ? [...stack, className] : stack;
    for (const child of node.children ?? []) walk(child, next);
  };

  walk(tree, []);
  return ranges;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Static highlighted markup (server render and reduced-motion fallback). */
export function highlightToHtml(code: string, language: string): string {
  return tokenColorRanges(code, language)
    .map(({ start, end, color }) => {
      const text = escapeHtml(code.slice(start, end)).replace(/\n/g, '<br>');
      return `<span style="color:${color}">${text}</span>`;
    })
    .join('');
}
