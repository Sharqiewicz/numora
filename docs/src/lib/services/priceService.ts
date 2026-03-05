import { createPublicClient, http, formatUnits, getAddress } from 'viem';
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

const WSTETH_CONTRACT = {
  mainnet: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
} as const;

const WSTETH_ABI = [
  {
    inputs: [],
    name: 'stEthPerToken',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function fetchPrice(symbol: TokenSymbol, network: NetworkName): Promise<number> {
  try {
    const feedAddress = PRICE_FEEDS[network][symbol];
    if (!feedAddress) return 0;

    const client = clients[network];
    const data = await client.readContract({
      address: getAddress(feedAddress),
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

async function fetchWstETHPrice(ethPrice: number, network: NetworkName): Promise<number> {
  try {
    if (network === 'base') {
      return fetchPrice('wstETH', network);
    }

    const client = clients.mainnet;
    const stEthPerToken = await client.readContract({
      address: getAddress(WSTETH_CONTRACT.mainnet),
      abi: WSTETH_ABI,
      functionName: 'stEthPerToken',
    });

    const ratio = Number(formatUnits(stEthPerToken, 18));
    return ethPrice * ratio;
  } catch (err) {
    console.error(`Error fetching wstETH price on ${network}:`, err);
    return 0;
  }
}

export async function fetchAllTokenPrices(network: NetworkName): Promise<PriceData> {
  const [ethPrice, usdcPrice, cbBTCPrice, eurcPrice] =
    await Promise.all([
      fetchPrice('ETH', network),
      fetchPrice('USDC', network),
      fetchPrice('cbBTC', network),
      fetchPrice('EURC', network),
    ]);

  const wstETHPrice = await fetchWstETHPrice(ethPrice, network);

  return {
    ETH: ethPrice,
    USDC: usdcPrice,
    cbBTC: cbBTCPrice,
    wstETH: wstETHPrice,
    EURC: eurcPrice,
  };
}

