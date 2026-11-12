import NumberFlow from '@number-flow/react';
import { NumoraInput } from 'numora-react';
import { useEffect, useId, useState } from 'react';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';

export function NumberFlowOverlayDemo() {
  const inputId = useId();
  const [value, setValue] = useState('1234567');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mirror the input's typed decimals on the animated layer so trailing zeros
  // ("1.20") line up under the cursor instead of collapsing to "1.2".
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  const numericValue = Number(value) || 0;

  return (
    <DemoFrame inputId={inputId}>
      <div className={demoOverlayBox}>
        <span aria-hidden="true" className="pointer-events-none whitespace-pre">
          {mounted ? (
            <NumberFlow
              value={numericValue}
              format={{
                useGrouping: true,
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              }}
            />
          ) : (
            '1,234,567'
          )}
        </span>
        <NumoraInput
          id={inputId}
          value={value}
          onValueChange={({ value }) => setValue(value)}
          formatOn="change"
          decimalMaxLength={2}
          thousandSeparator=","
          aria-label="Amount"
          className={`${demoOverlayInput} caret-foreground`}
        />
      </div>
    </DemoFrame>
  );
}
