import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark'
import { cn } from '@/lib/utils'

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
}

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  language?: string
}

export function CodeBlock({ children, className, language = 'typescript' }: CodeBlockProps) {
  const codeString = typeof children === 'string' ? children : String(children)

  return (
    <div className="relative my-6 overflow-hidden rounded-lg border border-muted/50 bg-surface-1">
      <SyntaxHighlighter
        language={language}
        style={codeBlockStyle}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'var(--surface-1)',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        preTagProps={{
          className: 'bg-surface-1!',
        }}
        codeTagProps={{
          className: cn('bg-transparent! p-0! rounded-none! text-sm', className),
        }}
      >
        {codeString.trim()}
      </SyntaxHighlighter>
    </div>
  )
}
