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
        Learn how to use NumoraInput with react-hook-form, including how to handle programmatic updates with <code>setValue()</code>.
      </p>

      <h2>Overview</h2>
      <p>
        <code>NumoraInput</code> works seamlessly with react-hook-form. You can use it in two modes:
      </p>
      <ul>
        <li><strong>Uncontrolled Mode:</strong> For basic forms that don't require programmatic updates</li>
        <li><strong>Controlled Mode:</strong> Required when using <code>setValue()</code> to programmatically update form values</li>
      </ul>

      <p>
        <strong>Note:</strong> <code>numora-react</code> does not require <code>react-hook-form</code> as a dependency. 
        It works with react-hook-form when it's present in your project.
      </p>

      <h2>Uncontrolled Mode</h2>
      <p>
        For basic forms that only need user input and form submission, you can use NumoraInput in uncontrolled mode:
      </p>

      <ExampleWithDemo
        code={`import { useForm } from 'react-hook-form'
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
        language="tsx"
        config={{
          maxDecimals: 2,
          thousandSeparator: ',',
        }}
        description="Basic form with react-hook-form in uncontrolled mode"
      />

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="text-sm m-0">
          <strong>⚠️ Limitation:</strong> In uncontrolled mode, calling <code>setValue()</code> won't update the UI immediately. 
          Use controlled mode if you need programmatic updates.
        </p>
      </div>

      <h2>Controlled Mode with setValue()</h2>
      <p>
        When you need to programmatically update the form value using <code>setValue()</code>, use controlled mode 
        with <code>useWatch</code> or <code>watch</code> to sync the form state:
      </p>

      <ExampleWithDemo
        code={`import { useForm, useWatch } from 'react-hook-form'
import { NumoraInput } from 'numora-react'

function Form() {
  const form = useForm()
  const { register, setValue } = form
  const amountString = useWatch({ control: form.control, name: 'amount' })

  return (
    <>
      <NumoraInput
        {...register('amount')}
        value={amountString || ''}  // Controlled mode - required for setValue
        maxDecimals={2}
        thousandSeparator=","
      />
      <button onClick={() => setValue('amount', '1000')}>
        Set to 1000
      </button>
    </>
  )
}`}
        language="tsx"
        config={{
          maxDecimals: 2,
          thousandSeparator: ',',
        }}
        description="Controlled mode with setValue() - click the button to see the value update"
      />

      <h3>Alternative Pattern</h3>
      <p>
        You can also pass the register object directly as a prop:
      </p>

      <CodeBlock language="tsx">
{`const form = useForm<FormFieldValues>()
const { setValue } = form
const amountString = useWatch({ control: form.control, name: 'amount' })

<NumoraInput
  register={form.register('amount')}
  value={amountString || ''}
  maxDecimals={2}
/>`}
      </CodeBlock>

      <h2>Why Controlled Mode is Needed</h2>
      <p>
        <code>NumoraInput</code> maintains its own internal state for formatting and display. When you use 
        <code>register</code> in uncontrolled mode, react-hook-form manages the value via a ref, but 
        <code>NumoraInput</code>'s internal state doesn't automatically sync with external ref updates.
      </p>
      <p>
        By providing the <code>value</code> prop along with <code>register</code>, you enable controlled mode, 
        which ensures that when <code>setValue()</code> is called:
      </p>
      <ol>
        <li>react-hook-form updates its internal state</li>
        <li><code>useWatch</code> detects the change and updates <code>amountString</code></li>
        <li><code>NumoraInput</code> receives the new <code>value</code> prop and updates immediately</li>
      </ol>

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
          <strong>Uncontrolled mode</strong> (with <code>register</code> only): Works for basic form submission, 
          but <code>setValue()</code> won't update the UI immediately
        </li>
        <li>
          <strong>Controlled mode</strong> (with <code>register</code> + <code>value</code>): Required when using 
          <code>setValue()</code> programmatically
        </li>
        <li>
          <strong>Pattern:</strong> Use <code>useWatch</code> or <code>watch</code> to get the form value and pass 
          it as <code>value</code> prop
        </li>
        <li>
          Both patterns work: <code>{'{...register(\'field\')}'}</code> (spread) or 
          <code>register={'{register(\'field\')}'}</code> (direct prop) - though spread is more common
        </li>
      </ul>
    </div>
  )
}

