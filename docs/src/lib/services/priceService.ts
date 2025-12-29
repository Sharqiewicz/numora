import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base } from 'viem/chains';
import { PRICE_FEEDS, PRICE_FEED_ABI, type NetworkName } from '../constants/priceFeeds';
import type { TokenSymbol } from '../constants/tokens';

export interface PriceData {
  ETH: number;
  USDC: number;
  cbBTC: number;
  wstETH: number;
  EURC: number;
}

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

    const price = Number(formatUnits(data[1], 8));
    return price;
  } catch (err) {
    console.error(`Error fetching ${symbol} price on ${network}:`, err);
    return 0;
  }
}

export async function fetchAllTokenPrices(network: NetworkName): Promise<PriceData> {
  const [ethPrice, usdcPrice, cbBTCPrice, wstETHPrice, eurcPrice] =
    await Promise.all([
      fetchPrice('ETH', network),
      fetchPrice('USDC', network),
      fetchPrice('cbBTC', network),
      fetchPrice('wstETH', network),
      fetchPrice('EURC', network),
    ]);

  return {
    ETH: ethPrice,
    USDC: usdcPrice,
    cbBTC: cbBTCPrice,
    wstETH: wstETHPrice,
    EURC: eurcPrice,
  };
}

