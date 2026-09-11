import { useState } from 'react';
import { TextMorph } from 'torph/react';
import { MorphCode } from '@/components/MorphCode';

/**
 * Pill button used to switch between morphing code examples
 * (mirrors the Button component on the Torph site).
 */
export const morphButtonClass = [
  'flex items-center justify-center gap-1 px-4 py-2',
  'text-base font-medium text-center text-white',
  'rounded-xl [corner-shape:superellipse(1.25)] shadow-[0_0_0_1px_var(--surface-3)]',
  'transition-[background-color,transform] duration-100 ease-[ease] will-change-transform',
  'cursor-pointer hover:bg-surface-2 aria-pressed:bg-surface-2 active:scale-[0.96]',
  '[&_svg]:block [&_svg]:-translate-x-1.5',
  'max-[480px]:p-3 max-[480px]:[&_svg]:translate-x-0',
].join(' ');

interface MorphCodeBlockProps {
  code: string;
  /** Prism language name, e.g. `bash`, `typescript`, `tsx`. */
  language?: string;
}

/**
 * Syntax-highlighted code block whose content morphs between values, with a
 * morphing "Copy" → "Copied" button (mirrors the CodeBlock on the Torph site).
 */
export function MorphCodeBlock({ code, language = 'typescript' }: MorphCodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => {
          setIsCopied(true);
          navigator.clipboard.writeText(code);
          setTimeout(() => setIsCopied(false), 2000);
        }}
        className="absolute right-0 top-0 z-10 p-[0.85rem] text-xs font-medium tracking-[-0.00563rem] text-muted-foreground hover:text-white transition-colors duration-200 cursor-pointer"
      >
        <TextMorph>{isCopied ? 'Copied' : 'Copy'}</TextMorph>
      </button>
      <pre className="relative block w-full m-0 px-4 py-3 text-white bg-surface-1 rounded-xl [corner-shape:superellipse(1.25)] font-mono text-[0.8125rem] font-light leading-[1.4] max-h-[11.75rem] overflow-y-auto">
        <MorphCode code={code} language={language} />
      </pre>
    </div>
  );
}
