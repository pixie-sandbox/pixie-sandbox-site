import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import YearFilter from '@/components/changelog/YearFilter'

describe('YearFilter – count in option text', () => {
  it('AC1: renders `2026 (4)` and `All years (4)` for four entries all in 2026', () => {
    render(
      <YearFilter
        years={[{ year: 2026, count: 4 }]}
        totalCount={4}
        selected={null}
        onChange={() => {}}
      />,
    )
    const select = screen.getByLabelText(/Filter entries by year/i) as HTMLSelectElement
    const options = within(select).getAllByRole('option') as HTMLOptionElement[]
    const texts = options.map((o) => o.textContent)
    expect(texts).toEqual(['All years (4)', '2026 (4)'])
  })

  it('AC2: renders `2026 (2)`, `2025 (1)`, `All years (3)` newest-first', () => {
    render(
      <YearFilter
        years={[
          { year: 2026, count: 2 },
          { year: 2025, count: 1 },
        ]}
        totalCount={3}
        selected={null}
        onChange={() => {}}
      />,
    )
    const select = screen.getByLabelText(/Filter entries by year/i) as HTMLSelectElement
    const options = within(select).getAllByRole('option') as HTMLOptionElement[]
    expect(options.map((o) => o.textContent)).toEqual([
      'All years (3)',
      '2026 (2)',
      '2025 (1)',
    ])
  })

  it('AC3: renders `2020 (1)` for a year with exactly one entry (no singular/plural word)', () => {
    render(
      <YearFilter
        years={[{ year: 2020, count: 1 }]}
        totalCount={1}
        selected={null}
        onChange={() => {}}
      />,
    )
    const select = screen.getByLabelText(/Filter entries by year/i) as HTMLSelectElement
    const opt = within(select).getByRole('option', { name: /^2020 \(1\)$/ })
    expect(opt).toBeInTheDocument()
    expect(opt.textContent).not.toMatch(/entry|entries/i)
  })

  it('AC4: renders only `All years (0)` when there are no entries', () => {
    render(
      <YearFilter
        years={[]}
        totalCount={0}
        selected={null}
        onChange={() => {}}
      />,
    )
    const select = screen.getByLabelText(/Filter entries by year/i) as HTMLSelectElement
    const options = within(select).getAllByRole('option') as HTMLOptionElement[]
    expect(options).toHaveLength(1)
    expect(options[0].textContent).toBe('All years (0)')
  })

  it('AC6: option accessible name equals its visible text (no aria-label / aria-describedby override)', () => {
    render(
      <YearFilter
        years={[{ year: 2026, count: 2 }]}
        totalCount={2}
        selected={null}
        onChange={() => {}}
      />,
    )
    const select = screen.getByLabelText(/Filter entries by year/i) as HTMLSelectElement
    const options = within(select).getAllByRole('option') as HTMLOptionElement[]
    for (const opt of options) {
      expect(opt).not.toHaveAttribute('aria-label')
      expect(opt).not.toHaveAttribute('aria-describedby')
      expect(opt.children.length).toBe(0)
      // accessible name for a native <option> is its text content
      expect(opt.getAttribute('aria-label')).toBeNull()
    }
  })

  it('AC7: control is a native <select id="year-filter"> with the existing aria-label and label association', () => {
    render(
      <YearFilter
        years={[{ year: 2026, count: 1 }]}
        totalCount={1}
        selected={null}
        onChange={() => {}}
      />,
    )
    const select = screen.getByLabelText(/Filter entries by year/i) as HTMLSelectElement
    expect(select.tagName).toBe('SELECT')
    expect(select.id).toBe('year-filter')
    expect(select.getAttribute('aria-label')).toBe('Filter entries by year')
  })
})
