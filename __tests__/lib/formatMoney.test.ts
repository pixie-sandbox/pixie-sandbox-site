import { formatMoney } from '@/lib/formatMoney';

describe('formatMoney', () => {
  it('formats a positive AUD amount without sign by default', () => {
    expect(formatMoney(1234.56)).toBe('$1,234.56');
  });

  it('formats a small amount with two decimal places', () => {
    expect(formatMoney(45)).toBe('$45.00');
  });

  it('adds + prefix for positive amounts when signed=true', () => {
    // Discriminating: formatMoney(50, true) must start with '+', not just '$50.00'
    expect(formatMoney(50, true)).toBe('+$50.00');
  });

  it('adds - prefix for negative amounts when signed=true', () => {
    // Discriminating: must be '-$45.00', not '$-45.00' (sign outside symbol)
    expect(formatMoney(-45, true)).toBe('-$45.00');
  });

  it('formats zero without sign prefix when signed=true', () => {
    expect(formatMoney(0, true)).toBe('+$0.00');
  });

  it('formats large amounts with comma separators', () => {
    expect(formatMoney(10000)).toBe('$10,000.00');
  });
});
