/**
 * Calculates the estimated reading time for a given description string.
 *
 * Word count is derived by splitting on whitespace (handles extra spaces).
 * Rate: 200 words per minute, rounded up (Math.ceil).
 * Minimum: 1 min read, regardless of word count.
 *
 * @param description - The entry description text.
 * @returns A string in the form "X min read".
 */
export function calculateReadingTime(description: string): string {
  const words = description.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}
