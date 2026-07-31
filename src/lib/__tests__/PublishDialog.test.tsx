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

function renderDialog(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <MantineProvider>
      <PublishDialog
        opened
        onClose={vi.fn()}
        fileId="f1"
        svg="<svg xmlns='http://www.w3.org/2000/svg'/>"
        mode="publish"
        onSubmit={onSubmit}
      />
    </MantineProvider>,
  );
  return onSubmit;
}

const publishButton = () => screen.getByRole('button', { name: 'Publish' });
const type = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('PublishDialog', () => {
  beforeEach(() => localStorage.clear());

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
});
