import { useEffect, useRef, useState } from 'react';
import { Modal, TextInput, Textarea, Button, Group, Stack, Text, Loader, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { friendlyError, type GalleryMeta } from '../lib/firebase';
import { PUBLISH_DIALOG_HINT, PUBLISH_LICENSE_HINT, CC0_URL } from '../lib/visibility';
import { suggestGalleryMetaForFile } from '../lib/gallery-meta';
import { SvgThumb } from './SvgThumb';

interface PublishDialogProps {
  opened: boolean;
  onClose: () => void;
  fileId: string;
  svg: string;
  /** Uploaded file's original name — prefill fallback when there is no chat. */
  fileName?: string;
  /** Stored values — used when editing an already-published file. */
  initialMeta?: GalleryMeta | null;
  /** 'publish' confirms going public; 'edit' only updates title/description. */
  mode: 'publish' | 'edit';
  /** Persists the meta (and flips visibility in publish mode). Rejections keep
   * the dialog open; resolution closes it. */
  onSubmit: (meta: GalleryMeta) => Promise<void>;
}

/**
 * Gallery listing dialog: title + description over a preview, prefilled from
 * the stored values or the chat/SVG heuristic, always user-editable before
 * anything goes live.
 */
export function PublishDialog({ opened, onClose, fileId, svg, fileName, initialMeta, mode, onSubmit }: PublishDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Once the user edits a field, the async suggestion must never touch it —
  // including a field they deliberately cleared back to empty.
  const touchedRef = useRef(false);

  // Re-init whenever the dialog opens OR its target file changes (the dialog
  // instance is reused across documents, so keying on `opened` alone could
  // leave one doc's title on another doc's dialog).
  useEffect(() => {
    if (!opened) return;
    touchedRef.current = false;
    setTitle(initialMeta?.title ?? '');
    setDescription(initialMeta?.description ?? '');
    if (initialMeta?.title || initialMeta?.description) {
      setSuggesting(false);
      return;
    }
    // No stored meta — suggest from the chat prompt / SVG title / filename.
    // Fields stay editable meanwhile; the suggestion never overwrites input.
    let cancelled = false;
    setSuggesting(true);
    suggestGalleryMetaForFile(fileId, svg, fileName)
      .then((meta) => {
        if (cancelled || touchedRef.current) return;
        setTitle(meta.title);
        setDescription(meta.description);
      })
      .finally(() => {
        if (!cancelled) setSuggesting(false);
      });
    // Closing/retargeting mid-suggestion must clear the spinner, else it
    // stays stuck for the next open.
    return () => {
      cancelled = true;
      setSuggesting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, fileId]);

  // A gallery card is title + description over the thumbnail; with either blank
  // it lists as "Untitled" with nothing to read, and the filter (title and
  // description only) can never find it.
  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      notifications.show({
        title: mode === 'publish' ? 'Publish failed' : 'Update failed',
        message: friendlyError(err),
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'publish' ? 'Publish to gallery' : 'Edit gallery info'}
      centered
    >
      <Stack gap="sm">
        {/* Same ratio as the gallery card, so this preview shows what the card
            will actually look like rather than a differently-shaped crop. */}
        <SvgThumb text={svg} ratio="1.618 / 1" alt={title || 'preview'} radius={4} />
        <TextInput
          label="Title"
          placeholder="Untitled"
          withAsterisk
          value={title}
          onChange={(e) => { touchedRef.current = true; setTitle(e.currentTarget.value); }}
          maxLength={100}
          data-autofocus
          rightSection={suggesting ? <Loader size="xs" /> : null}
        />
        {/* Fixed rows (no autosize): the prefill arrives async, and a growing
            field would make the dialog jump when the suggestion lands. */}
        <Textarea
          label="Description"
          placeholder="What does this image show?"
          withAsterisk
          value={description}
          onChange={(e) => { touchedRef.current = true; setDescription(e.currentTarget.value); }}
          rows={3}
          maxLength={300}
        />
        {mode === 'publish' && (
          <Stack gap={4}>
            <Text size="xs" c="dimmed">{PUBLISH_DIALOG_HINT}</Text>
            <Text size="xs" c="dimmed">
              {PUBLISH_LICENSE_HINT}{' '}
              <Anchor href={CC0_URL} target="_blank" rel="noopener noreferrer" size="xs">
                Read the licence
              </Anchor>
            </Text>
          </Stack>
        )}
        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit}>
            {mode === 'publish' ? 'Publish' : 'Save'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
