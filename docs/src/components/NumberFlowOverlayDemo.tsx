import NumberFlow from '@number-flow/react';
import { FormatOn } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { useEffect, useState } from 'react';

export function NumberFlowOverlayDemo() {
  const [value, setValue] = useState('1234567');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mirror the input's typed decimals on the animated layer so trailing zeros
  // ("1.20") line up under the caret instead of collapsing to "1.2".
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  const numericValue = value === '' ? 0 : Number(value);

  return (
    <div className="my-16 py-12 flex justify-center items-center">
      <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] text-4xl font-mono leading-none text-white">
        <span aria-hidden="true" className="pointer-events-none whitespace-pre tabular-nums">
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
          value={value}
          onChange={(e: NumoraInputChangeEvent) => {
            setValue(e.target.value);
          }}
          formatOn={FormatOn.Change}
          maxDecimals={2}
          thousandSeparator=","
          aria-label="Amount"
          className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent text-transparent placeholder-transparent caret-white outline-none focus:outline-none selection:bg-white/25 text-4xl font-mono leading-none"
        />
      </label>
    </div>
  );
}
