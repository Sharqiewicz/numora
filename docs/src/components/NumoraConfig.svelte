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

<div class="numora-config-container">
  <h3 class="config-title">Numora Configuration</h3>
  <p class="config-description">Modify Numora field values to see changes in the swap component above</p>

  <div class="config-grid">
    <div class="config-group">
      <h4 class="config-group-title">From Token</h4>
      <div class="config-field">
        <label for="from-decimals">Decimals:</label>
        <input
          id="from-decimals"
          type="number"
          min="0"
          max="20"
          value={$numoraConfig.fromDecimals}
          oninput={updateFromDecimals}
          class="config-input"
        />
        <span class="config-hint">Max decimal places (0-20)</span>
      </div>
      <div class="config-field">
        <label for="from-placeholder">Placeholder:</label>
        <input
          id="from-placeholder"
          type="text"
          value={$numoraConfig.fromPlaceholder}
          oninput={updateFromPlaceholder}
          class="config-input"
        />
        <span class="config-hint">Input placeholder text</span>
      </div>
    </div>

    <div class="config-group">
      <h4 class="config-group-title">To Token</h4>
      <div class="config-field">
        <label for="to-decimals">Decimals:</label>
        <input
          id="to-decimals"
          type="number"
          min="0"
          max="20"
          value={$numoraConfig.toDecimals}
          oninput={updateToDecimals}
          class="config-input"
        />
        <span class="config-hint">Max decimal places (0-20)</span>
      </div>
      <div class="config-field">
        <label for="to-placeholder">Placeholder:</label>
        <input
          id="to-placeholder"
          type="text"
          value={$numoraConfig.toPlaceholder}
          oninput={updateToPlaceholder}
          class="config-input"
        />
        <span class="config-hint">Input placeholder text</span>
      </div>
    </div>
  </div>

  <div class="config-preview">
    <div class="preview-item">
      <span class="preview-label">From Input Decimals:</span>
      <span class="preview-value">{$numoraConfig.fromDecimals}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">To Input Decimals:</span>
      <span class="preview-value">{$numoraConfig.toDecimals}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">From Placeholder:</span>
      <span class="preview-value">"{$numoraConfig.fromPlaceholder}"</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">To Placeholder:</span>
      <span class="preview-value">"{$numoraConfig.toPlaceholder}"</span>
    </div>
  </div>
</div>

<style>
  .numora-config-container {
    margin-top: 3rem;
    padding: 1.5rem;
    background-color: #181a1b;
    border: 1px solid #23272b;
    border-radius: 0.75rem;
    max-width: 28rem;
    margin-left: auto;
    margin-right: auto;
  }

  .config-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .config-description {
    font-size: 0.875rem;
    color: #a0a3c4;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .config-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .config-group-title {
    font-size: 1rem;
    font-weight: 600;
    color: #a0a3c4;
    margin-bottom: 0.5rem;
  }

  .config-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .config-field label {
    font-size: 0.875rem;
    color: #d1d5db;
    font-weight: 500;
  }

  .config-input {
    padding: 0.5rem;
    background-color: #23272b;
    border: 1px solid #2d3135;
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
  }

  .config-input:focus {
    outline: none;
    border-color: #5b2ff5;
    box-shadow: 0 0 0 2px rgba(91, 47, 245, 0.2);
  }

  .config-hint {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .config-preview {
    padding-top: 1rem;
    border-top: 1px solid #23272b;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .preview-label {
    color: #a0a3c4;
  }

  .preview-value {
    color: #5b2ff5;
    font-weight: 600;
    font-family: monospace;
  }

  :global(html[data-theme="light"]) .numora-config-container,
  :global(html:not([data-theme="dark"])) .numora-config-container {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
  }

  :global(html[data-theme="light"]) .config-title,
  :global(html:not([data-theme="dark"])) .config-title {
    color: #111827;
  }

  :global(html[data-theme="light"]) .config-description,
  :global(html:not([data-theme="dark"])) .config-description {
    color: #6b7280;
  }

  :global(html[data-theme="light"]) .config-group-title,
  :global(html:not([data-theme="dark"])) .config-group-title {
    color: #6b7280;
  }

  :global(html[data-theme="light"]) .config-field label,
  :global(html:not([data-theme="dark"])) .config-field label {
    color: #374151;
  }

  :global(html[data-theme="light"]) .config-input,
  :global(html:not([data-theme="dark"])) .config-input {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #111827;
  }

  :global(html[data-theme="light"]) .config-input:focus,
  :global(html:not([data-theme="dark"])) .config-input:focus {
    border-color: #5b2ff5;
    box-shadow: 0 0 0 2px rgba(91, 47, 245, 0.1);
  }

  :global(html[data-theme="light"]) .config-hint,
  :global(html:not([data-theme="dark"])) .config-hint {
    color: #9ca3af;
  }

  :global(html[data-theme="light"]) .config-preview,
  :global(html:not([data-theme="dark"])) .config-preview {
    border-top-color: #e5e7eb;
  }

  :global(html[data-theme="light"]) .preview-label,
  :global(html:not([data-theme="dark"])) .preview-label {
    color: #6b7280;
  }

  @media (max-width: 640px) {
    .config-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

