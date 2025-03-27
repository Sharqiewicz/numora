<script>
  import { onMount } from 'svelte';
  import { NumericInput } from 'numora';

  let basicContainer;
  let currencyContainer;
  let cryptoContainer;
  let customContainer;

  let basicValue = '0';
  let currencyValue = '0';
  let cryptoValue = '0';
  let customValue = '0';

  onMount(() => {
    // Basic example
    new NumericInput(basicContainer, {
      maxDecimals: 2,
      placeholder: 'Enter a number',
      onChange: (value) => {
        basicValue = value;
      },
    });

    // Currency example
    new NumericInput(currencyContainer, {
      maxDecimals: 2,
      placeholder: '0.00',
      onChange: (value) => {
        currencyValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      },
    });

    // Crypto example
    new NumericInput(cryptoContainer, {
      maxDecimals: 8,
      placeholder: '0.00000000',
      onChange: (value) => {
        cryptoValue = value;
      },
    });

    // Custom validation example
    new NumericInput(customContainer, {
      maxDecimals: 2,
      placeholder: 'Enter amount (max 1000)',
      onChange: (value) => {
        const numValue = Number(value);
        customValue = value;

        if (numValue > 1000) {
          customContainer.classList.add('error');
        } else {
          customContainer.classList.remove('error');
        }
      },
    });
  });
</script>

<div class="demo-container">
  <h2>Numora Live Examples</h2>

  <div class="example-block">
    <h3>Basic Number Input</h3>
    <div class="input-container">
      <div bind:this={basicContainer}></div>
      <div class="value-display">Value: {basicValue}</div>
    </div>
  </div>

  <div class="example-block">
    <h3>Currency Input</h3>
    <div class="input-container">
      <div bind:this={currencyContainer}></div>
      <div class="value-display">Value: {currencyValue}</div>
    </div>
  </div>

  <div class="example-block">
    <h3>Cryptocurrency Input</h3>
    <div class="input-container">
      <div bind:this={cryptoContainer}></div>
      <div class="value-display">Value: {cryptoValue} BTC</div>
    </div>
  </div>

  <div class="example-block">
    <h3>Custom Validation (Max 1000)</h3>
    <div class="input-container">
      <div bind:this={customContainer}></div>
      <div class="value-display">Value: {customValue}</div>
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
