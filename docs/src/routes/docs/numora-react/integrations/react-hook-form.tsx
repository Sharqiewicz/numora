import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { RhfLocalePlayground } from '@/components/RhfLocalePlayground';

export const Route = createFileRoute('/docs/numora-react/integrations/react-hook-form')({
  head: () => ({
    meta: [
      { title: 'React Hook Form integration | Numora React' },
      {
        name: 'description',
        content:
          'Use NumoraInput with React Hook Form through Controller. The form stores the raw value in every locale.',
      },
      { property: 'og:title', content: 'React Hook Form integration | Numora React' },
      {
        property: 'og:description',
        content:
          'Use NumoraInput with React Hook Form through Controller. The form stores the raw value in every locale.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/integrations/react-hook-form',
      },
      { name: 'twitter:title', content: 'React Hook Form integration | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Use NumoraInput with React Hook Form through Controller. The form stores the raw value in every locale.',
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
              'Use NumoraInput with React Hook Form through Controller. The form stores the raw value, a plain decimal string you can pass to a decimal library.',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>React Hook Form integration</h1>
      <p>
        Use <code>NumoraInput</code> with React Hook Form through its <code>Controller</code>{' '}
        component.
      </p>

      <p>
        <code>numora-react</code> does not depend on <code>react-hook-form</code>. Install it in
        your project yourself.
      </p>

      <h2>Controller pattern</h2>
      <p>
        Spread <code>field</code> onto <code>NumoraInput</code>. It forwards <code>name</code>,{' '}
        <code>value</code>, <code>onChange</code>, <code>onBlur</code>, <code>ref</code> and{' '}
        <code>disabled</code>.
      </p>
      <p>
        In <code>onChange</code>, React Hook Form reads <code>e.target.value</code>. On{' '}
        <code>NumoraInput</code> that is the raw value, so the form stores <code>"1234.5"</code> in
        every locale. <code>onBlur</code> tracks the touched state. <code>ref</code> focuses the
        field on a validation error.
      </p>
      <p>
        Give the field a string in <code>defaultValues</code>, so it is controlled from the first
        render.
      </p>

      <ExampleWithDemo
        code={`import { useForm, Controller } from 'react-hook-form'
import { NumoraInput } from 'numora-react'

function Form() {
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: { amount: '' },
  })

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        control={control}
        name="amount"
        render={({ field }) => <NumoraInput {...field} decimalMaxLength={2} />}
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
          decimalMaxLength: 2,
        }}
        description="A form with one Controller field. setValue() updates the input. The live field shows the input alone, without the form."
      />

      <h3>Validation errors</h3>
      <p>
        Show the message from <code>fieldState.error</code>. Validate with a <code>validate</code>{' '}
        function that works on the string. React Hook Form's <code>min</code> and <code>max</code>{' '}
        rules convert the value to a JavaScript number, which loses precision on long amounts.
      </p>

      <CodeBlock language="tsx">
        {`<Controller
  control={control}
  name="amount"
  rules={{
    required: 'Amount is required',
    // The form value is a string. Compare it as text or with a decimal library;
    // \`min\` would convert it to a float.
    validate: (value) => /^[1-9]/.test(value) || 'Must be at least 1',
  }}
  render={({ field, fieldState: { error } }) => (
    <>
      <NumoraInput {...field} decimalMaxLength={2} />
      {error && <span>{error.message}</span>}
    </>
  )}
/>`}
      </CodeBlock>

      <p>
        The same goes for a schema resolver. Keep the amount a string in the schema, such as Zod's{' '}
        <code>z.string()</code>. <code>z.coerce.number()</code> converts it to a JavaScript number.
      </p>

      <h3>Reusable field</h3>
      <p>
        To use the field in several forms, wrap it once with <code>useController</code>. The wrapper
        gives <code>name</code>, <code>control</code>, <code>rules</code> and <code>disabled</code>{' '}
        to React Hook Form, and passes every other prop to <code>NumoraInput</code>. Set the initial
        value in the form's <code>defaultValues</code>.
      </p>

      <CodeBlock language="tsx">
        {`import { useController, type FieldValues, type UseControllerProps } from 'react-hook-form'
import { NumoraInput, type NumoraInputProps } from 'numora-react'

type AmountFieldProps<T extends FieldValues> = Pick<
  UseControllerProps<T>,
  'name' | 'control' | 'rules' | 'disabled'
> &
  Omit<NumoraInputProps, 'name' | 'disabled' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'>

function AmountField<T extends FieldValues>({
  name,
  control,
  rules,
  disabled,
  ...props
}: AmountFieldProps<T>) {
  const { field, fieldState } = useController({ name, control, rules, disabled })

  return (
    <>
      <NumoraInput {...props} {...field} aria-invalid={fieldState.invalid} />
      {fieldState.error && <span role="alert">{fieldState.error.message}</span>}
    </>
  )
}

// <AmountField name="amount" control={control} rules={{ required: 'Amount is required' }} locale="de-DE" />`}
      </CodeBlock>

      <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
        <p className="m-0">
          The <code>onChange</code> event carries both strings. If you write the handler yourself,
          pass the raw value: <code>{'onChange={(e) => field.onChange(e.target.value)}'}</code>.
        </p>
        <ul className="mt-2 mb-0">
          <li>
            <code>e.target.value</code> is the raw value, <code>"1000.50"</code> in every locale
          </li>
          <li>
            <code>e.target.formattedValue</code> is the display value, <code>"1,000.50"</code> in
            en-US
          </li>
        </ul>
      </div>

      <h2>Complete example</h2>
      <p>
        A swap form with <code>Max</code> and <code>Half</code> buttons. Both write the amount with{' '}
        <code>setValue()</code>, as a string.
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
  const { control, handleSubmit, setValue, getValues } = useForm<FormValues>({
    defaultValues: { amount: '' }
  })

  const handleMaxClick = () => {
    setValue('amount', '1000000')
  }

  // String-based halving: scale to integer units, halve with bigint, scale back.
  // Never route the amount through Number()/parseFloat().
  const handleHalfClick = () => {
    setValue('amount', halve(getValues('amount')))
  }

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field, fieldState: { error } }) => (
          <>
            <NumoraInput {...field} decimalMaxLength={6} placeholder="0.0" />
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

      <h2>Try it with any locale</h2>
      <p>
        A live form built with React Hook Form. Switch the locale and compare what the field shows with what
        the form holds. The form state is the same raw value in every locale.
      </p>
      <RhfLocalePlayground />

      <h2>Why not register?</h2>
      <p>
        Don't spread <code>register('amount')</code> onto <code>NumoraInput</code>.{' '}
        <code>register</code> reads the value from the DOM node, and the DOM node holds the display
        value. The form stores <code>"1,234.5"</code>, or <code>"1.234,5"</code> in de-DE, where you
        wanted <code>"1234.5"</code>.
      </p>
      <p>
        Writing is worse. <code>setValue()</code> and <code>reset()</code> put their string straight
        into the input, past Numora. In a de-DE field, <code>setValue('amount', '1234.5')</code>{' '}
        shows <code>1234.5</code>. Type a <code>6</code> after it and the field reads{' '}
        <code>123.456</code>, because the dot was taken for a thousand separator. Use{' '}
        <code>Controller</code>.
      </p>
    </div>
  );
}
