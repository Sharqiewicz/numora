<script lang="ts">
  import { writable } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import { handleOnChangeNumericInput, handleOnPasteNumericInput } from 'numora';
  import TokenSelector from './TokenSelector.svelte';
  import { TOKENS, type TokenInfo } from '../lib/constants/tokens';
  import { fetchAllTokenPrices, type PriceData } from '../lib/services/priceService';
  import { calculateSwapAmount, calculateReverseSwapAmount, calculateExchangeRate } from '../lib/utils/swapCalculator';
  import type { NetworkName } from '../lib/constants/priceFeeds';
  import { numoraConfig } from '../lib/stores/numoraConfig';

  // State
  const currentNetwork: NetworkName = 'mainnet';
  const prices = writable<PriceData | null>(null);
  const loading = writable(true);
  const error = writable<string | null>(null);
  const lastUpdated = writable<Date | null>(null);

let fromToken: TokenInfo = $state(TOKENS[0]);
let toToken: TokenInfo = $state(TOKENS[2]);
let fromAmount = $state('1');
let toAmount = $state('');
let lastEdited: 'from' | 'to' | null = $state(null);
let pollInterval: ReturnType<typeof setInterval> | null = null;
let openSelector: 'from' | 'to' | null = $state(null);

  // Fetch prices on mount and set up polling
  onMount(() => {
    fetchPrices();
    pollInterval = setInterval(fetchPrices, 60000); // Poll every 60 seconds
  });

  onDestroy(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });

  async function fetchPrices() {
    loading.set(true);
    error.set(null);

    try {
      const priceData = await fetchAllTokenPrices(currentNetwork);
      prices.set(priceData);
      lastUpdated.set(new Date());
      error.set(null);
    } catch (err) {
      console.error('Error fetching prices:', err);
      error.set('Failed to fetch prices from Chainlink');
    } finally {
      loading.set(false);
    }
  }

  // Reactive calculation for swap - works both ways
  $effect(() => {
    if (!$prices || !fromToken || !toToken) return;

    if (lastEdited === 'from' && fromAmount && +fromAmount > 0) {
      const calculated = calculateSwapAmount(
        fromAmount,
        fromToken.symbol as any,
        toToken.symbol as any,
        $prices,
        effectiveToDecimals
      );
      toAmount = limitDecimals(calculated, effectiveToDecimals);
    } else if (lastEdited === 'to' && toAmount && +toAmount > 0) {
      const calculated = calculateReverseSwapAmount(
        toAmount,
        fromToken.symbol as any,
        toToken.symbol as any,
        $prices,
        effectiveFromDecimals
      );
      fromAmount = limitDecimals(calculated, effectiveFromDecimals);
    } else if (!lastEdited && fromAmount && +fromAmount > 0) {
      // Initial calculation when no input has been edited yet
      const calculated = calculateSwapAmount(
        fromAmount,
        fromToken.symbol as any,
        toToken.symbol as any,
        $prices,
        effectiveToDecimals
      );
      toAmount = limitDecimals(calculated, effectiveToDecimals);
    } else if (!fromAmount && !toAmount) {
      // Clear both if both are empty
      fromAmount = '';
      toAmount = '';
    }
  });

  $effect(() => {
    numoraConfig.update((config) => ({
      ...config,
      fromDecimals: fromToken.decimals,
      toDecimals: toToken.decimals,
    }));
  });

  // Price info display
  const priceInfo = $derived(
    $loading
      ? 'Loading prices...'
      : $error
        ? $error
        : $prices && fromAmount && +fromAmount > 0
          ? `1 ${fromToken.symbol} ≈ ${calculateExchangeRate(fromToken.symbol as any, toToken.symbol as any, $prices)} ${toToken.symbol}`
          : '-'
  );

  function flipTokens() {
    const tempToken = fromToken;
    fromToken = toToken;
    toToken = tempToken;

    const tempAmount = fromAmount;
    fromAmount = toAmount;
    toAmount = tempAmount;

    // Flip the lastEdited state to maintain calculation direction
    if (lastEdited === 'from') {
      lastEdited = 'to';
    } else if (lastEdited === 'to') {
      lastEdited = 'from';
    }
  }

  const effectiveFromDecimals = $derived($numoraConfig.fromDecimals);
  const effectiveToDecimals = $derived($numoraConfig.toDecimals);
  const effectiveFromPlaceholder = $derived($numoraConfig.fromPlaceholder);
  const effectiveToPlaceholder = $derived($numoraConfig.toPlaceholder);

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

  function handleFromInputChange(e: Event) {
    handleOnChangeNumericInput(e, effectiveFromDecimals);
    fromAmount = (e.target as HTMLInputElement).value;
    lastEdited = 'from';
  }

  function handleFromInputPaste(e: ClipboardEvent) {
    handleOnPasteNumericInput(e, effectiveFromDecimals);
    fromAmount = (e.target as HTMLInputElement).value;
    lastEdited = 'from';
  }

  function handleToInputChange(e: Event) {
    handleOnChangeNumericInput(e, effectiveToDecimals);
    toAmount = (e.target as HTMLInputElement).value;
    lastEdited = 'to';
  }

  function handleToInputPaste(e: ClipboardEvent) {
    handleOnPasteNumericInput(e, effectiveToDecimals);
    toAmount = (e.target as HTMLInputElement).value;
    lastEdited = 'to';
  }

  function handleSwap() {
    // Swap implementation would go here
    console.log('Swapping', fromAmount, fromToken.symbol, 'to', toToken.symbol);
  }

