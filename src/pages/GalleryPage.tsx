import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Text, Loader, Card, SimpleGrid, Group, Button, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye, IconGitFork } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { EditSvgCodeDb, friendlyError } from '../lib/firebase';
import { cloneDocument } from '../lib/chat-history';
import { openSignInModal } from '../components/SignInModal';

interface GalleryEntry {
  id: string;
  modified: Date;
  text: string;
  views: number;
}

function SvgThumb({ text }: { text: string }) {
  if (!text) return <div style={{ height: 140, background: 'var(--mantine-color-gray-1)' }} />;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  return (
    <img
      src={url}
      alt="preview"
      style={{ height: 140, width: '100%', objectFit: 'contain', background: 'var(--mantine-color-gray-1)' }}
    />
  );
}

export function GalleryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);

  useEffect(() => {
    new EditSvgCodeDb().listPublicDocuments()
      .then(setEntries)
      .catch((err) => {
        console.error('listPublicDocuments failed', err);
        notifications.show({ title: 'Failed to load gallery', message: friendlyError(err), color: 'red' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClone = useCallback(async (id: string) => {
    // Cloning copies the chat too, which needs a real account (message writes
    // are denied for anonymous users) — same gate as the AI chat itself.
    const user = getAuth().currentUser;
    if (!user || user.isAnonymous) {
      openSignInModal();
      return;
    }
    setCloningId(id);
    try {
      const newId = await cloneDocument(id);
      if (newId) {
        notifications.show({ title: 'Copied', message: 'You now have your own draft of this file.', color: 'green' });
        navigate(`/${newId}`);
      }
    } catch (err) {
      notifications.show({ title: 'Copy failed', message: friendlyError(err), color: 'red' });
    } finally {
      setCloningId(null);
    }
  }, [navigate]);

  return (
    <Container py="xl" className="page-scroll">
      <Title order={2} mb="xs">Gallery</Title>
      <Text c="dimmed" size="sm" mb="md">
        Public SVGs shared by the community. Open one to view it, or start from a copy of your own.
      </Text>

      {loading ? (
        <Loader size="sm" />
      ) : entries.length === 0 ? (
        <Text c="dimmed" size="sm">Nothing public yet. Save a file as public and it will show up here.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {entries.map((e) => (
            <Card key={e.id} withBorder padding="sm">
              <Card.Section component={Link} to={`/${e.id}`}>
                <SvgThumb text={e.text} />
              </Card.Section>
              <Group justify="space-between" mt="sm">
                <Anchor component={Link} to={`/${e.id}`} size="sm" fw={500}>
                  {e.id}
                </Anchor>
                <Group gap={4}>
                  <IconEye size={14} />
                  <Text size="xs" c="dimmed">{e.views}</Text>
                </Group>
              </Group>
              <Group justify="space-between" mt="xs">
                <Text size="xs" c="dimmed">{e.modified.toLocaleDateString()}</Text>
                <Button
                  size="compact-xs"
                  variant="light"
                  leftSection={<IconGitFork size={14} />}
                  loading={cloningId === e.id}
                  onClick={() => handleClone(e.id)}
                >
                  Start from this
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
