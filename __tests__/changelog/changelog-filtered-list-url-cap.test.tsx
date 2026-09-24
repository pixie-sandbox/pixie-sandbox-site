/**
 * Write-path URL cap tests for ChangelogFilteredList.
 *
 * These tests verify that the component caps the ?q= URL parameter at 200
 * characters when writing (AC1–AC5), matching the read-time cap already in
 * place. The search input's visible value is not constrained.
 *
 * Covers AC1–AC5.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ChangelogFilteredList from '@/components/changelog/ChangelogFilteredList';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/changelog',
}));

const entries = [
  {
    title: 'First entry',
    description: 'Something shipped.',
    date: '2026-01-01',
  },
  {
    title: 'Second entry',
    description: 'Another change.',
    date: '2026-02-01',
  },
];

const getLatestReplacedUrl = (): URL | null => {
  const calls = mockReplace.mock.calls;
  if (calls.length === 0) return null;
  const arg = calls[calls.length - 1][0];
  return new URL(String(arg), 'http://localhost');
};

const getSearchInput = (): HTMLInputElement => {
  const byRole = screen.queryByRole('searchbox');
  if (byRole) return byRole as HTMLInputElement;
  return screen.getByRole('textbox') as HTMLInputElement;
};

describe('changelog search URL cap on write', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('AC1: clearing the input removes ?q= from the URL', () => {
    render(<ChangelogFilteredList entries={entries} />);
    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'anything' } });
    fireEvent.change(input, { target: { value: '' } });
    const url = getLatestReplacedUrl();
    expect(url).not.toBeNull();
    expect(url!.searchParams.get('q')).toBeNull();
  });

  it('AC2: a short query is written to ?q= verbatim', () => {
    render(<ChangelogFilteredList entries={entries} />);
    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'release notes' } });
    const url = getLatestReplacedUrl();
    expect(url).not.toBeNull();
    expect(url!.searchParams.get('q')).toBe('release notes');
  });

  it('AC3: a value of exactly 200 characters is written in full', () => {
    render(<ChangelogFilteredList entries={entries} />);
    const input = getSearchInput();
    const value = 'a'.repeat(200);
    fireEvent.change(input, { target: { value } });
    const url = getLatestReplacedUrl();
    expect(url).not.toBeNull();
    expect(url!.searchParams.get('q')).toBe(value);
    expect(url!.searchParams.get('q')!.length).toBe(200);
  });

  it('AC4: a value of 201 characters is capped to the first 200 in the URL', () => {
    render(<ChangelogFilteredList entries={entries} />);
    const input = getSearchInput();
    const first200 = 'b'.repeat(200);
    const value = first200 + 'X';
    fireEvent.change(input, { target: { value } });
    const url = getLatestReplacedUrl();
    expect(url).not.toBeNull();
    const q = url!.searchParams.get('q');
    expect(q).toBe(first200);
    expect(q!.length).toBe(200);
  });

  it('AC5: a 500-character paste caps the URL at 200 but leaves the input showing the full value', () => {
    render(<ChangelogFilteredList entries={entries} />);
    const input = getSearchInput();
    const value = 'c'.repeat(500);
    fireEvent.change(input, { target: { value } });
    expect(input.value).toBe(value);
    expect(input.value.length).toBe(500);
    const url = getLatestReplacedUrl();
    expect(url).not.toBeNull();
    const q = url!.searchParams.get('q');
    expect(q).toBe('c'.repeat(200));
    expect(q!.length).toBe(200);
  });
});
