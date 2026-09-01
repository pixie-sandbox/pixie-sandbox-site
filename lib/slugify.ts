/**
 * Converts a string into a URL-safe slug suitable for use as an HTML anchor ID.
 *
 * Rules applied (in order):
 * 1. Lowercase the entire string.
 * 2. Strip characters that are not alphanumeric, spaces, or hyphens.
 * 3. Trim leading/trailing whitespace.
 * 4. Replace runs of whitespace with a single hyphen.
 * 5. Collapse consecutive hyphens into one.
 * 6. Strip any remaining leading/trailing hyphens.
 *
 * @example
 * slugify('New Feature Released!') // => 'new-feature-released'
 * slugify('Hello  World')          // => 'hello-world'
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
