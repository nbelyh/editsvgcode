import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ImageConfirm } from '../../components/aichat/ImageConfirm';

/**
 * A third of the people offered a generated picture turned it down for a hand drawing, and then
 * rejected the drawing. The question now says what each choice gives and what it costs.
 */
const show = (summary: string, imageCredits = 10) => {
  const onConfirm = vi.fn();
  const onDecline = vi.fn();
  render(<MantineProvider><ImageConfirm summary={summary} imageCredits={imageCredits} onConfirm={onConfirm} onDecline={onDecline} /></MantineProvider>);
  return { onConfirm, onDecline };
};

describe('ImageConfirm', () => {
  it('says a generated picture ends up as editable SVG too, and what it costs', () => {
    show('A cute kitten sitting on a cushion');
    expect(screen.getByText('This looks like a picture. Generate it?')).toBeInTheDocument();
    expect(screen.getByText(/traced into SVG shapes, so you can edit it/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate picture (10 credits)' })).toBeInTheDocument();
  });

  it('says declining costs nothing more — the request was already paid for', () => {
    show('A cute kitten');
    expect(screen.getByRole('button', { name: 'Draw it with shapes instead (no extra credits)' })).toBeInTheDocument();
  });

  it('prices the picture at the image model chosen, not a fixed number', () => {
    show('A cute kitten', 50);
    expect(screen.getByRole('button', { name: 'Generate picture (50 credits)' })).toBeInTheDocument();
  });

  it('asks about changing a picture in its own words', () => {
    show('modify:Add a red bow');
    expect(screen.getByText('Change the generated picture?')).toBeInTheDocument();
    expect(screen.getByText('Add a red bow')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit the shapes instead (no extra credits)' })).toBeInTheDocument();
  });

  it('hands each choice to its handler', () => {
    const { onConfirm, onDecline } = show('A cute kitten');
    fireEvent.click(screen.getByRole('button', { name: /Generate picture/ }));
    fireEvent.click(screen.getByRole('button', { name: /Draw it with shapes/ }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onDecline).toHaveBeenCalledOnce();
  });
});
