import { FormatOn, GroupingStyle } from './types';

// Precision-first default for the DeFi/crypto audience: token amounts routinely need
// 6 (USDC), 8 (WBTC), or 18 (most ERC-20) decimals. A low default silently truncated
// precision - the exact failure this library exists to prevent. Fiat/checkout callers
// opt down (e.g. decimalMaxLength: 2).
export const DEFAULT_DECIMAL_MAX_LENGTH = 18;
export const DEFAULT_DECIMAL_MIN_LENGTH = 0;
export const DEFAULT_FORMAT_ON = FormatOn.Blur;
export const DEFAULT_THOUSAND_SEPARATOR = ',';
// A truthy thousandSeparator (the default is ',') implies grouping, so the grouping style
// defaults to Thousand. This also aligns the core default with the React component (which
// already defaulted to Thousand). Pass GroupingStyle.None to disable grouping.
export const DEFAULT_GROUPING_STYLE = GroupingStyle.Thousand;
export const DEFAULT_DECIMAL_SEPARATOR = '.';
export const DEFAULT_ENABLE_COMPACT_NOTATION = false;
export const DEFAULT_ENABLE_NEGATIVE = false;
export const DEFAULT_ENABLE_LEADING_ZEROS = false;
export const DEFAULT_AUTO_ADD_LEADING_ZERO = false;
export const DEFAULT_EMIT_RAW_VALUE = false;
