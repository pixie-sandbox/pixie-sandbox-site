'use client';

interface TitleSearchProps {
  /** Current search query value. */
  value: string;
  /** Called whenever the search input changes. */
  onChange: (value: string) => void;
}

/**
 * A labelled text input for filtering changelog entries by title.
 *
 * Renders a visible 'Search' label, a text input, and (when the input contains
 * non-whitespace text) a clear (×) button inside the input on the right.
 *
 * Accessibility: carries a visible <label> and the clear control is a real
 * focusable <button> with aria-label='Clear search'.
 */
export default function TitleSearch({ value, onChange }: TitleSearchProps) {
  const hasClear = value.trim().length > 0;

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="title-search"
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Search
      </label>
      <div className="relative">
        <input
          id="title-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter by title…"
          className="text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 pr-7"
        />
        {hasClear && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-1 flex items-center px-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
