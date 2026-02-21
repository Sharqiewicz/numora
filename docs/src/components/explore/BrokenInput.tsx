import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

type BrokenInputMode = 'native-number' | 'native-text' | 'naive-format';

interface BrokenInputProps {
  mode: BrokenInputMode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onCursorChange?: (position: number) => void;
}

export function BrokenInput({
  mode,
  value,
  onChange,
  placeholder = 'Type here...',
  className,
  onCursorChange,
}: BrokenInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (mode === 'naive-format') {
      setDisplayValue(naiveFormat(value));
    } else {
      setDisplayValue(value);
    }
  }, [value, mode]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      if (mode === 'native-number') {
        onChange(rawValue);
      } else if (mode === 'native-text') {
        onChange(rawValue);
      } else if (mode === 'naive-format') {
        const cleaned = rawValue.replace(/,/g, '');
        onChange(cleaned);
        setTimeout(() => {
          if (inputRef.current) {
            const len = inputRef.current.value.length;
            inputRef.current.setSelectionRange(len, len);
            onCursorChange?.(len);
          }
        }, 0);
      }
    },
    [mode, onChange, onCursorChange]
  );

  const handleSelect = useCallback(() => {
    if (inputRef.current) {
      onCursorChange?.(inputRef.current.selectionStart || 0);
    }
  }, [onCursorChange]);

  const inputType = mode === 'native-number' ? 'number' : 'text';

  return (
    <input
      ref={inputRef}
      type={inputType}
      value={mode === 'naive-format' ? displayValue : value}
      onChange={handleChange}
      onSelect={handleSelect}
      onKeyUp={handleSelect}
      onClick={handleSelect}
      placeholder={placeholder}
      className={cn(
        'w-full px-4 py-3 rounded-lg bg-background border border-border',
        'text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50',
        'placeholder:text-muted-foreground/50',
        className
      )}
    />
  );
}

function naiveFormat(value: string): string {
  if (!value) return '';
  const parts = value.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}
