import ETH from '@/assets/tokens/ETH.svg';
import USDC from '@/assets/tokens/USDC.png';
import cbBTC from '@/assets/tokens/CBBTC.svg';
import wstETH from '@/assets/tokens/WSTETH.svg';
import EURC from '@/assets/tokens/EURC.svg';

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  logoImg: string;
  decimals: number;
}

export type TokenSymbol = 'ETH' | 'USDC' | 'cbBTC' | 'wstETH' | 'EURC';

export const TOKENS: TokenInfo[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    logoImg: ETH,
    decimals: 18,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    logoImg: USDC,
    decimals: 6,
  },
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    logoImg: cbBTC,
    decimals: 8,
  },
  {
    symbol: 'wstETH',
    name: 'Wrapped Staked ETH',
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    logoImg: wstETH,
    decimals: 18,
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    logoImg: EURC,
    decimals: 6,
  },
];
