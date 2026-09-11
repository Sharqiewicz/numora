import { type ReactNode, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TorphBlurVariant = 'minimal' | 'polished';

interface TorphBlurSectionProps {
  children: (variant: TorphBlurVariant) => ReactNode;
}

export function TorphBlurSection({ children }: TorphBlurSectionProps) {
  const [variant, setVariant] = useState<TorphBlurVariant>('minimal');

  return (
    <>
      <div className="flex justify-center mt-8 mb-2">
        <Tabs value={variant} onValueChange={(v) => setVariant(v as TorphBlurVariant)}>
          <TabsList>
            <TabsTrigger value="minimal">Minimal</TabsTrigger>
            <TabsTrigger value="polished">Caret polish</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {children(variant)}
    </>
  );
}