function toggleSelector(selector: 'from' | 'to', next: boolean) {
  if (next) {
    openSelector = selector;
    return;
  }

  if (openSelector === selector) {
    openSelector = null;
  }
}
</script>


<div class="flex items-center justify-center w-[460px]">
    <div class="relative p-4 rounded-xl border dark:bg-[#181a1b] dark:border-[#23272b] bg-[#f9fafb] border-gray-200 w-full">
      <div class="w-full flex justify-end">
        <button class="px-3 py-1 rounded-xl mb-2 cursor-pointer transition-transform duration-200 border active:scale-105 dark:bg-[#181a1b] dark:border-[#23272b] dark:hover:bg-[#23272b] bg-[#f1f1f1] border-gray-200 hover:bg-gray-200" aria-label="Slippage settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11.0195 3.55153C11.6283 3.20907 12.3717 3.20907 12.9805 3.55153L18.9805 6.92649C19.6103 7.28073 20 7.9471 20 8.66965V15.3302C20 16.0528 19.6103 16.7192 18.9805 17.0734L12.9805 20.4484C12.3717 20.7908 11.6283 20.7908 11.0195 20.4484L5.01954 17.0737C4.38975 16.7195 4 16.0531 4 15.3305L4 8.66963C4 7.94707 4.38973 7.2807 5.01949 6.92647L11.0195 3.55153Z" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"></path><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3432 15 9.00003 13.6569 9.00003 12C9.00003 10.3431 10.3432 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"></path></svg>
        </button>
      </div>


      <div class="!mt-0 flex items-center gap-2 p-2 border border-b-0 rounded-t-xl dark:bg-[#23272b] dark:border-[#363b3f] dark:hover:bg-[#23272b] bg-[#f1f1f1] border-gray-200 hover:bg-gray-200">

        <input
          class="flex bg-transparent text-2xl my-3 focus:outline-none dark:text-white placeholder-[#a0a3c4] dark:placeholder-[#a0a3c4] placeholder-gray-400"
          placeholder={effectiveFromPlaceholder}
          type="text"
          inputmode="decimal"
          value={fromAmount}
          oninput={handleFromInputChange}
          onpaste={handleFromInputPaste}
        />
        <TokenSelector
          label="From"
          selectedToken={fromToken}
          onSelect={(token) => (fromToken = token)}
          disabledToken={toToken}
          isOpen={openSelector === 'from'}
          onToggle={(next) => toggleSelector('from', next)}
        />


      </div>

      <div class="absolute left-1/2 top-[37%] -translate-x-1/2 -translate-y-1/2 flex justify-center my-2">
        <button class="p-2 rounded-full border cursor-pointer transition-transform duration-200 dark:bg-[#181a1b] dark:border-[#23272b] dark:text-[#a0a3c4] dark:hover:bg-[#30363b] dark:hover:border-[#484e54] bg-white border-gray-200 text-gray-500 hover:bg-[#f9fafb] hover:border-gray-300 hover:rotate-180" onclick={flipTokens} type="button" aria-label="Swap tokens">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 25" fill="none"><path d="M18 14.5L12 20.5L6 14.5M12 19.5V4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>


      <div class="!mt-0 flex items-center gap-2 p-2 border border-t-0 rounded-b-xl dark:bg-[#23272b] dark:border-[#363b3f] dark:hover:bg-[#23272b] bg-[#f1f1f1] border-gray-200 hover:bg-gray-200">
        <input
          class="flex bg-transparent border-none text-2xl my-3 focus:outline-none dark:text-white placeholder-[#a0a3c4] dark:placeholder-[#a0a3c4] placeholder-gray-400"
          placeholder={effectiveToPlaceholder}
          type="text"
          inputmode="decimal"
          value={toAmount}
          oninput={handleToInputChange}
          onpaste={handleToInputPaste}
        />

        <TokenSelector
        label="To"
        selectedToken={toToken}
        onSelect={(token) => (toToken = token)}
        disabledToken={fromToken}
        isOpen={openSelector === 'to'}
        onToggle={(next) => toggleSelector('to', next)}
      />
      </div>

      <div class="mt-2 text-sm text-center text-[#a0a3c4] dark:text-[#a0a3c4] text-gray-500">{priceInfo}</div>
      <button class="mt-6 w-full py-3 font-bold rounded-xl text-base text-white border-none cursor-pointer transition-transform duration-200 active:scale-105 bg-[#5b2ff5] hover:bg-[#4c1fd4] disabled:bg-[#c4b5fd] disabled:opacity-60 disabled:cursor-not-allowed dark:bg-[#5b2ff5] dark:hover:bg-[#4520b4] dark:disabled:bg-[#3b1f7a] dark:disabled:text-white dark:disabled:opacity-100" disabled={!parseFloat(fromAmount) || $loading} onclick={handleSwap}>
        {$loading ? 'Loading...' : 'Swap'}
      </button>
    </div>
</div>
<p class="w-full text-center text-sm mt-4">Input fields powered by <strong class="text-[#5b2ff5] font-heading">Numora</strong></p>
