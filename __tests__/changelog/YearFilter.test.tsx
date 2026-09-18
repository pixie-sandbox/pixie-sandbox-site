import { render, screen, fireEvent } from '@testing-library/react';
import YearFilter from '@/components/changelog/YearFilter';

describe('YearFilter — label and accessible name (AC1)', () => {
  it('AC1: renders a visible "Year:" label associated with the select', () => {
    render(
      <YearFilter years={[2026, 2025]} selected={null} onChange={() => {}} />
    );
    // The label text must be visible
    expect(screen.getByText('Year:')).toBeInTheDocument();
  });

  it('AC1: the select has aria-label "Filter entries by year"', () => {
    render(
      <YearFilter years={[2026, 2025]} selected={null} onChange={() => {}} />
    );
    const select = screen.getByRole('combobox', {
      name: 'Filter entries by year',
    });
    expect(select).toBeInTheDocument();
  });

  it('AC1: the label is associated with the select via htmlFor/id', () => {
    render(
      <YearFilter years={[2026, 2025]} selected={null} onChange={() => {}} />
    );
    const label = screen.getByText('Year:').closest('label');
    const select = screen.getByRole('combobox', {
      name: 'Filter entries by year',
    });
    expect(label).toHaveAttribute('for', select.id);
  });
});

describe('YearFilter — option list (AC2, AC3)', () => {
  it('AC2: options are "All years" first, then years newest-first', () => {
    // Discriminating: years [2024, 2025, 2026] passed in wrong order; the
    // component must receive them already sorted (newest-first by the caller).
    render(
      <YearFilter years={[2026, 2025, 2024]} selected={null} onChange={() => {}} />
    );
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('All years');
    expect(options[1]).toHaveTextContent('2026');
    expect(options[2]).toHaveTextContent('2025');
    expect(options[3]).toHaveTextContent('2024');
  });

  it('AC1: selects "All years" (empty value) by default when selected is null', () => {
    render(
      <YearFilter years={[2026, 2025]} selected={null} onChange={() => {}} />
    );
    const select = screen.getByRole('combobox', {
      name: 'Filter entries by year',
    });
    expect(select).toHaveValue('');
  });

  it('reflects the selected year value in the control', () => {
    // Discriminating: selected=2025 must not show 2026 as selected
    render(
      <YearFilter years={[2026, 2025]} selected={2025} onChange={() => {}} />
    );
    const select = screen.getByRole('combobox', {
      name: 'Filter entries by year',
    });
    expect(select).toHaveValue('2025');
    expect(select).not.toHaveValue('2026');
  });

  it('renders only "All years" when years array is empty (AC10)', () => {
    render(
      <YearFilter years={[]} selected={null} onChange={() => {}} />
    );
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('All years');
  });
});

describe('YearFilter — onChange events (AC11)', () => {
  it('calls onChange with the numeric year when a year option is selected', () => {
    // Discriminating: onChange must receive a number (2025), not a string ('2025')
    const handleChange = jest.fn();
    render(
      <YearFilter years={[2026, 2025]} selected={null} onChange={handleChange} />
    );
    const select = screen.getByRole('combobox', {
      name: 'Filter entries by year',
    });
    fireEvent.change(select, { target: { value: '2025' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(2025);
  });

  it('calls onChange with null when the "All years" option is selected', () => {
    // Discriminating: must receive null, not '' or 0
    const handleChange = jest.fn();
    render(
      <YearFilter years={[2026, 2025]} selected={2025} onChange={handleChange} />
    );
    const select = screen.getByRole('combobox', {
      name: 'Filter entries by year',
    });
    fireEvent.change(select, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith(null);
  });
});
