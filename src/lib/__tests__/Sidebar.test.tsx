import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Sidebar } from '../../components/Sidebar';

vi.mock('../credits-listener', () => ({
  subscribeCredits: (cb: (c: { tier: string }) => void) => {
    cb({ tier: 'free' });
    return () => {};
  },
}));

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Sidebar', () => {
  it('renders the title', () => {
    renderWithMantine(<Sidebar />);
    expect(screen.getByText('SVG Code Sandbox')).toBeInTheDocument();
  });

  it('renders help text', () => {
    renderWithMantine(<Sidebar />);
    expect(screen.getByText(/Upload or paste SVG code/)).toBeInTheDocument();
  });

  it('renders F1 keyboard shortcut hint', () => {
    renderWithMantine(<Sidebar />);
    expect(screen.getByText('F1')).toBeInTheDocument();
  });

  it('renders Command Palette link', () => {
    renderWithMantine(<Sidebar />);
    expect(screen.getByText('Command Palette')).toBeInTheDocument();
  });

  it('calls onOpenCommandPalette when Command Palette link clicked', async () => {
    const spy = vi.fn();
    renderWithMantine(<Sidebar onOpenCommandPalette={spy} />);
    const link = screen.getByText('Command Palette');
    link.click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('does not inject ads script on localhost', () => {
    renderWithMantine(<Sidebar />);
    expect(document.querySelector('#_carbonads_js')).toBeNull();
  });
});
