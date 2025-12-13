import { writable } from 'svelte/store';

export interface NumoraConfig {
  fromDecimals: number;
  toDecimals: number;
  fromPlaceholder: string;
  toPlaceholder: string;
}

export const numoraConfig = writable<NumoraConfig>({
  fromDecimals: 4,
  toDecimals: 4,
  fromPlaceholder: '0.0',
  toPlaceholder: '0.0',
});

