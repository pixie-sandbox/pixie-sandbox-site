'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { type ChangelogEntryData } from '@/components/changelog/ChangelogEntry';
import ChangelogList from '@/components/changelog/ChangelogList';
import TitleSearch from '@/components/changelog/TitleSearch';
import YearFilter from '@/components/changelog/YearFilter';

/**
 * Maximum number of characters stored in the ?q= URL parameter.
 * Read and write paths both apply this cap so a shared link never carries
 * more than the page will read back.
 */
const QUERY_MAX_LENGTH = 200;

interface ChangelogFilteredListProps {
  /** All changelog entries, pre-sorted newest-first by the server page. */
  entries: ChangelogEntryData[];
}

/**
 * Client wrapper that owns the year-filter state, derives the year list from
 * the supplied entries, filters before passing to ChangelogList, and renders
 * the entry count and filter control above the list.
 *
 * Filter state is URL-backed: ?year= and ?q= are read on every render via
 * useSearchParams, and changes are written back via router.replace (not push)
 * so that the browser Back button leaves /changelog rather than stepping through
 * every keystroke or year change.
 */
export default function ChangelogFilteredList({ entries }: ChangelogFilteredListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Derive per-year counts and sorted-unique year list from entries, newest year first.
  // Year extraction relies on the ISO 8601 date convention in data/changelog.json.
  // Counts are derived inline from the same entries array to stay in sync with the list.
  const yearCountMap: Record<number, number> = {};
  for (const e of entries) {
    const y = new Date(e.date).getUTCFullYear();
    yearCountMap[y] = (yearCountMap[y] ?? 0) + 1;
  }
  const years = Object.keys(yearCountMap)
    .map(Number)
    .sort((a, b) => b - a)
    .map((year) => ({ year, count: yearCountMap[year] }));
  const totalCount = entries.length;
  const validYears = new Set(years.map((y) => y.year));

  // Derive filter values from URL search params on every render (URL is source of truth).
  // ?year=: parse as integer; ignore NaN and years not in the dataset.
  const yearParam = searchParams.get('year');
  const parsedYear = yearParam !== null ? Number.parseInt(yearParam, 10) : NaN;
  const selectedYear: number | null =
    !Number.isNaN(parsedYear) && validYears.has(parsedYear) ? parsedYear : null;

  // ?q=: treat absent, empty, or whitespace-only as no filter.
  // Bound at QUERY_MAX_LENGTH characters at read time so a shared link cannot
  // force an unbounded substring scan on every render (AC14).
  const qParam = (searchParams.get('q') ?? '').slice(0, QUERY_MAX_LENGTH);
  const searchQuery = qParam;

  // Local state for the search input. Initialized from the URL-derived searchQuery
  // so that opening a shared link populates the input correctly. Held separately so
  // that what the reader typed is preserved in the input even though the URL write
  // path caps at QUERY_MAX_LENGTH — the reader sees the full string they entered.
  const [inputValue, setInputValue] = useState(searchQuery);

  // Write URL helpers — use router.replace (not push) to avoid history stack growth.
  function updateUrl(year: number | null, q: string) {
    const params = new URLSearchParams();
    if (year !== null) params.set('year', String(year));
    // Cap the URL value at QUERY_MAX_LENGTH — same bound as the read path (above)
    // so a shared link never carries more than the page will read back.
    const trimmedQ = q.trim().slice(0, QUERY_MAX_LENGTH);
    if (trimmedQ.length > 0) params.set('q', trimmedQ);
    const qs = params.toString();
    router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleYearChange(year: number | null) {
    updateUrl(year, inputValue);
  }

  function handleSearchChange(q: string) {
    setInputValue(q);
    updateUrl(selectedYear, q);
  }

  // Apply year filter first, then title search. Both conditions must match (AND).
  // Whitespace-only search is treated as empty — no additional filtering applied.
  const trimmedQuery = inputValue.trim().toLowerCase();
  const filtered = entries.filter((e) => {
    const yearMatch =
      selectedYear === null || new Date(e.date).getUTCFullYear() === selectedYear;
    const searchMatch =
      trimmedQuery === '' || e.title.toLowerCase().includes(trimmedQuery);
    return yearMatch && searchMatch;
  });

  const countText =
    filtered.length === 1 ? '1 entry' : `${filtered.length} entries`;

  return (
    <>
      <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {countText}
      </p>
      <div className="flex items-center gap-4">
        <TitleSearch value={inputValue} onChange={handleSearchChange} />
        <YearFilter
          years={years}
          totalCount={totalCount}
          selected={selectedYear}
          onChange={handleYearChange}
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">No entries match.</p>
      ) : (
        <ChangelogList entries={filtered} />
      )}
    </>
  );
}
