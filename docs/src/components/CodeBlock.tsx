import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {oneDark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  language?: string
}

export function CodeBlock({ children, className, language = 'typescript' }: CodeBlockProps) {
  const codeString = typeof children === 'string' ? children : String(children)


  return (
    <div className="relative my-6 overflow-hidden rounded-lg border border-muted/50">
      {language && (
        <div className="border-b border-muted bg-[#171717] px-4 py-2 text-xs font-medium text-muted-foreground">
          {language}
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#282828',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}

        codeTagProps={{
          className: cn('text-sm', className),
        }}
      >
        {codeString.trim()}
      </SyntaxHighlighter>
    </div>
  )
}
