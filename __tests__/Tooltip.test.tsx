import { render, screen } from '@testing-library/react';
import Tooltip from '@/components/ui/Tooltip';

describe('Tooltip', () => {
  it('AC2: renders its children', () => {
    render(<Tooltip content="August 8, 2026"><span>3 weeks ago</span></Tooltip>);
    expect(screen.getByText('3 weeks ago')).toBeInTheDocument();
  });

  it('AC2: renders the tooltip content in the DOM', () => {
    render(<Tooltip content="August 8, 2026"><span>3 weeks ago</span></Tooltip>);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('August 8, 2026');
  });

  it('AC2: tooltip element has role="tooltip"', () => {
    render(<Tooltip content="Exact date"><button>hover me</button></Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  it('AC2: trigger has aria-describedby linking to the tooltip id', () => {
    render(<Tooltip content="Exact date"><span>relative time</span></Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    const tooltipId = tooltip.id;
    expect(tooltipId).toBeTruthy();
    // The inner trigger span should reference the tooltip id
    const trigger = screen.getByText('relative time').parentElement;
    expect(trigger).toHaveAttribute('aria-describedby', tooltipId);
  });

  it('AC4: tooltip uses zinc-based dark mode classes', () => {
    render(<Tooltip content="Date"><span>time</span></Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    // Verify dark mode class tokens are applied (dark: prefix present in className)
    expect(tooltip.className).toContain('dark:bg-zinc-200');
    expect(tooltip.className).toContain('dark:text-zinc-900');
  });

  it('AC4: tooltip uses zinc-based light mode classes', () => {
    render(<Tooltip content="Date"><span>time</span></Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('bg-zinc-800');
    expect(tooltip.className).toContain('text-zinc-50');
  });

  it('AC2: tooltip is initially invisible (CSS hidden)', () => {
    render(<Tooltip content="Hidden date"><span>relative</span></Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    // The tooltip is in the DOM but CSS-hidden via the invisible class
    expect(tooltip.className).toContain('invisible');
    expect(tooltip.className).toContain('opacity-0');
  });
});
