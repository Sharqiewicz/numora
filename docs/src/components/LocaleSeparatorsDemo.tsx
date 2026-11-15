import { formatValue, getSeparatorsFromLocale } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph/react';
import { LoopToggle, useLoop } from '@/components/anatomy/kit';
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
  // Both look like a comma at a glance, so the code point is the useful name.
  '٬': 'U+066C',
  '٫': 'U+066B',
};
const GROUPING: Record<string, string> = { thousand: '3-3-3', lakh: '3-2-2', wan: '4-4-4' };

const MORPH_EASE = { stiffness: 400, damping: 30 };

/**
 * Separator chips. Torph tags a separator `torph-kind="symbol"` when it can parse the number,
 * which sets the chip width before Torph measures. The colour comes from `data-sep`, set in the
 * effect below, because Torph does not parse `ar-EG` text and leaves those separators untagged.
 *
 * `--torph-fade: 0` turns off Torph's top and bottom fade on the chips, so they keep a hard
 * rounded edge in every locale, parsed or not.
 */
const CHIPS = cn(
  '[&_[torph-kind=symbol]]:mx-[0.05em] [&_[torph-kind=symbol]]:min-w-[0.45em] [&_[torph-kind=symbol]]:text-center',
  '[&_[data-sep]]:rounded-[4px] [&_[data-sep]]:[--torph-fade:0px]',
  '[&_[data-sep=thousand]]:bg-signal-sky-surface [&_[data-sep=thousand]]:text-signal-sky-fg',
  '[&_[data-sep=decimal]]:bg-signal-amber-surface [&_[data-sep=decimal]]:text-signal-amber-fg',
  // A space separator would leave the chip blank, so it gets an open-box mark. The mark is
  // absolutely placed and adds no width to what Torph measures.
  '[&_[data-space]]:relative [&_[data-space]]:after:absolute [&_[data-space]]:after:inset-x-0 [&_[data-space]]:after:bottom-[0.42em]',
  "[&_[data-space]]:after:text-center [&_[data-space]]:after:text-[0.42em] [&_[data-space]]:after:leading-none [&_[data-space]]:after:content-['␣']"
);

/**
 * A rule under every integer digit. The separators between the groups carry none, so the rule
 * breaks into one segment per group. It sits just above Torph's bottom fade.
 */
const GROUP_RULE = cn(
  '[&_[data-int]]:bg-[linear-gradient(var(--signal-violet),var(--signal-violet))] [&_[data-int]]:bg-no-repeat',
  '[&_[data-int]]:[background-size:100%_2px] [&_[data-int]]:[background-position:0_calc(100%-0.17em)]'
);

/** Autoplays through six locales and names what each one changes about the same amount. */
export function LocaleSeparatorsDemo() {
  const loop = useLoop({ frames: LOCALES.length, frameMs: 2400, holdMs: 0 });
  const locale = LOCALES[loop.frame];
  const { thousandSeparator, decimalSeparator, groupingStyle } = getSeparatorsFromLocale(
    locale.tag
  );
  const text = formatValue(RAW, { locale: locale.tag });

  // Runs after Torph's own effect has written the new characters. Colour, the group rule and the
  // space mark only, so it does not change the widths Torph measured.
  const numberRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-tag whenever the text changes
  useEffect(() => {
    let inInteger = true;
    for (const item of numberRef.current?.querySelectorAll('[torph-item]:not([torph-exiting])') ??
      []) {
      const char = item.textContent ?? '';
      if (char === thousandSeparator) item.setAttribute('data-sep', 'thousand');
      else if (char === decimalSeparator) item.setAttribute('data-sep', 'decimal');
      else item.removeAttribute('data-sep');
      if (char === decimalSeparator) inInteger = false;
      item.toggleAttribute('data-space', item.hasAttribute('data-sep') && /^\s$/.test(char));
      item.toggleAttribute('data-int', inInteger && /^\d$/.test(char));
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
              CHIPS,
              GROUP_RULE
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
          <Legend label="Grouping" swatch="bg-signal-violet">
            {GROUPING[groupingStyle] ?? groupingStyle}
          </Legend>
        </dl>
        <div className="flex items-center gap-2 border-t border-surface-3 px-2 py-1.5">
          {/* biome-ignore lint/a11y/useSemanticElements: a button group, not a form fieldset */}
          <div role="group" aria-label="Locale" className="flex min-w-0 flex-1 gap-1">
            {LOCALES.map((item, i) => (
              <button
                key={item.tag}
                type="button"
                aria-label={`${item.tag}, ${item.name}`}
                aria-pressed={i === loop.frame}
                onClick={() => loop.goTo(i)}
                className={cn(
                  'group flex h-12 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md sm:max-w-16',
                  'transition-[background-color,color,scale] duration-150 ease-out-expo motion-reduce:transition-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96]',
                  i === loop.frame
                    ? 'bg-surface-4 text-foreground'
                    : 'text-muted-foreground [@media(hover:hover)]:hover:bg-surface-3 [@media(hover:hover)]:hover:text-foreground'
                )}
              >
                {/* The tag is the label: it is the string that goes into the prop. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'text-base leading-none transition-opacity duration-150 ease-out-expo motion-reduce:transition-none',
                    i !== loop.frame && 'opacity-70 [@media(hover:hover)]:group-hover:opacity-100'
                  )}
                >
                  {item.flag}
                </span>
                <span className="font-mono text-[11px] leading-none">{item.tag}</span>
              </button>
            ))}
          </div>
          <LoopToggle loop={loop} />
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        A locale sets three things: the thousand separator, the decimal separator and the group
        size.
      </figcaption>
    </figure>
  );
}

function Legend({ label, swatch, children }: { label: string; swatch: string; children: string }) {
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
