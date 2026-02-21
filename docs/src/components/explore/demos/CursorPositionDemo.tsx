import { useState, useRef, useCallback } from 'react';
import { NumoraInput } from 'numora-react';
import { FormatOn, ThousandStyle } from 'numora';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { BrokenInput } from '../BrokenInput';
import { CursorVisualizer } from '../CursorVisualizer';

export function CursorPositionDemo() {
  const [naiveValue, setNaiveValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');
  const [naiveCursor, setNaiveCursor] = useState(0);
  const [numoraCursor, setNumoraCursor] = useState(0);
  const numoraInputRef = useRef<HTMLInputElement>(null);

  const handleNumoraChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNumoraValue(e.target.value);
  }, []);

  const handleNumoraSelect = useCallback(() => {
    if (numoraInputRef.current) {
      setNumoraCursor(numoraInputRef.current.selectionStart || 0);
    }
  }, []);

  const formatWithCommas = (value: string): string => {
    if (!value) return '';
    const parts = value.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  return (
    <ProblemSection
      id="cursor-position"
      problemNumber={2}
      title="Cursor Position Hell"
      subtitle="Formatting destroys cursor position"
      description={
        <p>
          When you format a number (adding commas), the cursor jumps to the end.
          Try typing <code className="px-1 py-0.5 rounded bg-muted font-mono">1234567</code> rapidly
          in both inputs and watch the cursor.
        </p>
      }
    >
      <InputComparison
        leftLabel="Naive Formatting"
        rightLabel="Numora Input"
        leftInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Type rapidly and watch the cursor jump to the end after each keystroke:
            </p>
            <BrokenInput
              mode="naive-format"
              value={naiveValue}
              onChange={setNaiveValue}
              onCursorChange={setNaiveCursor}
              placeholder="Type 1234567..."
            />
            <CursorVisualizer
              value={formatWithCommas(naiveValue)}
              cursorPosition={naiveCursor}
            />
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm">
              <p className="text-red-400">
                The cursor always jumps to the end, making editing impossible.
              </p>
            </div>
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Type rapidly and the cursor stays in the logical position:
            </p>
            <NumoraInput
              ref={numoraInputRef}
              value={numoraValue}
              onChange={handleNumoraChange}
              onSelect={handleNumoraSelect}
              onKeyUp={handleNumoraSelect}
              onClick={handleNumoraSelect}
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={ThousandStyle.Thousand}
              placeholder="Type 1234567..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <CursorVisualizer
              value={numoraValue}
              cursorPosition={numoraCursor}
            />
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm">
              <p className="text-green-400">
                Cursor stays where you expect it, even as commas are added.
              </p>
            </div>
          </div>
        }
      />
    </ProblemSection>
  );
}
