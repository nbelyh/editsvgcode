import { useState, useEffect, useMemo } from 'react';
import { Container, Title, Text, Loader, Card, SimpleGrid, Group, Button, Anchor, Avatar, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye, IconGitFork, IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EditSvgCodeDb, friendlyError } from '../lib/firebase';
import { useCloneDocument } from '../lib/useCloneDocument';
import { displayAuthorName } from '../lib/gallery-meta';
import { GALLERY_LICENSE_NOTE, CC0_URL } from '../lib/visibility';
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
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { clone, cloningId } = useCloneDocument();

  // Filtering is client-side over the already-loaded page: Firestore has no
  // substring search, and the gallery is capped at 60 entries anyway.
  // Title and description only — cards show the author abbreviated
  // (displayAuthorName), so matching the stored authorName would both miss the
  // name as displayed and make the withheld surname searchable.
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      e.title.toLowerCase().includes(q)
      || e.description.toLowerCase().includes(q));
  }, [entries, filter]);

  useEffect(() => {
    new EditSvgCodeDb().listPublicDocuments()
      .then(setEntries)
      .catch((err) => {
        console.error('listPublicDocuments failed', err);
        notifications.show({ title: 'Failed to load gallery', message: friendlyError(err), color: 'red' });
      })
      .finally(() => setLoading(false));
  }, []);

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
      <Text size="sm" c="dimmed">
        {GALLERY_LICENSE_NOTE}{' '}
        <Anchor href={CC0_URL} target="_blank" rel="noopener noreferrer" size="sm">
          Read the licence
        </Anchor>
      </Text>

      {entries.length > 0 && (
        <TextInput
          value={filter}
          onChange={(ev) => setFilter(ev.currentTarget.value)}
          placeholder="Filter by title or description"
          leftSection={<IconSearch size={16} />}
          maw={420}
        />
      )}

      {loading ? (
        <Loader size="sm" />
      ) : entries.length === 0 ? (
        <Text c="dimmed" size="sm">Nothing public yet. Save a file as public and it will show up here.</Text>
      ) : visible.length === 0 ? (
        // Distinct from the empty gallery above: nothing is wrong, the filter
        // just excluded everything.
        <Text c="dimmed" size="sm">No files match “{filter.trim()}”.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
          {visible.map((e) => (
            // flex column + mt="auto" on the meta row pins it to the card
            // bottom, so rows align across cards with/without a description
            <Card key={e.id} shadow="sm" padding="sm" radius="md" withBorder style={{ display: 'flex', flexDirection: 'column' }}>
              <Card.Section component={Link} to={`/${e.id}`}>
                <SvgThumb text={e.text} ratio="1.618 / 1" alt={e.title || 'preview'} />
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
                    <Text size="xs" c="dimmed" lineClamp={1}>{displayAuthorName(e.authorName)}</Text>
                  </Group>
                )}
                <Button
                  size="compact-xs"
                  variant="light"
                  ml="auto"
                  style={{ flexShrink: 0 }}
                  leftSection={<IconGitFork size={14} />}
                  loading={cloningId === e.id}
                  onClick={() => clone(e.id)}
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
