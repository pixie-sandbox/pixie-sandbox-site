import { render, screen } from '@testing-library/react';
import ChangelogEntry from '@/components/changelog/ChangelogEntry';

const entry = {
  title: 'Footer',
  description: 'Added a site-wide footer displaying the current year and a link to the GitHub repository.',
  date: '2026-08-08T00:00:00.000Z',
};

describe('ChangelogEntry', () => {
  it('AC1: renders the entry title', () => {
    render(<ChangelogEntry entry={entry} />);
    expect(screen.getByRole('heading', { name: 'Footer' })).toBeInTheDocument();
  });

  it('AC1: renders the entry description', () => {
    render(<ChangelogEntry entry={entry} />);
    expect(screen.getByText(entry.description)).toBeInTheDocument();
  });

  it('AC2: renders a <time> element with the correct dateTime attribute', () => {
    render(<ChangelogEntry entry={entry} />);
    const time = screen.getByRole('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('dateTime', '2026-08-08T00:00:00.000Z');
  });

  it('AC2: renders a tooltip showing the absolute date', () => {
    render(<ChangelogEntry entry={entry} />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    // The tooltip should show the human-readable form of the ISO date
    expect(tooltip).toHaveTextContent('August 8, 2026');
  });

  it('AC1: renders as an article element', () => {
    render(<ChangelogEntry entry={entry} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('AC4: title uses zinc-950/zinc-50 text classes for dark mode', () => {
    render(<ChangelogEntry entry={entry} />);
    const heading = screen.getByRole('heading', { name: 'Footer' });
    // Check that dark mode zinc tokens are applied to the title
    expect(heading.className).toContain('dark:text-zinc-50');
  });

  it('AC4: description uses zinc-600/zinc-400 text classes for dark mode', () => {
    render(<ChangelogEntry entry={entry} />);
    const desc = screen.getByText(entry.description);
    expect(desc.className).toContain('dark:text-zinc-400');
  });

  it('AC4: date text uses zinc-500/zinc-400 text classes for dark mode', () => {
    render(<ChangelogEntry entry={entry} />);
    const time = screen.getByRole('time');
    expect(time.className).toContain('dark:text-zinc-400');
  });
});
