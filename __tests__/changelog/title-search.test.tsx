import { useReducer } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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

// Discriminating fixture (DTI-01):
//  - Two titles containing 'dark' in different cases prove case-insensitive matching.
//  - One 2025 and two 2026 entries let the AND with year filter separate correct from OR.
//  - 'Fixed login bug' is the negative control that a substring implementation must exclude.
const entries = [
  { title: 'Added dark mode', description: 'A', date: '2026-09-01' },
  { title: 'Improved DARK theme contrast', description: 'B', date: '2025-05-01' },
  { title: 'Fixed login bug', description: 'C', date: '2026-08-01' },
] as Parameters<typeof ChangelogFilteredList>[0]['entries'];

describe('changelog title search', () => {
  test('AC1: search input and year filter both render above the list', () => {
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /year/i })).toBeInTheDocument();
    expect(screen.getByText('Added dark mode')).toBeInTheDocument();
    expect(screen.getByText('Improved DARK theme contrast')).toBeInTheDocument();
    expect(screen.getByText('Fixed login bug')).toBeInTheDocument();
  });

  test('AC2 & AC3: typing lowercase "dark" matches mixed-case titles; excludes non-matching entry', () => {
    render(<ChangelogFilteredList entries={entries} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), { target: { value: 'dark' } });
    expect(screen.getByText('Added dark mode')).toBeInTheDocument();
    expect(screen.getByText('Improved DARK theme contrast')).toBeInTheDocument();
    expect(screen.queryByText('Fixed login bug')).toBeNull();
  });

  test('AC4: search + year filter combine as AND', () => {
    render(<ChangelogFilteredList entries={entries} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), { target: { value: 'dark' } });
    fireEvent.change(screen.getByRole('combobox', { name: /year/i }), { target: { value: '2026' } });
    expect(screen.getByText('Added dark mode')).toBeInTheDocument();
    expect(screen.queryByText('Improved DARK theme contrast')).toBeNull();
    expect(screen.queryByText('Fixed login bug')).toBeNull();
  });

  test('AC5: no match — controls remain, "No entries match." shown in place of entries', () => {
    render(<ChangelogFilteredList entries={entries} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), { target: { value: 'zzzqqq' } });
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /year/i })).toBeInTheDocument();
    expect(screen.getByText('No entries match.')).toBeInTheDocument();
    expect(screen.queryByText('Added dark mode')).toBeNull();
    expect(screen.queryByText('Improved DARK theme contrast')).toBeNull();
    expect(screen.queryByText('Fixed login bug')).toBeNull();
  });

  test('AC6: clear-search control is not present when the input is empty', () => {
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.queryByRole('button', { name: /clear search/i })).toBeNull();
  });

  test('AC7: clear-search appears with text, clears the input on click, and restores search-only-excluded entries', () => {
    render(<ChangelogFilteredList entries={entries} />);
    const input = screen.getByRole('textbox', { name: /search/i }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dark' } });
    expect(screen.queryByText('Fixed login bug')).toBeNull();
    const clear = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clear);
    expect(input.value).toBe('');
    expect(screen.queryByRole('button', { name: /clear search/i })).toBeNull();
    expect(screen.getByText('Fixed login bug')).toBeInTheDocument();
  });

  test('AC8: whitespace-only query applies no filtering', () => {
    render(<ChangelogFilteredList entries={entries} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), { target: { value: '   ' } });
    expect(screen.getByText('Added dark mode')).toBeInTheDocument();
    expect(screen.getByText('Improved DARK theme contrast')).toBeInTheDocument();
    expect(screen.getByText('Fixed login bug')).toBeInTheDocument();
  });
});
