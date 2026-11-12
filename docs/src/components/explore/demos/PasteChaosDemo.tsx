import { useState } from 'react';
import { NumoraInput } from 'numora-react';
import { sanitizeNumoraInput } from 'numora/internal';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { PasteButtonGroup } from '../PasteButton';
import { BrokenInput } from '../BrokenInput';

const PASTE_VALUES = [
  { label: '$1,234.56', value: '$1,234.56' },
  { label: '1.234,56 (EU, needs decimalSeparator: \',\')', value: '1.234,56' },
  { label: '1.5e-18', value: '1.5e-18' },
  { label: '１２３４ (full-width)', value: '１２３４' },
];

// What the pasted text should become with default separators ('.' decimal, ',' thousands).
// The EU sample is intentionally absent from the intended results: it needs
// decimalSeparator: ',' and is parsed incorrectly with the defaults used here.
const INTENDED: Record<string, string> = {
  '$1,234.56': '1234.56',
  '1.234,56': '1234.56',
  '1.5e-18': '0.0000000000000000015',
  '１２３４': '1234',
};

const SANITIZE_OPTIONS = {
  thousandSeparator: ',',
  decimalSeparator: '.',
  allowCompactNotation: true,
};

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
    setNumoraValue(sanitizeNumoraInput(pastedValue, SANITIZE_OPTIONS));
  };

  return (
    <ProblemSection
      id="paste-chaos"
      problemNumber={1}
      title="Paste chaos"
      subtitle="Users paste numbers in whatever format they have"
      description={
        <p>
          Real users paste values from spreadsheets, financial reports, different locales, and
          scientific tools. Native inputs reject them or corrupt the value without telling you.
          Press a paste button to see it.
        </p>
      }
    >
      <InputComparison
        leftLabel={'Native <input type="number">'}
        rightLabel="Numora"
        leftInput={
          <div className="space-y-4">
            <PasteButtonGroup buttons={PASTE_VALUES} onPaste={handleNativePaste} className="mb-4" />
            <BrokenInput
              mode="native-number"
              value={nativeValue}
              onChange={setNativeValue}
              placeholder="1,234.56"
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
            <PasteButtonGroup buttons={PASTE_VALUES} onPaste={handleNumoraPaste} className="mb-4" />
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              allowCompactNotation
              placeholder="1,234.56"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <ResultDisplay
              label="Numora result"
              original={lastPasted}
              result={numoraValue}
              intended={lastPasted ? INTENDED[lastPasted] : undefined}
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
  intended?: string;
}

function ResultDisplay({ label, original, result, isBroken, intended }: ResultDisplayProps) {
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
            isBroken
              ? hasError
                ? 'bg-signal-red/20 text-signal-red'
                : 'bg-signal-green/20 text-signal-green'
              : intended !== undefined && result === intended
                ? 'bg-signal-green/20 text-signal-green'
                : 'bg-signal-amber/20 text-signal-amber'
          }`}
        >
          {isEmpty ? '(empty)' : result}
        </code>
      </div>
    </div>
  );
}
