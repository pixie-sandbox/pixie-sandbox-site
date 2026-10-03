import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('Home — accounts overview', () => {
  it('AC1: greets Alex and lists exactly three named accounts', () => {
    render(<HomePage />);
    expect(screen.getByText(/Hello,\s*Alex/)).toBeInTheDocument();
    expect(screen.getByText('Everyday')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('Credit card')).toBeInTheDocument();
    // Exactly three account cards (links with masked numbers)
    const cards = screen.getAllByRole('link', {
      name: /•{2,}.*\d{4}/,
    });
    expect(cards).toHaveLength(3);
  });

  it('AC3: shows the Savings interest rate as "4.50% p.a."', () => {
    render(<HomePage />);
    // Use a discriminating input: 4.50% p.a. — not 4.5 alone or a different format
    expect(screen.getByText('4.50% p.a.')).toBeInTheDocument();
  });

  it('AC4: shows credit card owing and limit, each labelled and formatted in AUD', () => {
    render(<HomePage />);
    // Labels must be present
    expect(screen.getByText(/^Owing$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Credit limit$/i)).toBeInTheDocument();
    // At least two AUD-formatted amounts visible (owing + limit)
    const audAmounts = screen.getAllByText(/\$[\d,]+\.\d{2}/);
    expect(audAmounts.length).toBeGreaterThanOrEqual(4);
  });

  it('AC5: links each account to its slug-based detail page', () => {
    render(<HomePage />);
    // Each card is a link; test the href attribute directly (discriminating: exact paths)
    expect(
      screen.getByRole('link', { name: /Everyday.*•{2,}.*\d{4}/i })
    ).toHaveAttribute('href', '/accounts/everyday');
    expect(
      screen.getByRole('link', { name: /Savings.*•{2,}.*\d{4}/i })
    ).toHaveAttribute('href', '/accounts/savings');
    expect(
      screen.getByRole('link', { name: /Credit card.*•{2,}.*\d{4}/i })
    ).toHaveAttribute('href', '/accounts/credit-card');
  });

  it('AC2 + AC12: shows masked account numbers and never leaks a full number', () => {
    render(<HomePage />);
    const textContent = document.body.textContent ?? '';
    // At least one masked number visible — bullet dots followed by four digits
    expect(textContent).toMatch(/[••]{2,}\s?\d{4}/);
    // No run of six or more consecutive digits (SEC-01 §4 discriminating check)
    expect(textContent).not.toMatch(/\d{6,}/);
  });
});
