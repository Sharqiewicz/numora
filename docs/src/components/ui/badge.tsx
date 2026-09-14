import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import GlareHover from '../GlareHover';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,background-color,border-color,box-shadow] duration-300 ease-out overflow-hidden',
  {
    variants: {
      variant: {
        green:
          'h-9 gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium  bg-signal-green-surface text-signal-green-fg border border-signal-green-line',
        blue: 'h-9 gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium  bg-signal-sky-surface text-signal-sky-fg border border-signal-sky-line',
        orange:
          'h-9 gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium  bg-signal-amber-surface text-signal-amber-fg border border-signal-amber-line',
        gray: 'h-9 gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium  bg-surface-3 text-foreground border border-surface-5',
        red: 'h-9 gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium  bg-signal-red-surface text-signal-red-fg border border-signal-red-line',
      },
    },
    defaultVariants: {
      variant: 'green',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <GlareHover
      glareColor="#ffffff"
      glareOpacity={0.3}
      glareAngle={-30}
      glareSize={200}
      transitionDuration={250}
      playOnce={false}
      width="auto"
      height="100%"
      background="transparent"
      className={cn(badgeVariants({ variant }), className)}
    >
      <Comp data-slot="badge" {...props} />
    </GlareHover>
  );
}

export { Badge, badgeVariants };
