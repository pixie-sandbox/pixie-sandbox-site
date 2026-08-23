import { render, screen, fireEvent, act } from '@testing-library/react';
import BackToTop from '@/components/BackToTop';

/** Helper: configure jsdom's read-only scroll/size properties. */
function setScrollContext({
  scrollHeight = 500,
  innerHeight = 1000,
  scrollY = 0,
}: {
  scrollHeight?: number;
  innerHeight?: number;
  scrollY?: number;
} = {}) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: innerHeight,
    configurable: true,
  });
  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    configurable: true,
  });
}

describe('BackToTop', () => {
  beforeEach(() => {
    // Default: short page, not scrolled — control must not appear.
    setScrollContext({ scrollHeight: 500, innerHeight: 1000, scrollY: 0 });
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── AC1 ────────────────────────────────────────────────────────────────────

  it('AC1: is absent from the DOM when the page is shorter than the viewport', () => {
    // scrollHeight (500) < innerHeight (1000) → not scrollable
    setScrollContext({ scrollHeight: 500, innerHeight: 1000, scrollY: 0 });
    render(<BackToTop />);
    expect(
      screen.queryByRole('button', { name: /back to top/i })
    ).not.toBeInTheDocument();
  });

  // ── AC2 ────────────────────────────────────────────────────────────────────

  it('AC2: is not visible when the page is scrollable but the user has not scrolled', () => {
    // Scrollable page (2000 > 1000) but scrollY = 0
    setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 0 });
    render(<BackToTop />);
    expect(
      screen.queryByRole('button', { name: /back to top/i })
    ).not.toBeInTheDocument();
  });

  // ── AC3 ────────────────────────────────────────────────────────────────────

  it('AC3: becomes visible in the footer once the user scrolls on a long page', () => {
    // Scrollable page, user starts at top
    setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 0 });
    render(<BackToTop />);

    // Simulate the user scrolling
    act(() => {
      setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 200 });
      fireEvent.scroll(window);
    });

    expect(
      screen.getByRole('button', { name: /back to top/i })
    ).toBeInTheDocument();
  });

  it('AC3: disappears again when the user scrolls back to the very top', () => {
    // Start scrolled
    setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 200 });
    render(<BackToTop />);

    // Fire initial scroll to make it visible
    act(() => {
      fireEvent.scroll(window);
    });

    expect(
      screen.getByRole('button', { name: /back to top/i })
    ).toBeInTheDocument();

    // Scroll back to top
    act(() => {
      setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 0 });
      fireEvent.scroll(window);
    });

    expect(
      screen.queryByRole('button', { name: /back to top/i })
    ).not.toBeInTheDocument();
  });

  // ── AC4 ────────────────────────────────────────────────────────────────────

  it('AC4: clicking the button calls window.scrollTo with smooth behaviour to y=0', () => {
    setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 300 });
    render(<BackToTop />);

    // Make button visible via a scroll event
    act(() => {
      fireEvent.scroll(window);
    });

    fireEvent.click(screen.getByRole('button', { name: /back to top/i }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  // ── AC5 ────────────────────────────────────────────────────────────────────

  it('AC5: the button carries aria-label="Back to top" for screen readers', () => {
    setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 100 });
    render(<BackToTop />);

    act(() => {
      fireEvent.scroll(window);
    });

    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toHaveAttribute('aria-label', 'Back to top');
  });

  it('AC5: the icon inside the button is hidden from assistive technology', () => {
    setScrollContext({ scrollHeight: 2000, innerHeight: 1000, scrollY: 100 });
    render(<BackToTop />);

    act(() => {
      fireEvent.scroll(window);
    });

    // The SVG carries aria-hidden so screen readers rely on the button's aria-label.
    const svg = document
      .querySelector('button[aria-label="Back to top"] svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
