import { useState } from 'react';
import { NumoraInput } from 'numora-react';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { PasteButtonGroup } from '../PasteButton';
import { BrokenInput } from '../BrokenInput';

const PASTE_VALUES = [
  { label: '$1,234.56', value: '$1,234.56' },
  { label: '1.234,56 (EU)', value: '1.234,56' },
  { label: '1.5e-18', value: '1.5e-18' },
  { label: '１２３４ (full-width)', value: '１２３４' },
];

export function PasteChaosDemo() {
  const [nativeValue, setNativeValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');
  const [lastPasted, setLastPasted] = useState<string | null>(null);

  const handleNativePaste = (pastedValue: string) => {
    setLastPasted(pastedValue);
    setNativeValue(pastedValue);
  };

  const handleNumoraPaste = (pastedValue: string) => {
    setLastPasted(pastedValue);
    setNumoraValue(pastedValue);
  };

  return (
    <ProblemSection
      id="paste-chaos"
      problemNumber={1}
      title="Paste Chaos"
      subtitle="Users paste numbers in every format imaginable"
      description={
        <p>
          Real users paste values from spreadsheets, financial reports, different locales,
          and scientific tools. Native inputs either reject them outright or silently
          corrupt the data. Click the paste buttons below to see what happens.
        </p>
      }
    >
      <InputComparison
        leftLabel="Native type='number'"
        rightLabel="Numora Input"
        leftInput={
          <div className="space-y-4">
            <PasteButtonGroup
              buttons={PASTE_VALUES}
              onPaste={handleNativePaste}
              className="mb-4"
            />
            <BrokenInput
              mode="native-number"
              value={nativeValue}
              onChange={setNativeValue}
              placeholder="Paste or type..."
            />
            <ResultDisplay
              label="Native result"
              original={lastPasted}
              result={nativeValue}
              isBroken
            />
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <PasteButtonGroup
              buttons={PASTE_VALUES}
              onPaste={handleNumoraPaste}
              className="mb-4"
            />
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              enableCompactNotation
              placeholder="Paste or type..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <ResultDisplay
              label="Numora result"
              original={lastPasted}
              result={numoraValue}
            />
          </div>
        }
      />
    </ProblemSection>
  );
}

interface ResultDisplayProps {
  label: string;
  original: string | null;
  result: string;
  isBroken?: boolean;
}

function ResultDisplay({ label, original, result, isBroken }: ResultDisplayProps) {
  if (!original) return null;

  const isEmpty = !result || result === '';
  const isNaN = result === 'NaN' || Number.isNaN(Number(result));
  const hasError = isEmpty || isNaN;

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}:</p>
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="text-muted-foreground">Pasted:</span>
        <code className="px-2 py-0.5 rounded bg-muted">{original}</code>
        <span className="text-muted-foreground">→</span>
        <code
          className={`px-2 py-0.5 rounded ${
            isBroken && hasError
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {isEmpty ? '(empty)' : result}
        </code>
      </div>
    </div>
  );
}
