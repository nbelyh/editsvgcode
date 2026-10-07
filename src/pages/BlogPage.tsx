import { Link } from 'react-router-dom';
import { Container, Title, Text, Stack, Group, Badge, Box, Anchor, Divider, Image, SimpleGrid, Modal, UnstyledButton, Typography } from '@mantine/core';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IconExternalLink } from '@tabler/icons-react';
import { PageMeta } from '../components/PageMeta';
import { metaFor } from '../lib/route-meta';
import { UPDATES, formatUpdateDate, updatePath, type ChangeKind, type Update, type UpdateImage } from '../lib/updates';

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

const ENTRY_BORDER = {
  border: '1px solid var(--mantine-color-default-border)',
  borderRadius: 'var(--mantine-radius-md)',
  padding: 'var(--mantine-spacing-xl)',
};

function UpdateDate({ update }: { update: Update }) {
  return (
    <Group gap="xs">
      <Text size="sm" c="dimmed">
        <time dateTime={update.date}>{formatUpdateDate(update.date)}</time>
      </Text>
      {update.version && <Badge variant="light" size="sm">v{update.version}</Badge>}
    </Group>
  );
}

const REMARK_PLUGINS = [remarkGfm];

/**
 * How the article's Markdown is drawn. A picture's alt text doubles as its caption, as on the rest
 * of the blog, and a table scrolls sideways on its own rather than widening the page on a phone.
 */
const ARTICLE_COMPONENTS: Components = {
  img: ({ src, alt }) => (
    <span style={{ display: 'block', margin: 'var(--mantine-spacing-md) 0' }}>
      <img
        src={typeof src === 'string' ? src : undefined}
        alt={alt ?? ''}
        loading="lazy"
        style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: 'var(--mantine-radius-sm)', border: '1px solid var(--mantine-color-default-border)', background: '#fff' }}
      />
      {alt && <Text component="span" size="xs" c="dimmed" mt={6} style={{ display: 'block' }}>{alt}</Text>}
    </span>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: 'var(--mantine-spacing-md)' }}><table>{children}</table></div>
  ),
  // A step below the page's own heading, which an article's sections sit under.
  h2: ({ children }) => <Title order={2} size="h3" mt="xl" mb="sm">{children}</Title>,
  h3: ({ children }) => <Title order={3} size="h4" mt="lg" mb="xs">{children}</Title>,
};

/** An update's longer write-up, on its own page. */
function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <Typography>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={ARTICLE_COMPONENTS}>{markdown}</ReactMarkdown>
    </Typography>
  );
}

/** One update in full: its pictures and every change. On its own page the title is the page's heading. */
export function UpdateEntry({ update, onImageClick, asPage = false }: {
  update: Update;
  onImageClick: (image: UpdateImage) => void;
  asPage?: boolean;
}) {
  return (
    <Box component="article" id={update.id} style={ENTRY_BORDER}>
      <Stack gap="md">
        <UpdateDate update={update} />

        <Title order={asPage ? 1 : 2} size={asPage ? 'h2' : 'h3'}>{update.title}</Title>

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
                    // At its own size: the density makes the browser lay it out that big, and no bigger.
                    srcSet={image.density ? `${image.thumb} ${image.density}x` : undefined}
                    w={image.density ? 'auto' : undefined}
                    maw="100%"
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

        {asPage && update.article && <ArticleBody markdown={update.article} />}

        <Divider />

        {asPage && update.article && <Title order={2} size="h4">What changed</Title>}

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

/** A screenshot opened over the page. */
export function ImageZoom({ image, onClose }: { image: UpdateImage | null; onClose: () => void }) {
  return (
    <Modal
      opened={image !== null}
      onClose={onClose}
      // A picture with a density opens at its own size; stretched to the window, it blurred.
      size={image?.density ? 'auto' : '95vw'}
      centered
      padding="xs"
      title={image?.alt}
    >
      {image && (
        <Image
          src={image.src}
          srcSet={image.density ? `${image.src} ${image.density}x` : undefined}
          w={image.density ? 'auto' : undefined}
          maw="100%"
          alt={image.alt}
        />
      )}
    </Modal>
  );
}

/**
 * One update in the list: its date, title, summary and first picture, linking to its own page.
 * The list used to carry every update in full, every change and every screenshot, and grew into
 * one very long page. Keeps the update's id, so an old /blog#<id> link still lands on it.
 */
function UpdateCard({ update }: { update: Update }) {
  const image = update.images?.[0];
  return (
    <Box component="article" id={update.id} style={ENTRY_BORDER}>
      <Group align="flex-start" gap="lg" wrap="wrap">
        <Stack gap="xs" style={{ flex: '1 1 320px', minWidth: 0 }}>
          <UpdateDate update={update} />
          <Title order={2} size="h3">
            <Anchor component={Link} to={updatePath(update)} c="inherit" inherit>{update.title}</Anchor>
          </Title>
          {/* Four lines here; the whole summary is on the update's page, and in this markup for
              anyone reading it without the clamp. */}
          <Text lineClamp={4}>{update.summary}</Text>
          <Anchor component={Link} to={updatePath(update)} size="sm">
            {update.article ? 'Read the article' : 'See every change'}
          </Anchor>
        </Stack>
        {image && (
          <Anchor component={Link} to={updatePath(update)} style={{ flex: '0 0 240px', maxWidth: '100%' }} aria-hidden tabIndex={-1}>
            <Image
              src={image.thumb}
              alt=""
              radius="sm"
              loading="lazy"
              // A fixed box, cropped from the top: a tall screenshot would otherwise stretch the card.
              w={240}
              h={154}
              fit="cover"
              style={{ border: '1px solid var(--mantine-color-default-border)', objectPosition: 'top' }}
            />
          </Anchor>
        )}
      </Group>
    </Box>
  );
}

export function BlogPage() {
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
            <UpdateCard key={update.id} update={update} />
          ))}
        </Stack>
      </Container>
    </div>
  );
}

