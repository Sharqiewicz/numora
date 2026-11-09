import { XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputComparisonProps {
  leftLabel: string;
  rightLabel: string;
  leftInput: React.ReactNode;
  rightInput: React.ReactNode;
  leftStatus?: 'broken' | 'working';
  rightStatus?: 'broken' | 'working';
  className?: string;
}

export function InputComparison({
  leftLabel,
  rightLabel,
  leftInput,
  rightInput,
  leftStatus = 'broken',
  rightStatus = 'working',
  className,
}: InputComparisonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
      <ComparisonCard label={leftLabel} status={leftStatus}>
        {leftInput}
      </ComparisonCard>
      <ComparisonCard label={rightLabel} status={rightStatus}>
        {rightInput}
      </ComparisonCard>
    </div>
  );
}

interface ComparisonCardProps {
  label: string;
  status: 'broken' | 'working';
  children: React.ReactNode;
}

function ComparisonCard({ label, status, children }: ComparisonCardProps) {
  const isBroken = status === 'broken';

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 sm:p-6 transition-colors duration-200',
        isBroken ? 'border-signal-red/50 bg-signal-red-surface/20' : 'border-signal-green/50 bg-signal-green-surface/20'
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        {isBroken ? (
          <XCircle className="w-5 h-5 text-signal-red" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-signal-green" />
        )}
        <span className={cn('font-medium text-sm', isBroken ? 'text-signal-red' : 'text-signal-green')}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
