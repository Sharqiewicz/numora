/**
 * Type definitions and constants for number formatting
 */

export type thousandStyle = 'thousand' | 'lakh' | 'wan';

/**
 * Configuration for different grouping styles used in number formatting.
 *
 * - thousand: Groups by 3 digits (Western style) - 1,234,567
 * - lakh: First group of 3, then groups of 2 (Indian style) - 12,34,567
 * - wan: Groups by 4 digits (Chinese style) - 123,4567
 */
export const GROUPING_CONFIG = {
  thousand: { size: 3 },
  lakh: { firstGroup: 3, restGroup: 2 },
  wan: { size: 4 },
} as const;

/**
 * Interface representing a change range in the input value.
 * Used to distinguish between Delete and Backspace operations.
 */
export interface ChangeRange {
  start: number;
  end: number;
  deletedLength: number;
  isDelete?: boolean;
}
