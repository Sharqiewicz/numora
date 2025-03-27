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

<div class="demo-container">
  <h2>Numora Live Examples</h2>

  <div class="config-section">
    <h3>Configuration</h3>
    <div class="config-inputs">
      <div class="config-input">
        <label for="maxDecimals">Max Decimals:</label>
        <input
          type="number"
          id="maxDecimals"
          min="0"
          max="20"
          bind:value={maxDecimalsValue}
          on:change={createNumericInput}
        />
      </div>

      <div class="config-input">
        <label for="placeholder">Placeholder:</label>
        <input
          type="text"
          id="placeholder"
          bind:value={placeholderValue}
          on:change={createNumericInput}
        />
      </div>

      <div class="config-input">
        <label for="consoleMessage">Console Message:</label>
        <input
          type="text"
          id="consoleMessage"
          bind:value={consoleMessage}
          on:change={createNumericInput}
        />
      </div>
    </div>
  </div>

  <div class="example-block">
    <h3>Basic Number Input</h3>
    <div class="input-container">
      <div bind:this={basicContainer}></div>
      <div class="value-display">Value: {basicValue}</div>
    </div>
  </div>
</div>

<style>
  .demo-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .config-section {
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    background: #f8f9fa;
  }

  .config-inputs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .config-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .config-input label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  .config-input input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .example-block {
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #eaeaea;
    border-radius: 4px;
  }

  h2 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }

  h3 {
    color: #666;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .input-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .value-display {
    font-size: 0.9rem;
    color: #666;
    margin-top: 0.5rem;
  }

  :global(.error) {
    border-color: #ff4444 !important;
  }

  :global(input) {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  :global(input:focus) {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  :global(input::placeholder) {
    color: #999;
  }
</style>
