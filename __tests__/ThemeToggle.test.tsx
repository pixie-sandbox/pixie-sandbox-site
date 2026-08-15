import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('AC3: renders an accessible toggle button after mounting', () => {
    renderWithProvider();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('AC3: button has a descriptive aria-label in light mode', () => {
    renderWithProvider();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to dark mode'
    );
  });

  it('AC3: button has a descriptive aria-label in dark mode', () => {
    document.documentElement.classList.add('dark');
    renderWithProvider();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to light mode'
    );
  });

  it('AC3: clicking the toggle adds the dark class to <html>', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('AC3: clicking the toggle in dark mode removes the dark class from <html>', () => {
    document.documentElement.classList.add('dark');
    renderWithProvider();
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('AC3: clicking the toggle stores the new preference in localStorage', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('AC2: stores light preference in localStorage when toggling back from dark', () => {
    document.documentElement.classList.add('dark');
    renderWithProvider();
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('AC3: aria-label updates after toggle', () => {
    renderWithProvider();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});
