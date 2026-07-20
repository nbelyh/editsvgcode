import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Text, Loader, Card, SimpleGrid, Group, Button, Anchor, Avatar, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye, IconGitFork } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { EditSvgCodeDb, friendlyError } from '../lib/firebase';
import { cloneDocument } from '../lib/chat-history';
import { openSignInModal } from '../components/SignInModal';
import { SvgThumb } from '../components/SvgThumb';

interface GalleryEntry {
  id: string;
  modified: Date;
  text: string;
  views: number;
  title: string;
  description: string;
  authorName: string;
  authorPhoto: string;
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

  // Header mirrors FeaturesPage — the other public card-grid page — so the
  // nav siblings (Features / Gallery / Support / About) share one hero style.
  return (
    <div className="page-scroll">
    <Container size="lg" py="xl">
      <Stack gap="md">
      <Title order={1}>Gallery</Title>
      <Text size="lg" c="dimmed">
        Public SVGs shared by the community. Open one to view it, or start from a copy of your own.
      </Text>

      {loading ? (
        <Loader size="sm" />
      ) : entries.length === 0 ? (
        <Text c="dimmed" size="sm">Nothing public yet. Save a file as public and it will show up here.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {entries.map((e) => (
            // flex column + mt="auto" on the meta row pins it to the card
            // bottom, so rows align across cards with/without a description
            <Card key={e.id} shadow="sm" padding="sm" radius="md" withBorder style={{ display: 'flex', flexDirection: 'column' }}>
              <Card.Section component={Link} to={`/${e.id}`}>
                <SvgThumb text={e.text} alt={e.title || 'preview'} />
              </Card.Section>
              <Group justify="space-between" mt="xs" gap="xs" wrap="nowrap">
                {/* minWidth 0 lets the flex item shrink so lineClamp can
                    ellipsize an unbroken long title instead of overflowing */}
                <Anchor component={Link} to={`/${e.id}`} fw={600} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
                  {e.title || 'Untitled'}
                </Anchor>
                <Group gap={4} wrap="nowrap" c="dimmed">
                  <IconEye size={14} />
                  <Text size="xs" c="dimmed">{e.views}</Text>
                  <Text size="xs" c="dimmed">·</Text>
                  <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>{e.modified.toLocaleDateString()}</Text>
                </Group>
              </Group>
              {/* Fixed two-line slot (height = 2 × line-height) whether or not a
                  description exists — keeps every card's fields at the same spot */}
              <Text size="sm" c="dimmed" lineClamp={2} mt={2} lh={1.45} style={{ height: '2.9em' }}>
                {e.description}
              </Text>
              <Group mt="auto" pt="xs" gap="xs" wrap="nowrap">
                {e.authorName && (
                  <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar src={e.authorPhoto || undefined} name={e.authorName} color="initials" size={18} radius="xl" />
                    <Text size="xs" c="dimmed" lineClamp={1}>{e.authorName}</Text>
                  </Group>
                )}
                <Button
                  size="compact-xs"
                  variant="light"
                  ml="auto"
                  style={{ flexShrink: 0 }}
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
      </Stack>
    </Container>
    </div>
  );
}
