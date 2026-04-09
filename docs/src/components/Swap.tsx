import { NumoraHTMLInputElement, NumoraInput } from 'numora-react';
import { FormatOn, ThousandStyle } from 'numora';
import { useEffect, useState } from 'react';
import { useTRPC } from '@/integrations/trpc/react';
import { TOKENS, type TokenInfo } from '@/lib/constants/tokens';
import {
  calculateExchangeRate,
  calculateReverseSwapAmount,
  calculateSwapAmount,
} from '@/lib/utils/swapCalculator';
import { TokenSelector } from './TokenSelector';

export function Swap() {
  const [fromToken, setFromToken] = useState<TokenInfo>(TOKENS[0]);
  const [toToken, setToToken] = useState<TokenInfo>(TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  const [lastEdited, setLastEdited] = useState<'from' | 'to' | null>(null);
  const [openSelector, setOpenSelector] = useState<'from' | 'to' | null>(null);

  const { data: prices, isLoading } = useTRPC.prices.getAll.useQuery(
    { network: 'mainnet' },
    {
      refetchInterval: 60000,
    }
  );

  const effectiveFromDecimals = fromToken.decimals;
  const effectiveToDecimals = toToken.decimals;

  useEffect(() => {
    if (!prices || !fromToken || !toToken) return;

    if (lastEdited !== 'to' && fromAmount && +fromAmount > 0) {
      setToAmount(calculateSwapAmount(fromAmount, fromToken.symbol as any, toToken.symbol as any, prices, effectiveToDecimals));
    } else if (lastEdited === 'to' && toAmount && +toAmount > 0) {
      setFromAmount(calculateReverseSwapAmount(toAmount, fromToken.symbol as any, toToken.symbol as any, prices, effectiveFromDecimals));
    }
  }, [fromAmount, toAmount, lastEdited, prices, fromToken, toToken, effectiveFromDecimals, effectiveToDecimals]);

  const priceInfo =
    isLoading
      ? 'Loading prices…'
      : !prices
        ? 'Failed to fetch prices'
        : fromAmount && +fromAmount > 0
          ? `1 ${fromToken.symbol} ≈ ${calculateExchangeRate(
              fromToken.symbol as any,
              toToken.symbol as any,
              prices
            )} ${toToken.symbol}`
          : '-';

  function flipTokens() {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);

    if (lastEdited === 'from') {
      setLastEdited('to');
    } else if (lastEdited === 'to') {
      setLastEdited('from');
    }
  }

  function handleFromInputChange(e: React.ChangeEvent<NumoraHTMLInputElement>) {
    setFromAmount(e.target.rawValue ?? '');
    setLastEdited('from');
  }

  function handleToInputChange(e: React.ChangeEvent<NumoraHTMLInputElement>) {
    setToAmount(e.target.rawValue ?? '');
    setLastEdited('to');
  }

  function handleSwap() {
    console.log('Swapping', fromAmount, fromToken.symbol, 'to', toToken.symbol);
  }

  function toggleSelector(selector: 'from' | 'to', next: boolean) {
    if (next) {
      setOpenSelector(selector);
      return;
    }

    if (openSelector === selector) {
      setOpenSelector(null);
    }
  }

  return (
    <div className="flex items-center flex-col justify-center sm:w-[460px] px-4 sm:p-0">
      <div className="relative p-4 rounded-xl sm:border bg-surface-1 border-surface-3 w-full">
        <div className="w-full flex justify-end">
          <button
            className="px-3 py-1 rounded-xl mb-2 cursor-pointer transition-transform duration-200 border active:scale-105 bg-surface-1 border-surface-5 hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            aria-label="Slippage settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M11.0195 3.55153C11.6283 3.20907 12.3717 3.20907 12.9805 3.55153L18.9805 6.92649C19.6103 7.28073 20 7.9471 20 8.66965V15.3302C20 16.0528 19.6103 16.7192 18.9805 17.0734L12.9805 20.4484C12.3717 20.7908 11.6283 20.7908 11.0195 20.4484L5.01954 17.0737C4.38975 16.7195 4 16.0531 4 15.3305L4 8.66963C4 7.94707 4.38973 7.2807 5.01949 6.92647L11.0195 3.55153Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M15 12C15 13.6569 13.6569 15 12 15C10.3432 15 9.00003 13.6569 9.00003 12C9.00003 10.3431 10.3432 9 12 9C13.6569 9 15 10.3431 15 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="group !mt-0 flex items-center gap-2 p-2 border rounded-t-xl bg-surface-3 border-surface-5 hover:bg-surface-5 [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-brand">
          <label htmlFor="fromAmount" className="sr-only">From amount</label>
          <NumoraInput
            id="fromAmount"
            name="fromAmount"
            className="flex bg-transparent text-2xl my-3 focus:outline-none text-white placeholder-muted-icon"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => handleFromInputChange(e as React.ChangeEvent<NumoraHTMLInputElement>)}
            maxDecimals={effectiveFromDecimals}
            formatOn={FormatOn.Change}
            thousandStyle={ThousandStyle.Thousand}
            enableCompactNotation
            rawValueMode

          />
          <TokenSelector
            label="From"
            selectedToken={fromToken}
            onSelect={setFromToken}
            disabledToken={toToken}
            isOpen={openSelector === 'from'}
            onToggle={(next) => toggleSelector('from', next)}
          />
        </div>

        <div className="absolute border rounded-full border-surface-5 left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 flex justify-center my-2">
          <button
            className="p-2 rounded-full border cursor-pointer transition-transform duration-200 bg-surface-1 border-surface-3 text-muted-icon hover:bg-surface-4 hover:border-surface-7 motion-safe:hover:rotate-180 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            onClick={flipTokens}
            type="button"
            aria-label="Flip tokens"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

        <div className="group mt-0.5  flex items-center gap-2 p-2 border  rounded-b-xl bg-surface-3 border-surface-5 hover:bg-surface-5 [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-brand">
          <label htmlFor="toAmount" className="sr-only">To amount</label>
          <NumoraInput
            id="toAmount"
            name="toAmount"
            className="flex bg-transparent border-none text-2xl my-3 focus:outline-none text-white placeholder-muted-icon"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => handleToInputChange(e as React.ChangeEvent<HTMLInputElement>)}
            maxDecimals={effectiveToDecimals}
            formatOn={FormatOn.Change}
            thousandStyle={ThousandStyle.Thousand}
            enableCompactNotation
            rawValueMode
          />
          <TokenSelector
            label="To"
            selectedToken={toToken}
            onSelect={setToToken}
            disabledToken={fromToken}
            isOpen={openSelector === 'to'}
            onToggle={(next) => toggleSelector('to', next)}
          />
        </div>

        <div
          className="mt-2 text-sm text-center text-muted-icon mb-6"
          aria-live="polite"
          aria-atomic="true"
        >
          {priceInfo}
        </div>
        <button
          type="button"
          className="active:scale-95 w-full py-3 font-bold rounded-xl text-base text-white border-none cursor-pointer transition-transform duration-200 bg-brand disabled:opacity-60 disabled:cursor-not-allowed hover:bg-brand-hover disabled:bg-brand-disabled disabled:text-white disabled:opacity-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 focus-visible:outline-none"
          onClick={handleSwap}
          disabled={isLoading}
        >
          {isLoading ? 'Loading…' : 'Swap'}
        </button>
      </div>
      <p className="w-full text-center text-sm mt-4">
        Input fields powered by <strong className="text-secondary font-numora">numora</strong>
      </p>
    </div>
  );
}

