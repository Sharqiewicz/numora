import type { PriceData } from '../services/priceService';
import type { TokenSymbol } from '../constants/tokens';

/** "0.02940500" -> "0.029405", "1.000" -> "1". */
function trimTrailingZeros(value: string): string {
  return value.includes('.') ? value.replace(/\.?0+$/, '') : value;
}

export function calculateSwapAmount(
  fromAmount: string,
  fromToken: TokenSymbol,
  toToken: TokenSymbol,
  prices: PriceData,
  toDecimals: number
): string {
  if (!fromAmount || Number(fromAmount) <= 0) {
    return '';
  }

  const fromPrice = prices[fromToken] || 0;
  const toPrice = prices[toToken] || 1;

  if (fromPrice <= 0 || toPrice <= 0) {
    return '';
  }

  const fromValueUSD = parseFloat(fromAmount) * fromPrice;
  const toTokenAmount = fromValueUSD / toPrice;

  return trimTrailingZeros(toTokenAmount.toFixed(toDecimals));
}

export function calculateReverseSwapAmount(
  toAmount: string,
  fromToken: TokenSymbol,
  toToken: TokenSymbol,
  prices: PriceData,
  fromDecimals: number
): string {
  if (!toAmount || Number(toAmount) <= 0) {
    return '';
  }

  const fromPrice = prices[fromToken] || 0;
  const toPrice = prices[toToken] || 1;

  if (fromPrice <= 0 || toPrice <= 0) {
    return '';
  }

  const toValueUSD = parseFloat(toAmount) * toPrice;
  const fromTokenAmount = toValueUSD / fromPrice;

  return trimTrailingZeros(fromTokenAmount.toFixed(fromDecimals));
}

export function calculateExchangeRate(
  fromToken: TokenSymbol,
  toToken: TokenSymbol,
  prices: PriceData
): string {
  const fromPrice = prices[fromToken] || 0;
  const toPrice = prices[toToken] || 1;

  if (fromPrice <= 0 || toPrice <= 0) {
    return '-';
  }

  const rate = fromPrice / toPrice;
  return rate.toFixed(6);
}
