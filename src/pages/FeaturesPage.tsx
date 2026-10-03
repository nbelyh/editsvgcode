import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, Text, Stack, Image, SimpleGrid, Card, Badge, Group, Modal, UnstyledButton, Anchor } from '@mantine/core';
import { DEFAULT_PRICING } from '../lib/pricing';
import { PageMeta } from '../components/PageMeta';
import { metaFor } from '../lib/route-meta';

interface Feature {
  title: string;
  /** The /features/<slug> page that explains it. A test checks every card has one. */
  page: string;
  description: string;
  image: string;
  thumb: string;
  /** The thumbnail's pixel size, when it is not THUMB_SIZE. */
  thumbSize?: readonly [number, number];
  /**
   * The pixel density a screenshot of part of the screen was taken at. Such a picture is shown
   * at its own size and never stretched to the card: scaled even a little, its small text blurs.
   */
  density?: number;
  badge?: string;
}

/**
 * The thumbnails' size, given to each <img> so the browser can reserve its box before the
 * picture arrives. Without it a thumbnail was zero pixels tall until it loaded: the server-
 * rendered page laid its text out with no pictures above it, then pushed all of it down about
 * 330px when they came in — a layout shift of 0.21 on every visit, close to what search counts
 * as poor. A test reads each file and fails if its real size no longer matches.
 */
export const THUMB_SIZE = [700, 450] as const;

const AI_FEATURES: Feature[] = [
  {
    title: 'AI Chat',
    page: 'ai-chat',
    description: 'Type a request like "make the circles red", "add a drop shadow to all text", or "translate all text to German". The AI reads your current SVG, proposes the change with a one-line summary and shows it in the preview, and you accept or reject it. Multi-turn conversations work — each message builds on the previous context. Also useful for translating text content in SVGs to other languages.',
    image: '/screenshots/08-chat-conversation.png',
    thumb: '/screenshots/thumbs/08-chat-conversation.png',
    badge: 'Pro',
  },
  {
    title: 'Image Generation & Vectorizer',
    page: 'ai-images',
    description: 'Describe an image in text and the AI generates a raster PNG. The built-in vectorizer then converts it to SVG paths. You can tune the vectorization: number of colors, speckle filtering threshold, corner threshold, curve optimization, and path simplification. The result is inserted directly into the editor.',
    image: '/screenshots/11-image-generation.png',
    thumb: '/screenshots/thumbs/11-image-generation.png',
    badge: 'Pro',
  },
  {
    title: 'Image Modification',
    page: 'ai-images',
    description: 'Ask the AI to modify a previously generated image — add elements, change colors, or refine details. The AI edits the existing raster image based on your instructions, then re-vectorizes it to SVG. Multiple modifications can be chained in the same conversation.',
    image: '/screenshots/16-image-modification.png',
    thumb: '/screenshots/thumbs/16-image-modification.png',
    thumbSize: [400, 197],
    badge: 'Pro',
  },
  {
    title: 'Model Selector',
    page: 'ai-chat',
    description: 'Switch between AI models from a dropdown — the GPT-5 family, Claude, DeepSeek and Kimi, with more under "Show all". Each has different strengths, and cheaper models cost fewer credits per request. On the models that support it, a reasoning effort control lets you trade speed for care on complex edits.',
    image: '/screenshots/10-model-selector.png',
    thumb: '/screenshots/thumbs/10-model-selector.png',
    badge: 'Pro',
  },
  {
    title: 'Icon Search',
    page: 'icon-search',
    description: 'Search across 200,000+ open-source icons (Material, FontAwesome, Lucide, etc.) by keyword. Pick one and the AI inserts it into your SVG as inline markup, sized and placed to fit the drawing. No external dependencies — pure SVG, under licences that need no attribution.',
    image: '/screenshots/13-icon-picker.png',
    thumb: '/screenshots/thumbs/13-icon-picker.png',
    badge: 'Pro',
  },
];

