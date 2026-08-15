import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

/** Simple consumer that displays the current theme and provides a toggle button. */
function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <TestConsumer />
    </ThemeProvider>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  // ── Blocking-script logic ──────────────────────────────────────────────────
  // The inline script in layout.tsx is reproduced here as a plain function so
  // we can verify the correct class is applied before React hydrates.

  describe('blocking script logic (AC1, AC2)', () => {
    function runScript(storedTheme: string | null, osPrefsDark: boolean) {
      if (storedTheme !== null) {
        localStorage.setItem('theme', storedTheme);
      }
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches:
            query === '(prefers-color-scheme: dark)' && osPrefsDark,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      // Replicate the exact logic from THEME_SCRIPT in layout.tsx.
      try {
        const s = localStorage.getItem('theme');
        if (
          s === 'dark' ||
          (!s && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
          document.documentElement.classList.add('dark');
        }
      } catch (_) {
        // intentionally empty – mirrors the try/catch in the real script
      }
    }

    it('AC1: adds dark class when OS prefers dark and no stored preference', () => {
      runScript(null, true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('AC1: does not add dark class when OS prefers light and no stored preference', () => {
      runScript(null, false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('AC2: adds dark class when stored preference is dark (overrides OS)', () => {
      runScript('dark', false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('AC2: does not add dark class when stored preference is light, even if OS prefers dark', () => {
      runScript('light', true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  // ── ThemeProvider React state ──────────────────────────────────────────────

  it('defaults to light theme when html has no dark class', () => {
    renderWithProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('AC1: syncs to dark when blocking script has already added .dark class', () => {
    document.documentElement.classList.add('dark');
    renderWithProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('AC3: toggleTheme switches from light to dark', () => {
    renderWithProvider();
    act(() => {
      screen.getByRole('button', { name: /toggle/i }).click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('AC3: toggleTheme adds .dark class to document.documentElement', () => {
    renderWithProvider();
    act(() => {
      screen.getByRole('button', { name: /toggle/i }).click();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('AC3: toggleTheme persists the new preference to localStorage', () => {
    renderWithProvider();
    act(() => {
      screen.getByRole('button', { name: /toggle/i }).click();
    });
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('AC2: toggleTheme switches back from dark to light and persists', () => {
    document.documentElement.classList.add('dark');
    renderWithProvider();
    act(() => {
      screen.getByRole('button', { name: /toggle/i }).click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('throws when useTheme is used outside a ThemeProvider', () => {
    // Silence the expected error output from React
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<TestConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    spy.mockRestore();
  });
});
