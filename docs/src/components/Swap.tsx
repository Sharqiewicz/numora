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
      <div className="relative p-4 rounded-xl sm:border bg-[#181a1b] border-[#23272b] w-full">
        <div className="w-full flex justify-end">
          <button
            className="px-3 py-1 rounded-xl mb-2 cursor-pointer transition-transform duration-200 border active:scale-105 bg-[#181a1b] border-[#23272b] hover:bg-[#23272b] border-[#363b3f] focus-visible:ring-2 focus-visible:ring-[#5b2ff5] focus-visible:outline-none"
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

        <div className="group !mt-0 flex items-center gap-2 p-2 border rounded-t-xl bg-[#23272b] border-[#363b3f] hover:bg-[#34383b] [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-[#5b2ff5]">
          <label htmlFor="fromAmount" className="sr-only">From amount</label>
          <NumoraInput
            id="fromAmount"
            name="fromAmount"
            className="flex bg-transparent text-2xl my-3 focus:outline-none text-white placeholder-[#a0a3c4]"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => handleFromInputChange(e as React.ChangeEvent<NumoraHTMLInputElement>)}
            maxDecimals={effectiveFromDecimals}
            formatOn={FormatOn.Change}
            thousandStyle={ThousandStyle.Thousand}
            enableCompactNotation={true}
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

        <div className="absolute border rounded-full border-[#363b3f] left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 flex justify-center my-2">
          <button
            className="p-2 rounded-full border cursor-pointer transition-transform duration-200 bg-[#181a1b] border-[#23272b] text-[#a0a3c4] hover:bg-[#30363b] hover:border-[#484e54] motion-safe:hover:rotate-180 focus-visible:ring-2 focus-visible:ring-[#5b2ff5] focus-visible:outline-none"
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

        <div className="group mt-0.5  flex items-center gap-2 p-2 border  rounded-b-xl bg-[#23272b] border-[#363b3f] hover:bg-[#34383b] [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-[#5b2ff5]">
          <label htmlFor="toAmount" className="sr-only">To amount</label>
          <NumoraInput
            id="toAmount"
            name="toAmount"
            className="flex bg-transparent border-none text-2xl my-3 focus:outline-none text-white placeholder-[#a0a3c4]"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => handleToInputChange(e as React.ChangeEvent<HTMLInputElement>)}
            maxDecimals={effectiveToDecimals}
            formatOn={FormatOn.Change}
            thousandStyle={ThousandStyle.Thousand}
            enableCompactNotation={true}
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
          className="mt-2 text-sm text-center text-[#a0a3c4] text-gray-500 mb-6"
          aria-live="polite"
          aria-atomic="true"
        >
          {priceInfo}
        </div>
        <button
          type="button"
          className="active:scale-95 w-full py-3 font-bold rounded-xl text-base text-white border-none cursor-pointer transition-transform duration-200 bg-[#5b2ff5] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#4520b4] disabled:bg-[#3b1f7a] disabled:text-white disabled:opacity-100 focus-visible:ring-2 focus-visible:ring-[#5b2ff5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181a1b] focus-visible:outline-none"
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

