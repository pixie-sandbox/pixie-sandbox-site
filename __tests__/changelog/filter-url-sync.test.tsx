/**
 * URL-backed filter sync tests for ChangelogFilteredList.
 *
 * These tests verify that the component reads filter state from URL search params
 * on load, and writes back via router.replace (not push) on each change.
 *
 * Covers AC1–AC12.
 */
// useReducer is imported at the top level to avoid require() inside the jest.mock factory.
import { useReducer } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChangelogFilteredList from '@/components/changelog/ChangelogFilteredList';

// Reactive mock: router.replace updates the shared params so that the component
// re-renders with the new filter state. mockPush is separately tracked to verify
// it is never called.

let _currentParams = new URLSearchParams();
let _forceUpdate: (() => void) | null = null;
const mockReplace = jest.fn();
const mockPush = jest.fn();

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
    push: mockPush,
  }),
  usePathname: () => '/changelog',
}));

const entries = [
  { title: 'Firebase logon shipped', description: 'auth work', date: '2025-01-15' },
  { title: 'Legacy migration completed', description: 'migration', date: '2024-06-01' },
  { title: 'Payment retry logic', description: 'retry', date: '2025-03-12' },
  { title: 'Statement layout tweak', description: 'copy', date: '2024-09-09' },
];

function setParams(qs: string) {
  _currentParams = new URLSearchParams(qs);
}

beforeEach(() => {
  mockReplace.mockClear();
  mockPush.mockClear();
  _currentParams = new URLSearchParams();
  _forceUpdate = null;
});

