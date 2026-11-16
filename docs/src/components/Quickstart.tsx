/* ─────────────────────────────────────────────────────────
 * QUICKSTART DIALOG STORYBOARD
 *
 * Open
 *    0ms   overlay fades in, dialog scales 0.96 → 1 (200ms)
 *
 * Choose a package
 *    0ms   title morphs: question → package name (400ms)
 *    0ms   title slides right, back arrow fades in (300ms)
 *    0ms   prompt and copy button fade in (150ms)
 *
 * Copy
 *    0ms   label morphs: "Copy prompt" → "Copied" (300ms)
 * 1600ms   label morphs back
 *
 * Close
 *    0ms   dialog scales 1 → 0.98 and fades out (130ms)
 *
 * The dialog and step animations live in styles.css (.quickstart-*).
 * ───────────────────────────────────────────────────────── */
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, X } from 'lucide-react';
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { AnimatedCopyIcon } from '@/components/AnimatedCopyIcon';
import { useClipboard } from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import {
  type QuickstartPackage,
  quickstartPrompt,
  quickstartPromptText,
} from '@/lib/quickstart-prompt';
import { cn } from '@/lib/utils';

const TIMING = {
  titleMorph: 400, // question ↔ package name
  labelMorph: 300, // "Copy prompt" ↔ "Copied"
  copiedHold: 1600, // how long "Copied" stays
  failedHold: 3000, // how long "Copy failed" stays
};

const MORPH_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const PACKAGES: { id: QuickstartPackage; fits: string }[] = [
  { id: 'numora-react', fits: 'React' },
  { id: 'numora', fits: 'Everything else' },
];

const QUESTION = 'What is your app built with?';

const iconButton =
  "relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none transition-[background-color,color,opacity,scale] duration-150 ease-out-expo after:absolute after:-inset-1.5 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring active:scale-[0.96] [@media(hover:hover)]:hover:bg-surface-4 [@media(hover:hover)]:hover:text-foreground";

/** Renders `backticked` spans as inline code; everything else as text. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 === 1 ? (
          <code
            // biome-ignore lint/suspicious/noArrayIndexKey: static split
            key={i}
            className="rounded-[5px] bg-surface-4 px-[0.3em] py-[0.1em] font-mono text-[0.86em] text-foreground"
          >
            {part}
          </code>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

function CopyPrompt({ text }: { text: string }) {
  const clipboard = useClipboard();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const ok = await clipboard.copyToClipboard(text);
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), ok ? TIMING.copiedHold : TIMING.failedHold);
  };

  const label = state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy prompt';

  return (
    <>
      <Button
        aria-label="Copy prompt"
        autoFocus
        className="mt-3 h-11 w-full pr-6 pl-5"
        data-quickstart-copy
        onClick={copy}
        type="button"
      >
        <AnimatedCopyIcon className="size-4" trigger={state === 'copied'} />
        <TextMorph duration={TIMING.labelMorph} ease={MORPH_EASE}>
          {label}
        </TextMorph>
      </Button>
      <span aria-live="polite" className="sr-only">
        {state === 'copied'
          ? 'Prompt copied'
          : state === 'failed'
            ? 'Copy failed. Select the prompt and copy it manually'
            : ''}
      </span>
    </>
  );
}

function Flow({ initialPackage }: { initialPackage?: QuickstartPackage }) {
  // null = the question; a package = its prompt.
  const [pkg, setPkg] = useState<QuickstartPackage | null>(initialPackage ?? null);
  // The package to put focus back on after "Back".
  const [last, setLast] = useState<QuickstartPackage | null>(null);
  const prompt = pkg ? quickstartPrompt(pkg) : null;

  return (
    <div className="flex flex-col p-3">
      {/* One header for both steps, so the title morphs instead of being replaced. */}
      <div className="relative flex h-8 items-center justify-between gap-3">
        <button
          aria-label="Back to package choice"
          className={cn(iconButton, 'absolute left-0', !pkg && 'pointer-events-none opacity-0')}
          disabled={!pkg}
          onClick={() => {
            setLast(pkg);
            setPkg(null);
          }}
          type="button"
        >
          <ArrowLeft className="size-4" />
        </button>
        <Dialog.Title
          aria-label={pkg ? `Prompt for ${pkg}` : QUESTION}
          className={cn(
            'min-w-0 pl-1 font-medium text-foreground transition-transform duration-300 ease-out-expo motion-reduce:transition-none',
            pkg && 'translate-x-9'
          )}
        >
          <TextMorph duration={TIMING.titleMorph} ease={MORPH_EASE}>
            {pkg ?? QUESTION}
          </TextMorph>
        </Dialog.Title>
        <Dialog.Close aria-label="Close" className={iconButton}>
          <X className="size-4" />
        </Dialog.Close>
      </div>
      <Dialog.Description className="sr-only">
        {pkg
          ? 'Copy this prompt and paste it into your coding agent.'
          : 'Pick one to get a prompt that sets up Numora.'}
      </Dialog.Description>

      {prompt && pkg ? (
        <div key="prompt" className="quickstart-step flex flex-col">
          <div
            className="mt-3 max-h-[55dvh] overflow-y-auto overscroll-contain rounded-xl bg-surface-1 p-4 text-foreground/90 text-sm leading-[1.6] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard reachable
            tabIndex={0}
          >
            <p>
              <Inline text={prompt.intro} />
            </p>
            <ol className="mt-3 flex flex-col gap-2">
              {prompt.steps.map((step, i) => (
                <li key={step} className="grid grid-cols-[1.5rem_1fr] [overflow-wrap:anywhere]">
                  <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                  <span>
                    <Inline text={step} />
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3">
              <Inline text={prompt.outro} />
            </p>
          </div>
          <CopyPrompt text={quickstartPromptText(pkg)} />
        </div>
      ) : (
        <div key="choose" className="quickstart-step mt-3 grid grid-cols-2 gap-2">
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              // biome-ignore lint/a11y/noAutofocus: restores focus to the choice after "Back"
              autoFocus={p.id === last}
              className="flex cursor-pointer flex-col gap-1 rounded-xl bg-surface-3 p-4 text-left shadow-border outline-none transition-[background-color,scale] duration-150 ease-out-expo focus-visible:ring-[3px] focus-visible:ring-ring active:scale-[0.98] [@media(hover:hover)]:hover:bg-surface-4"
              onClick={() => setPkg(p.id)}
              type="button"
            >
              <span className="font-medium text-foreground">{p.fits}</span>
              <code className="font-mono text-caption text-muted-foreground">{p.id}</code>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Wraps a trigger button. The dialog asks which package fits, then becomes the
 * agent prompt for it. Pass `initialPackage` where the package is already
 * known (the docs), and the dialog opens straight on the prompt.
 */
export function Quickstart({
  children,
  initialPackage,
}: {
  children: ReactNode;
  initialPackage?: QuickstartPackage;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="quickstart-overlay fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          className="quickstart-dialog fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-[30rem] rounded-3xl bg-surface-2 text-left shadow-[0_0_0_1px_var(--border),0_24px_60px_-12px_oklch(0_0_0/0.6)] outline-none"
          // Opening straight on the prompt: focus its one action, not the back arrow.
          onOpenAutoFocus={(event) => {
            const copy = (event.currentTarget as HTMLElement).querySelector<HTMLElement>(
              '[data-quickstart-copy]'
            );
            if (!copy) return;
            event.preventDefault();
            copy.focus();
          }}
        >
          {/* Mounted with the dialog, so every open starts from the same step. */}
          <Flow initialPackage={initialPackage} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
