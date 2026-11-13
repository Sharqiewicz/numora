import { FormatOn, GroupingStyle } from './types';

// Precision-first default for the DeFi/crypto audience: token amounts routinely need
// 6 (USDC), 8 (WBTC), or 18 (most ERC-20) decimals. A low default silently truncated
// precision - the exact failure this library exists to prevent. Fiat/checkout callers
// opt down (e.g. decimalMaxLength: 2).
export const DEFAULT_DECIMAL_MAX_LENGTH = 18;
export const DEFAULT_DECIMAL_MIN_LENGTH = 0;
export const DEFAULT_FORMAT_ON = FormatOn.Change;
export const DEFAULT_THOUSAND_SEPARATOR = ',';
// Grouping is on by default. `GroupingStyle.None` is the only way to turn it off.
export const DEFAULT_GROUPING_STYLE = GroupingStyle.Thousand;
export const DEFAULT_DECIMAL_SEPARATOR = '.';
export const DEFAULT_ALLOW_COMPACT_NOTATION = false;
export const DEFAULT_ALLOW_SCIENTIFIC_NOTATION = true;
export const DEFAULT_ALLOW_NEGATIVE = false;
export const DEFAULT_ALLOW_LEADING_ZEROS = false;
export const DEFAULT_PAD_LEADING_ZERO = false;
