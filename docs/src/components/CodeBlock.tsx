import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import { cn } from '@/lib/utils';
import { CopyButton } from './CopyButton';

// Register only the languages the docs use; the full Prism build ships every grammar.
// 'text' needs no grammar and renders as plain text.
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);

const codeBlockStyle = {
  ...oneDark,
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
    textShadow: 'none',
  },
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: 'transparent',
    textShadow: 'none',
    margin: 0,
    padding: 0,
  },
};

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
  /** Drop the outer margin, radius and border so the block can sit inside another card. */
  bare?: boolean;
}

export function CodeBlock({
  children,
  className,
  language = 'typescript',
  bare = false,
}: CodeBlockProps) {
  const codeString = typeof children === 'string' ? children : String(children);

  return (
    <div
      className={cn(
        'group relative overflow-hidden bg-surface-1',
        !bare && 'my-6 rounded-lg shadow-border'
      )}
    >
      {/* Opaque strip under the button so a long line never runs beneath or past it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 z-10 h-11 w-14 bg-linear-to-l from-surface-1 from-75% to-transparent"
      />
      <CopyButton
        className="absolute top-2 right-2 z-10 p-1.5! after:-inset-2! bg-surface-1! hover:bg-surface-3! [&_svg]:opacity-60 group-hover:[&_svg]:opacity-100 focus-visible:[&_svg]:opacity-100 [&_svg]:transition-opacity [&_svg]:duration-150"
        noBorder
        text={codeString.trim()}
      />
      {/* Thin dark scrollbar scoped to this block: long comment lines scroll, never wrap. */}
      <div className="[&_pre]:[scrollbar-width:thin] [scrollbar-color:var(--surface-6)_transparent]">
        <SyntaxHighlighter
          language={language}
          style={codeBlockStyle}
          customStyle={{
            margin: 0,
            padding: '1rem',
            paddingRight: '3rem',
            background: 'var(--surface-1)',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          codeTagProps={{
            className: cn('bg-transparent! p-0! rounded-none! text-sm', className),
          }}
        >
          {codeString.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
