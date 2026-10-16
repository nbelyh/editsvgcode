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
  const onImageStyleChange = vi.fn();
  render(<MantineProvider><ImageConfirm summary={summary} imageCredits={imageCredits} imageStyle={{ outlines: true, detail: false }} onImageStyleChange={onImageStyleChange} onConfirm={onConfirm} onDecline={onDecline} /></MantineProvider>);
  return { onConfirm, onDecline, onImageStyleChange };
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
    expect(screen.getByText('Change the picture?')).toBeInTheDocument();
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

  it('offers outlines and detail as separate options, and reports a change to either', () => {
    const { onImageStyleChange } = show('A cute kitten');
    expect(screen.getByRole('checkbox', { name: 'Bold outlines' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'More detail' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'More detail' }));
    expect(onImageStyleChange).toHaveBeenCalledWith({ outlines: true, detail: true });
  });
});

describe('ImageConfirm offering a stronger chat model', () => {
  // A small model reaching for the image model to change a traced picture often could not find
  // the part in the shapes; a stronger one edits them directly.
  const showWith = (summary: string, available: boolean) => {
    const onStronger = vi.fn();
    render(<MantineProvider><ImageConfirm summary={summary} imageCredits={10} imageStyle={{ outlines: true, detail: false }} onImageStyleChange={vi.fn()} onConfirm={vi.fn()} onDecline={vi.fn()} stronger={{ label: 'claude-sonnet-5', credits: 20, available }} onStronger={onStronger} /></MantineProvider>);
    return onStronger;
  };

  it('hands a picture change to the stronger model when the account can use it', () => {
    const onStronger = showWith('modify:Make the eyes blue', true);
    fireEvent.click(screen.getByRole('button', { name: 'Ask claude-sonnet-5 to edit the shapes (20 credits)' }));
    expect(onStronger).toHaveBeenCalled();
  });

  it('only names it when the account cannot, and says nothing of it for a new picture', () => {
    showWith('modify:Make the eyes blue', false);
    expect(screen.queryByRole('button', { name: /Ask claude-sonnet-5/ })).toBeNull();
    expect(screen.getByText(/claude-sonnet-5 \(Pro\) can often make this change in the shapes directly/)).toBeInTheDocument();
  });

  it('is not offered for a new picture, which no chat model draws as well', () => {
    showWith('A cute kitten', true);
    expect(screen.queryByText(/claude-sonnet-5/)).toBeNull();
  });
});
