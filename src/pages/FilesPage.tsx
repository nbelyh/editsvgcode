import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Text, Table, Anchor, Loader, ActionIcon, Tooltip, Alert, Box, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconInfoCircle } from '@tabler/icons-react';
import { VisibilityMenu } from '../components/VisibilityMenu';
import { PublishDialog } from '../components/PublishDialog';
import { SvgThumb } from '../components/SvgThumb';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { config } from '../lib/config';
import { Link } from 'react-router-dom';
import { EditSvgCodeDb, friendlyError, type Visibility, type GalleryMeta } from '../lib/firebase';
import { VISIBILITY_LABEL, VISIBILITY_MESSAGE } from '../lib/visibility';
import { submitGalleryMeta } from '../lib/publish';

interface FileEntry {
  id: string;
  modified: Date;
  text: string;
  visibility: Visibility;
  views: number;
  downloads: number;
  saved: boolean;
  title: string;
  description: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
      setIsAnonymous(!u || u.isAnonymous);
      if (u) {
        const db = new EditSvgCodeDb();
        db.listUserDocuments()
          .then(setFiles)
          .catch((err) => {
            console.error('listUserDocuments failed', err);
            notifications.show({ title: 'Failed to load files', message: friendlyError(err), color: 'red' });
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    modals.openConfirmModal({
      title: 'Delete file',
      children: <Text size="sm">Are you sure you want to delete <b>{id}</b>? This cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const db = new EditSvgCodeDb();
        try {
          await db.deleteDocument(id);
          setFiles((prev) => prev.filter((f) => f.id !== id));
          notifications.show({ title: 'Deleted', message: `File ${id} deleted.`, color: 'green' });
        } catch (err) {
          notifications.show({ title: 'Delete failed', message: friendlyError(err), color: 'red' });
        }
      },
    });
  }, []);

  // File being published or having its gallery info edited via the dialog.
  const [publishTarget, setPublishTarget] = useState<FileEntry | null>(null);

  const handleSetVisibility = useCallback(async (id: string, newValue: Visibility) => {
    const db = new EditSvgCodeDb();
    const file = files.find((f) => f.id === id);
    if (!file || file.visibility === newValue) return;
    // Going public is confirmed through the publish dialog.
    if (newValue === 'public') {
      setPublishTarget(file);
      return;
    }
    try {
      await db.setVisibility(id, newValue);
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, visibility: newValue } : f));
      notifications.show({ title: VISIBILITY_LABEL[newValue], message: VISIBILITY_MESSAGE[newValue], color: 'blue' });
    } catch (err) {
      notifications.show({ title: 'Failed to update visibility', message: friendlyError(err), color: 'red' });
    }
  }, [files]);

  const handlePublishSubmit = useCallback(async (meta: GalleryMeta) => {
    if (!publishTarget) return;
    const { id, visibility } = publishTarget;
    const mode = visibility === 'public' ? 'edit' : 'publish';
    await submitGalleryMeta(id, mode, meta);
    setFiles((prev) => prev.map((f) => f.id === id
      ? { ...f, ...meta, ...(mode === 'publish' ? { visibility: 'public' as Visibility } : {}) }
      : f));
  }, [publishTarget]);

  const isBeta = config.FIREBASE_PROJECT_ID === 'editsvgcode-beta' || config.FIREBASE_AUTH_DOMAIN === 'localhost';

  const savedFiles = files.filter((f) => f.saved);
  const drafts = files.filter((f) => !f.saved);

  return (
    <Container py="xl" className="page-scroll">
      <PublishDialog
        opened={publishTarget !== null}
        onClose={() => setPublishTarget(null)}
        fileId={publishTarget?.id ?? ''}
        svg={publishTarget?.text ?? ''}
        initialMeta={publishTarget}
        mode={publishTarget?.visibility === 'public' ? 'edit' : 'publish'}
        onSubmit={handlePublishSubmit}
      />
      <Title order={2} mb="md">Files</Title>
      {isBeta && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light" mb="md">
          This is a <strong>beta environment</strong> — files are not guaranteed to be preserved.
        </Alert>
      )}

      {loading ? (
        <Loader size="sm" />
      ) : savedFiles.length === 0 ? (
        <Text c="dimmed" size="sm">No saved files yet. Use &quot;Save&quot; in the editor to save a file.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={50} />
              <Table.Th>File</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Views</Table.Th>
              <Table.Th>Downloads</Table.Th>
              <Table.Th>Modified</Table.Th>
              <Table.Th w={40} />
              <Table.Th w={40} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {savedFiles.map((f) => (
              <Table.Tr key={f.id}>
                <Table.Td>
                  <SvgThumb text={f.text} height={40} width={40} radius={4} alt={f.title || 'preview'} />
                </Table.Td>
                <Table.Td>
                  <Anchor component={Link} to={`/${f.id}`} size="sm">
                    {f.title || f.id}
                  </Anchor>
                  {f.title && <Text size="xs" c="dimmed">{f.id}</Text>}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{formatSize(new Blob([f.text]).size)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{f.views}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{f.downloads}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{f.modified.toLocaleString()}</Text>
                </Table.Td>
                <Table.Td>
                  <VisibilityMenu
                    visibility={f.visibility}
                    onChange={(v) => handleSetVisibility(f.id, v)}
                    onEditMeta={() => setPublishTarget(f)}
                    shareUrl={`${window.location.origin}/${f.id}`}
                    disabledReason={isAnonymous ? 'Unlisted — sign in to manage visibility' : undefined}
                  />
                </Table.Td>
                <Table.Td>
                  <Tooltip label="Delete">
                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(f.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {!loading && drafts.length > 0 && (
        <>
          <Title order={3} mt="xl" mb="xs">Drafts</Title>
          <Text c="dimmed" size="sm" mb="md">
            Unsaved documents with an AI chat — open one to continue where you left off.
          </Text>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={50} />
                <Table.Th>Draft</Table.Th>
                <Table.Th>Modified</Table.Th>
                <Table.Th w={40} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {drafts.map((f) => (
                <Table.Tr key={f.id}>
                  <Table.Td>
                    <SvgThumb text={f.text} height={40} width={40} radius={4} />
                  </Table.Td>
                  <Table.Td>
                    <Anchor component={Link} to={`/${f.id}`} size="sm">
                      {f.id}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{f.modified.toLocaleString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="Delete">
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(f.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}
    </Container>
  );
}
