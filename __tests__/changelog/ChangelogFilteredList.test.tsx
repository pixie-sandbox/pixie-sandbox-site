import { useReducer } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ChangelogFilteredList from '@/components/changelog/ChangelogFilteredList';

// Reactive mock: router.replace updates the shared params so that the component
// re-renders with the new filter state, matching how Next.js works in production.
// useReducer is imported at the top level to avoid require() inside the factory.
let _currentParams = new URLSearchParams();
let _forceUpdate: (() => void) | null = null;
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => {
    const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
    _forceUpdate = forceUpdate;
    return _currentParams;
  },
  useRouter: () => ({
    replace: (url: string, opts?: unknown) => {
      mockReplace(url, opts);
      const qs = (url.includes('?') ? url.slice(url.indexOf('?') + 1) : '');
      _currentParams = new URLSearchParams(qs);
      _forceUpdate?.();
    },
  }),
  usePathname: () => '/changelog',
}));

beforeEach(() => {
  mockReplace.mockClear();
  _currentParams = new URLSearchParams();
  _forceUpdate = null;
});

// Entries spanning two different years with multiple entries per year.
// Using two years is discriminating: a bug that shows all entries regardless
// of year would surface here, as would a bug that deduplicates years wrong.
const multiYearEntries = [
  { title: 'Entry 2026-C', description: 'Third 2026 entry.', date: '2026-08-29T00:00:00Z' },
  { title: 'Entry 2026-B', description: 'Second 2026 entry.', date: '2026-08-15T00:00:00Z' },
  { title: 'Entry 2025-A', description: 'Only 2025 entry.', date: '2025-12-01T00:00:00Z' },
  { title: 'Entry 2026-A', description: 'First 2026 entry.', date: '2026-01-10T00:00:00Z' },
];

// Pre-sort newest-first, mimicking what the server page does.
const sortedEntries = [...multiYearEntries].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
// sortedEntries order: 2026-08-29, 2026-08-15, 2026-01-10, 2025-12-01

describe('ChangelogFilteredList — year list derivation (AC2, AC3, AC4)', () => {
  it('AC2: renders year options newest-first after "All years"', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });
    const options = within(select).getAllByRole('option');
    expect(options[0]).toHaveTextContent('All years');
    expect(options[1]).toHaveTextContent('2026');
    expect(options[2]).toHaveTextContent('2025');
  });

  it('AC3: each year appears exactly once even with multiple entries per year', () => {
    // Discriminating: three entries in 2026 must produce one option, not three
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });
    const options = within(select).getAllByRole('option');
    const yearOptions = options.filter((o) => o.getAttribute('value') !== '');
    const yearTexts = yearOptions.map((o) => o.textContent ?? '');
    expect(yearTexts.filter((t) => t.startsWith('2026'))).toHaveLength(1);
    expect(yearTexts.filter((t) => t.startsWith('2025'))).toHaveLength(1);
  });
});

describe('ChangelogFilteredList — default state (AC6, AC9)', () => {
  it('AC9: shows the total entry count when "All years" is selected', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    // 4 entries total across both years
    expect(screen.getByText('4 entries')).toBeInTheDocument();
  });

  it('AC6: all entries are visible by default', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    expect(screen.getByText('Entry 2026-C')).toBeInTheDocument();
    expect(screen.getByText('Entry 2026-B')).toBeInTheDocument();
    expect(screen.getByText('Entry 2026-A')).toBeInTheDocument();
    expect(screen.getByText('Entry 2025-A')).toBeInTheDocument();
  });
});

describe('ChangelogFilteredList — filtering behaviour (AC5, AC6, AC7, AC8)', () => {
  it('AC5: selecting 2026 shows only 2026 entries and hides 2025 entries', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });
    fireEvent.change(select, { target: { value: '2026' } });

    // 2026 entries must be visible
    expect(screen.getByText('Entry 2026-C')).toBeInTheDocument();
    expect(screen.getByText('Entry 2026-B')).toBeInTheDocument();
    expect(screen.getByText('Entry 2026-A')).toBeInTheDocument();
    // 2025 entry must be absent — discriminating: a naive "show all" bug fails here
    expect(screen.queryByText('Entry 2025-A')).not.toBeInTheDocument();
  });

  it('AC5: filtered entries preserve newest-first order', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });
    fireEvent.change(select, { target: { value: '2026' } });

    const articles = screen.getAllByRole('article');
    // Expect 2026-08-29 first, then 2026-08-15, then 2026-01-10
    expect(articles[0]).toHaveTextContent('Entry 2026-C');
    expect(articles[1]).toHaveTextContent('Entry 2026-B');
    expect(articles[2]).toHaveTextContent('Entry 2026-A');
  });

  it('AC8: shows correct plural count when a year with multiple entries is selected', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });
    fireEvent.change(select, { target: { value: '2026' } });
    // 3 entries for 2026 — discriminating: "1 entry" (singular bug) would fail
    expect(screen.getByText('3 entries')).toBeInTheDocument();
  });

  it('AC7: shows "1 entry" (singular) when a year with exactly one entry is selected', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });
    fireEvent.change(select, { target: { value: '2025' } });
    // 1 entry for 2025 — discriminating: "1 entries" (plural bug) would fail
    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  it('AC6: selecting "All years" after a year selection restores all entries', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });

    // First filter to 2025
    fireEvent.change(select, { target: { value: '2025' } });
    expect(screen.queryByText('Entry 2026-C')).not.toBeInTheDocument();

    // Then restore to All years
    fireEvent.change(select, { target: { value: '' } });
    expect(screen.getByText('Entry 2026-C')).toBeInTheDocument();
    expect(screen.getByText('Entry 2025-A')).toBeInTheDocument();
    expect(screen.getByText('4 entries')).toBeInTheDocument();
  });
});

describe('ChangelogFilteredList — count styling', () => {
  it('count paragraph carries the muted zinc Tailwind classes', () => {
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const countEl = screen.getByText('4 entries');
    expect(countEl.className).toMatch(/text-zinc-600/);
    expect(countEl.className).toMatch(/dark:text-zinc-400/);
  });
});

describe('ChangelogFilteredList — empty state (AC10)', () => {
  it('AC10: shows "0 entries", only "All years" option, and "No entries match." when entries is empty', () => {
    render(<ChangelogFilteredList entries={[]} />);

    expect(screen.getByText('0 entries')).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });
    const options = within(select).getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('All years');

    expect(screen.getByText('No entries match.')).toBeInTheDocument();
    expect(screen.queryByRole('feed')).not.toBeInTheDocument();
  });
});

describe('ChangelogFilteredList — keyboard interaction (AC11)', () => {
  it('AC11: changing the select value by fireEvent updates the list and count without mouse', () => {
    // Simulates keyboard-driven selection via fireEvent (no mouse events).
    render(<ChangelogFilteredList entries={sortedEntries} />);
    const select = screen.getByRole('combobox', { name: 'Filter entries by year' });

    // keyboard select 2025
    select.focus();
    fireEvent.change(select, { target: { value: '2025' } });

    expect(screen.getByText('1 entry')).toBeInTheDocument();
    expect(screen.queryByText('Entry 2026-C')).not.toBeInTheDocument();
    expect(screen.getByText('Entry 2025-A')).toBeInTheDocument();
  });
});
