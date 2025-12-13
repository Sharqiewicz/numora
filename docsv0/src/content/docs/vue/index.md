---
title: Vue Guide
description: Using Numora with Vue
---

# Numora for Vue

Guide to using Numora with Vue. Since Numora is framework-agnostic, you can use it directly in Vue components.

## Status

**Note:** A dedicated Vue adapter package (`numora-vue`) is coming soon. For now, you can use the core `numora` package directly in Vue applications.

## Installation

```bash
npm install numora
# or
yarn add numora
# or
pnpm add numora
# or
bun add numora
```

## Basic Usage with NumoraInput

```vue
<template>
  <div ref="container"></div>
  <div>Current value: {{ value }}</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { NumoraInput } from 'numora';

const container = ref(null);
let numoraInputInstance = null;
const value = ref('0');

onMounted(() => {
  numoraInputInstance = new NumoraInput(container.value, {
    decimalMaxLength: 2,
    onChange: (newValue) => {
      value.value = newValue;
      console.log('Value changed:', newValue);
    },
  });
});

onBeforeUnmount(() => {
  if (numoraInputInstance && container.value) {
    container.value.innerHTML = '';
  }
});
</script>
```

## Using Event Handlers Directly

For more control, you can use Numora's event handlers directly with Vue's event handlers:

```vue
<template>
  <input
    type="text"
    inputmode="decimal"
    placeholder="0.0"
    :value="fromAmount"
    @input="handleFromInputChange"
    @paste="handleFromInputPaste"
  />
</template>

<script setup>
import { ref } from 'vue';
import { handleOnChangeNumoraInput, handleOnPasteNumoraInput } from 'numora';
import { FormatOn, ThousandStyle } from 'numora';

const fromAmount = ref('1');
const decimals = 18;

function handleFromInputChange(e) {
  handleOnChangeNumoraInput(e, decimals, undefined, {
    formatOn: FormatOn.Change,
    thousandSeparator: ',',
    ThousandStyle: ThousandStyle.Thousand,
  });
  fromAmount.value = e.target.value;
}

function handleFromInputPaste(e) {
  handleOnPasteNumoraInput(e, decimals, {
    enableCompactNotation: true,
  });
  fromAmount.value = e.target.value;
}
</script>
```

## Advanced Example with Reactive Configuration

```vue
<template>
  <div class="config">
    <label>
      Max Decimals:
      <input type="number" v-model.number="decimalMaxLength" min="0" max="20" />
    </label>
    <label>
      Thousand Separator:
      <input type="text" v-model="thousandSeparator" />
    </label>
    <label>
      Format On:
      <select v-model="formatOn">
        <option :value="FormatOn.Blur">Blur</option>
        <option :value="FormatOn.Change">Change</option>
      </select>
    </label>
    <label>
      <input type="checkbox" v-model="enableCompactNotation" />
      Enable Compact Notation
    </label>
  </div>

  <div ref="container"></div>
  <div>Value: {{ value }}</div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const container = ref(null);
let numoraInputInstance = null;
const value = ref('');

const decimalMaxLength = ref(18);
const thousandSeparator = ref(',');
const formatOn = ref(FormatOn.Blur);
const enableCompactNotation = ref(false);

function createInput() {
  if (numoraInputInstance && container.value) {
    container.value.innerHTML = '';
  }

  if (container.value) {
    numoraInputInstance = new NumoraInput(container.value, {
      decimalMaxLength: decimalMaxLength.value,
      thousandSeparator: thousandSeparator.value,
      thousandStyle: ThousandStyle.Thousand,
      formatOn: formatOn.value,
      enableCompactNotation: enableCompactNotation.value,
      onChange: (newValue) => {
        value.value = newValue;
      },
    });
  }
}

onMounted(() => {
  createInput();
});

onBeforeUnmount(() => {
  if (numoraInputInstance && container.value) {
    container.value.innerHTML = '';
  }
});

watch([decimalMaxLength, thousandSeparator, formatOn, enableCompactNotation], () => {
  createInput();
});
</script>
```

## Using with Vue Composables

```vue
<template>
  <div ref="container"></div>
  <div>Amount: {{ amount }}</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { NumoraInput } from 'numora';

const container = ref(null);
let numoraInputInstance = null;
const amount = ref('0');

onMounted(() => {
  numoraInputInstance = new NumoraInput(container.value, {
    decimalMaxLength: 2,
    rawValueMode: true,
    onChange: (value) => {
      amount.value = value;
    },
  });
});

onBeforeUnmount(() => {
  if (numoraInputInstance && container.value) {
    container.value.innerHTML = '';
  }
});
</script>
```

## Best Practices for Vue

1. **Clean up on unmount** - Always clean up the container when the component is unmounted
2. **Use reactive refs** - Update Vue refs in the onChange callback for reactivity
3. **Recreate instance on config changes** - If configuration changes, recreate the NumoraInput instance
4. **Use rawValueMode for calculations** - Get unformatted values when you need to perform calculations
5. **Handle edge cases** - Empty inputs, zero values, etc.
6. **Use watch for reactive updates** - Watch configuration changes and recreate the instance

## Features Available in Vue

All Numora features are available in Vue:

- ✅ Decimal precision control (min/max)
- ✅ Thousand separators with customizable grouping styles
- ✅ Format on blur/change modes
- ✅ Compact notation expansion
- ✅ Scientific notation expansion (always automatic)
- ✅ Paste event handling
- ✅ Cursor position preservation
- ✅ Mobile keyboard optimization
- ✅ Raw value mode
- ✅ Display formatting utilities

## Coming Soon

A dedicated `numora-vue` package is in development that will provide:

- Vue component wrapper
- Better Vue integration
- Simplified API
- TypeScript support

## Related

- [Vanilla JS Guide](/docs/vanilla) - Core package documentation
- [Examples](/docs/general/example) - More usage examples
- [React Guide](/docs/react) - React integration (for reference)
