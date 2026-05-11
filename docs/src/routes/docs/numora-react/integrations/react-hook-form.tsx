import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/numora-react/integrations/react-hook-form')({
  head: () => ({
    meta: [
      { title: 'React Hook Form Integration | numora-react' },
      { name: 'description', content: 'Use NumoraInput with React Hook Form. Validated, formatted numeric fields with full TypeScript support.' },
      { property: 'og:title', content: 'React Hook Form Integration | numora-react' },
      { property: 'og:description', content: 'Use NumoraInput with React Hook Form. Validated, formatted numeric fields with full TypeScript support.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/integrations/react-hook-form' },
      { name: 'twitter:title', content: 'React Hook Form Integration | numora-react' },
      { name: 'twitter:description', content: 'Use NumoraInput with React Hook Form. Validated, formatted numeric fields with full TypeScript support.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/integrations/react-hook-form' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "React Hook Form Integration - NumoraInput with React Numeric Input and RHF", "description": "Use NumoraInput with React Hook Form via Controller. Validate numeric inputs, integrate with form state, and access raw values for precision math libraries.", "url": "https://numeric-input.com/docs/numora-react/integrations/react-hook-form", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numeric-input.com/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "React Hook Form", "item": "https://numeric-input.com/docs/numora-react/integrations/react-hook-form" }] }]) },
    ],
  }),
  component: ReactHookFormIntegration,
})

function ReactHookFormIntegration() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>React Hook Form Integration</h1>
      <p className="text-lg text-muted-foreground">
        Learn how to use NumoraInput with react-hook-form using the recommended <code>Controller</code> pattern.
      </p>

      <h2>Overview</h2>
      <p>
        <code>NumoraInput</code> manages its own DOM value directly (via an uncontrolled <code>defaultValue</code> internally),
        but supports a controlled-style <code>value</code> prop that syncs programmatic changes into the input.
        React Hook Form's <code>Controller</code> component is the recommended integration pattern - it handles
        the <code>value</code>, <code>onChange</code>, <code>onBlur</code>, <code>ref</code>, and <code>disabled</code> wiring automatically.
      </p>

      <p>
        <strong>Note:</strong> <code>numora-react</code> does not require <code>react-hook-form</code> as a dependency.
        It works with react-hook-form when it's present in your project.
      </p>

      <h2>Controller Pattern (recommended)</h2>
      <p>
        Always forward all four field properties - <code>onChange</code>, <code>onBlur</code>, <code>ref</code>,
        and <code>disabled</code>. Omitting <code>onBlur</code> breaks touched-state tracking;
        omitting <code>ref</code> breaks auto-focus on validation errors.
      </p>

      <ExampleWithDemo
        code={`import { useForm, Controller } from 'react-hook-form'
import { NumoraInput } from 'numora-react'

function Form() {
  const { control, handleSubmit, setValue } = useForm()

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value, ref, disabled } }) => (
          <NumoraInput
            ref={ref}
            name="amount"
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            maxDecimals={2}
            thousandSeparator=","
          />
        )}
      />
      <button type="button" onClick={() => setValue('amount', '1000')}>
        Set to 1000
      </button>
      <button type="submit">Submit</button>
    </form>
  )
}`}
        language="tsx"
        config={{
          maxDecimals: 2,
          thousandSeparator: ',',
        }}
        description="Basic form with Controller pattern - works with setValue() automatically"
      />

      <h3>Validation errors</h3>
      <p>
        Use <code>fieldState.error</code> from the render prop to display validation messages:
      </p>

      <CodeBlock language="tsx">
{`<Controller
  control={control}
  name="amount"
  rules={{ required: 'Amount is required', min: { value: 1, message: 'Must be at least 1' } }}
  render={({ field: { onChange, onBlur, value, ref, disabled }, fieldState: { error } }) => (
    <>
      <NumoraInput
        ref={ref}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxDecimals={2}
        thousandSeparator=","
      />
      {error && <span>{error.message}</span>}
    </>
  )}
/>`}
      </CodeBlock>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>💡 Tip:</strong> <code>NumoraInput</code>'s <code>onChange</code> always exposes the raw
          (unformatted) numeric string - no post-processing required:
          <ul className="mt-2 mb-0">
            <li><code>e.target.value</code> - raw numeric string (e.g. <code>"1000.50"</code>) - separators stripped</li>
            <li><code>e.target.formattedValue</code> - formatted display string (e.g. <code>"1,000.50"</code>), typed via <code>NumoraHTMLInputElement</code></li>
          </ul>
        </p>
      </div>

      <h2>Complete example</h2>
      <p>
        A form with programmatic updates (<code>Max</code> / <code>Half</code> buttons) using the Controller pattern:
      </p>

      <CodeBlock language="tsx">
{`import { useForm, Controller } from 'react-hook-form'
import { NumoraInput } from 'numora-react'

interface FormValues {
  amount: string
}

function SwapForm() {
  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: { amount: '' }
  })

  const handleMaxClick = () => {
    setValue('amount', '1000000')
  }

  const handleHalfClick = () => {
    const current = parseFloat(watch('amount') || '0')
    setValue('amount', (current / 2).toString())
  }

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, onBlur, value, ref, disabled }, fieldState: { error } }) => (
          <>
            <NumoraInput
              ref={ref}
              name="amount"
              value={value || ''}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              maxDecimals={6}
              thousandSeparator=","
              placeholder="0.0"
            />
            {error && <span>{error.message}</span>}
          </>
        )}
      />
      <div>
        <button type="button" onClick={handleMaxClick}>Max</button>
        <button type="button" onClick={handleHalfClick}>Half</button>
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}`}
      </CodeBlock>

      <h2>Register pattern (uncontrolled)</h2>
      <p>
        For basic forms that don't need programmatic updates or <code>setValue()</code>, you can use
        the <code>register</code> pattern. Spread the register result and leave <code>NumoraInput</code> to
        manage its own value - do not also pass a <code>value</code> prop:
      </p>

      <CodeBlock language="tsx">
{`import { useForm } from 'react-hook-form'
import { NumoraInput } from 'numora-react'

function Form() {
  const { register, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <NumoraInput
        {...register('amount')}
        maxDecimals={2}
        thousandSeparator=","
      />
      <button type="submit">Submit</button>
    </form>
  )
}`}
      </CodeBlock>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>⚠️ Limitation:</strong> With the <code>register</code> pattern, calling <code>setValue()</code> won't
          update the displayed value. Use the <code>Controller</code> pattern whenever you need programmatic updates.
        </p>
      </div>

      <h2>Key points</h2>
      <ul>
        <li>
          <strong>Always forward <code>onBlur</code>, <code>ref</code>, and <code>disabled</code></strong> from the
          Controller field - these are required for touched-state tracking, focus management on errors, and
          disabled-field support.
        </li>
        <li>
          <strong>Controller pattern</strong> (recommended): works with <code>setValue()</code>, validation, and
          all react-hook-form features.
        </li>
        <li>
          <strong>Register pattern</strong>: works for basic form submission only - <code>setValue()</code> won't
          update the UI.
        </li>
        <li>
          <strong>Raw values by default:</strong> <code>e.target.value</code> in <code>onChange</code> always
          returns the raw numeric string (separators stripped). <code>field.onChange(e.target.value)</code> stores
          the clean value - no extra handling needed. The formatted display string is available as{' '}
          <code>e.target.formattedValue</code> via <code>NumoraHTMLInputElement</code>.
        </li>
        <li>
          <strong>No extra dependencies:</strong> <code>numora-react</code> doesn't require react-hook-form.
        </li>
      </ul>
    </div>
  )
}
