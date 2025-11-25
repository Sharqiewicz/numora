<script lang="ts">
  import { numoraConfig } from '../lib/stores/numoraConfig';

  function updateFromDecimals(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value >= 0 && value <= 20) {
      numoraConfig.update((config) => ({ ...config, fromDecimals: value }));
    }
  }

  function updateToDecimals(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value >= 0 && value <= 20) {
      numoraConfig.update((config) => ({ ...config, toDecimals: value }));
    }
  }

  function updateFromPlaceholder(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    numoraConfig.update((config) => ({ ...config, fromPlaceholder: value }));
  }

  function updateToPlaceholder(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    numoraConfig.update((config) => ({ ...config, toPlaceholder: value }));
  }
</script>

<div class="mt-12 p-6 border rounded-xl max-w-md mx-auto dark:bg-[#181a1b] dark:border-[#23272b] bg-white border-gray-200">
  <h3 class="text-xl font-bold mb-2 text-center dark:text-white text-gray-900">Numora Configuration</h3>
  <p class="text-sm text-center mb-6 dark:text-[#a0a3c4] text-gray-500">Modify Numora field values to see changes in the swap component above</p>

  <div class="grid col-span-1 sm:grid-cols-2 gap-6 mb-6">
    <div class="flex flex-col gap-4">
      <h4 class="text-base font-semibold mb-2 dark:text-[#a0a3c4] text-gray-500">From Token</h4>
      <div class="flex flex-col gap-2">
        <label for="from-decimals" class="text-sm font-medium dark:text-[#d1d5db] text-gray-700">Decimals:</label>
        <input
          id="from-decimals"
          type="number"
          min="0"
          max="20"
          value={$numoraConfig.fromDecimals}
          oninput={updateFromDecimals}
          class="p-2 border rounded-lg text-sm focus:outline-none focus:border-[#5b2ff5] focus:ring-2 dark:bg-[#23272b] dark:border-[#2d3135] dark:text-white dark:focus:ring-[#5b2ff5]/20 bg-white border-gray-200 text-gray-900 focus:ring-[#5b2ff5]/10"
        />
        <span class="text-xs text-gray-500 dark:text-gray-500 text-gray-400">Max decimal places (0-20)</span>
      </div>
      <div class="flex flex-col gap-2">
        <label for="from-placeholder" class="text-sm font-medium dark:text-[#d1d5db] text-gray-700">Placeholder:</label>
        <input
          id="from-placeholder"
          type="text"
          value={$numoraConfig.fromPlaceholder}
          oninput={updateFromPlaceholder}
          class="p-2 border rounded-lg text-sm focus:outline-none focus:border-[#5b2ff5] focus:ring-2 dark:bg-[#23272b] dark:border-[#2d3135] dark:text-white dark:focus:ring-[#5b2ff5]/20 bg-white border-gray-200 text-gray-900 focus:ring-[#5b2ff5]/10"
        />
        <span class="text-xs text-gray-500 dark:text-gray-500 text-gray-400">Input placeholder text</span>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <h4 class="text-base font-semibold mb-2 dark:text-[#a0a3c4] text-gray-500">To Token</h4>
      <div class="flex flex-col gap-2">
        <label for="to-decimals" class="text-sm font-medium dark:text-[#d1d5db] text-gray-700">Decimals:</label>
        <input
          id="to-decimals"
          type="number"
          min="0"
          max="20"
          value={$numoraConfig.toDecimals}
          oninput={updateToDecimals}
          class="p-2 border rounded-lg text-sm focus:outline-none focus:border-[#5b2ff5] focus:ring-2 dark:bg-[#23272b] dark:border-[#2d3135] dark:text-white dark:focus:ring-[#5b2ff5]/20 bg-white border-gray-200 text-gray-900 focus:ring-[#5b2ff5]/10"
        />
        <span class="text-xs text-gray-500 dark:text-gray-500 text-gray-400">Max decimal places (0-20)</span>
      </div>
      <div class="flex flex-col gap-2">
        <label for="to-placeholder" class="text-sm font-medium dark:text-[#d1d5db] text-gray-700">Placeholder:</label>
        <input
          id="to-placeholder"
          type="text"
          value={$numoraConfig.toPlaceholder}
          oninput={updateToPlaceholder}
          class="p-2 border rounded-lg text-sm focus:outline-none focus:border-[#5b2ff5] focus:ring-2 dark:bg-[#23272b] dark:border-[#2d3135] dark:text-white dark:focus:ring-[#5b2ff5]/20 bg-white border-gray-200 text-gray-900 focus:ring-[#5b2ff5]/10"
        />
        <span class="text-xs text-gray-500 dark:text-gray-500 text-gray-400">Input placeholder text</span>
      </div>
    </div>
  </div>

  <div class="pt-4 border-t flex flex-col gap-2 dark:border-[#23272b] border-gray-200">
    <div class="flex justify-between items-center text-sm">
      <span class="dark:text-[#a0a3c4] text-gray-500">From Input Decimals:</span>
      <span class="text-[#5b2ff5] font-semibold font-mono">{$numoraConfig.fromDecimals}</span>
    </div>
    <div class="flex justify-between items-center text-sm">
      <span class="dark:text-[#a0a3c4] text-gray-500">To Input Decimals:</span>
      <span class="text-[#5b2ff5] font-semibold font-mono">{$numoraConfig.toDecimals}</span>
    </div>
    <div class="flex justify-between items-center text-sm">
      <span class="dark:text-[#a0a3c4] text-gray-500">From Placeholder:</span>
      <span class="text-[#5b2ff5] font-semibold font-mono">"{$numoraConfig.fromPlaceholder}"</span>
    </div>
    <div class="flex justify-between items-center text-sm">
      <span class="dark:text-[#a0a3c4] text-gray-500">To Placeholder:</span>
      <span class="text-[#5b2ff5] font-semibold font-mono">"{$numoraConfig.toPlaceholder}"</span>
    </div>
  </div>
</div>
