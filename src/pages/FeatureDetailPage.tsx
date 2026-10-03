import { Fragment } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Container, Title, Text, Stack, Image, Badge, Group, Anchor, List, Button, Code, Divider } from '@mantine/core';
import { IconArrowLeft, IconPlayerPlay } from '@tabler/icons-react';
import { PageMeta } from '../components/PageMeta';
import { metaFor } from '../lib/route-meta';
import { FEATURE_PAGES, featurePage, tryItHref, type FeatureImage } from '../lib/feature-pages';

/**
 * One feature explained on a page of its own: what it is for, how to use it, what it will not
 * do, and a link that opens the editor with a drawing that shows it. The /features cards are a
 * paragraph each, which says what a feature is but not when it is the right tool or where it
 * stops — the questions someone arriving from a search, or an assistant summarising the site,
 * actually has.
 *
 * The content lives in feature-pages.ts; this only lays it out. Rendered at build time too, so
 * a reader without JavaScript gets the whole page.
 */

/** `code` in the copy becomes <Code>; everything else is plain text. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <Code key={i}>{part}</Code> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

function Picture({ image }: { image: FeatureImage }) {
  return (
    <figure style={{ margin: 0 }}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        radius="sm"
        // A screenshot of part of the screen is shown at its own size, never stretched: scaled
        // up, its small text blurs. A whole-window one fills the column.
        style={{
          height: 'auto', border: '1px solid var(--mantine-color-default-border)',
          ...(image.density && { maxWidth: image.width / image.density, marginInline: 'auto' }),
        }}
      />
      <Text component="figcaption" size="xs" c="dimmed" mt={6} ta={image.density ? 'center' : undefined}>{image.alt}</Text>
    </figure>
  );
}

export function FeatureDetailPage({ slug: fixedSlug }: { slug?: string }) {
  const params = useParams();
  const page = featurePage(fixedSlug ?? params.slug ?? '');
  if (!page) return <Navigate to="/features" replace />;

  return (
    <div className="page-scroll">
      <PageMeta {...metaFor(`/features/${page.slug}`)} />
      <Container size="md" py="xl">
        <Stack gap="lg">
          <Anchor component={Link} to="/features" size="sm">
            <Group gap={4} component="span"><IconArrowLeft size={14} />All features</Group>
          </Anchor>

          <div>
            <Group gap="sm" align="center">
              <Title order={1}>{page.title}</Title>
              {page.badge && <Badge color="blue" variant="light">{page.badge}</Badge>}
            </Group>
            <Text size="lg" mt="sm"><Rich text={page.lead} /></Text>
          </div>

          {page.tryIt && (
            <Group gap="md" align="center" wrap="wrap">
              <Button component="a" href={tryItHref(page.tryIt.svg)} leftSection={<IconPlayerPlay size={16} />}>
                {page.tryIt.label}
              </Button>
              <Text size="sm" c="dimmed" style={{ flex: 1, minWidth: 240 }}><Rich text={page.tryIt.hint} /></Text>
            </Group>
          )}

          {page.sections.map((section) => (
            <Stack key={section.heading} gap="sm" component="section">
              <Title order={2} mt="md">{section.heading}</Title>
              {section.paragraphs.map((p, i) => <Text key={i}><Rich text={p} /></Text>)}
              {section.steps && (
                <List type="ordered" spacing="xs">
                  {section.steps.map((step, i) => <List.Item key={i}><Rich text={step} /></List.Item>)}
                </List>
              )}
              {section.image && <Picture image={section.image} />}
            </Stack>
          ))}

          {page.limits.length > 0 && (
            <Stack gap="sm" component="section">
              <Title order={2} mt="md">Good to know</Title>
              <List spacing="xs">
                {page.limits.map((limit, i) => <List.Item key={i}><Rich text={limit} /></List.Item>)}
              </List>
            </Stack>
          )}

          {page.faq.length > 0 && (
            <Stack gap="sm" component="section">
              <Title order={2} mt="md">Questions</Title>
              {page.faq.map((item) => (
                <div key={item.q}>
                  <Title order={3} size="h4">{item.q}</Title>
                  <Text mt={4}><Rich text={item.a} /></Text>
                </div>
              ))}
            </Stack>
          )}

          <Divider mt="md" />
          <Stack gap="xs" component="nav" aria-label="Related features">
            <Text fw={600}>Related</Text>
            <Group gap="lg">
              {page.related.map((slug) => {
                const other = FEATURE_PAGES.find((p) => p.slug === slug)!;
                return <Anchor key={slug} component={Link} to={`/features/${slug}`}>{other.title}</Anchor>;
              })}
              <Anchor component={Link} to="/features">All features</Anchor>
            </Group>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