const CODE_EDITOR_FEATURES: Feature[] = [
  {
    title: 'Monaco Editor',
    page: 'code-editor',
    description: 'The same editor engine used in VS Code. Provides syntax highlighting, bracket matching, code folding, multi-cursor editing, find/replace with regex, and document formatting. The SVG preview updates live as you type.',
    image: '/screenshots/01-editor-full.png',
    thumb: '/screenshots/thumbs/01-editor-full.png',
  },
  {
    title: 'Element Autocomplete',
    page: 'autocomplete',
    description: 'Type "<" to get a list of all valid SVG elements with descriptions. The completion list is generated from the SVG spec schema and includes elements like <filter>, <clipPath>, <linearGradient> that are hard to remember.',
    image: '/screenshots/02-autocomplete.png',
    thumb: '/screenshots/thumbs/02-autocomplete.png',
  },
  {
    title: 'Hover Documentation',
    page: 'autocomplete',
    description: 'Hover over any SVG element or attribute name to see a tooltip with its description from the MDN SVG reference. Useful when you need to check what an attribute does without leaving the editor.',
    image: '/screenshots/02b-hover-tooltip.png',
    thumb: '/screenshots/thumbs/02b-hover-tooltip.png',
  },
  {
    title: 'Attribute Completion',
    page: 'autocomplete',
    description: 'Inside an element tag, trigger autocomplete to see all valid attributes for that specific element. Each suggestion includes a description. For example, inside <rect> you get x, y, width, height, rx, ry — not the full list of every possible attribute.',
    image: '/screenshots/03-attribute-completion.png',
    thumb: '/screenshots/thumbs/03-attribute-completion.png',
  },
  {
    title: 'Value Completion',
    page: 'autocomplete',
    description: 'For attributes with a fixed set of allowed values (like cursor, stroke-linecap, font-style), the editor suggests the valid options. No need to look up which values are accepted.',
    image: '/screenshots/03b-value-completion.png',
    thumb: '/screenshots/thumbs/03b-value-completion.png',
  },
  {
    title: 'Color Picker',
    page: 'code-editor',
    description: 'Hex, rgb() and hsl() color values in the code show an inline color swatch. Click it to open a color picker; the picked color is written back into the attribute, as hex, RGB or HSL.',
    image: '/screenshots/04-color-completion.png',
    thumb: '/screenshots/thumbs/04-color-completion.png',
  },
];

const PREVIEW_FEATURES: Feature[] = [
  {
    title: 'Zoom Controls',
    page: 'live-preview',
    description: 'Toolbar buttons for zoom in, zoom out, reset to 100%, and fit to window. Ctrl+scroll also works. The current zoom percentage is shown in the toolbar.',
    image: '/screenshots/05-zoom-controls.png',
    thumb: '/screenshots/thumbs/05-zoom-controls.png',
  },
  {
    title: 'Background Modes',
    page: 'live-preview',
    description: 'Four background options: light checkerboard, dark checkerboard, solid white, and solid black. Checkerboard patterns make transparent regions visible. Dark/light solid backgrounds help check contrast.',
    image: '/screenshots/06-background-modes.png',
    thumb: '/screenshots/thumbs/06-background-modes.png',
  },
  {
    title: 'Click-to-Select',
    page: 'live-preview',
    description: 'Click an element in the preview and the editor jumps to the corresponding line in the source code. The selected element is highlighted in the preview — and moving the cursor in the code highlights the element under it.',
    image: '/screenshots/07-click-to-select.png',
    thumb: '/screenshots/thumbs/07-click-to-select.png',
  },
];

const EXPORT_FEATURES: Feature[] = [
  {
    title: 'Export as PNG or WebP',
    page: 'export',
    description: 'Save the drawing as a picture at its own size, at 2× and 3× for sharp screens — one at a time, or all together as a zip with the <img srcset> line that uses them — or at any width and height, on a transparent, white or coloured background; or copy it straight to the clipboard. Unlock the proportions to export into a box of another shape, such as a square logo on a 1200 × 630 social card, and pick where the drawing sits; it stays whole and is never stretched. A preview and the exact pixel size are shown before anything is saved.',
    image: '/screenshots/28-export-image.png',
    thumb: '/screenshots/thumbs/28-export-image.png',
    thumbSize: [732, 1172],
    density: 1.5,
  },
  {
    title: 'Favicon & App Icons',
    page: 'export',
    description: 'Turn the drawing into the icons a website links to: a favicon.ico with 16, 32 and 48 pixel icons, an SVG favicon, the 180 pixel iPhone home-screen icon, and the 192 and 512 pixel icons for a web app manifest. Download the favicon on its own, or everything as a zip with the lines to paste into your page. The small sizes are previewed, so you can see whether the drawing still reads at 16 pixels.',
    image: '/screenshots/29-favicon-icons.png',
    thumb: '/screenshots/thumbs/29-favicon-icons.png',
    thumbSize: [732, 942],
    density: 1.5,
  },
  {
    title: 'Copy as Code',
    page: 'export',
    description: 'Copy the drawing in the form you are about to paste it into: the SVG markup, a data URI for an <img>, Base64, a CSS background, or a React component with its attributes spelled the way React expects and editor leftovers removed. The code is shown before it is copied, and the form you used last is remembered.',
    image: '/screenshots/30-copy-as-code.png',
    thumb: '/screenshots/thumbs/30-copy-as-code.png',
    thumbSize: [1002, 801],
    density: 1.5,
  },
];

