import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/integrations/react-hook-form')({
  head: () => ({
    meta: [
      { title: 'React Hook Form integration | Numora React' },
      {
        name: 'description',
        content:
          'Use NumoraInput with React Hook Form. Validated, formatted numeric fields, typed in TypeScript.',
      },
      { property: 'og:title', content: 'React Hook Form integration | Numora React' },
      {
        property: 'og:description',
        content:
          'Use NumoraInput with React Hook Form. Validated, formatted numeric fields, typed in TypeScript.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/integrations/react-hook-form',
      },
      { name: 'twitter:title', content: 'React Hook Form integration | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Use NumoraInput with React Hook Form. Validated, formatted numeric fields, typed in TypeScript.',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://numeric-input.com/docs/numora-react/integrations/react-hook-form',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'React Hook Form integration for NumoraInput',
            description:
              'Use NumoraInput with React Hook Form via Controller. Validate numeric inputs, keep them in form state, and read the raw value to pass to precision math libraries.',
            url: 'https://numeric-input.com/docs/numora-react/integrations/react-hook-form',
            author: {
              '@type': 'Person',
              name: 'Kacper Szarkiewicz',
              url: 'https://x.com/sharqiewicz',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Numora React',
                item: 'https://numeric-input.com/docs/numora-react',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'React Hook Form integration',
                item: 'https://numeric-input.com/docs/numora-react/integrations/react-hook-form',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: ReactHookFormIntegration,
});

function ReactHookFormIntegration() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>React Hook Form integration</h1>
      <p>
        Use <code>NumoraInput</code> with React Hook Form through the recommended{' '}
        <code>Controller</code> pattern.
      </p>

      <p>
        <code>numora-react</code> does not require <code>react-hook-form</code> as a dependency.
        It works with React Hook Form when it is present in your project.
      </p>

      <h2>Controller pattern (recommended)</h2>
      <p>
        Always forward all four field properties: <code>onChange</code>, <code>onBlur</code>,{' '}
        <code>ref</code> and <code>disabled</code>. Omitting <code>onBlur</code> breaks
        touched-state tracking; omitting <code>ref</code> breaks auto-focus on validation errors.
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
        }}
        description="Basic form with the Controller pattern. setValue() updates the input."
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
      />
      {error && <span>{error.message}</span>}
    </>
  )}
/>`}
      </CodeBlock>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="m-0">
          <strong>Tip:</strong> <code>NumoraInput</code>'s <code>onChange</code> always exposes the
          raw (unformatted) numeric string, so you need no post-processing:
        </p>
        <ul className="mt-2 mb-0">
          <li>
            <code>e.target.value</code> is the raw value (e.g. <code>"1000.50"</code>), with
            separators stripped
          </li>
          <li>
            <code>e.target.formattedValue</code> is the formatted display string (e.g.{' '}
            <code>"1,000.50"</code>), typed via <code>NumoraHTMLInputElement</code>
          </li>
        </ul>
      </div>

      <h2>Complete example</h2>
      <p>
        A form with programmatic updates (<code>Max</code> / <code>Half</code> buttons) using the
        Controller pattern:
      </p>

      <CodeBlock language="tsx">
        {`import { useForm, Controller } from 'react-hook-form'
import { NumoraInput } from 'numora-react'

interface FormValues {
  amount: string
}

function halve(amount: string, decimals = 6): string {
  const [int = '0', frac = ''] = (amount || '0').split('.')
  const units = BigInt(int + frac.padEnd(decimals, '0').slice(0, decimals)) / 2n
  const padded = units.toString().padStart(decimals + 1, '0')
  const result = \`\${padded.slice(0, -decimals)}.\${padded.slice(-decimals)}\`
  return result.replace(/\\.?0+$/, '')
}

function SwapForm() {
  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: { amount: '' }
  })

  const handleMaxClick = () => {
    setValue('amount', '1000000')
  }

  // String-based halving: scale to integer units, halve with bigint, scale back.
  // Never route the amount through Number()/parseFloat().
  const handleHalfClick = () => {
    setValue('amount', halve(watch('amount')))
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
        the <code>register</code> pattern. Spread the register result and leave{' '}
        <code>NumoraInput</code> to manage its own value. Do not also pass a <code>value</code>{' '}
        prop:
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
      />
      <button type="submit">Submit</button>
    </form>
  )
}`}
      </CodeBlock>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="m-0">
          <strong>Caution:</strong> With the <code>register</code> pattern, calling{' '}
          <code>setValue()</code> won't update the displayed value. Use the <code>Controller</code>{' '}
          pattern whenever you need programmatic updates.
        </p>
      </div>
    </div>
  );
}
