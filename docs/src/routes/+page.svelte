<script lang="ts">
	import { onMount } from 'svelte';
	import { NumericInput } from 'numora';

	let numoraContainer: HTMLElement | null = null;
	let numoraInput: NumericInput | null = null;
	let currentValue = '0.00';
	let maxDecimals = 2;
	let isDisabled = false;
	let readOnly = false;

	onMount(() => {
		if (numoraContainer) {
			createNumoraInput();
		}
	});

	function createNumoraInput() {
		// Clear container if input already exists
		if (numoraContainer) {
			numoraContainer.innerHTML = '';
		}

		// Create new instance with current settings
		numoraInput = new NumericInput(numoraContainer!, {
			maxDecimals,
			defaultValue: currentValue,
			readOnly,
			onChange: (value: string) => {
				currentValue = value;
			}
		});

		// Apply disabled state if needed
		if (isDisabled) {
			numoraInput.disable();
		}
	}

	function updateMaxDecimals() {
		createNumoraInput();
	}

	function toggleDisabled() {
		isDisabled = !isDisabled;
		if (numoraInput) {
			isDisabled ? numoraInput.disable() : numoraInput.enable();
		}
	}

	function toggleReadOnly() {
		readOnly = !readOnly;
		createNumoraInput();
	}

	function resetValue() {
		if (numoraInput) {
			numoraInput.setValue('0.00');
			currentValue = '0.00';
		}
	}
</script>

