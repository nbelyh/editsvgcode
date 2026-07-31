import { useEffect, useRef, useState } from 'react';
import { Modal, TextInput, Textarea, Button, Group, Stack, Text, Loader, Anchor, Tooltip } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { friendlyError, type GalleryMeta } from '../lib/firebase';
import { suggestGalleryMetaAi, isCreditsError } from '../lib/api-client';
import { rasterizeSvg } from '../lib/svg-raster';
import { loadFirstUserPrompt } from '../lib/chat-history';
import { GALLERY_META_CREDITS } from '../lib/models';
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
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Once the user edits a field, the async suggestion must never touch it —
  // including a field they deliberately cleared back to empty.
  const touchedRef = useRef(false);
  // Bumped every time the dialog opens, retargets or closes. The instance is
  // permanently mounted at both call sites, so without this an AI reply that
  // lands after the user moved on would overwrite a *different* document's
  // fields — and mark them touched, suppressing that document's own suggestion.
  const runRef = useRef(0);

  // Re-init whenever the dialog opens OR its target file changes (the dialog
  // instance is reused across documents, so keying on `opened` alone could
  // leave one doc's title on another doc's dialog).
  useEffect(() => {
    if (!opened) return;
    runRef.current += 1;
    touchedRef.current = false;
    setTitle(initialMeta?.title ?? '');
    setDescription(initialMeta?.description ?? '');
    if (initialMeta?.title || initialMeta?.description) {
      setSuggesting(false);
      // Same invalidation as the branch below, which this one skips over.
      return () => { runRef.current += 1; };
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
      runRef.current += 1;
      setSuggesting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, fileId]);

  // A gallery card is title + description over the thumbnail; with either blank
  // it lists as "Untitled" with nothing to read, and the filter (title and
  // description only) can never find it.
  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  // Paid, on demand, and never automatic: the dialog's own free suggestion is
  // already in the fields, so a credit is only spent when the user judges it
  // not good enough.
  const handleGenerate = async () => {
    const run = runRef.current;
    setGenerating(true);
    try {
      // A picture of the drawing plus whatever the author asked the AI for — the
      // two things that actually say what this is. Both are best-effort: an
      // un-rasterisable drawing or a chat-less document still gets a suggestion
      // from the markup server-side.
      const [image, prompt] = await Promise.all([
        rasterizeSvg(svg).catch(() => null),
        loadFirstUserPrompt(fileId).catch(() => null),
      ]);
      const meta = await suggestGalleryMetaAi(svg, {
        image: image ?? undefined,
        prompt: prompt ?? undefined,
      });
      // The dialog moved to another document while this was in flight: the
      // credit is spent either way, but the answer describes a drawing that is
      // no longer on screen.
      if (run !== runRef.current) return;
      // Counts as user input — the pending free suggestion must not overwrite it.
      touchedRef.current = true;
      if (meta.title) setTitle(meta.title.slice(0, 100));
      if (meta.description) setDescription(meta.description.slice(0, 300));
    } catch (err) {
      if (run !== runRef.current) return;
      notifications.show({
        title: isCreditsError(err) ? 'Out of credits' : 'Could not suggest a title',
        message: friendlyError(err),
        color: 'red',
      });
    } finally {
      setGenerating(false);
    }
  };

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
        {/* Shares the footer row with Cancel/Save rather than taking a line of
            its own — the dialog is already tall enough to reach the viewport
            edge on a short screen. */}
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Tooltip label={`Writes a title and description from the drawing itself — costs ${GALLERY_META_CREDITS} credit${GALLERY_META_CREDITS === 1 ? '' : 's'}`}>
            <Button
              size="compact-xs"
              variant="subtle"
              leftSection={<IconSparkles size={14} />}
              onClick={handleGenerate}
              loading={generating}
              disabled={suggesting || submitting}
            >
              Suggest with AI · {GALLERY_META_CREDITS} credit{GALLERY_META_CREDITS === 1 ? '' : 's'}
            </Button>
          </Tooltip>
          <Group gap="xs" wrap="nowrap">
            <Button variant="default" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            {/* Blocked while the AI is writing: publishing the old text a beat
                before the paid suggestion lands spends a credit for nothing. */}
            <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit || generating}>
              {mode === 'publish' ? 'Publish' : 'Save'}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
