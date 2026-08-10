import { useState } from 'react';
import { Container, Title, Text, Stack, Group, Badge, Box, Anchor, Divider, Image, SimpleGrid, Modal, UnstyledButton } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { PageMeta } from '../components/PageMeta';
import { metaFor } from '../lib/route-meta';
import { UPDATES, formatUpdateDate, type ChangeKind, type Update, type UpdateImage } from '../lib/updates';

const KIND_LABEL: Record<ChangeKind, string> = {
  new: 'New',
  improved: 'Improved',
  fixed: 'Fixed',
};

const KIND_COLOR: Record<ChangeKind, string> = {
  new: 'blue',
  improved: 'teal',
  fixed: 'gray',
};

function UpdateEntry({ update, onImageClick }: { update: Update; onImageClick: (image: UpdateImage) => void }) {
  return (
    <Box
      component="article"
      id={update.id}
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-md)',
        padding: 'var(--mantine-spacing-xl)',
      }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            <time dateTime={update.date}>{formatUpdateDate(update.date)}</time>
          </Text>
          {update.version && <Badge variant="light" size="sm">v{update.version}</Badge>}
        </Group>

        <Title order={2} size="h3">{update.title}</Title>

        <Text>{update.summary}</Text>

        {update.images && (
          // One picture gets the full column; two or more share it, so a long
          // entry does not turn into a page of screenshots.
          <SimpleGrid cols={{ base: 1, sm: update.images.length > 1 ? 2 : 1 }} spacing="md">
            {update.images.map(image => (
              <Box key={image.src} component="figure" m={0}>
                <UnstyledButton
                  onClick={() => onImageClick(image)}
                  style={{ width: '100%', cursor: 'zoom-in' }}
                >
                  <Image
                    src={image.thumb}
                    alt={image.alt}
                    radius="sm"
                    loading="lazy"
                    style={{ border: '1px solid var(--mantine-color-default-border)' }}
                  />
                </UnstyledButton>
                <Text component="figcaption" size="xs" c="dimmed" mt={6}>{image.alt}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}

        <Divider />

        <Stack gap="sm">
          {update.changes.map(change => (
            <Group key={change.text} gap="sm" align="flex-start" wrap="nowrap">
              {/* Fixed width so the sentences line up down one edge whichever
                  label a change carries. */}
              <Badge
                color={KIND_COLOR[change.kind]}
                variant="light"
                size="sm"
                w={78}
                style={{ flexShrink: 0, marginTop: 2 }}
              >
                {KIND_LABEL[change.kind]}
              </Badge>
              <Text size="sm">{change.text}</Text>
            </Group>
          ))}
        </Stack>

        {update.readMoreUrl && (
          <Anchor href={update.readMoreUrl} target="_blank" rel="noopener noreferrer" size="sm">
            Read the full announcement
            <IconExternalLink size={14} style={{ verticalAlign: 'text-bottom', marginLeft: 4 }} />
          </Anchor>
        )}
      </Stack>
    </Box>
  );
}

export function BlogPage() {
  const [zoomed, setZoomed] = useState<UpdateImage | null>(null);

  return (
    <div className="page-scroll">
      <PageMeta {...metaFor('/blog')} />
      <Container size="sm" py="xl">
        <Stack gap="lg">
          <Title order={1}>What's new</Title>
          <Text c="dimmed">
            What changed in the editor, newest first. Something you would like to see here?{' '}
            <Anchor href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer">
              Tell us
            </Anchor>.
          </Text>

          {UPDATES.map(update => (
            <UpdateEntry key={update.id} update={update} onImageClick={setZoomed} />
          ))}
        </Stack>
      </Container>

      <Modal
        opened={zoomed !== null}
        onClose={() => setZoomed(null)}
        size="95vw"
        centered
        padding="xs"
        title={zoomed?.alt}
      >
        {zoomed && <Image src={zoomed.src} alt={zoomed.alt} />}
      </Modal>
    </div>
  );
}
