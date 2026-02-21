import { Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PasteButtonProps {
  label: string;
  value: string;
  onPaste: (value: string) => void;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
}

export function PasteButton({
  label,
  value,
  onPaste,
  className,
  variant = 'outline',
}: PasteButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => onPaste(value)}
      className={cn('gap-2 font-mono text-xs', className)}
    >
      <Clipboard className="w-3 h-3" />
      {label}
    </Button>
  );
}

interface PasteButtonGroupProps {
  buttons: Array<{ label: string; value: string }>;
  onPaste: (value: string) => void;
  className?: string;
}

export function PasteButtonGroup({
  buttons,
  onPaste,
  className,
}: PasteButtonGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {buttons.map((button) => (
        <PasteButton
          key={button.value}
          label={button.label}
          value={button.value}
          onPaste={onPaste}
        />
      ))}
    </div>
  );
}
