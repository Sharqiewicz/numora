import type { NumoraHTMLInputElement, NumoraInputProps } from 'numora-react';
import { type Ref, useEffect, useId, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { useTRPC } from '@/integrations/trpc/react';
import { TOKENS, type TokenInfo, type TokenSymbol } from '@/lib/constants/tokens';
import {
  calculateExchangeRate,
  calculateReverseSwapAmount,
  calculateSwapAmount,
} from '@/lib/utils/swapCalculator';
import { TokenSelector } from './TokenSelector';
import { TorphField } from './TorphField';

const TRY_INPUTS = ['1.5k', '1e-7', '1,234.56', '12abc.3'];

// Keep amounts readable in the field: up to 999,999,999 with 8 decimals.
const MAX_INTEGER_DIGITS = 9;
const MAX_DECIMALS = 8;
const isWithinLimit = (raw: string) => raw.split('.')[0].length <= MAX_INTEGER_DIGITS;
const amountDecimals = (token: TokenInfo) => Math.min(token.decimals, MAX_DECIMALS);

const fieldClass =
  'group flex flex-col gap-1 p-3 border cursor-text bg-surface-3 border-surface-5 hover:bg-surface-5 transition-colors [&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-brand';

// Step the font down as the formatted value grows, so separators and decimals stay
// visible. Fixed h-8 keeps the field height constant across steps (no layout shift).
// The longest value the limits allow is 20 characters, which fits at text-lg, so the
// input never drops below 16px (iOS zooms on focus under that).
const AMOUNT_SIZE_STEPS: [maxChars: number, className: string][] = [
  [13, 'text-2xl'],
  [17, 'text-xl'],
];

function amountSizeClass(raw: string) {
  const intLen = raw.split('.')[0].replace('-', '').length;
  const displayLen = raw.length + Math.max(0, Math.floor((intLen - 1) / 3));
  return AMOUNT_SIZE_STEPS.find(([max]) => displayLen <= max)?.[1] ?? 'text-lg';
}

const AMOUNT_FORMAT = { formatOn: 'change', groupingStyle: 'thousand' } as const;
const MORPH_EASE = { stiffness: 400, damping: 30 };

type AmountInputProps = Omit<
  NumoraInputProps,
  'value' | 'className' | 'formatOn' | 'groupingStyle'
> & {
  ref?: Ref<HTMLInputElement>;
  value: string;
  /** The side the quote fills in, not the one the user typed. Drawn muted. */
  isComputed: boolean;
};

/** A Torph-drawn amount: digits slide as separators appear, the quoted side rolls to its new value. */
function AmountInput({ value, isComputed, ...props }: AmountInputProps) {
  const color = !value ? 'text-muted-icon' : isComputed ? 'text-muted-foreground' : 'text-white';

  return (
    <div
      className={`relative flex items-center min-w-0 w-full h-8 overflow-hidden ${amountSizeClass(value)} tabular-nums transition-colors ${color}`}
    >
      <TorphField
        {...props}
        {...AMOUNT_FORMAT}
        value={value}
        // The quoted side is rewritten while the other field has focus: it has no caret.
        focusedCaretOnly
        className="caret-white selection:bg-white/25"
      />
    </div>
  );
}

export function Swap() {
  const [fromToken, setFromToken] = useState<TokenInfo>(TOKENS[0]);
  const [toToken, setToToken] = useState<TokenInfo>(TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from');
  const [swapped, setSwapped] = useState(false);
  const [flips, setFlips] = useState(0);
  const [openSelector, setOpenSelector] = useState<'from' | 'to' | null>(null);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const swappedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fromInputId = useId();
  const toInputId = useId();

  const {
    data: prices,
    isLoading,
    refetch,
    isRefetching,
  } = useTRPC.prices.getAll.useQuery({ network: 'mainnet' }, { refetchInterval: 60000 });

  const from = fromToken.symbol as TokenSymbol;
  const to = toToken.symbol as TokenSymbol;
  const quoteTo = (raw: string) =>
    prices ? calculateSwapAmount(raw, from, to, prices, amountDecimals(toToken)) : '';
  const quoteFrom = (raw: string) =>
    prices ? calculateReverseSwapAmount(raw, from, to, prices, amountDecimals(fromToken)) : '';

  // Reject a keystroke if either side - typed or computed - would exceed the limit.
  const isFromAllowed = (raw: string) =>
    isWithinLimit(raw) && (!(+raw > 0) || isWithinLimit(quoteTo(raw)));
  const isToAllowed = (raw: string) =>
    isWithinLimit(raw) && (!(+raw > 0) || isWithinLimit(quoteFrom(raw)));

  // biome-ignore lint/correctness/useExhaustiveDependencies: quote helpers are derived from the listed deps
  useEffect(() => {
    if (!prices) return;

    // The edited side drives the other one. An empty or zero amount clears it.
    if (lastEdited === 'from') {
      setToAmount(+fromAmount > 0 ? quoteTo(fromAmount) : '');
    } else {
      setFromAmount(+toAmount > 0 ? quoteFrom(toAmount) : '');
    }
  }, [fromAmount, toAmount, lastEdited, prices, fromToken, toToken]);

  useEffect(() => () => clearTimeout(swappedTimer.current), []);

  const hasAmount = +fromAmount > 0 || +toAmount > 0;
  const canSwap = +fromAmount > 0 && +toAmount > 0;

  function flipTokens() {
    setFlips((n) => n + 1);
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    // The amount the user typed stays the source of truth on its new side.
    setLastEdited(lastEdited === 'from' ? 'to' : 'from');
  }

  function handleFromInputChange(e: React.ChangeEvent<NumoraHTMLInputElement>) {
    setFromAmount(e.target.value);
    setLastEdited('from');
  }

  function handleToInputChange(e: React.ChangeEvent<NumoraHTMLInputElement>) {
    setToAmount(e.target.value);
    setLastEdited('to');
  }

  function tryInput(text: string) {
    const input = fromInputRef.current;
    if (!input) return;
    input.focus();
    input.select();
    // Real text insertion (not a value= assignment): it runs
    // through Numora's sanitize/format pipeline, like an autofill or IME commit would.
    document.execCommand('insertText', false, text);
  }

  function handleSwap() {
    setSwapped(true);
    clearTimeout(swappedTimer.current);
    swappedTimer.current = setTimeout(() => setSwapped(false), 1500);
  }

  // The field's padding looks clickable (hover state), so a click there focuses the input.
  function focusOnFieldClick(e: React.MouseEvent, input: HTMLInputElement | null) {
    if (!(e.target as HTMLElement).closest('button, input, label, [role="menu"]')) input?.focus();
  }

  function toggleSelector(selector: 'from' | 'to', next: boolean) {
    if (next) setOpenSelector(selector);
    else if (openSelector === selector) setOpenSelector(null);
  }

  const ctaDisabled = isLoading || !prices || !canSwap;

  let rateLine: React.ReactNode;
  if (isLoading) {
    rateLine = (
      <>
        <span className="sr-only">Loading prices</span>
        <span
          aria-hidden="true"
          className="inline-block h-4 w-44 rounded bg-surface-5 motion-safe:animate-pulse align-middle"
        />
      </>
    );
  } else if (!prices) {
    rateLine = (
      <>
        Couldn’t load prices.{' '}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-secondary underline underline-offset-2 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          {isRefetching ? 'Retrying…' : 'Retry'}
        </button>
      </>
    );
  } else {
    rateLine = (
      <>
        1 {fromToken.symbol} ≈{' '}
        {calculateExchangeRate(
          fromToken.symbol as TokenSymbol,
          toToken.symbol as TokenSymbol,
          prices
        )}{' '}
        {toToken.symbol}
      </>
    );
  }

  return (
    <div className="flex items-center flex-col justify-center w-full px-4 sm:p-0">
      <div className="relative p-4 rounded-xl sm:border bg-surface-1 border-surface-3 w-full">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer convenience only; the input and its label are the accessible controls */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: same as above */}
        <div
          className={`${fieldClass} rounded-t-lg`}
          onClick={(e) => focusOnFieldClick(e, fromInputRef.current)}
        >
          <label htmlFor={fromInputId} className="text-sm text-muted-foreground">
            You pay
          </label>
          <div className="flex items-center gap-2">
            <AmountInput
              ref={fromInputRef}
              id={fromInputId}
              name="fromAmount"
              isComputed={lastEdited === 'to'}
              placeholder="0"
              value={fromAmount}
              onChange={(e) =>
                handleFromInputChange(e as React.ChangeEvent<NumoraHTMLInputElement>)
              }
              decimalMaxLength={amountDecimals(fromToken)}
              isAllowed={isFromAllowed}
              allowCompactNotation
            />
            <div className="w-36 shrink-0">
              <TokenSelector
                label="Pay"
                selectedToken={fromToken}
                onSelect={setFromToken}
                disabledToken={toToken}
                isOpen={openSelector === 'from'}
                onToggle={(next) => toggleSelector('from', next)}
              />
            </div>
          </div>
        </div>

        <div className="relative h-0.5">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full border border-surface-5">
            <button
              className="relative after:absolute after:-inset-1 after:content-[''] p-2 rounded-full border cursor-pointer transition-[background-color,border-color,scale] duration-200 active:scale-[0.96] bg-surface-1 border-surface-3 text-muted-icon hover:bg-surface-4 hover:border-surface-7 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              onClick={flipTokens}
              type="button"
              aria-label="Flip tokens"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 25"
                fill="none"
                aria-hidden="true"
                // Half a turn per flip: the click is what moves the arrow, not the hover.
                className="motion-safe:rotate-(--flip) transition-[rotate] duration-200 ease-move"
                style={{ '--flip': `${flips * 180}deg` } as React.CSSProperties}
              >
                <path
                  d="M18 14.5L12 20.5L6 14.5M12 19.5V4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer convenience only; the input and its label are the accessible controls */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: same as above */}
        <div
          className={`${fieldClass} rounded-b-lg`}
          onClick={(e) => focusOnFieldClick(e, toInputRef.current)}
        >
          <label htmlFor={toInputId} className="text-sm text-muted-foreground">
            You receive
          </label>
          <div className="flex items-center gap-2">
            <AmountInput
              ref={toInputRef}
              id={toInputId}
              name="toAmount"
              isComputed={lastEdited === 'from'}
              placeholder="0"
              value={toAmount}
              onChange={(e) => handleToInputChange(e as React.ChangeEvent<NumoraHTMLInputElement>)}
              decimalMaxLength={amountDecimals(toToken)}
              isAllowed={isToAllowed}
              allowCompactNotation
            />
            <div className="w-36 shrink-0">
              <TokenSelector
                label="Receive"
                selectedToken={toToken}
                onSelect={setToToken}
                disabledToken={fromToken}
                isOpen={openSelector === 'to'}
                onToggle={(next) => toggleSelector('to', next)}
              />
            </div>
          </div>
        </div>

        <div
          className="mt-3 mb-4 min-h-5 text-sm text-center text-muted-icon tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {rateLine}
        </div>
        <button
          type="button"
          className="active:scale-[0.98] w-full py-3 font-bold rounded-lg text-base text-white border-none cursor-pointer transition-[background-color,color,scale] duration-200 bg-brand hover:bg-brand-hover disabled:bg-surface-4 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 focus-visible:outline-none"
          onClick={handleSwap}
          disabled={ctaDisabled}
        >
          <span aria-live="polite">
            <TextMorph ease={MORPH_EASE}>
              {swapped ? 'Swapped (demo)' : hasAmount ? 'Swap' : 'Enter an amount'}
            </TextMorph>
          </span>
        </button>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Demo only. No transaction is sent.
        </p>
      </div>

      <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-2.5 text-sm">
        <span className="text-muted-foreground mr-1">Try typing</span>
        {TRY_INPUTS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => tryInput(t)}
            className="relative after:absolute after:-inset-y-3 after:-inset-x-1 after:content-[''] rounded-md border border-surface-5 bg-surface-2 px-2 py-0.5 font-mono text-xs text-foreground cursor-pointer transition-[background-color,border-color,scale] duration-150 ease-out-expo active:scale-[0.97] hover:bg-surface-4 hover:border-surface-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t}
          </button>
        ))}
      </div>

      <p className="w-full text-center text-sm mt-4">
        Input fields powered by <strong className="text-secondary font-numora">Numora</strong>
      </p>
    </div>
  );
}
