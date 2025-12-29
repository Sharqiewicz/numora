import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/numora-react/integrations/react-hook-form')({
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
        <code>NumoraInput</code> is a controlled component, and react-hook-form recommends using the <code>Controller</code> 
        component for integrating controlled components. This pattern provides seamless integration with all react-hook-form 
        features including <code>setValue()</code>, validation, and form state management.
      </p>

      <p>
        <strong>Note:</strong> <code>numora-react</code> does not require <code>react-hook-form</code> as a dependency. 
        It works with react-hook-form when it's present in your project.
      </p>

      <h2>Recommended: Controller Pattern</h2>
      <p>
        The <code>Controller</code> component is the recommended way to integrate <code>NumoraInput</code> with react-hook-form. 
        It automatically handles controlled mode and works seamlessly with <code>setValue()</code>:
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
        render={({ field: { onChange, name, value } }) => (
          <NumoraInput
            name={name}
            value={value || ''}
            onChange={onChange}
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

      <h3>Storing Raw Values</h3>
      <p>
        By default, <code>NumoraInput</code> provides formatted values (e.g., "1,000.50") in <code>e.target.value</code>. 
        If you need to store raw values (e.g., "1000.50") in your form state for calculations, you can access the raw value 
        via <code>e.target.rawValue</code>:
      </p>

      <CodeBlock language="tsx">
{`<Controller
  control={control}
  name="amount"
  render={({ field }) => (
    <NumoraInput
      value={field.value || ''}
      onChange={(e) => {
        // Store raw value (without thousand separators) - better for calculations
        field.onChange((e.target as any).rawValue);
      }}
      maxDecimals={2}
      thousandSeparator=","
    />
  )}
/>`}
      </CodeBlock>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>💡 Tip:</strong> <code>NumoraInput</code> provides both formatted and raw values:
          <ul className="mt-2 mb-0">
            <li><code>e.target.value</code> - Formatted value (e.g., "1,000.50")</li>
            <li><code>e.target.rawValue</code> - Raw value (e.g., "1000.50")</li>
          </ul>
        </p>
      </div>

      <h2>Complete Example</h2>
      <p>
        Here's a complete example showing a form with programmatic value updates using the Controller pattern:
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
    setValue('amount', '1000000')  // Set to max balance
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
        render={({ field: { onChange, name, value } }) => (
          <NumoraInput
            name={name}
            value={value || ''}
            onChange={onChange}
            maxDecimals={6}
            thousandSeparator=","
            placeholder="0.0"
          />
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

      <h2>Alternative: Register Pattern (Uncontrolled)</h2>
      <p>
        For basic forms that don't require programmatic updates, you can use the <code>register</code> pattern. 
        However, this approach has limitations:
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
          <strong>⚠️ Limitation:</strong> With <code>register</code> pattern, calling <code>setValue()</code> won't 
          update the UI immediately. Use the <code>Controller</code> pattern if you need programmatic updates.
        </p>
      </div>

      <h2>Complete Example</h2>
      <p>
        Here's a complete example showing a form with programmatic value updates:
      </p>

      <CodeBlock language="tsx">
{`import { useForm, useWatch } from 'react-hook-form'
import { NumoraInput } from 'numora-react'

interface FormValues {
  amount: string
}

function SwapForm() {
  const form = useForm<FormValues>({
    defaultValues: { amount: '' }
  })
  const { register, setValue, handleSubmit } = form
  const amountString = useWatch({ control: form.control, name: 'amount' })

  const handleMaxClick = () => {
    setValue('amount', '1000000')  // Set to max balance
  }

  const handleHalfClick = () => {
    const current = parseFloat(amountString || '0')
    setValue('amount', (current / 2).toString())
  }

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <NumoraInput
        {...register('amount')}
        value={amountString || ''}
        maxDecimals={6}
        thousandSeparator=","
        placeholder="0.0"
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

      <h2>Key Points</h2>
      <ul>
        <li>
          <strong>Controller pattern</strong> (recommended): Works seamlessly with all react-hook-form features including 
          <code>setValue()</code>, validation, and form state management. This is the official react-hook-form 
          recommendation for controlled components.
        </li>
        <li>
          <strong>Register pattern</strong> (alternative): Works for basic form submission, but <code>setValue()</code> 
          won't update the UI immediately. Use only for simple uncontrolled forms.
        </li>
        <li>
          <strong>Formatted vs Raw Values:</strong> By default, form state contains formatted values. Access 
          <code>e.target.rawValue</code> if you need to store raw values for calculations.
        </li>
        <li>
          <strong>No dependencies:</strong> <code>numora-react</code> doesn't require react-hook-form as a dependency. 
          It works with react-hook-form when it's present in your project.
        </li>
      </ul>
    </div>
  )
}



