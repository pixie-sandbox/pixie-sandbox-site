'use client';

import { useId, type ReactNode } from 'react';

interface TooltipProps {
  /** The text to display inside the tooltip. */
  content: string;
  children: ReactNode;
}

/**
 * A simple, accessible CSS tooltip that appears on hover.
 *
 * Accessibility: the tooltip element carries role="tooltip" and is linked to
 * the trigger via aria-describedby so screen readers announce the content when
 * the trigger is focused or hovered.
 *
 * Styling: Tailwind-only, zinc-based, supports light and dark modes.
 */
export default function Tooltip({ content, children }: TooltipProps) {
  const id = useId();

  return (
    <span className="relative group inline-block">
      <span aria-describedby={id}>{children}</span>
      <span
        id={id}
        role="tooltip"
        className={[
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5',
          'px-2 py-1 text-xs rounded whitespace-nowrap',
          'bg-zinc-800 text-zinc-50',
          'dark:bg-zinc-200 dark:text-zinc-900',
          'invisible opacity-0',
          'group-hover:visible group-hover:opacity-100',
          'transition-opacity duration-150',
          'pointer-events-none z-10',
        ].join(' ')}
      >
        {content}
      </span>
    </span>
  );
}
