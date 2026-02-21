import { useState } from 'react';
import { NumoraInput } from 'numora-react';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { BrokenInput } from '../BrokenInput';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type Locale = 'US' | 'EU';

export function DecimalDilemmaDemo() {
  const [locale, setLocale] = useState<Locale>('US');
  const [nativeValue, setNativeValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');

  const decimalSeparator = locale === 'US' ? '.' : ',';
  const exampleValid = locale === 'US' ? '1,234.56' : '1.234,56';
  const exampleInvalid = locale === 'US' ? '1.234,56' : '1,234.56';

  return (
    <ProblemSection
      id="decimal-dilemma"
      problemNumber={5}
      title="The Decimal Dilemma"
      subtitle="Is 1,234 one thousand or 1.234?"
      description={
        <p>
          In the US, <code className="px-1 py-0.5 rounded bg-muted font-mono">1,234.56</code> means
          one thousand two hundred thirty-four and 56 cents. In Europe, the same number is written
          as <code className="px-1 py-0.5 rounded bg-muted font-mono">1.234,56</code>. Native inputs
          have no idea which you mean.
        </p>
      }
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-secondary" />
          <span className="font-medium">Select locale format:</span>
        </div>
        <div className="flex gap-2">
          <LocaleButton
            locale="US"
            label="US (1,234.56)"
            isActive={locale === 'US'}
            onClick={() => setLocale('US')}
          />
          <LocaleButton
            locale="EU"
            label="EU (1.234,56)"
            isActive={locale === 'EU'}
            onClick={() => setLocale('EU')}
          />
        </div>
      </div>

      <div className="mb-8 p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-sm text-muted-foreground mb-2">
          Try typing <code className="px-1 py-0.5 rounded bg-muted font-mono">1.2.3.4</code> or
          <code className="px-1 py-0.5 rounded bg-muted font-mono ml-1">1,2,3,4</code> to see how
          multiple separators are handled.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Valid for {locale}:</p>
            <code className="font-mono text-green-400">{exampleValid}</code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Confusing for {locale}:</p>
            <code className="font-mono text-orange-400">{exampleInvalid}</code>
          </div>
        </div>
      </div>

      <InputComparison
        leftLabel="Native type='number'"
        rightLabel="Numora Input"
        leftInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type <code className="px-1 py-0.5 rounded bg-muted font-mono">{exampleValid}</code>:
            </p>
            <BrokenInput
              mode="native-number"
              value={nativeValue}
              onChange={setNativeValue}
              placeholder={`Type ${exampleValid}...`}
            />
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm">
              <p className="text-red-400">
                Native input rejects commas entirely and can't be configured for locale.
              </p>
            </div>
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type <code className="px-1 py-0.5 rounded bg-muted font-mono">{exampleValid}</code>:
            </p>
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              decimalSeparator={decimalSeparator}
              placeholder={`Type ${exampleValid}...`}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm">
              <p className="text-green-400">
                Configurable decimal separator. Multiple decimals are automatically prevented
                (only the first is kept).
              </p>
            </div>
          </div>
        }
      />
    </ProblemSection>
  );
}

interface LocaleButtonProps {
  locale: Locale;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function LocaleButton({ label, isActive, onClick }: LocaleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg border font-medium text-sm transition-colors',
        isActive
          ? 'bg-secondary text-secondary-foreground border-secondary'
          : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
      )}
    >
      {label}
    </button>
  );
}
