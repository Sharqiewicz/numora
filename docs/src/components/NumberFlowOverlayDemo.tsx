import NumberFlow from '@number-flow/react';
import { NumoraInput } from 'numora-react';
import { useId, useState } from 'react';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';

export function NumberFlowOverlayDemo() {
  const inputId = useId();
  const [value, setValue] = useState('1234567');

  // Mirror the input's typed decimals on the animated layer so trailing zeros
  // ("1.20") line up under the caret instead of collapsing to "1.2".
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  // The raw string itself, not Number(value): Intl formats a numeric string digit for digit.
  // This project's TS lib (ES2022) still types the value as a number.
  const number = (/\d/.test(value) ? value : '0') as unknown as number;

  return (
    <DemoFrame inputId={inputId}>
      <div className={demoOverlayBox}>
        <span aria-hidden="true" className="pointer-events-none whitespace-pre">
          <NumberFlow
            value={number}
            // "1." is the number 1, so the dot the user just typed is drawn as a suffix.
            suffix={value.endsWith('.') ? '.' : undefined}
            locales="en-US"
            format={{
              useGrouping: true,
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }}
          />
        </span>
        <NumoraInput
          id={inputId}
          value={value}
          onValueChange={({ value }) => setValue(value)}
          decimalMaxLength={2}
          padLeadingZero
          aria-label="Amount"
          className={`${demoOverlayInput} caret-foreground`}
        />
      </div>
    </DemoFrame>
  );
}
