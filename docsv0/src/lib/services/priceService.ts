/**
 * Service for fetching token prices from Chainlink oracles
 * Follows Single Responsibility Principle - handles only price fetching logic
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base } from 'viem/chains';
import { PRICE_FEEDS, PRICE_FEED_ABI, type NetworkName } from '../constants/priceFeeds';
import type { TokenSymbol } from '../constants/tokens';

export interface PriceData {
  ETH: number;
  WETH: number;
  USDC: number;
  DAI: number;
  cbBTC: number;
  wstETH: number;
  EURC: number;
}

/**
 * Public clients for different networks
 */
const clients = {
  mainnet: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  base: createPublicClient({
    chain: base,
    transport: http(),
  }),
};

/**
 * Fetch price from Chainlink oracle for a specific token
 * @param symbol - Token symbol
 * @param network - Network name (mainnet or base)
 * @returns Price in USD (8 decimals)
 */
export async function fetchPrice(symbol: TokenSymbol, network: NetworkName): Promise<number> {
  try {
    const feedAddress = PRICE_FEEDS[network][symbol];
    if (!feedAddress) return 0;

    const client = clients[network];
    const data = await client.readContract({
      address: feedAddress as `0x${string}`,
      abi: PRICE_FEED_ABI,
      functionName: 'latestRoundData',
    });

    // Chainlink returns price with 8 decimals
    const price = Number(formatUnits(data[1], 8));
    return price;
  } catch (err) {
    console.error(`Error fetching ${symbol} price on ${network}:`, err);
    return 0;
  }
}

/**
 * Fetch all token prices for a given network
 * @param network - Network name (mainnet or base)
 * @returns Object containing prices for all tokens
 */
export async function fetchAllTokenPrices(network: NetworkName): Promise<PriceData> {
  const [ethPrice, wethPrice, usdcPrice, daiPrice, cbBTCPrice, wstETHPrice, eurcPrice] =
    await Promise.all([
      fetchPrice('ETH', network),
      fetchPrice('WETH', network),
      fetchPrice('USDC', network),
      fetchPrice('DAI', network),
      fetchPrice('cbBTC', network),
      fetchPrice('wstETH', network),
      fetchPrice('EURC', network),
    ]);

  return {
    ETH: ethPrice,
    WETH: wethPrice,
    USDC: usdcPrice,
    DAI: daiPrice,
    cbBTC: cbBTCPrice,
    wstETH: wstETHPrice,
    EURC: eurcPrice,
  };
}
