import { useState } from 'react';
import { Container, Title, Text, Stack, Image, SimpleGrid, Card, Badge, Group, Modal, UnstyledButton } from '@mantine/core';

interface Feature {
  title: string;
  description: string;
  image: string;
  thumb: string;
  badge?: string;
}

const AI_FEATURES: Feature[] = [
  {
    title: 'AI Chat',
    description: 'Type a request like "make the circles red", "add a drop shadow to all text", or "translate all text to German". The AI reads your current SVG, generates modified code, and shows a diff. You review the changes and accept or reject. Multi-turn conversations work — each message builds on the previous context. Also useful for translating text content in SVGs to other languages.',
    image: '/screenshots/08-chat-conversation.png',
    thumb: '/screenshots/thumbs/08-chat-conversation.png',
    badge: 'Pro',
  },
  {
    title: 'Image Generation & Vectorizer',
    description: 'Describe an image in text and the AI generates a raster PNG. The built-in vectorizer then converts it to SVG paths. You can tune the vectorization: number of colors, speckle filtering threshold, corner threshold, curve optimization, and path simplification. The result is inserted directly into the editor.',
    image: '/screenshots/11-image-generation.png',
    thumb: '/screenshots/thumbs/11-image-generation.png',
    badge: 'Pro',
  },
  {
    title: 'Model Selector',
    description: 'Switch between AI models (GPT-4o, Claude, o4-mini, etc.) from a dropdown. Each model has different strengths — faster responses vs. better reasoning. A "reasoning effort" slider lets you trade speed for quality on complex edits.',
    image: '/screenshots/10-model-selector.png',
    thumb: '/screenshots/thumbs/10-model-selector.png',
    badge: 'Pro',
  },
  {
    title: 'Icon Search',
    description: 'Search across 200,000+ open-source icons (Material, FontAwesome, Lucide, etc.) by keyword. Select one and the AI inserts it into your SVG as inline paths, positioned and scaled to fit the existing viewBox. No external dependencies — pure SVG.',
    image: '/screenshots/13-icon-picker.png',
    thumb: '/screenshots/thumbs/13-icon-picker.png',
    badge: 'Pro',
  },
];

const CODE_EDITOR_FEATURES: Feature[] = [
  {
    title: 'Monaco Editor',
    description: 'The same editor engine used in VS Code. Provides syntax highlighting, bracket matching, code folding, multi-cursor editing, find/replace with regex, and minimap. The SVG preview updates live as you type.',
    image: '/screenshots/01-editor-full.png',
    thumb: '/screenshots/thumbs/01-editor-full.png',
  },
  {
    title: 'Element Autocomplete',
    description: 'Type "<" to get a list of all valid SVG elements with descriptions. The completion list is generated from the SVG spec schema and includes elements like <filter>, <clipPath>, <linearGradient> that are hard to remember.',
    image: '/screenshots/02-autocomplete.png',
    thumb: '/screenshots/thumbs/02-autocomplete.png',
  },
  {
    title: 'Hover Documentation',
    description: 'Hover over any SVG element or attribute name to see a tooltip with its description from the SVG specification. Useful when you need to check what an attribute does without leaving the editor.',
    image: '/screenshots/02b-hover-tooltip.png',
    thumb: '/screenshots/thumbs/02b-hover-tooltip.png',
  },
  {
    title: 'Attribute Completion',
    description: 'Inside an element tag, trigger autocomplete to see all valid attributes for that specific element. Each suggestion includes a description. For example, inside <rect> you get x, y, width, height, rx, ry — not the full list of every possible attribute.',
    image: '/screenshots/03-attribute-completion.png',
    thumb: '/screenshots/thumbs/03-attribute-completion.png',
  },
  {
    title: 'Value Completion',
    description: 'For attributes with a fixed set of allowed values (like cursor, stroke-linecap, font-style), the editor suggests the valid options. No need to look up which values are accepted.',
    image: '/screenshots/03b-value-completion.png',
    thumb: '/screenshots/thumbs/03b-value-completion.png',
  },
  {
    title: 'Color Picker',
    description: 'Color values in the code show an inline color swatch. Click it to open a color picker that supports hex, RGB, HSL, and named SVG colors. The picked color is written back into the attribute.',
    image: '/screenshots/04-color-completion.png',
    thumb: '/screenshots/thumbs/04-color-completion.png',
  },
];

const PREVIEW_FEATURES: Feature[] = [
  {
    title: 'Zoom Controls',
    description: 'Toolbar buttons for zoom in, zoom out, reset to 100%, and fit to window. Ctrl+scroll also works. The current zoom percentage is shown in the toolbar.',
    image: '/screenshots/05-zoom-controls.png',
    thumb: '/screenshots/thumbs/05-zoom-controls.png',
  },
  {
    title: 'Background Modes',
    description: 'Four background options: light checkerboard, dark checkerboard, solid white, and solid black. Checkerboard patterns make transparent regions visible. Dark/light solid backgrounds help check contrast.',
    image: '/screenshots/06-background-modes.png',
    thumb: '/screenshots/thumbs/06-background-modes.png',
  },
  {
    title: 'Click-to-Select',
    description: 'Click an element in the preview and the editor jumps to the corresponding line in the source code. A bounding box is drawn around the selected element. Works with nested groups and transformed elements.',
    image: '/screenshots/07-click-to-select.png',
    thumb: '/screenshots/thumbs/07-click-to-select.png',
  },
];

const FILE_FEATURES: Feature[] = [
  {
    title: 'Cloud Storage',
    description: 'Files are saved to Firebase with auto-generated SVG thumbnails. Each file can be toggled between public (shareable link) and private. The files page shows a grid of all saved files with their thumbnails.',
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
                <Image src={f.thumb} alt={f.title} />
              </UnstyledButton>
            </Card.Section>
            <Group mt="md" mb="xs" justify="space-between">
              <Text fw={600}>{f.title}</Text>
              {f.badge && <Badge color="blue" variant="light">{f.badge}</Badge>}
            </Group>
            <Text size="sm" c="dimmed">{f.description}</Text>
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
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Title order={1}>Features</Title>
          <Text size="lg" c="dimmed">
            An SVG code editor with AI assistance, schema-aware autocomplete, and live preview.
          </Text>
          <FeatureSection title="AI Tools (Pro)" features={AI_FEATURES} onImageClick={handleImageClick} />
          <FeatureSection title="Code Editor" features={CODE_EDITOR_FEATURES} onImageClick={handleImageClick} />
          <FeatureSection title="Live Preview" features={PREVIEW_FEATURES} onImageClick={handleImageClick} />
          <FeatureSection title="File Management" features={FILE_FEATURES} onImageClick={handleImageClick} />
        </Stack>
      </Container>

      <Modal
        opened={opened !== null}
        onClose={() => setOpened(null)}
        size="95vw"
        title={opened?.title}
        centered
        padding="xs"
      >
        {opened && <Image src={opened.image} alt={opened.title} />}
      </Modal>
    </div>
  );
}
