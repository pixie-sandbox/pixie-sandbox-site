/** @jest-environment jsdom */
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChangelogEntry from '@/components/changelog/ChangelogEntry';

const base = {
  title: 'Widget renamed to gadget',
  description: 'The widget resource has been renamed to gadget in the public API.',
  date: '2026-09-01T00:00:00.000Z',
};

describe('ChangelogEntry — breaking marker', () => {
  it('shows a Breaking marker when breaking is true (AC1)', () => {
    render(<ChangelogEntry entry={{ ...base, breaking: true }} />);
    const article = screen.getByRole('article');
    expect(within(article).getByText(/breaking change:/i)).toBeInTheDocument();
  });

  it('shows no Breaking marker when breaking is absent (AC3)', () => {
    render(<ChangelogEntry entry={{ ...base }} />);
    expect(screen.queryByText(/breaking change:/i)).not.toBeInTheDocument();
  });

  it('shows no Breaking marker when breaking is false (AC3)', () => {
    render(<ChangelogEntry entry={{ ...base, breaking: false }} />);
    expect(screen.queryByText(/breaking change:/i)).not.toBeInTheDocument();
  });

  it('places "Breaking change:" before the title in reading order (AC2)', () => {
    render(<ChangelogEntry entry={{ ...base, title: 'Widget renamed to gadget', breaking: true }} />);
    const article = screen.getByRole('article');
    const text = article.textContent ?? '';
    const breakingAt = text.toLowerCase().indexOf('breaking change:');
    const titleAt = text.indexOf('Widget renamed to gadget');
    expect(breakingAt).toBeGreaterThanOrEqual(0);
    expect(titleAt).toBeGreaterThan(breakingAt);
  });

  it('renders a distinct Breaking marker on each breaking entry when several are shown (AC12)', () => {
    render(
      <>
        <ChangelogEntry entry={{ ...base, title: 'First breaking', breaking: true }} />
        <ChangelogEntry entry={{ ...base, title: 'Second breaking', breaking: true }} />
      </>
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getAllByText(/breaking change:/i)).toHaveLength(2);
  });
});
