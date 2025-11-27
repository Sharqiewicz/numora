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

<div class="relative w-full">
  <button
    type="button"
    class="flex w-32 items-center rounded-lg p-1.5 cursor-pointer focus:outline-none relative z-20 dark:bg-black dark:hover:bg-[#23272b] bg-white border border-gray-700 hover:bg-gray-50 hover:border-gray-500 focus:border-[#5b2ff5] focus:shadow-[0_0_0_3px_rgba(91,47,245,0.1)] {isOpen ? 'border-b-0' : ''}"
    onclick={() => (isOpen = !isOpen)}
  >
    <img src={selectedToken.logoURI} alt={selectedToken.symbol} class="w-7 h-7 rounded-full mr-3" />
    <span class="font-semibold text-base text-white mr-1 dark:text-white text-gray-900">{selectedToken.symbol}</span>
    <svg width="20" height="20" fill="none" class="ml-auto text-[#a0a3c4] transition-transform duration-300 dark:text-[#a0a3c4] text-gray-500 {isOpen ? 'rotate-180' : ''}">
      <path d="M7 8l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </svg>
  </button>
  <div class="!mt-0 absolute left-0 right-0 top-full rounded-xl shadow-lg overflow-hidden z-30 transition-all duration-300 ease-out border-t-0 dark:bg-[#181a1b] bg-white border border-gray-200 {isOpen ? 'max-h-64 opacity-100 translate-y-0 overflow-y-auto' : 'max-h-0 opacity-0 transform translate-y-0'}">
    <div
      class="!mt-0 flex items-center px-3 py-2 cursor-pointer transition-colors duration-200 dark:hover:bg-[#23272b] hover:bg-gray-50 bg-[#23272b] dark:bg-[#23272b] bg-gray-50"
      onclick={() => handleTokenSelect(selectedToken)}
      onkeydown={(e) => handleKeyDown(e, selectedToken)}
      role="button"
      tabindex="0"
    >
      <img src={selectedToken.logoURI} alt={selectedToken.symbol} class="w-5 h-5 rounded-full mr-2" />
      <span class="font-semibold text-base text-white mr-1 dark:text-white text-gray-900">{selectedToken.symbol}</span>
    </div>
    {#each TOKENS.filter(t => t.symbol !== selectedToken.symbol) as token}
      <div
        class="!mt-0 flex items-center px-3 py-2 cursor-pointer transition-colors duration-200 dark:hover:bg-[#23272b] hover:bg-gray-50 {disabledToken && token.symbol === disabledToken.symbol ? 'opacity-50 cursor-not-allowed' : ''}"
        onclick={() => handleTokenSelect(token)}
        onkeydown={(e) => handleKeyDown(e, token)}
        role="button"
        tabindex="0"
      >
        <img src={token.logoURI} alt={token.symbol} class="w-5 h-5 rounded-full mr-2" />
        <span class="font-semibold text-base text-white mr-1 dark:text-white text-gray-900">{token.symbol}</span>
      </div>
    {/each}
  </div>
</div>
