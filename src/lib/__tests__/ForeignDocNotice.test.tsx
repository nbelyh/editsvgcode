import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ForeignDocNotice } from '../../components/ForeignDocNotice';
import { FOREIGN_DOC_CHAT_NOTICE, FOREIGN_DOC_INFO_NOTICE } from '../visibility';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

// The notice is the only thing telling a visitor the document is not theirs, in
// both the chat and the Info tab. It carries no firebase import by design, so it
// renders in plain jsdom without the mocks the panels need.
describe('ForeignDocNotice', () => {
  it('states whose document it is, whichever panel shows it', () => {
    renderWithMantine(<ForeignDocNotice message={FOREIGN_DOC_CHAT_NOTICE} onStartFrom={() => {}} />);
    expect(screen.getByText(/someone else's document/)).toBeInTheDocument();
  });

  it('promises only what the chat panel governs', () => {
    renderWithMantine(<ForeignDocNotice message={FOREIGN_DOC_CHAT_NOTICE} onStartFrom={() => {}} />);
    expect(screen.getByText(/continue the chat/)).toBeInTheDocument();
  });

  it('promises only what the Info panel governs', () => {
    renderWithMantine(<ForeignDocNotice message={FOREIGN_DOC_INFO_NOTICE} onStartFrom={() => {}} />);
    expect(screen.getByText(/edit and save your own version/)).toBeInTheDocument();
  });

  it('forks the document when Start from this is clicked', () => {
    const spy = vi.fn();
    renderWithMantine(<ForeignDocNotice message={FOREIGN_DOC_CHAT_NOTICE} onStartFrom={spy} />);
    screen.getByRole('button', { name: /Start from this/ }).click();
    expect(spy).toHaveBeenCalledOnce();
  });
});
