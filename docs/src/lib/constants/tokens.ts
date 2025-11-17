/**
 * Token definitions and configurations
 */

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  logoURI: string;
  decimals: number;
}

export type TokenSymbol = 'ETH' | 'WETH' | 'USDC' | 'DAI' | 'cbBTC' | 'wstETH' | 'EURC';

export const TOKENS: TokenInfo[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    logoURI: '/ETH.svg',
    decimals: 18,
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    logoURI: '/WETH.svg',
    decimals: 18,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    logoURI: '/USDC.png',
    decimals: 6,
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    logoURI: '/DAI.svg',
    decimals: 18,
  },
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    logoURI: '/CBBTC.svg',
    decimals: 8,
  },
  {
    symbol: 'wstETH',
    name: 'Wrapped Staked ETH',
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    logoURI: '/WSTETH.svg',
    decimals: 18,
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    logoURI: '/EURC.svg',
    decimals: 6,
  },
];
