import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Text, Table, Anchor, Loader, ActionIcon, Tooltip, Alert, Box, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconLock, IconWorld, IconInfoCircle } from '@tabler/icons-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { config } from '../lib/config';
import { Link } from 'react-router-dom';
import { EditSvgCodeDb, friendlyError } from '../lib/firebase';

interface FileEntry {
  id: string;
  modified: Date;
  text: string;
  public: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SvgThumb({ text }: { text: string }) {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  return <img src={url} alt="preview" width={40} height={40} style={{ objectFit: 'contain', background: 'var(--mantine-color-gray-1)', borderRadius: 4 }} />;
}

export function FilesPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
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

  const handleTogglePrivate = useCallback(async (id: string) => {
    const db = new EditSvgCodeDb();
    const file = files.find((f) => f.id === id);
    if (!file) return;
    const newPrivate = file.public;
    try {
      await db.setPrivate(id, newPrivate);
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, public: !newPrivate } : f));
      notifications.show({ title: newPrivate ? 'Private' : 'Public', message: newPrivate ? 'Only you can view this file.' : 'Anyone with the link can view.', color: 'blue' });
    } catch (err) {
      notifications.show({ title: 'Failed to update privacy', message: friendlyError(err), color: 'red' });
    }
  }, [files]);

  const isBeta = config.FIREBASE_PROJECT_ID === 'editsvgcode-beta' || config.FIREBASE_AUTH_DOMAIN === 'localhost';

  return (
    <Container py="xl" className="page-scroll">
      <Title order={2} mb="md">Files</Title>
      {isBeta && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light" mb="md">
          This is a <strong>beta environment</strong> — files are not guaranteed to be preserved.
        </Alert>
      )}

      {loading ? (
        <Loader size="sm" />
      ) : files.length === 0 ? (
        <Text c="dimmed" size="sm">No saved files yet. Use &quot;Save&quot; in the editor to save a file.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={50} />
              <Table.Th>File ID</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Modified</Table.Th>
              <Table.Th w={40} />
              <Table.Th w={40} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {files.map((f) => (
              <Table.Tr key={f.id}>
                <Table.Td>
                  <SvgThumb text={f.text} />
                </Table.Td>
                <Table.Td>
                  <Anchor component={Link} to={`/${f.id}`} size="sm">
                    {f.id}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{formatSize(new Blob([f.text]).size)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{f.modified.toLocaleString()}</Text>
                </Table.Td>
                <Table.Td>
                  <Tooltip label={f.public ? 'Public — click to make private' : 'Private — click to make public'}>
                    <ActionIcon variant="subtle" color={f.public ? 'blue' : 'gray'} size="sm" onClick={() => handleTogglePrivate(f.id)}>
                      {f.public ? <IconWorld size={14} /> : <IconLock size={14} />}
                    </ActionIcon>
                  </Tooltip>
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
    </Container>
  );
}
