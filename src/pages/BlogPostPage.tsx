import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Container, Stack, Group, Anchor, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { PageMeta } from '../components/PageMeta';
import { UPDATES, updateMeta, updatePath, type UpdateImage } from '../lib/updates';
import { ImageZoom, UpdateEntry } from './BlogPage';

/**
 * One update on a page of its own, at /blog/<id>: every change and every picture, with the
 * updates before and after it a click away. The page's title, description and share picture come
 * from the entry in updates.ts, so publishing an update stays one entry there.
 */
export function BlogPostPage({ id: fixedId }: { id?: string }) {
  const params = useParams();
  const [zoomed, setZoomed] = useState<UpdateImage | null>(null);
  const index = UPDATES.findIndex(u => u.id === (fixedId ?? params.id));
  if (index < 0) return <Navigate to="/blog" replace />;

  const update = UPDATES[index];
  const newer = UPDATES[index - 1];
  const older = UPDATES[index + 1];

  return (
    <div className="page-scroll">
      <PageMeta {...updateMeta(update)} />
      <Container size="sm" py="xl">
        <Stack gap="lg">
          <Anchor component={Link} to="/blog" size="sm">
            <IconArrowLeft size={14} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
            All updates
          </Anchor>

          <UpdateEntry update={update} onImageClick={setZoomed} asPage />

          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
            {older ? (
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text size="xs" c="dimmed">Older</Text>
                <Anchor component={Link} to={updatePath(older)} size="sm">{older.title}</Anchor>
              </Stack>
            ) : <span />}
            {newer && (
              <Stack gap={2} style={{ minWidth: 0, textAlign: 'right' }}>
                <Text size="xs" c="dimmed">Newer</Text>
                <Anchor component={Link} to={updatePath(newer)} size="sm">{newer.title}</Anchor>
              </Stack>
            )}
          </Group>
        </Stack>
      </Container>

      <ImageZoom image={zoomed} onClose={() => setZoomed(null)} />
    </div>
  );
}
