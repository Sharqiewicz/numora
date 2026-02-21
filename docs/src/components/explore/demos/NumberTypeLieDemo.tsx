import { useState, useRef, useEffect } from 'react';
import { NumoraInput } from 'numora-react';
import { FormatOn, ThousandStyle } from 'numora';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import {
  AlertTriangle,
  MousePointer2,
  Type,
  Hash,
  Eye,
  Accessibility,
  Smartphone,
  Code,
} from 'lucide-react';

const PROBLEMS = [
  {
    icon: MousePointer2,
    title: 'Scroll wheel changes value',
    description: 'Hover and scroll to accidentally change the number',
  },
  {
    icon: Type,
    title: "Can't format with commas",
    description: 'Thousand separators are rejected',
  },
  {
    icon: Hash,
    title: 'Shows spinners on desktop',
    description: 'Ugly increment/decrement buttons appear',
  },
  {
    icon: Eye,
    title: 'Inconsistent validation',
    description: 'Allows "e" but not "," - counterintuitive',
  },
  {
    icon: Accessibility,
    title: 'Poor accessibility',
    description: 'Screen readers struggle with the format',
  },
  {
    icon: Smartphone,
    title: 'Mobile keyboard issues',
    description: 'Some mobile browsers show wrong keyboard',
  },
  {
    icon: Code,
    title: 'Value vs display mismatch',
    description: '.value might differ from displayed text',
  },
];

export function NumberTypeLieDemo() {
  const [nativeValue, setNativeValue] = useState('1000');
  const [numoraValue, setNumoraValue] = useState('1000');
  const nativeInputRef = useRef<HTMLInputElement>(null);
  const [scrollWarning, setScrollWarning] = useState(false);

  useEffect(() => {
    const input = nativeInputRef.current;
    if (!input) return;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === input || input.matches(':hover')) {
        setScrollWarning(true);
        setTimeout(() => setScrollWarning(false), 2000);
      }
    };

    input.addEventListener('wheel', handleWheel);
    return () => input.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <ProblemSection
      id="number-type-lie"
      problemNumber={7}
      title='The type="number" Lie'
      subtitle="It seems right, but it's deeply broken"
      description={
        <p>
          <code className="px-1 py-0.5 rounded bg-muted font-mono">{'<input type="number">'}</code> seems
          like the obvious choice for numeric inputs, but it has fundamental problems that make it
          unsuitable for most real-world applications.
        </p>
      }
    >
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROBLEMS.map((problem) => (
          <ProblemCard key={problem.title} {...problem} />
        ))}
      </div>

      <InputComparison
        leftLabel='type="number"'
        rightLabel='Numora (type="text" + inputmode)'
        leftInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hover over the input and use your scroll wheel:
            </p>
            <div className="relative">
              <input
                ref={nativeInputRef}
                type="number"
                value={nativeValue}
                onChange={(e) => setNativeValue(e.target.value)}
                placeholder="Type a number..."
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
              />
              {scrollWarning && (
                <div className="absolute -top-10 left-0 right-0 flex justify-center">
                  <div className="px-3 py-1 rounded bg-red-500 text-white text-xs font-medium animate-bounce">
                    Value changed by scroll!
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">Try this:</span>
              </div>
              <ul className="text-red-400 list-disc list-inside space-y-1 text-xs">
                <li>Hover and scroll to change value accidentally</li>
                <li>Try typing 1,000 (comma rejected)</li>
                <li>Notice the ugly spinner buttons</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground">Implementation:</p>
              <code className="font-mono text-xs text-orange-400">
                {'<input type="number" />'}
              </code>
            </div>
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Same test - hover and scroll:
            </p>
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={ThousandStyle.Thousand}
              placeholder="Type a number..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm">
              <p className="text-green-400 font-medium mb-2">Numora uses:</p>
              <ul className="text-green-400 list-disc list-inside space-y-1 text-xs">
                <li>type="text" - no scroll hijacking</li>
                <li>inputmode="decimal" - mobile numeric keyboard</li>
                <li>Full formatting support with commas</li>
                <li>Consistent, predictable behavior</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground">Implementation:</p>
              <code className="font-mono text-xs text-green-400">
                {'<input type="text" inputmode="decimal" />'}
              </code>
            </div>
          </div>
        }
      />
    </ProblemSection>
  );
}

interface ProblemCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function ProblemCard({ icon: Icon, title, description }: ProblemCardProps) {
  return (
    <div className="p-4 rounded-lg bg-red-950/20 border border-red-500/30">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-red-400" />
        <span className="font-medium text-sm text-red-400">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
