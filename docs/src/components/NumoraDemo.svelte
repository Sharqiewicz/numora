<script>
  import { onMount } from 'svelte';
  import { NumericInput } from 'numora';

  let basicContainer;
  let basicValue = '0';

  // Configuration values
  let maxDecimalsValue = '2';
  let placeholderValue = 'Enter a number';
  let consoleMessage = 'Value:';

  let numericInputInstance;

  onMount(() => {
    createNumericInput();
  });

  function createNumericInput() {
    // Cleanup previous instance if exists
    if (numericInputInstance) {
      basicContainer.innerHTML = '';
    }

    numericInputInstance = new NumericInput(basicContainer, {
      maxDecimals: parseInt(maxDecimalsValue, 10),
      placeholder: placeholderValue,
      onChange: (value) => {
        basicValue = value;
        console.log(`${consoleMessage} ${value}`);
      },
    });
  }
</script>

<div class="max-w-2xl mx-auto my-8 p-8 bg-white rounded-lg shadow-sm [&_input]:w-full [&_input]:p-2 [&_input]:border [&_input]:border-[#ddd] [&_input]:rounded [&_input]:text-base [&_input]:transition-colors [&_input:focus]:outline-none [&_input:focus]:border-[#007bff] [&_input:focus]:shadow-[0_0_0_2px_rgba(0,123,255,0.25)] [&_.error]:!border-[#ff4444]">
  <h2 class="text-[#333] mb-8 text-center text-2xl font-bold">Numora Live Examples</h2>

  <div class="mb-8 p-4 border border-[#eaeaea] rounded bg-[#f8f9fa]">
    <h3 class="text-[#666] mb-4 text-lg">Configuration</h3>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="maxDecimals" class="text-sm text-[#666] font-medium">Max Decimals:</label>
        <input
          type="number"
          id="maxDecimals"
          min="0"
          max="20"
          bind:value={maxDecimalsValue}
          on:change={createNumericInput}
          class="!p-2 !text-sm"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="placeholder" class="text-sm text-[#666] font-medium">Placeholder:</label>
        <input
          type="text"
          id="placeholder"
          bind:value={placeholderValue}
          on:change={createNumericInput}
          class="!p-2 !text-sm"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="consoleMessage" class="text-sm text-[#666] font-medium">Console Message:</label>
        <input
          type="text"
          id="consoleMessage"
          bind:value={consoleMessage}
          on:change={createNumericInput}
          class="!p-2 !text-sm"
        />
      </div>
    </div>
  </div>

  <div class="mb-8 p-4 border border-[#eaeaea] rounded">
    <h3 class="text-[#666] mb-4 text-lg">Basic Number Input</h3>
    <div class="flex flex-col gap-2">
      <div bind:this={basicContainer}></div>
      <div class="text-sm text-[#666] mt-2">Value: {basicValue}</div>
    </div>
  </div>
</div>
