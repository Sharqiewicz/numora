import { useState } from 'react';
import { NumoraInput } from 'numora-react';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { PasteButtonGroup } from '../PasteButton';
import { BrokenInput } from '../BrokenInput';
import { Wallet, Beaker, Calculator } from 'lucide-react';

const SCIENTIFIC_VALUES = [
  { label: '1e-18 (1 wei)', value: '1e-18' },
  { label: '1.5e-7', value: '1.5e-7' },
  { label: '2.1e+15', value: '2.1e+15' },
];

export function ScientificNotationDemo() {
  const [nativeValue, setNativeValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');

  const handleNativePaste = (value: string) => {
    setNativeValue(value);
  };

  const handleNumoraPaste = (value: string) => {
    setNumoraValue(value);
  };

  return (
    <ProblemSection
      id="scientific-notation"
      problemNumber={3}
      title="Scientific Notation Expansion"
      subtitle="1e-18 should expand to 0.000000000000000001"
      description={
        <p>
          In crypto and DeFi, users frequently deal with very small or very large numbers.
          Pasting <code className="px-1 py-0.5 rounded bg-muted font-mono">1e-18</code> (1 wei)
          should display the full decimal representation, not the scientific notation.
        </p>
      }
    >
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ExampleCard
          icon={<Wallet className="w-5 h-5" />}
          title="1 wei"
          scientific="1e-18"
          expanded="0.000000000000000001"
        />
        <ExampleCard
          icon={<Beaker className="w-5 h-5" />}
          title="Lab measurement"
          scientific="1.5e-7"
          expanded="0.00000015"
        />
        <ExampleCard
          icon={<Calculator className="w-5 h-5" />}
          title="Large number"
          scientific="2.1e+15"
          expanded="2100000000000000"
        />
      </div>

      <InputComparison
        leftLabel="Native type='number'"
        rightLabel="Numora Input"
        leftInput={
          <div className="space-y-4">
            <PasteButtonGroup
              buttons={SCIENTIFIC_VALUES}
              onPaste={handleNativePaste}
              className="mb-4"
            />
            <BrokenInput
              mode="native-number"
              value={nativeValue}
              onChange={setNativeValue}
              placeholder="Paste scientific notation..."
            />
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Native displays:</p>
              <code className="font-mono text-red-400">
                {nativeValue || '(empty)'}
              </code>
              <p className="text-xs text-red-400 mt-2">
                Shows scientific notation or loses precision entirely
              </p>
            </div>
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <PasteButtonGroup
              buttons={SCIENTIFIC_VALUES}
              onPaste={handleNumoraPaste}
              className="mb-4"
            />
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              enableCompactNotation
              maxDecimals={18}
              placeholder="Paste scientific notation..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Numora expands:</p>
              <code className="font-mono text-green-400 break-all">
                {numoraValue || '(empty)'}
              </code>
              <p className="text-xs text-green-400 mt-2">
                Full decimal expansion with precise representation
              </p>
            </div>
          </div>
        }
      />
    </ProblemSection>
  );
}

interface ExampleCardProps {
  icon: React.ReactNode;
  title: string;
  scientific: string;
  expanded: string;
}

function ExampleCard({ icon, title, scientific, expanded }: ExampleCardProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center gap-2 mb-2 text-secondary">
        {icon}
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Input:</span>
          <code className="font-mono">{scientific}</code>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Output:</span>
          <code className="font-mono text-green-400 break-all">{expanded}</code>
        </div>
      </div>
    </div>
  );
}
