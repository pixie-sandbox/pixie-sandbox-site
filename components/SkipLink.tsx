/**
 * SkipLink — accessibility bypass-block component.
 *
 * Renders as the first focusable element in the DOM. It is visually hidden
 * (off-screen via sr-only) for mouse users, and becomes visible when it
 * receives keyboard focus, satisfying WCAG 2.1 Success Criterion 2.4.1.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black focus:shadow-md focus:outline-2 focus:outline-offset-2 focus:outline-black dark:focus:bg-zinc-900 dark:focus:text-white dark:focus:outline-white"
    >
      Skip to main content
    </a>
  );
}
