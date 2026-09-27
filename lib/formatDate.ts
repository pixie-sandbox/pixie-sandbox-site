/**
 * Formats an ISO 8601 date string (YYYY-MM-DD) as 'DD MMM YYYY'.
 *
 * Parses the date portion directly to avoid timezone-offset shifts.
 * Example: '2026-08-29' → '29 Aug 2026'.
 *
 * Complies with ANZ Digital Date & Time Display Standard (DTS-04 §1):
 * absolute dates always render as DD MMM YYYY on customer-facing surfaces.
 */
export function formatDate(isoString: string): string {
  const [year, month, day] = isoString.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
