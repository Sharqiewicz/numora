import NumberFlow from '@number-flow/react';
import { FormatOn } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { useEffect, useState } from 'react';

const EXCHANGE_RATE = 1850.42;

export function NumberFlowDemo() {
  const [amount, setAmount] = useState('');
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const numericAmount = amount === '' ? 0 : Number(amount);
  const converted = numericAmount * EXCHANGE_RATE;

  return (
    <div className="my-16 py-12 grid gap-4 sm:grid-cols-2 items-center">
      {editing ? (
        <NumoraInput
          autoFocus
          value={amount}
          onChange={(e: NumoraInputChangeEvent) => setAmount(e.target.value)}
          onBlur={() => setEditing(false)}
          formatOn={FormatOn.Change}
          decimalMaxLength={6}
          thousandSeparator=","
          placeholder="0"
          className="w-full bg-transparent text-4xl font-mono text-white placeholder-surface-6 focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-left text-4xl font-mono text-white tabular-nums cursor-text focus:outline-none"
          aria-label="Edit ETH amount"
        >
          {mounted ? <NumberFlow value={numericAmount} /> : numericAmount}
        </button>
      )}
      <div className="text-4xl font-mono text-white tabular-nums">
        {mounted ? (
          <NumberFlow
            value={converted}
            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 2 }}
          />
        ) : (
          '$0.00'
        )}
      </div>
    </div>
  );
}
