import { useState } from 'react'
import {
  expandCompactNotation,
  expandScientificNotation,
  filterMobileKeyboardArtifacts,
  removeExtraDecimalSeparators,
  removeLeadingZeros,
  removeNonNumericCharacters,
  removeThousandSeparators,
} from 'numora'

interface Step {
  name: string
  description: string
  output: string
  ran: boolean
}

const config = {
  thousandSeparator: ',',
  decimalSeparator: '.',
  enableCompactNotation: true,
  enableNegative: false,
  enableLeadingZeros: false,
}

function pipeline(input: string): Step[] {
  const steps: Step[] = []
  let v = input

  v = filterMobileKeyboardArtifacts(v)
  steps.push({
    name: 'filterMobileKeyboardArtifacts',
    description: 'Strip non-breaking spaces and Unicode whitespace',
    output: v,
    ran: true,
  })

  v = removeThousandSeparators(v, config.thousandSeparator)
  steps.push({
    name: 'removeThousandSeparators',
    description: 'Strip the configured grouping char (formatting, not data)',
    output: v,
    ran: true,
  })

  if (config.enableCompactNotation) {
    v = expandCompactNotation(v)
    steps.push({
      name: 'expandCompactNotation',
      description: 'Expand "1k" → "1000", "2.5M" → "2500000"',
      output: v,
      ran: true,
    })
  }

  v = expandScientificNotation(v)
  steps.push({
    name: 'expandScientificNotation',
    description: 'Expand "1.5e-7" → "0.00000015"',
    output: v,
    ran: true,
  })

  v = removeNonNumericCharacters(v, config.enableNegative, config.decimalSeparator)
  steps.push({
    name: 'removeNonNumericCharacters',
    description: 'Strip everything that is not a digit or the decimal separator',
    output: v,
    ran: true,
  })

  v = removeExtraDecimalSeparators(v, config.decimalSeparator)
  steps.push({
    name: 'removeExtraDecimalSeparators',
    description: 'Keep only the first decimal point',
    output: v,
    ran: true,
  })

  if (!config.enableLeadingZeros) {
    v = removeLeadingZeros(v)
    steps.push({
      name: 'removeLeadingZeros',
      description: 'Drop "007" → "7" unless leading zeros are enabled',
      output: v,
      ran: true,
    })
  }

  return steps
}

const PRESETS = ['$1,234.56abc', '1.5e-7', '2.5M', '007.5', '1.2.3.4', '12,34,567']

export function SanitizationStepper() {
  const [value, setValue] = useState('$1,234.56abc')
  const steps = pipeline(value)

  return (
    <div className="my-6 space-y-4 rounded-lg border bg-muted/30 p-4">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Try a messy input - every step runs live as you type:
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="$1,234.56abc"
          className="w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setValue(preset)}
              className="rounded border border-border/60 bg-background/50 px-2 py-0.5 font-mono text-xs text-muted-foreground hover:border-border hover:text-foreground"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
          <div>Step</div>
          <div>Function</div>
          <div className="text-right">Output</div>
        </div>
        {steps.map((step, i) => {
          const prev = i === 0 ? value : steps[i - 1].output
          const changed = prev !== step.output
          return (
            <div
              key={step.name}
              className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded px-3 py-2 transition-colors ${
                changed ? 'bg-background' : 'opacity-50'
              }`}
            >
              <div className="font-mono text-xs text-muted-foreground">{i}</div>
              <div>
                <div className="font-mono text-xs text-foreground">{step.name}</div>
                <div className="text-xs text-muted-foreground/70">{step.description}</div>
              </div>
              <div className="font-mono text-sm">
                {step.output ? (
                  <span className={changed ? 'text-emerald-400' : 'text-muted-foreground'}>
                    "{step.output}"
                  </span>
                ) : (
                  <span className="text-muted-foreground">""</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
