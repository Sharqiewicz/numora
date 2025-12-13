import { FormatOn, NumoraInput, ThousandStyle } from 'numora-react';
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
  const effectiveFromPlaceholder = '0.0';
  const effectiveToPlaceholder = '0.0';

  useEffect(() => {
    if (!prices || !fromToken || !toToken) return;

    if (lastEdited === 'from' && fromAmount && +fromAmount > 0) {
      const calculated = calculateSwapAmount(
        fromAmount,
        fromToken.symbol as any,
        toToken.symbol as any,
        prices,
        effectiveToDecimals
      );
      setToAmount(limitDecimals(calculated, effectiveToDecimals));
    } else if (lastEdited === 'to' && toAmount && +toAmount > 0) {
      const calculated = calculateReverseSwapAmount(
        toAmount,
        fromToken.symbol as any,
        toToken.symbol as any,
        prices,
        effectiveFromDecimals
      );
      setFromAmount(limitDecimals(calculated, effectiveFromDecimals));
    } else if (!lastEdited && fromAmount && +fromAmount > 0) {
      const calculated = calculateSwapAmount(
        fromAmount,
        fromToken.symbol as any,
        toToken.symbol as any,
        prices,
        effectiveToDecimals
      );
      setToAmount(limitDecimals(calculated, effectiveToDecimals));
    } else if (!fromAmount && !toAmount) {
      setFromAmount('');
      setToAmount('');
    }
  }, [fromAmount, toAmount, lastEdited, prices, fromToken, toToken, effectiveFromDecimals, effectiveToDecimals]);

  const priceInfo =
    isLoading
      ? 'Loading prices...'
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

  function limitDecimals(value: string, maxDecimals: number): string {
    if (!value || value === '') return '';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';

    const parts = value.split('.');
    if (parts.length === 1) {
      return value;
    }

    const decimalPart = parts[1];

    if (decimalPart.length <= maxDecimals) {
      return value;
    }

    return numValue.toFixed(maxDecimals);
  }

  function handleFromInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFromAmount(e.target.value);
    setLastEdited('from');
  }

  function handleToInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setToAmount(e.target.value);
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
    <div className="flex items-center flex-col justify-center sm:w-[460px]">
      <div className="relative p-4 rounded-xl border bg-[#181a1b] border-[#23272b] w-full">
        <div className="w-full flex justify-end">
          <button
            className="px-3 py-1 rounded-xl mb-2 cursor-pointer transition-transform duration-200 border active:scale-105 bg-[#181a1b] border-[#23272b] hover:bg-[#23272b] border-[#363b3f]hover:bg-gray-200"
            aria-label="Slippage settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
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

        <div className="!mt-0 flex items-center gap-2 p-2 border rounded-t-xl bg-[#23272b] border-[#363b3f] hover:bg-[#34383b]">
          <NumoraInput
            id="fromAmount"
            name="fromAmount"
            className="flex bg-transparent text-2xl my-3 focus:outline-none text-white placeholder-[#a0a3c4]"
            placeholder={effectiveFromPlaceholder}
            value={fromAmount}
            onChange={(e) => handleFromInputChange(e as React.ChangeEvent<HTMLInputElement>)}
            maxDecimals={effectiveFromDecimals}
            formatOn={FormatOn.Change}
            thousandSeparator=","
            thousandStyle={ThousandStyle.Thousand}
            enableCompactNotation={true}
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

        <div className="absolute border rounded-full border-[#363b3f] left-1/2 top-[37%] -translate-x-1/2 -translate-y-1/2 flex justify-center my-2">
          <button
            className="p-2 rounded-full border cursor-pointer transition-transform duration-200 bg-[#181a1b] border-[#23272b] text-[#a0a3c4] hover:bg-[#30363b] hover:border-[#484e54] hover:rotate-180"
            onClick={flipTokens}
            type="button"
            aria-label="Swap tokens"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 25"
              fill="none"
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

        <div className="!mt-0 flex items-center gap-2 p-2 border border-t-0 rounded-b-xl bg-[#23272b] border-[#363b3f] hover:bg-[#34383b]">
          <NumoraInput
            id="toAmount"
            name="toAmount"
            className="flex bg-transparent border-none text-2xl my-3 focus:outline-none text-white placeholder-[#a0a3c4]"
            placeholder={effectiveToPlaceholder}
            value={toAmount}
            onChange={(e) => handleToInputChange(e as React.ChangeEvent<HTMLInputElement>)}
            maxDecimals={effectiveToDecimals}
            formatOn={FormatOn.Change}
            thousandSeparator=","
            thousandStyle={ThousandStyle.Thousand}
            enableCompactNotation={true}
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

        <div className="mt-2 text-sm text-center text-[#a0a3c4] text-gray-500 mb-6">
          {priceInfo}
        </div>
        <button
          type='button'
          className=" active:scale-102 w-full py-3 font-bold rounded-xl text-base text-white border-none cursor-pointer transition-transform duration-200 bg-[#5b2ff5] disabled:bg-[#c4b5fd] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#4520b4] disabled:bg-[#3b1f7a] disabled:text-white disabled:opacity-100"
          disabled={!parseFloat(fromAmount) || isLoading}
          onClick={handleSwap}
        >
          {isLoading ? 'Loading...' : 'Swap'}
        </button>
      </div>
      <p className="w-full text-center text-sm mt-4">
        Input fields powered by <strong className="text-secondary font-numora">numora</strong>
      </p>
    </div>
  );
}

