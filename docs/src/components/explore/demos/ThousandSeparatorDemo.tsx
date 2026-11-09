import { useState } from 'react';
import { NumoraInput } from 'numora-react';
import { FormatOn, GroupingStyle } from 'numora';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { BrokenInput } from '../BrokenInput';
import { cn } from '@/lib/utils';

type GroupingKey = 'thousand' | 'lakh' | 'wan';

const GROUPING_STYLES: Record<
  GroupingKey,
  { label: string; example: string; style: GroupingStyle }
> = {
  thousand: {
    label: 'Thousand (1,234,567)',
    example: '1,234,567',
    style: GroupingStyle.Thousand,
  },
  lakh: {
    label: 'Lakh (12,34,567)',
    example: '12,34,567',
    style: GroupingStyle.Lakh,
  },
  wan: {
    label: 'Wan (123,4567)',
    example: '123,4567',
    style: GroupingStyle.Wan,
  },
};

export function ThousandSeparatorDemo() {
  const [groupingKey, setGroupingKey] = useState<GroupingKey>('thousand');
  const [naiveValue, setNaiveValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');

  const currentStyle = GROUPING_STYLES[groupingKey];

  return (
    <ProblemSection
      id="thousand-separators"
      problemNumber={6}
      title="Thousand separator traps"
      subtitle="Format on blur is jarring. Format on change is hard"
      description={
        <p>
          Adding thousand separators while someone types is hard. Most implementations format on blur, which
          jars, or on change, which moves the cursor. Regions also group digits differently.
        </p>
      }
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-medium">Grouping style:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            Object.entries(GROUPING_STYLES) as [
              GroupingKey,
              (typeof GROUPING_STYLES)[GroupingKey],
            ][]
          ).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setGroupingKey(key)}
              className={cn(
                'px-4 py-2 rounded-lg border font-medium text-sm active:scale-[0.96] transition-[background-color,border-color,color,scale] duration-150 ease-out-expo',
                groupingKey === key
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <InputComparison
        leftLabel="Naive format-on-change"
        rightLabel="Numora"
        leftInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type <code className="px-1 py-0.5 rounded bg-muted font-mono">1234567</code> and watch
              the cursor:
            </p>
            <BrokenInput
              mode="naive-format"
              value={naiveValue}
              onChange={setNaiveValue}
              placeholder="1234567.89"
            />
            <div className="p-3 rounded-lg bg-signal-red/10 border border-signal-red/30 text-sm space-y-2">
              <p className="text-signal-red font-medium">Problems:</p>
              <ul className="text-signal-red list-disc list-inside space-y-1 text-xs">
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
              Type <code className="px-1 py-0.5 rounded bg-muted font-mono">1234567</code> the same way:
            </p>
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              formatOn={FormatOn.Change}
              thousandSeparator=","
              groupingStyle={currentStyle.style}
              placeholder="1234567.89"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <div className="p-3 rounded-lg bg-signal-green/10 border border-signal-green/30 text-sm space-y-2">
              <p className="text-signal-green font-medium">Features:</p>
              <ul className="text-signal-green list-disc list-inside space-y-1 text-xs">
                <li>The cursor stays in place</li>
                <li>You can edit anywhere in the number</li>
                <li>
                  Supports {currentStyle.label.split(' ')[0]} grouping: {currentStyle.example}
                </li>
              </ul>
            </div>
          </div>
        }
      />
    </ProblemSection>
  );
}
