import { createFileRoute } from '@tanstack/react-router'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import { FormatOn, ThousandStyle } from 'numora'

export const Route = createFileRoute('/docs/numora-react/features/formatting')({
  head: () => ({
    meta: [
      { title: 'Number Formatting as You Type | numora-react' },
      { name: 'description', content: 'Format numbers as you type using the NumoraInput React component. Thousand separators, multiple grouping styles, real-time formatting with cursor position preservation.' },
      { property: 'og:title', content: 'Number Formatting as You Type | numora-react' },
      { property: 'og:description', content: 'Format numbers as you type using the NumoraInput React component. Thousand separators and cursor position preservation.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/features/formatting' },
      { name: 'twitter:title', content: 'Number Formatting as You Type | numora-react' },
      { name: 'twitter:description', content: 'Format numbers as you type using the NumoraInput React component.' },
    ],
  }),
  component: Formatting,
})

function Formatting() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Formatting</h1>
      <p className="text-lg text-muted-foreground">
        Numora formats numbers with thousand separators as the user types, preserving cursor
        position throughout.
      </p>

      <h2>Grouping styles</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Standard: 1,234,567"
          description="Type a large number to see standard grouping"
          language="tsx"
          code={`<NumoraInput thousandSeparator="," thousandStyle={ThousandStyle.Thousand} />`}
          config={{ thousandSeparator: ',', thousandStyle: ThousandStyle.Thousand, maxDecimals: 2 }}
        />
        <ExampleWithDemo
          title="Indian (Lakh): 12,34,567"
          description="Type a large number to see Indian numbering"
          language="tsx"
          code={`<NumoraInput thousandSeparator="," thousandsStyle={ThousandStyle.Lakh} />`}
          config={{ thousandSeparator: ',', thousandStyle: ThousandStyle.Lakh, maxDecimals: 2 }}
        />
        <ExampleWithDemo
          title="Chinese (Wan): 123,4567"
          description="Type a large number to see Chinese numbering"
          language="tsx"
          code={`<NumoraInput thousandSeparator="," thousandsGroupStyle={ThousandStyle.Wan} />`}
          config={{ thousandSeparator: ',', thousandStyle: ThousandStyle.Wan, maxDecimals: 2 }}
        />
        <ExampleWithDemo
          title="None"
          description="Type a large number to see none grouping"
          language="tsx"
          code={`<NumoraInput thousandSeparator="," thousandsGroupStyle={ThousandStyle.None} />`}
          config={{ thousandSeparator: ',', thousandStyle: ThousandStyle.None, maxDecimals: 2 }}
        />
      </div>

      <h2>When to format</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Blur (default)"
          description="Type a number and click away to see formatting applied"
          language="tsx"
          code={`<NumoraInput formatOn={FormatOn.Blur} thousandSeparator="," />`}
          config={{ formatOn: FormatOn.Blur, thousandSeparator: ',', maxDecimals: 2 }}
        />
        <ExampleWithDemo
          title="Change"
          description="Formatting is applied on every keystroke"
          language="tsx"
          code={`<NumoraInput formatOn={FormatOn.Change} thousandSeparator="," />`}
          config={{ formatOn: FormatOn.Change, thousandSeparator: ',', maxDecimals: 2 }}
        />
      </div>

      <h2>Automatic behaviors</h2>
      <ul>
        <li><strong>Cursor preservation</strong> - the cursor stays in the correct position when separators are added or removed during formatting</li>
        <li><strong>Separator skipping</strong> - backspace and delete automatically skip over thousand separators so they never need to be deleted manually</li>
      </ul>
    </div>
  )
}
