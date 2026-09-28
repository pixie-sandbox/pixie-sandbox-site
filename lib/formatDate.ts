const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an ISO 8601 date string (YYYY-MM-DD) as 'DD MMM YYYY'.
 *
 * Parses the date portion directly to avoid timezone-offset shifts.
 * Example: '2026-08-29' → '29 Aug 2026'.
 *
 * Month names come from a fixed three-letter table rather than
 * Intl/toLocaleDateString: current ICU data abbreviates September as 'Sept'
 * in en-GB, which breaks the three-letter MMM form.
 *
 * Complies with ANZ Digital Date & Time Display Standard (DTS-04 §1):
 * absolute dates always render as DD MMM YYYY on customer-facing surfaces.
 */
export function formatDate(isoString: string): string {
  const [year, month, day] = isoString.slice(0, 10).split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`;
}
