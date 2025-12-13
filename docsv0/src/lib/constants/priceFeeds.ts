/**
 * Chainlink Price Feed addresses for different networks
 */

import type { TokenSymbol } from './tokens';

export type NetworkName = 'mainnet' | 'base';

export type PriceFeedsConfig = {
  [K in NetworkName]: {
    [T in TokenSymbol]: string;
  };
};

/**
 * Chainlink Price Feed contract addresses
 */
export const PRICE_FEEDS: PriceFeedsConfig = {
  mainnet: {
    ETH: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    WETH: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // Same as ETH
    USDC: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    DAI: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
    cbBTC: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    wstETH: '0x164b276057258d81941e97B5e3134145e10fEd1F',
    EURC: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
  },
  base: {
    ETH: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
    WETH: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
    USDC: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
    DAI: '0x591e79239a7d679c7e06cc7c1b0AAf69e9ae2AFF',
    cbBTC: '0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D',
    wstETH: '0x43a5C292A453A3bF3606fa856197f09D7B74251a',
    EURC: '0xDAe398520e2B67cd3f27aeF9Cf14D93D927f8250',
  },
};

/**
 * Minimal Chainlink Price Feed ABI
 */
export const PRICE_FEED_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
