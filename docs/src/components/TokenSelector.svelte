<script lang="ts">
  import { TOKENS, type TokenInfo } from '../lib/constants/tokens';

  interface Props {
    label: string;
    selectedToken: TokenInfo;
    onSelect: (token: TokenInfo) => void;
    disabledToken?: TokenInfo;
  }

  let { selectedToken, onSelect, disabledToken }: Props = $props();
  let isOpen = $state(false);

  function handleTokenSelect(token: TokenInfo) {
    onSelect(token);
    isOpen = false;
  }

  function handleKeyDown(e: KeyboardEvent, token: TokenInfo) {
    if (e.key === 'Enter' || e.key === ' ') {
      handleTokenSelect(token);
    }
  }
</script>

<div class="token-selector-container">
  <button
    type="button"
    class="token-selector-button"
    class:open={isOpen}
    onclick={() => (isOpen = !isOpen)}
  >
    <img src={selectedToken.logoURI} alt={selectedToken.symbol} class="token-icon" />
    <span class="token-symbol">{selectedToken.symbol}</span>
    <svg width="20" height="20" fill="none" class="token-dropdown-icon">
      <path d="M7 8l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </svg>
  </button>
  <div class="token-dropdown-menu" class:open={isOpen}>
    <div
      class="token-dropdown-item"
      class:selected={true}
      onclick={() => handleTokenSelect(selectedToken)}
      onkeydown={(e) => handleKeyDown(e, selectedToken)}
      role="button"
      tabindex="0"
    >
      <img src={selectedToken.logoURI} alt={selectedToken.symbol} class="token-small-icon" />
      <span class="token-symbol">{selectedToken.symbol}</span>
    </div>
    {#each TOKENS.filter(t => t.symbol !== selectedToken.symbol) as token}
      <div
        class="token-dropdown-item"
        class:disabled={disabledToken && token.symbol === disabledToken.symbol}
        onclick={() => handleTokenSelect(token)}
        onkeydown={(e) => handleKeyDown(e, token)}
        role="button"
        tabindex="0"
      >
        <img src={token.logoURI} alt={token.symbol} class="token-small-icon" />
        <span class="token-symbol">{token.symbol}</span>
      </div>
    {/each}
  </div>
</div>

<style>

  .token-selector-container {
    position: relative;
    width: 100%;
  }

  .token-selector-button {
    display: flex;
    width: 144px;
    align-items: center;
    border-radius: 10px;
    padding: 0.35rem;
    cursor: pointer;
    background: black;
    position: relative;
    z-index: 2;
    border: none;
  }



  .token-selector-button:hover{
    background-color: #23272b;
  }

  .token-selector-button:focus {
    outline: none;
  }

  .token-icon {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 9999px;
    margin-right: 0.75rem;
  }

  .token-symbol {
    font-weight: 600;
    font-size: 1rem;
    color: white;
    margin-right: 0.25rem;
  }

  .token-name {
    font-size: 0.75rem;
    color: #a0a3c4;
  }

  .token-dropdown-icon {
    margin-left: auto;
    color: #a0a3c4;
    transition: transform 0.3s ease;
  }

  .token-selector-button.open .token-dropdown-icon {
    transform: rotate(180deg);
  }

  .token-dropdown-menu {
    margin-top: 0 !important;
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    background-color: #181a1b;
    border-top: none;
    border-radius: 0.75rem;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    z-index: 3;
    max-height: 0;
    transform: translateY(0px);
    transition: max-height 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
    scrollbar-width: none;
  }

  .token-dropdown-menu.open {
    max-height: 16rem;
    transform: translateY(0);
    overflow-y: auto;
  }

  .token-dropdown-menu::-webkit-scrollbar {
    display: none;
  }

  .token-dropdown-item {
    margin-top: 0 !important;
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .token-dropdown-item:hover {
    background-color: #23272b;
  }

  .token-dropdown-item.selected {
    background-color: #23272b;
  }

  .token-dropdown-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .token-small-icon {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 9999px;
    margin-right: 0.5rem;
  }

  @media (prefers-color-scheme: light) {


    .token-selector-button {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
    }

    .token-selector-button.open {
      border-bottom: none;
    }

    .token-selector-button:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }

    .token-selector-button:focus {
      border-color: #5b2ff5;
      box-shadow: 0 0 0 3px rgba(91, 47, 245, 0.1);
    }

    .token-symbol {
      color: #111827;
    }

    .token-name {
      color: #6b7280;
    }

    .token-dropdown-menu {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-top: none;
    }

    .token-dropdown-item.selected {
      background-color: #f9fafb;
    }

    .token-dropdown-item:hover {
      background-color: #f9fafb;
    }

    .token-dropdown-icon {
      color: #6b7280;
    }
  }
</style>
