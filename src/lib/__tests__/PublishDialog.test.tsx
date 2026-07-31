import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { PublishDialog } from '../../components/PublishDialog';

vi.mock('../firebase', () => ({
  friendlyError: (e: unknown) => String(e),
}));

// No prefill: the suggestion is what usually fills these fields, and the point
// of these tests is what happens when they are empty.
vi.mock('../gallery-meta', () => ({
  suggestGalleryMetaForFile: () => Promise.resolve({ title: '', description: '' }),
}));

// The paid suggestion and everything it gathers. Each test drives the reply.
const { suggestAi } = vi.hoisted(() => ({ suggestAi: vi.fn() }));
vi.mock('../api-client', () => ({ suggestGalleryMetaAi: suggestAi, isCreditsError: () => false }));
vi.mock('../svg-raster', () => ({ rasterizeSvg: () => Promise.resolve(null) }));
vi.mock('../chat-history', () => ({ loadFirstUserPrompt: () => Promise.resolve(null) }));

const SVG = "<svg xmlns='http://www.w3.org/2000/svg'/>";

function dialog(fileId: string, onSubmit: () => Promise<void>) {
  return (
    <MantineProvider>
      <PublishDialog opened onClose={vi.fn()} fileId={fileId} svg={SVG} mode="publish" onSubmit={onSubmit} />
    </MantineProvider>
  );
}

function renderDialog(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const { rerender } = render(dialog('f1', onSubmit));
  return Object.assign(onSubmit, {
    retarget: (fileId: string) => rerender(dialog(fileId, onSubmit)),
  });
}

const publishButton = () => screen.getByRole('button', { name: 'Publish' });
const suggestButton = () => screen.getByRole('button', { name: /suggest with ai/i });
const titleInput = () => screen.getByLabelText(/title/i) as HTMLInputElement;
const type = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('PublishDialog', () => {
  beforeEach(() => {
    localStorage.clear();
    suggestAi.mockReset();
  });

  it('cannot publish with no title or description', async () => {
    const onSubmit = renderDialog();
    await waitFor(() => expect(publishButton()).toBeDisabled());
    publishButton().click();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cannot publish with only a title', async () => {
    renderDialog();
    type(/title/i, 'Red Square');
    await waitFor(() => expect(publishButton()).toBeDisabled());
  });

  it('cannot publish when the fields hold only whitespace', async () => {
    renderDialog();
    type(/title/i, '   ');
    type(/description/i, '  ');
    await waitFor(() => expect(publishButton()).toBeDisabled());
  });

  it('publishes trimmed values once both are filled', async () => {
    const onSubmit = renderDialog();
    type(/title/i, '  Red Square  ');
    type(/description/i, '  A red square.  ');
    await waitFor(() => expect(publishButton()).toBeEnabled());
    publishButton().click();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: 'Red Square', description: 'A red square.' }));
  });

  // The dialog instance is permanently mounted and reused for every document,
  // so an AI reply outliving its request would land on whatever is open now.
  it('drops an AI suggestion that arrives after the dialog retargets', async () => {
    let reply: (meta: { title: string; description: string }) => void = () => {};
    suggestAi.mockReturnValue(new Promise((resolve) => { reply = resolve; }));

    const onSubmit = renderDialog();
    // The free suggestion holds the button disabled until it settles.
    await waitFor(() => expect(suggestButton()).toBeEnabled());
    suggestButton().click();
    await waitFor(() => expect(suggestButton()).toHaveAttribute('data-loading'));

    onSubmit.retarget('f2');
    reply({ title: 'Sleeping Tiger', description: 'A tiger asleep in tall grass.' });

    // The button leaving its loading state is the signal that the reply landed,
    // so this asserts the suggestion was dropped rather than merely not yet in.
    await waitFor(() => expect(suggestButton()).not.toHaveAttribute('data-loading'));
    expect(titleInput().value).toBe('');

    // …and the other document is still free to take its own suggestion.
    type(/title/i, 'Red Square');
    expect(titleInput().value).toBe('Red Square');
  });

  it('cannot publish while the AI suggestion is still running', async () => {
    suggestAi.mockReturnValue(new Promise(() => {}));
    renderDialog();
    type(/title/i, 'Red Square');
    type(/description/i, 'A red square.');
    await waitFor(() => expect(publishButton()).toBeEnabled());

    suggestButton().click();
    await waitFor(() => expect(publishButton()).toBeDisabled());
  });
});
