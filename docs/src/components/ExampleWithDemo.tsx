import { NumoraInput } from 'numora-react'
import type { NumoraInputProps } from 'numora-react'
import { CodeBlock } from './CodeBlock'

interface ExampleWithDemoProps {
  code: string
  language?: string
  config: NumoraInputProps
  title?: string
  description?: string
  placeholder?: string
}

export function ExampleWithDemo({
  code,
  language = 'typescript',
  config,
  title,
  description,
  placeholder = 'Try typing here...',
}: ExampleWithDemoProps) {
  return (
    <div className="my-6 space-y-4">
      {title && <h4 className="text-lg font-semibold">{title}</h4>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <CodeBlock language={language}>{code}</CodeBlock>
      <div className="rounded-lg border bg-muted/30 p-4">
        <label className="mb-2 block text-sm font-medium">Live Example:</label>
        <NumoraInput
          {...config}
          placeholder={placeholder}
          className="w-full"
        />
      </div>
    </div>
  )
}
