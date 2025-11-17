/**
 * Swap calculation utilities
 * Follows Single Responsibility Principle - handles only swap calculations
 */

import type { PriceData } from '../services/priceService';
import type { TokenSymbol } from '../constants/tokens';

/**
 * Calculate the output amount for a token swap
 * @param fromAmount - Input amount as string
 * @param fromToken - Source token symbol
 * @param toToken - Destination token symbol
 * @param prices - Current token prices
 * @param toDecimals - Decimal places for output token
 * @returns Calculated output amount as string
 */
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

  // Calculate USD value of input amount
  const fromValueUSD = parseFloat(fromAmount) * fromPrice;

  // Convert to output token
  const toTokenAmount = fromValueUSD / toPrice;

  return toTokenAmount.toFixed(toDecimals);
}

/**
 * Calculate the input amount needed for a desired output amount (reverse calculation)
 * @param toAmount - Desired output amount as string
 * @param fromToken - Source token symbol
 * @param toToken - Destination token symbol
 * @param prices - Current token prices
 * @param fromDecimals - Decimal places for input token
 * @returns Calculated input amount as string
 */
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

  // Calculate USD value of desired output amount
  const toValueUSD = parseFloat(toAmount) * toPrice;

  // Convert to input token
  const fromTokenAmount = toValueUSD / fromPrice;

  return fromTokenAmount.toFixed(fromDecimals);
}

/**
 * Calculate exchange rate between two tokens
 * @param fromToken - Source token symbol
 * @param toToken - Destination token symbol
 * @param prices - Current token prices
 * @returns Exchange rate formatted as string
 */
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
