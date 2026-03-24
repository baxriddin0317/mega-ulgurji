/**
 * Format a price value in Uzbek Som (UZS) with proper spacing.
 * Examples:
 *   formatUZS(1500000) → "1 500 000 so'm"
 *   formatUZS("1500000") → "1 500 000 so'm"
 *   formatUZS(43) → "43 so'm"
 *   formatUZS(0) → "0 so'm"
 */
export function formatUZS(price: string | number): string {
  const num = typeof price === 'string' ? Number(price) : price;
  if (isNaN(num)) return "0 so'm";
  const formatted = new Intl.NumberFormat('uz-UZ', {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(num).replace(/,/g, ' ');
  return `${formatted} so'm`;
}

/**
 * Format a price value as raw number with spaces (no currency suffix).
 * Useful when you want to add the currency label separately.
 * Examples:
 *   formatNumber(1500000) → "1 500 000"
 *   formatNumber("43") → "43"
 */
export function formatNumber(price: string | number): string {
  const num = typeof price === 'string' ? Number(price) : price;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('uz-UZ', {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(num).replace(/,/g, ' ');
}
