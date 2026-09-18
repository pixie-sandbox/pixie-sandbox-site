'use client';

interface YearFilterProps {
  /** Available years in descending order (newest first). */
  years: number[];
  /** Currently selected year, or null for 'All years'. */
  selected: number | null;
  /** Called with the new year selection, or null for 'All years'. */
  onChange: (year: number | null) => void;
}

/**
 * A labelled native <select> control for filtering changelog entries by year.
 *
 * Accessibility: carries a visible <label> and an aria-label on the <select>
 * so both sighted and assistive-technology users can identify the control.
 * Keyboard operability is provided by native <select> semantics.
 */
export default function YearFilter({ years, selected, onChange }: YearFilterProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <label
        htmlFor="year-filter"
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Year:
      </label>
      <select
        id="year-filter"
        aria-label="Filter entries by year"
        value={selected ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? null : parseInt(val, 10));
        }}
        className="text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1"
      >
        <option value="">All years</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
