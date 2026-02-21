import { useState } from 'react';
import { NumoraInput } from 'numora-react';
import { FormatOn, ThousandStyle } from 'numora';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { BrokenInput } from '../BrokenInput';
import { cn } from '@/lib/utils';

type GroupingStyle = 'thousand' | 'lakh' | 'wan';

const GROUPING_STYLES: Record<
  GroupingStyle,
  { label: string; example: string; style: ThousandStyle }
> = {
  thousand: {
    label: 'Thousand (1,234,567)',
    example: '1,234,567',
    style: ThousandStyle.Thousand,
  },
  lakh: {
    label: 'Lakh (12,34,567)',
    example: '12,34,567',
    style: ThousandStyle.Lakh,
  },
  wan: {
    label: 'Wan (123,4567)',
    example: '123,4567',
    style: ThousandStyle.Wan,
  },
};

export function ThousandSeparatorDemo() {
  const [groupingStyle, setGroupingStyle] = useState<GroupingStyle>('thousand');
  const [naiveValue, setNaiveValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');

  const currentStyle = GROUPING_STYLES[groupingStyle];

  return (
    <ProblemSection
      id="thousand-separators"
      problemNumber={6}
      title="Thousand Separator Traps"
      subtitle="Format on blur is jarring, format on change is hard"
      description={
        <p>
          Formatting numbers with thousand separators as users type is surprisingly difficult.
          Most implementations either format on blur (jarring) or format on change (cursor jumps).
          Different regions also use different grouping styles.
        </p>
      }
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-medium">Grouping style:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(GROUPING_STYLES) as [GroupingStyle, typeof GROUPING_STYLES[GroupingStyle]][]).map(
            ([key, { label }]) => (
              <button
                key={key}
                onClick={() => setGroupingStyle(key)}
                className={cn(
                  'px-4 py-2 rounded-lg border font-medium text-sm transition-colors',
                  groupingStyle === key
                    ? 'bg-secondary text-secondary-foreground border-secondary'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <InputComparison
        leftLabel="Naive Format-on-Change"
        rightLabel="Numora Input"
        leftInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type <code className="px-1 py-0.5 rounded bg-muted font-mono">1234567</code> and
              watch the cursor:
            </p>
            <BrokenInput
              mode="naive-format"
              value={naiveValue}
              onChange={setNaiveValue}
              placeholder="Type 1234567..."
            />
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm space-y-2">
              <p className="text-red-400 font-medium">Problems:</p>
              <ul className="text-red-400 list-disc list-inside space-y-1 text-xs">
                <li>Cursor jumps to end after each keystroke</li>
                <li>Editing in the middle is impossible</li>
                <li>Only supports one grouping style</li>
              </ul>
            </div>
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type <code className="px-1 py-0.5 rounded bg-muted font-mono">1234567</code> smoothly:
            </p>
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={currentStyle.style}
              placeholder="Type 1234567..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm space-y-2">
              <p className="text-green-400 font-medium">Features:</p>
              <ul className="text-green-400 list-disc list-inside space-y-1 text-xs">
                <li>Cursor stays in logical position</li>
                <li>Edit anywhere without issues</li>
                <li>Supports {currentStyle.label.split(' ')[0]} grouping: {currentStyle.example}</li>
              </ul>
            </div>
          </div>
        }
      />
    </ProblemSection>
  );
}
