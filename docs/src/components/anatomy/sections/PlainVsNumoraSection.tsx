import { useState } from 'react';
import { FormatOn, ThousandStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { InputPair } from '../InputPair';
import { DemoInput, demoInputClass } from '../kit';

export function PlainVsNumoraSection() {
  const [plainValue, setPlainValue] = useState('');

  return (
    <section id="plain-vs-numora" className="space-y-4 scroll-mt-24">
      <h2>
        Plain <code>&lt;input&gt;</code> vs Numora
      </h2>
      <p>
        Type the same text into both inputs below, for example <code>$1,234.56abc</code>, then{' '}
        <code>1.5e-7</code>, then <code>2.5k</code>. Numora cleans, expands and
        groups the value as you type:
      </p>
      <InputPair
        left={{
          label: 'Plain <input type="text">',
          tone: 'bad',
          input: (
            <DemoInput
              type="text"
              value={plainValue}
              onChange={(e) => setPlainValue(e.target.value)}
              aria-label="Plain text input"
              placeholder="$1,234.56abc"
            />
          ),
          note: 'Keeps whatever you type.',
        }}
        right={{
          label: 'NumoraInput',
          tone: 'good',
          input: (
            <NumoraInput
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={ThousandStyle.Thousand}
              maxDecimals={2}
              enableCompactNotation
              aria-label="Numora input"
              placeholder="$1,234.56abc"
              className={demoInputClass}
            />
          ),
          note: 'Cleans, expands and groups.',
        }}
      />
    </section>
  );
}
