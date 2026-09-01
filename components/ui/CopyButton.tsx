'use client';

import { useState } from 'react';

interface CopyButtonProps {
  /** The slug identifying the entry anchor (without the leading '#'). */
  slug: string;
}

/**
 * A small, muted button that copies a permalink to the current page entry to
 * the clipboard. Shows 'Copied' for two seconds after a successful copy, then
 * reverts to 'Link'.
 *
 * Accessibility: carries an aria-label so screen readers announce its purpose.
 * Styling: uses muted zinc Tailwind tokens so the button stays visually
 * secondary to the entry title.
 */
export default function CopyButton({ slug }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url =
      window.location.href.split('#')[0] + '#' + slug;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Copy permalink to this entry"
      className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
    >
      {copied ? 'Copied' : 'Link'}
    </button>
  );
}
