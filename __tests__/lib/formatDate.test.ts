import { formatDate } from '@/lib/formatDate';

describe('formatDate', () => {
  it('AC13: formats an ISO date as DD MMM YYYY', () => {
    // Discriminating: '2026-08-29' must render as '29 Aug 2026', not '08/29/2026' etc.
    expect(formatDate('2026-08-29')).toBe('29 Aug 2026');
  });

  it('zero-pads single-digit days', () => {
    // Discriminating: day 5 must render as '05', not '5'.
    expect(formatDate('2026-09-05')).toMatch(/^05 /);
  });

  it('abbreviates September as three letters ("Sep", not ICU en-GB "Sept")', () => {
    expect(formatDate('2026-09-05')).toBe('05 Sep 2026');
  });

  it('handles January correctly', () => {
    expect(formatDate('2026-01-01')).toBe('01 Jan 2026');
  });

  it('handles December correctly', () => {
    expect(formatDate('2026-12-31')).toBe('31 Dec 2026');
  });

  it('does not shift the date due to timezone offset', () => {
    // Discriminating: parsing '2026-07-01' as UTC midnight can shift to Jun 30
    // in timezones west of UTC. This test guards against that.
    expect(formatDate('2026-07-01')).toBe('01 Jul 2026');
  });
});