const FILE_FEATURES: Feature[] = [
  {
    title: 'Cloud Storage',
    page: 'save-and-share',
    description: 'Save a drawing to the cloud and it gets a link of its own. Share sets who can see it — private, unlisted, or published to the public gallery — and the Files page lists every saved drawing with a preview and its views and downloads.',
    image: '/screenshots/14-files-page.png',
    thumb: '/screenshots/thumbs/14-files-page.png',
  },
];

function FeatureSection({ title, features, onImageClick }: { title: string; features: Feature[]; onImageClick: (f: Feature) => void }) {
  return (
    <>
      <Title order={2} mt="xl">{title}</Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {features.map((f) => (
          <Card key={f.title} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <UnstyledButton onClick={() => onImageClick(f)} style={{ width: '100%', cursor: 'zoom-in' }}>
                {/* Intrinsic size as attributes, so the box exists before the picture does;
                    height:auto keeps it scaling with the card rather than fixed at that size. */}
                <Image src={f.thumb} alt={f.title} width={(f.thumbSize ?? THUMB_SIZE)[0]}
                  height={(f.thumbSize ?? THUMB_SIZE)[1]}
                  style={{ height: 'auto', ...(f.density && { maxWidth: (f.thumbSize ?? THUMB_SIZE)[0] / f.density, marginInline: 'auto' }) }} />
              </UnstyledButton>
            </Card.Section>
            <Group mt="md" mb="xs" justify="space-between">
              <Anchor component={Link} to={`/features/${f.page}`} fw={600} c="inherit">{f.title}</Anchor>
              {f.badge && <Badge color="blue" variant="light">{f.badge}</Badge>}
            </Group>
            <Text size="sm" c="dimmed">{f.description}</Text>
            <Anchor component={Link} to={`/features/${f.page}`} size="sm" mt="sm">Learn more</Anchor>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}

export function FeaturesPage() {
  const [opened, setOpened] = useState<Feature | null>(null);

  const handleImageClick = (f: Feature) => setOpened(f);

  return (
    <div className="page-scroll">
      <PageMeta {...metaFor('/features')} />
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Title order={1}>Features</Title>
          <Text size="lg" c="dimmed">
            A free SVG code editor with schema-aware autocomplete and live preview. The optional AI assistance
            (marked <Badge color="blue" variant="light" component="span">Pro</Badge>) runs on credits — every account gets
            {' '}{DEFAULT_PRICING.freeMonthlyCredits} free each month — while everything else is free.
          </Text>
          <FeatureSection title="AI Tools (Pro)" features={AI_FEATURES} onImageClick={handleImageClick} />
          <FeatureSection title="Code Editor" features={CODE_EDITOR_FEATURES} onImageClick={handleImageClick} />
          <FeatureSection title="Live Preview" features={PREVIEW_FEATURES} onImageClick={handleImageClick} />
          <FeatureSection title="Export" features={EXPORT_FEATURES} onImageClick={handleImageClick} />
          <FeatureSection title="File Management" features={FILE_FEATURES} onImageClick={handleImageClick} />
        </Stack>
      </Container>

      <Modal
        opened={opened !== null}
        onClose={() => setOpened(null)}
        // A picture with a density opens at its own size; stretched to the window, it blurred.
        size={opened?.density ? 'auto' : '95vw'}
        title={opened?.title}
        centered
        padding="xs"
      >
        {opened && (
          <Image
            src={opened.image}
            srcSet={opened.density ? `${opened.image} ${opened.density}x` : undefined}
            w={opened.density ? 'auto' : undefined}
            maw="100%"
            alt={opened.title}
          />
        )}
      </Modal>
    </div>
  );
}
