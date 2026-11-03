import { useState, useRef, useCallback } from 'react';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { FormatOn, ThousandStyle } from 'numora';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { BrokenInput } from '../BrokenInput';
import { CursorVisualizer } from '../CursorVisualizer';

export function CursorPositionDemo() {
  const [naiveValue, setNaiveValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');
  const [numoraDisplay, setNumoraDisplay] = useState('');
  const [naiveCursor, setNaiveCursor] = useState(0);
  const [numoraCursor, setNumoraCursor] = useState(0);
  const numoraInputRef = useRef<HTMLInputElement>(null);

  const handleNumoraChange = useCallback((e: NumoraInputChangeEvent) => {
    setNumoraValue(e.target.value);
    setNumoraDisplay(e.target.formattedValue ?? e.target.value);
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
      title="Cursor position hell"
      subtitle="Formatting moves the cursor"
      description={
        <p>
          Add commas to a number as it is typed and the cursor jumps to the end. Type{' '}
          <code className="px-1 py-0.5 rounded bg-muted font-mono">1234567</code> quickly in both
          inputs and watch the cursor.
        </p>
      }
    >
      <InputComparison
        leftLabel="Naive formatting"
        rightLabel="Numora"
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
              placeholder="1234567"
            />
            <CursorVisualizer value={formatWithCommas(naiveValue)} cursorPosition={naiveCursor} />
            <div className="p-3 rounded-lg bg-signal-red/10 border border-signal-red/30 text-sm">
              <p className="text-signal-red">
                The cursor jumps to the end every time, so you can't edit the middle.
              </p>
            </div>
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Type quickly. The cursor stays where it belongs:
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
              placeholder="1234567"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <CursorVisualizer value={numoraDisplay} cursorPosition={numoraCursor} />
            <div className="p-3 rounded-lg bg-signal-green/10 border border-signal-green/30 text-sm">
              <p className="text-signal-green">
                The cursor stays put, even as Numora adds commas.
              </p>
            </div>
          </div>
        }
      />
    </ProblemSection>
  );
}