describe('URL-backed changelog filters', () => {
  it('AC1: ?year=2024 shows only 2024 entries on load and count reflects filter', () => {
    setParams('year=2024');
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.getByText('Legacy migration completed')).toBeInTheDocument();
    expect(screen.getByText('Statement layout tweak')).toBeInTheDocument();
    expect(screen.queryByText('Firebase logon shipped')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment retry logic')).not.toBeInTheDocument();
    // Count should reflect filtered number (2 entries)
    expect(screen.getByText('2 entries')).toBeInTheDocument();
    // Year filter control shows 2024
    expect(
      (screen.getByRole('combobox', { name: /year/i }) as HTMLSelectElement).value
    ).toBe('2024');
  });

  it('AC2: ?q=FIREBASE matches case-insensitively; input shows the raw value', () => {
    setParams('q=FIREBASE');
    render(<ChangelogFilteredList entries={entries} />);
    const search = screen.getByRole('textbox', { name: /search/i });
    expect(search).toHaveValue('FIREBASE');
    expect(screen.getByText('Firebase logon shipped')).toBeInTheDocument();
    expect(screen.queryByText('Legacy migration completed')).not.toBeInTheDocument();
  });

  it('AC3: ?year=2025&q=retry combines both filters', () => {
    setParams('year=2025&q=retry');
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.getByText('Payment retry logic')).toBeInTheDocument();
    expect(screen.queryByText('Firebase logon shipped')).not.toBeInTheDocument();
    expect(screen.queryByText('Legacy migration completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Statement layout tweak')).not.toBeInTheDocument();
  });

  it('AC4: ?q= (empty) renders all entries', () => {
    setParams('q=');
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.getByText('Firebase logon shipped')).toBeInTheDocument();
    expect(screen.getByText('Legacy migration completed')).toBeInTheDocument();
    expect(screen.getByText('Payment retry logic')).toBeInTheDocument();
    expect(screen.getByText('Statement layout tweak')).toBeInTheDocument();
  });

  it('AC5: ?q=%20%20%20 (whitespace-only) renders all entries', () => {
    setParams('q=%20%20%20');
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.getByText('Firebase logon shipped')).toBeInTheDocument();
    expect(screen.getByText('Legacy migration completed')).toBeInTheDocument();
    expect(screen.getByText('Payment retry logic')).toBeInTheDocument();
    expect(screen.getByText('Statement layout tweak')).toBeInTheDocument();
  });

  it('AC6: ?year=notayear is ignored and all entries render', () => {
    setParams('year=notayear');
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.getByText('Firebase logon shipped')).toBeInTheDocument();
    expect(screen.getByText('Legacy migration completed')).toBeInTheDocument();
    expect(screen.getByText('Statement layout tweak')).toBeInTheDocument();
    expect(screen.getByText('Payment retry logic')).toBeInTheDocument();
  });

  it('AC7: ?year=1999 (unknown numeric year) is ignored and all entries render', () => {
    setParams('year=1999');
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.getByText('Firebase logon shipped')).toBeInTheDocument();
    expect(screen.getByText('Legacy migration completed')).toBeInTheDocument();
    expect(screen.getByText('Payment retry logic')).toBeInTheDocument();
    expect(screen.getByText('Statement layout tweak')).toBeInTheDocument();
  });

  it('AC8: selecting a year calls router.replace (not push) with ?year=', () => {
    render(<ChangelogFilteredList entries={entries} />);
    fireEvent.change(screen.getByRole('combobox', { name: /year/i }), {
      target: { value: '2025' },
    });
    expect(mockReplace).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    const [url] = mockReplace.mock.calls.at(-1)!;
    expect(url).toMatch(/\/changelog\?year=2025/);
  });

  it('AC9: typing in the search box calls router.replace (not push) on each keystroke', () => {
    render(<ChangelogFilteredList entries={entries} />);
    const input = screen.getByRole('textbox', { name: /search/i });
    // Simulate typing 'fire' one character at a time — each change should trigger replace
    fireEvent.change(input, { target: { value: 'f' } });
    fireEvent.change(input, { target: { value: 'fi' } });
    fireEvent.change(input, { target: { value: 'fir' } });
    fireEvent.change(input, { target: { value: 'fire' } });
    // replace called four times (once per keystroke), push never
    expect(mockReplace).toHaveBeenCalledTimes(4);
    expect(mockPush).not.toHaveBeenCalled();
    // Final URL reflects the last value typed
    const [finalUrl] = mockReplace.mock.calls.at(-1)!;
    expect(finalUrl).toMatch(/\/changelog\?q=fire/);
  });

  it('AC10: clearing the year filter removes ?year rather than leaving ?year=', () => {
    setParams('year=2025');
    render(<ChangelogFilteredList entries={entries} />);
    fireEvent.change(screen.getByRole('combobox', { name: /year/i }), {
      target: { value: '' },
    });
    const [finalUrl] = mockReplace.mock.calls.at(-1)!;
    expect(finalUrl).not.toMatch(/year=/);
  });

  it('AC11: clearing the search input removes ?q rather than leaving ?q=', () => {
    setParams('q=firebase');
    render(<ChangelogFilteredList entries={entries} />);
    // The clear button (×) is rendered because the value is non-empty
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);
    const [finalUrl] = mockReplace.mock.calls.at(-1)!;
    expect(finalUrl).not.toMatch(/q=/);
  });

  it('AC12: a filter that matches nothing renders an empty region, not the full list; count shows zero', () => {
    setParams('q=xyznotamatchxyz');
    render(<ChangelogFilteredList entries={entries} />);
    expect(screen.queryByText('Firebase logon shipped')).not.toBeInTheDocument();
    expect(screen.queryByText('Legacy migration completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment retry logic')).not.toBeInTheDocument();
    expect(screen.queryByText('Statement layout tweak')).not.toBeInTheDocument();
    expect(screen.getByText('No entries match.')).toBeInTheDocument();
    expect(screen.getByText('0 entries')).toBeInTheDocument();
  });

  it('AC14: ?q= longer than 200 characters is truncated to 200 at read time; input value is the 200-char prefix', () => {
    // Construct a q value that is 500 chars total.
    // The first 200 chars are 'firebase' padded with 'x' — a value that is
    // unambiguously different from the 500-char full string.
    // Without truncation, input.value.length would be 500 and .toHaveLength(200)
    // would fail, making this a discriminating test for the slice(0,200) bound.
    const prefix = 'firebase'.padEnd(200, 'x'); // 200 chars
    const tail = 'z'.repeat(300); // 300 chars
    setParams('q=' + encodeURIComponent(prefix + tail));
    render(<ChangelogFilteredList entries={entries} />);
    const input = screen.getByRole('textbox', { name: /search/i }) as HTMLInputElement;
    expect(input.value).toHaveLength(200);
    expect(input.value).toBe(prefix);
    expect(input.value).not.toContain('z');
  });
});
