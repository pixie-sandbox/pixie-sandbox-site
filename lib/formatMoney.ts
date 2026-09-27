/**
 * Formats an AUD amount as a currency string.
 *
 * Always two decimal places, locale 'en-AU', currency 'AUD'.
 * A signed prefix ('+' or '-') is prepended outside the currency symbol
 * so it reads as e.g. '+$1,234.56' or '-$45.00'.
 *
 * The `signed` parameter defaults to false (no explicit sign prefix).
 * Pass `signed: true` for transaction amounts on account detail pages.
 */
export function formatMoney(amount: number, signed = false): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);

  if (!signed) return formatted;
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}