<div class="mx-auto max-w-4xl px-4 py-8 font-sans">
	<h1 class="mb-4 text-3xl font-bold text-gray-900">Numora - Numeric Input Library</h1>
	<p class="mb-8 text-xl text-gray-700">
		A lightweight, framework-agnostic numeric input library for handling currency and decimal inputs
		in financial applications.
	</p>

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold text-gray-800">Live Demo</h2>

		<div
			class="grid gap-8 rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm md:grid-cols-2"
		>
			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-medium text-gray-700">Numora Input</h3>
				<div bind:this={numoraContainer} class="min-h-[50px] py-4"></div>
				<div class="rounded-md bg-gray-100 p-3">
					<span class="text-gray-700">Current value: </span>
					<code class="rounded bg-gray-200 px-1 font-mono">{currentValue}</code>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-medium text-gray-700">Configuration</h3>

				<div class="mb-4 flex flex-col gap-3">
					<label class="flex flex-col gap-1">
						<span class="text-gray-700">Max Decimals:</span>
						<input
							type="number"
							bind:value={maxDecimals}
							min="0"
							max="20"
							on:change={updateMaxDecimals}
							class="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</label>

					<button
						on:click={resetValue}
						class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
					>
						Reset Value
					</button>
				</div>

				<div class="flex flex-col gap-3">
					<label class="flex items-center gap-2 text-gray-700">
						<input
							type="checkbox"
							bind:checked={isDisabled}
							on:change={toggleDisabled}
							class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500"
						/>
						Disabled
					</label>

					<label class="flex items-center gap-2 text-gray-700">
						<input
							type="checkbox"
							bind:checked={readOnly}
							on:change={toggleReadOnly}
							class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500"
						/>
						Read Only
					</label>
				</div>
			</div>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold text-gray-800">Integration Example</h2>

		<div class="flex flex-col gap-8">
			<div>
				<h3 class="mb-2 text-lg font-medium text-gray-700">Vanilla JavaScript</h3>
				<pre class="overflow-x-auto rounded-lg bg-gray-100 p-4"><code class="language-javascript"
						>{`import { NumericInput } from 'numora';

// Get container element
const container = document.getElementById('input-container');

// Create NumericInput instance
const numericInput = new NumericInput(container, {
  maxDecimals: 2,
  defaultValue: '0.00',
  onChange: (value) => {
    console.log('Value changed:', value);
    // example: integrate react-hook-form (React support coming soon)
  }
});

// Access methods
numericInput.getValue();
numericInput.setValue('123.45');
numericInput.focus();
numericInput.disable();
numericInput.enable();`}</code
					></pre>
			</div>

			<div>
				<h3 class="mb-2 text-lg font-medium text-gray-700">Svelte</h3>
			</div>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold text-gray-800">API Reference</h2>

		<h3 class="mb-3 text-lg font-medium text-gray-700">Constructor Options</h3>
		<div class="overflow-x-auto">
			<table class="mb-8 w-full">
				<thead>
					<tr>
						<th
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700"
							>Option</th
						>
						<th
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700"
							>Type</th
						>
						<th
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700"
							>Default</th
						>
						<th
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700"
							>Description</th
						>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">maxDecimals</td>
						<td class="border-b border-gray-200 px-4 py-3">number</td>
						<td class="border-b border-gray-200 px-4 py-3">15</td>
						<td class="border-b border-gray-200 px-4 py-3"
							>Maximum number of decimal places allowed</td
						>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">defaultValue</td>
						<td class="border-b border-gray-200 px-4 py-3">string</td>
						<td class="border-b border-gray-200 px-4 py-3">''</td>
						<td class="border-b border-gray-200 px-4 py-3">Initial value of the input</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">readOnly</td>
						<td class="border-b border-gray-200 px-4 py-3">boolean</td>
						<td class="border-b border-gray-200 px-4 py-3">false</td>
						<td class="border-b border-gray-200 px-4 py-3">Makes the input read-only</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">additionalStyle</td>
						<td class="border-b border-gray-200 px-4 py-3">string</td>
						<td class="border-b border-gray-200 px-4 py-3">''</td>
						<td class="border-b border-gray-200 px-4 py-3"
							>Additional CSS classes to add to the input</td
						>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">autoFocus</td>
						<td class="border-b border-gray-200 px-4 py-3">boolean</td>
						<td class="border-b border-gray-200 px-4 py-3">false</td>
						<td class="border-b border-gray-200 px-4 py-3"
							>Whether to focus the input when mounted</td
						>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">onChange</td>
						<td class="border-b border-gray-200 px-4 py-3">function</td>
						<td class="border-b border-gray-200 px-4 py-3">undefined</td>
						<td class="border-b border-gray-200 px-4 py-3"
							>Callback function that runs when the input value changes</td
						>
					</tr>
				</tbody>
			</table>
		</div>

		<h3 class="mb-3 text-lg font-medium text-gray-700">Methods</h3>
		<div class="overflow-x-auto">
			<table class="mb-8 w-full">
				<thead>
					<tr>
						<th
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700"
							>Method</th
						>
						<th
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700"
							>Arguments</th
						>
						<th
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700"
							>Description</th
						>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">getValue()</td>
						<td class="border-b border-gray-200 px-4 py-3">None</td>
						<td class="border-b border-gray-200 px-4 py-3">Gets the current value of the input</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">setValue(value)</td>
						<td class="border-b border-gray-200 px-4 py-3">value: string</td>
						<td class="border-b border-gray-200 px-4 py-3">Sets the value of the input</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">focus()</td>
						<td class="border-b border-gray-200 px-4 py-3">None</td>
						<td class="border-b border-gray-200 px-4 py-3">Focuses the input</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">disable()</td>
						<td class="border-b border-gray-200 px-4 py-3">None</td>
						<td class="border-b border-gray-200 px-4 py-3">Disables the input</td>
					</tr>
					<tr>
						<td class="border-b border-gray-200 px-4 py-3">enable()</td>
						<td class="border-b border-gray-200 px-4 py-3">None</td>
						<td class="border-b border-gray-200 px-4 py-3">Enables the input</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 text-2xl font-semibold text-gray-800">Installation</h2>

		<pre class="mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4"><code>npm i numora</code></pre>

		<p class="mb-2 text-gray-700">Or if you're using pnpm:</p>
		<pre class="overflow-x-auto rounded-lg bg-gray-100 p-4"><code>pnpm i numora</code></pre>
	</section>
</div>
