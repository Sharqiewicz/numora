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
</script>

<div class="app-container">

    <div class="swap-form-container">
      <div class="slippage-wrapper">
        <button class="slippage-button" aria-label="Slippage settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11.0195 3.55153C11.6283 3.20907 12.3717 3.20907 12.9805 3.55153L18.9805 6.92649C19.6103 7.28073 20 7.9471 20 8.66965V15.3302C20 16.0528 19.6103 16.7192 18.9805 17.0734L12.9805 20.4484C12.3717 20.7908 11.6283 20.7908 11.0195 20.4484L5.01954 17.0737C4.38975 16.7195 4 16.0531 4 15.3305L4 8.66963C4 7.94707 4.38973 7.2807 5.01949 6.92647L11.0195 3.55153Z" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"></path><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3432 15 9.00003 13.6569 9.00003 12C9.00003 10.3431 10.3432 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"></path></svg>
        </button>
      </div>


      <div class="swap-input-container">

        <input
          class="swap-input"
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
        />


        </div>

      <div class="flip-button-container">
        <button class="flip-button" onclick={flipTokens} type="button" aria-label="Swap tokens">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 25" fill="none"><path d="M18 14.5L12 20.5L6 14.5M12 19.5V4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>


      <div class="swap-input-container-to">
        <input
          class="swap-input"
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
      />
      </div>

      <div class="price-info">{priceInfo}</div>
      <button class="swap-button" disabled={!parseFloat(fromAmount) || $loading} onclick={handleSwap}>
        {$loading ? 'Loading...' : 'Swap'}
      </button>
    </div>
</div>
<p class="powered-by-text">Input fields powered by <strong class="powered-by-text-strong">Numora</strong></p>

<style>

  .slippage-button{
    background: #f1f1f1;
    border: 1px solid #e5e7eb;
    padding: 0.25rem 0.75rem;
    border-radius: 0.75rem;
    margin-bottom: 0.5rem;
    cursor:pointer;
    transition: transform 0.2s;
  }

  .slippage-wrapper{
    width: 100%;
    display: flex;
    justify-items: end;
  }

  .powered-by-text-strong{
    color: #5b2ff5;
  }
  .powered-by-text{
    width: 100%;
    text-align: center;
  }

  .swap-input-container,
  .swap-input-container-to {
    margin-top: 0 !important;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #f1f1f1;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  .slippage-button:active, .swap-button:active{
    transform: scale(1.05);
  }
.slippage-button:hover,
  .swap-input-container:hover,
  .swap-input-container-to:hover{
    background-color: #e5e7eb;
  }

  .swap-input-container {
    border-radius: 0.75rem 0.75rem 0 0;
    border-bottom: none;
  }

  .swap-input-container-to {
    border-radius: 0 0 0.75rem 0.75rem;
  }



  .swap-form-container {
    position: relative;
    padding: 1rem;
    border-radius: 0.75rem;
  }

  .swap-input {
    display: flex;
    flex-grow: 1;
    background-color: transparent;
    border: none;
    font-size: 1.5rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }


  .swap-input:focus {
    outline: none;
  }

  .swap-input::placeholder {
    color: #a0a3c4;
  }

  .flip-button-container {
    position: absolute;
    left: 50%;
    top: 37%;
    transform: translateX(-50%) translateY(-50%);
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .flip-button {
    padding: 0.5rem;
    border-radius: 9999px;
    background-color: #181a1b;
    border: 1px solid #23272b;
    color: #a0a3c4;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .flip-button:hover {
    background-color: #23272b;
    transform: rotate(180deg);
  }

  .price-info {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #a0a3c4;
    text-align: center;
  }

  .swap-button {
    margin-top: 1.5rem;
    width: 100%;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    background-color: #5b2ff5;
    font-weight: 700;
    border-radius: 0.75rem;
    font-size: 1rem;
    color: white;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .swap-button:hover {
    background-color: #4520b4;
  }

  .swap-button:disabled {
    background-color: #3b1f7a;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .app-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(html[data-theme="light"]) .swap-form-container,
  :global(html:not([data-theme="dark"])) .swap-form-container {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
  }


  :global(html[data-theme="light"]) .swap-input::placeholder,
  :global(html:not([data-theme="dark"])) .swap-input::placeholder {
    color: #9ca3af;
  }

  :global(html[data-theme="light"]) .flip-button,
  :global(html:not([data-theme="dark"])) .flip-button {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #6b7280;
  }

  :global(html[data-theme="light"]) .flip-button:hover,
  :global(html:not([data-theme="dark"])) .flip-button:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  :global(html[data-theme="light"]) .price-info,
  :global(html:not([data-theme="dark"])) .price-info {
    color: #6b7280;
  }

  :global(html[data-theme="light"]) .swap-button,
  :global(html:not([data-theme="dark"])) .swap-button {
    background-color: #5b2ff5;
  }

  :global(html[data-theme="light"]) .swap-button:hover,
  :global(html:not([data-theme="dark"])) .swap-button:hover {
    background-color: #4c1fd4;
  }

  :global(html[data-theme="light"]) .swap-button:disabled,
  :global(html:not([data-theme="dark"])) .swap-button:disabled {
    background-color: #c4b5fd;
    color: #ffffff;
    opacity: 0.6;
  }

</style>
