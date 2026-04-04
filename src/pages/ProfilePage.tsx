import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Text, Table, Anchor, Loader, Group, Avatar, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { EditSvgCodeDb } from '../lib/firebase';

interface FileEntry {
  id: string;
  modified: Date;
  text: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SvgThumb({ text }: { text: string }) {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  return <img src={url} alt="preview" width={40} height={40} style={{ objectFit: 'contain', background: '#f8f8f8', borderRadius: 4 }} />;
}

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const db = new EditSvgCodeDb();
        db.listUserDocuments()
          .then(setFiles)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const db = new EditSvgCodeDb();
    await db.deleteDocument(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="md">Profile</Title>

      {user && (
        <Group mb="xl" gap="md">
          <Avatar src={user.photoURL} size={48} radius="xl" />
          <div>
            <Text fw={500}>{user.displayName || 'Anonymous'}</Text>
            <Text size="sm" c="dimmed">{user.email ?? user.uid}</Text>
            {user.isAnonymous && <Badge size="xs" variant="light" color="yellow">Anonymous</Badge>}
          </div>
        </Group>
      )}

      <Title order={4} mb="sm">Shared files</Title>

      {loading ? (
        <Loader size="sm" />
      ) : files.length === 0 ? (
        <Text c="dimmed" size="sm">No shared files yet. Use &quot;Share&quot; in the editor to save a file.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={50} />
              <Table.Th>File ID</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Modified</Table.Th>
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
