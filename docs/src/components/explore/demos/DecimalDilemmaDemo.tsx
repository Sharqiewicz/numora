import { Globe } from 'lucide-react';
import { NumoraInput } from 'numora-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BrokenInput } from '../BrokenInput';
import { InputComparison } from '../InputComparison';
import { ProblemSection } from '../ProblemSection';

type Locale = 'US' | 'EU';

export function DecimalDilemmaDemo() {
  const [locale, setLocale] = useState<Locale>('US');
  const [nativeValue, setNativeValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');

  const decimalSeparator = locale === 'US' ? '.' : ',';
  const exampleValid = locale === 'US' ? '1,234.56' : '1.234,56';
  const exampleInvalid = locale === 'US' ? '1.234,56' : '1,234.56';

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <ProblemSection
      id="decimal-dilemma"
      problemNumber={5}
      title="The decimal dilemma"
      subtitle="Is 1,234 one thousand or 1.234?"
      description={
        <p>
          In the US, <code className="px-1 py-0.5 rounded bg-muted font-mono">1,234.56</code> means
          one thousand two hundred thirty-four and 56 cents. In Europe, the same number is written
          as <code className="px-1 py-0.5 rounded bg-muted font-mono">1.234,56</code>. A native
          input can't tell which one you mean.
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
          <code className="px-1 py-0.5 rounded bg-muted font-mono ml-1">1,2,3,4</code> to see what
          happens with repeated separators.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Valid for {locale}:</p>
            <code className="font-mono text-signal-green">{exampleValid}</code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Confusing for {locale}:</p>
            <code className="font-mono text-signal-amber">{exampleInvalid}</code>
          </div>
        </div>
      </div>

      <InputComparison
        leftLabel={'Native <input type="number">'}
        rightLabel="Numora"
        leftInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type <code className="px-1 py-0.5 rounded bg-muted font-mono">{exampleValid}</code>:
            </p>
            <BrokenInput
              mode="native-number"
              value={nativeValue}
              onChange={setNativeValue}
              placeholder={exampleValid}
            />
            <div className="p-3 rounded-lg bg-signal-red/10 border border-signal-red/30 text-sm">
              <p className="text-signal-red">
                A native input rejects commas and has no locale setting.
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
              placeholder={exampleValid}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <div className="p-3 rounded-lg bg-signal-green/10 border border-signal-green/30 text-sm">
              <p className="text-signal-green">
                You set the decimal separator. Numora keeps the first decimal separator and drops
                the rest.
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
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg border font-medium text-sm active:scale-[0.96] transition-[background-color,border-color,color,scale] duration-150 ease-out-expo',
        isActive
          ? 'bg-secondary text-secondary-foreground border-secondary'
          : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
      )}
    >
      {label}
    </button>
  );
}
