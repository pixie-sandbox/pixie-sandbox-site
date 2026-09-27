import { render, screen } from '@testing-library/react';
import SkipLink from '@/components/SkipLink';

describe('SkipLink', () => {
  // ── AC3 ────────────────────────────────────────────────────────────────────

  it('AC3: renders an anchor that is visually hidden by default (sr-only class)', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
    // sr-only is applied by default (not focused state)
    expect(link).toHaveClass('sr-only');
  });

  // ── AC2 ────────────────────────────────────────────────────────────────────

  it('AC2: the skip link href targets #main-content', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  // ── AC1 ────────────────────────────────────────────────────────────────────

  it('AC1: has focus-visible classes that make it visible when focused', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    // Verify that focus:not-sr-only class is present so the element becomes
    // visible when focused — Tailwind compiles these into CSS rules applied on focus.
    expect(link.className).toMatch(/focus:not-sr-only/);
    expect(link.className).toMatch(/focus:absolute/);
  });

  it('AC1: skip link text is "Skip to main content"', () => {
    render(<SkipLink />);
    expect(
      screen.getByRole('link', { name: 'Skip to main content' })
    ).toBeInTheDocument();
  });
});
