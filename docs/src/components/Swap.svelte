<script lang="ts">
  import { writable } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import { handleOnChangeNumericInput, handleOnPasteNumericInput } from 'numora';
  import TokenSelector from './TokenSelector.svelte';
  import { TOKENS, type TokenInfo } from '../lib/constants/tokens';
  import { fetchAllTokenPrices, type PriceData } from '../lib/services/priceService';
  import { calculateSwapAmount, calculateExchangeRate } from '../lib/utils/swapCalculator';
  import type { NetworkName } from '../lib/constants/priceFeeds';

  // State
  const currentNetwork: NetworkName = 'mainnet';
  const prices = writable<PriceData | null>(null);
  const loading = writable(true);
  const error = writable<string | null>(null);
  const lastUpdated = writable<Date | null>(null);

  let fromToken: TokenInfo = $state(TOKENS[0]);
  let toToken: TokenInfo = $state(TOKENS[1]);
  let fromAmount = $state('');
  let toAmount = $state('');
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

  // Reactive calculation for swap output
  $effect(() => {
    if ($prices && fromToken && toToken && fromAmount && +fromAmount > 0) {
      toAmount = calculateSwapAmount(
        fromAmount,
        fromToken.symbol as any,
        toToken.symbol as any,
        $prices,
        toToken.decimals
      );
    } else {
      toAmount = '';
    }
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
  }

  function handleFromInputChange(e: Event) {
    handleOnChangeNumericInput(e, fromToken.decimals);
    fromAmount = (e.target as HTMLInputElement).value;
  }

  function handleFromInputPaste(e: ClipboardEvent) {
    handleOnPasteNumericInput(e, fromToken.decimals);
    fromAmount = (e.target as HTMLInputElement).value;
  }

  function handleSwap() {
    // Swap implementation would go here
    console.log('Swapping', fromAmount, fromToken.symbol, 'to', toToken.symbol);
  }
</script>

<div class="app-container">
    <div class="swap-form-container">
      <div class="swap-input-container">

        <input
          class="swap-input"
          placeholder="0.0"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            stroke="currentColor"
            fill="none"
            stroke-width="2"
          >
            <path
              d="M16 8l4 4-4 4M8 16l-4-4 4-4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>


      <div class="swap-input-container">


        <input
          class="swap-input"
          placeholder="0.0"
          type="text"
          inputmode="decimal"
          value={toAmount}
          disabled
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

  .powered-by-text-strong{
    color: #5b2ff5;
  }
  .powered-by-text{
    width: 100%;
    text-align: center;
  }

  .swap-input-container{
    display: flex;
    gap: 0.5rem;
  }
  .swap-form-container {
    padding: 1rem;
    border-radius: 0.75rem;
  }

  .swap-input {
    display: flex;
    flex-grow: 1;
    background-color: transparent;
    border: 0;
    border-bottom: 1px solid #23272b;
    font-size: 1.5rem;
    color: white;
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
  }

  .flip-button:hover {
    background-color: #23272b;
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
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
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

  .app-card {
    background-color: #23272b;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 28rem;
  }

  .app-title {
    font-weight: 700;
    font-size: 1.5rem;
    color: white;
    margin-bottom: 1rem;
    text-align: center;
  }

  .app-footer {
    margin-top: 2rem;
    color: #d1d5db;
    text-align: center;
    opacity: 0.8;
    font-size: 0.75rem;
  }

  :global(html[data-theme="light"]) .app-container,
  :global(html:not([data-theme="dark"])) .app-container {
  }

  :global(html[data-theme="light"]) .app-card,
  :global(html:not([data-theme="dark"])) .app-card {
    background-color: #ffffff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }

  :global(html[data-theme="light"]) .swap-form-container,
  :global(html:not([data-theme="dark"])) .swap-form-container {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  :global(html[data-theme="light"]) .swap-input,
  :global(html:not([data-theme="dark"])) .swap-input {
    border-bottom: 1px solid #e5e7eb;
    color: #111827;
  }

  :global(html[data-theme="light"]) .swap-input:focus,
  :global(html:not([data-theme="dark"])) .swap-input:focus {
    border-bottom-color: #5b2ff5;
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

  :global(html[data-theme="light"]) .app-title,
  :global(html:not([data-theme="dark"])) .app-title {
    color: #111827;
  }

  :global(html[data-theme="light"]) .app-footer,
  :global(html:not([data-theme="dark"])) .app-footer {
    color: #6b7280;
  }
</style>
