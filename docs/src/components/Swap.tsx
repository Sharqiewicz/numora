import { type NumoraHTMLInputElement, NumoraInput } from 'numora-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTRPC } from '@/integrations/trpc/react';
import { TOKENS, type TokenInfo, type TokenSymbol } from '@/lib/constants/tokens';
import {
  calculateExchangeRate,
  calculateReverseSwapAmount,
  calculateSwapAmount,
} from '@/lib/utils/swapCalculator';
import { TokenSelector } from './TokenSelector';

const TRY_INPUTS = ['1.5k', '1e-7', '1,234.56', '12abc.3'];

// Keep amounts readable in the field: up to 999,999,999 with 8 decimals.
const MAX_INTEGER_DIGITS = 9;
const MAX_DECIMALS = 8;
const isWithinLimit = (raw: string) => raw.split('.')[0].length <= MAX_INTEGER_DIGITS;
const amountDecimals = (token: TokenInfo) => Math.min(token.decimals, MAX_DECIMALS);

const fieldClass =
  'group flex flex-col gap-1 p-3 border bg-surface-3 border-surface-5 hover:bg-surface-5 transition-colors [&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-brand';

// Step the font down as the formatted value grows, so separators and decimals stay
// visible. Fixed h-8 keeps the field height constant across steps (no layout shift).
const AMOUNT_SIZE_STEPS: [maxChars: number, className: string][] = [
  [13, 'text-2xl'],
  [17, 'text-xl'],
  [21, 'text-lg'],
  [23, 'text-base'],
];

function amountSizeClass(raw: string) {
  const intLen = raw.split('.')[0].replace('-', '').length;
  const displayLen = raw.length + Math.max(0, Math.floor((intLen - 1) / 3));
  return AMOUNT_SIZE_STEPS.find(([max]) => displayLen <= max)?.[1] ?? 'text-sm';
}

function amountInputClass(isComputed: boolean, raw: string) {
  return `flex min-w-0 w-full h-8 bg-transparent border-none ${amountSizeClass(raw)} focus:outline-none placeholder-muted-icon tabular-nums transition-colors ${
    isComputed ? 'text-muted-foreground' : 'text-white'
  }`;
}
export function Swap() {
  const [fromToken, setFromToken] = useState<TokenInfo>(TOKENS[0]);
  const [toToken, setToToken] = useState<TokenInfo>(TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  const [lastEdited, setLastEdited] = useState<'from' | 'to' | null>(null);
  const [openSelector, setOpenSelector] = useState<'from' | 'to' | null>(null);

  const fromInputRef = useRef<HTMLInputElement>(null);
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

    if (lastEdited !== 'to' && fromAmount && +fromAmount > 0) {
      setToAmount(quoteTo(fromAmount));
    } else if (lastEdited === 'to' && toAmount && +toAmount > 0) {
      setFromAmount(quoteFrom(toAmount));
    }
  }, [fromAmount, toAmount, lastEdited, prices, fromToken, toToken]);

  const hasAmount = !!fromAmount && +fromAmount > 0;

  function flipTokens() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    if (lastEdited === 'from') setLastEdited('to');
    else if (lastEdited === 'to') setLastEdited('from');
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
    // Real text insertion (not a value= assignment): it lands in the undo stack and runs
    // through Numora's sanitize/format pipeline, like an autofill or IME commit would.
    document.execCommand('insertText', false, text);
  }

  function handleSwap() {
    console.log('Swapping', fromAmount, fromToken.symbol, 'to', toToken.symbol);
  }

  function toggleSelector(selector: 'from' | 'to', next: boolean) {
    if (next) setOpenSelector(selector);
    else if (openSelector === selector) setOpenSelector(null);
  }

  const ctaDisabled = isLoading || !prices || !hasAmount;

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
        <div className={`${fieldClass} rounded-t-md`}>
          <label htmlFor={fromInputId} className="text-sm text-muted-foreground">
            You pay
          </label>
          <div className="flex items-center gap-2">
            <NumoraInput
              ref={fromInputRef}
              id={fromInputId}
              name="fromAmount"
              className={amountInputClass(lastEdited === 'to', fromAmount)}
              placeholder="0"
              value={fromAmount}
              onChange={(e) =>
                handleFromInputChange(e as React.ChangeEvent<NumoraHTMLInputElement>)
              }
              decimalMaxLength={amountDecimals(fromToken)}
              isAllowed={isFromAllowed}
              formatOn="change"
              groupingStyle="thousand"
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
              className="p-2 rounded-full border cursor-pointer transition-[background-color,border-color,rotate,scale] duration-200 active:scale-[0.96] bg-surface-1 border-surface-3 text-muted-icon hover:bg-surface-4 hover:border-surface-7 motion-safe:hover:rotate-180 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
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

        <div className={`${fieldClass} rounded-b-md`}>
          <label htmlFor={toInputId} className="text-sm text-muted-foreground">
            You receive
          </label>
          <div className="flex items-center gap-2">
            <NumoraInput
              id={toInputId}
              name="toAmount"
              className={amountInputClass(lastEdited !== 'to', toAmount)}
              placeholder="0"
              value={toAmount}
              onChange={(e) => handleToInputChange(e as React.ChangeEvent<NumoraHTMLInputElement>)}
              decimalMaxLength={amountDecimals(toToken)}
              isAllowed={isToAllowed}
              formatOn="change"
              groupingStyle="thousand"
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
          className="active:scale-[0.96] w-full py-3 font-bold rounded-xl text-base text-white border-none cursor-pointer transition-[background-color,color,scale] duration-200 bg-brand hover:bg-brand-hover disabled:bg-surface-4 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 focus-visible:outline-none"
          onClick={handleSwap}
          disabled={ctaDisabled}
        >
          {hasAmount ? 'Swap' : 'Enter an amount'}
        </button>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Demo only. No transaction is sent.
        </p>
      </div>

      <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-1.5 text-sm">
        <span className="text-muted-foreground mr-1">Try typing</span>
        {TRY_INPUTS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => tryInput(t)}
            className="rounded-md border border-surface-5 bg-surface-2 px-2 py-0.5 font-mono text-xs text-foreground cursor-pointer transition-colors hover:bg-surface-4 hover:border-surface-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
