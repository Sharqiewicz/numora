import { Pause, Play } from 'lucide-react';
import { formatValue, getSeparatorsFromLocale } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph/react';
import { useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

/** Long enough to group twice, with a decimal part. */
const RAW = '1234567.89';

const LOCALES = [
  { tag: 'en-US', flag: '🇺🇸', name: 'US English' },
  { tag: 'de-DE', flag: '🇩🇪', name: 'German' },
  { tag: 'pl-PL', flag: '🇵🇱', name: 'Polish' },
  { tag: 'en-IN', flag: '🇮🇳', name: 'Indian English' },
  { tag: 'ar-EG', flag: '🇪🇬', name: 'Egyptian Arabic' },
  { tag: 'de-CH', flag: '🇨🇭', name: 'Swiss German' },
] as const;

const CHAR_NAMES: Record<string, string> = {
  ',': 'comma',
  '.': 'full stop',
  ' ': 'space',
  ' ': 'no-break space',
  ' ': 'narrow no-break space',
  '’': 'apostrophe (U+2019)',
  "'": 'apostrophe',
  '٬': 'Arabic thousands separator',
  '٫': 'Arabic decimal separator',
};
const GROUPING: Record<string, string> = { thousand: '3-3-3', lakh: '3-2-2', wan: '4-4-4' };

const MORPH_EASE = { stiffness: 400, damping: 30 };

/**
 * Separator chips. Torph tags a separator `torph-kind="symbol"` when it can parse the number,
 * which sets the chip width before Torph measures. The colour comes from `data-sep`, set in the
 * effect below, because Torph does not parse `ar-EG` text and leaves those separators untagged.
 */
const CHIPS = cn(
  '[&_[torph-kind=symbol]]:mx-[0.05em] [&_[torph-kind=symbol]]:min-w-[0.45em] [&_[torph-kind=symbol]]:text-center',
  '[&_[data-sep]]:rounded-[4px]',
  '[&_[data-sep=thousand]]:bg-signal-sky-surface [&_[data-sep=thousand]]:text-signal-sky-fg',
  '[&_[data-sep=decimal]]:bg-signal-amber-surface [&_[data-sep=decimal]]:text-signal-amber-fg'
);

/** Autoplays through six locales and names what each one changes about the same amount. */
export function LocaleSeparatorsDemo() {
  const loop = useLoop({ frames: LOCALES.length, frameMs: 2400, holdMs: 0 });
  const locale = LOCALES[loop.frame];
  const { thousandSeparator, decimalSeparator, groupingStyle } = getSeparatorsFromLocale(
    locale.tag
  );
  const text = formatValue(RAW, { locale: locale.tag });

  // Runs after Torph's own effect has written the new characters. Colour only, so it does not
  // change the widths Torph measured.
  const numberRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-tag whenever the text changes
  useEffect(() => {
    for (const item of numberRef.current?.querySelectorAll('[torph-item]:not([torph-exiting])') ??
      []) {
      const char = item.textContent;
      if (char === thousandSeparator) item.setAttribute('data-sep', 'thousand');
      else if (char === decimalSeparator) item.setAttribute('data-sep', 'decimal');
      else item.removeAttribute('data-sep');
    }
  }, [text, thousandSeparator, decimalSeparator]);

  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <div className="px-4 pt-5 pb-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm">
            <span aria-hidden="true" className="text-xl leading-none">
              {locale.flag}
            </span>
            <TextMorph className="text-foreground" ease={MORPH_EASE}>
              {locale.name}
            </TextMorph>
            <code className="font-mono text-caption text-muted-foreground">{locale.tag}</code>
          </div>
          <div
            ref={numberRef}
            className={cn(
              'mt-3 text-4xl leading-[1.2] font-medium whitespace-pre text-foreground tabular-nums sm:text-5xl',
              CHIPS
            )}
          >
            <TextMorph ease={MORPH_EASE} locale={locale.tag}>
              {text}
            </TextMorph>
          </div>
        </div>
        <dl className="m-0 divide-y divide-surface-3 border-t border-surface-3 px-4 py-1 sm:px-6">
          <Legend label="Thousand separator" swatch="bg-signal-sky">
            {CHAR_NAMES[thousandSeparator] ?? thousandSeparator}
          </Legend>
          <Legend label="Decimal separator" swatch="bg-signal-amber">
            {CHAR_NAMES[decimalSeparator] ?? decimalSeparator}
          </Legend>
          <Legend label="Grouping">{GROUPING[groupingStyle] ?? groupingStyle}</Legend>
        </dl>
        <div className="flex items-center gap-2 border-t border-surface-3 px-2 py-1.5">
          {/* biome-ignore lint/a11y/useSemanticElements: a button group, not a form fieldset */}
          <div role="group" aria-label="Locale" className="flex min-w-0 flex-1 gap-1">
            {LOCALES.map((item, i) => (
              <button
                key={item.tag}
                type="button"
                aria-label={item.name}
                aria-pressed={i === loop.frame}
                onClick={() => loop.goTo(i)}
                className={cn(
                  'flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-md text-xl leading-none sm:max-w-11',
                  'transition-[background-color,opacity,scale] duration-150 ease-out-expo motion-reduce:transition-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96]',
                  i === loop.frame
                    ? 'bg-surface-4'
                    : 'opacity-45 [@media(hover:hover)]:hover:bg-surface-3 [@media(hover:hover)]:hover:opacity-100'
                )}
              >
                <span aria-hidden="true">{item.flag}</span>
              </button>
            ))}
          </div>
          {/* Nothing autoplays under reduced motion, so there is nothing to pause. */}
          {!loop.reduced && (
            <button
              type="button"
              data-loop-control
              onClick={loop.toggle}
              aria-label={loop.held ? 'Play animation' : 'Pause animation'}
              className="relative inline-flex size-8 flex-none cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out-expo before:absolute before:-inset-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-surface-4 [@media(hover:hover)]:hover:text-foreground"
            >
              {loop.held ? (
                <Play className="size-4" aria-hidden />
              ) : (
                <Pause className="size-4" aria-hidden />
              )}
            </button>
          )}
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        A locale sets three things: the thousand separator, the decimal separator and the group
        size.
      </figcaption>
    </figure>
  );
}

function Legend({ label, swatch, children }: { label: string; swatch?: string; children: string }) {
  return (
    <div className="flex h-9 items-center gap-2">
      <span aria-hidden="true" className={cn('size-2.5 flex-none rounded-[3px]', swatch)} />
      <dt className="flex-none text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 flex min-w-0 flex-1 justify-end overflow-hidden text-sm whitespace-nowrap text-foreground tabular-nums">
        <TextMorph ease={MORPH_EASE}>{children}</TextMorph>
      </dd>
    </div>
  );
}
