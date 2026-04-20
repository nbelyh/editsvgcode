import { Container, Title, Text, Stack, Image, SimpleGrid, Card, Badge, Group } from '@mantine/core';

interface Feature {
  title: string;
  description: string;
  image: string;
  badge?: string;
}

const CODE_EDITOR_FEATURES: Feature[] = [
  {
    title: 'Full-Featured Code Editor',
    description: 'Powered by Monaco (the engine behind VS Code) with syntax highlighting, bracket matching, and dark theme support. Live preview updates as you type.',
    image: '/screenshots/01-editor-full.png',
  },
  {
    title: 'SVG Element Autocomplete',
    description: 'Start typing a tag and get instant suggestions for all SVG elements — circles, paths, filters, gradients, and more.',
    image: '/screenshots/02-autocomplete.png',
  },
  {
    title: 'Hover Documentation',
    description: 'Hover over any SVG element or attribute to see its description from the MDN documentation, right in the editor.',
    image: '/screenshots/02b-hover-tooltip.png',
  },
  {
    title: 'Attribute Completion',
    description: 'Inside any SVG element, get context-aware suggestions for all valid attributes with descriptions.',
    image: '/screenshots/03-attribute-completion.png',
  },
  {
    title: 'Attribute Value Completion',
    description: 'Enumerated attribute values are suggested automatically — no need to memorize valid options.',
    image: '/screenshots/03b-value-completion.png',
  },
  {
    title: 'Color Picker',
    description: 'Click on any color value to open an inline color picker. Supports named colors, hex, RGB, and HSL formats.',
    image: '/screenshots/04-color-completion.png',
  },
];

const PREVIEW_FEATURES: Feature[] = [
  {
    title: 'Zoom Controls',
    description: 'Zoom in, out, reset, or fit-to-window with toolbar buttons or Ctrl+Scroll. The zoom percentage is always visible.',
    image: '/screenshots/05-zoom-controls.png',
  },
  {
    title: 'Background Modes',
    description: 'Toggle between light checkerboard, dark checkerboard, white, and black backgrounds to inspect transparency and contrast.',
    image: '/screenshots/06-background-modes.png',
  },
  {
    title: 'Click-to-Select',
    description: 'Click any element in the preview to select it. The corresponding code is highlighted in the editor, and a bounding box appears around the element.',
    image: '/screenshots/07-click-to-select.png',
  },
];

const AI_FEATURES: Feature[] = [
  {
    title: 'AI Chat',
    description: 'Describe changes in natural language — "make the circles red", "add a border" — and the AI edits your SVG. Review changes in a diff view before accepting.',
    image: '/screenshots/08-chat-conversation.png',
    badge: 'Pro',
  },
  {
    title: 'Model Selector',
    description: 'Choose between different AI models and adjust reasoning effort to balance speed and quality for your task.',
    image: '/screenshots/10-model-selector.png',
    badge: 'Pro',
  },
  {
    title: 'Image Generation & Vectorizer',
    description: 'Generate raster images from text prompts and convert them to SVG with adjustable vectorization parameters — colors, speckle filter, curve mode, and more.',
    image: '/screenshots/11-image-generation.png',
    badge: 'Pro',
  },
  {
    title: 'Icon Search',
    description: 'Search through 200,000+ open-source icons. Pick one and the AI inserts it into your SVG, sized and positioned to fit.',
    image: '/screenshots/13-icon-picker.png',
    badge: 'Pro',
  },
];

const FILE_FEATURES: Feature[] = [
  {
    title: 'File Management',
    description: 'Save your work to the cloud, manage files with thumbnails, and control visibility with public/private toggles.',
    image: '/screenshots/14-files-page.png',
  },
];

function FeatureSection({ title, features }: { title: string; features: Feature[] }) {
  return (
    <>
      <Title order={2} mt="xl">{title}</Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {features.map((f) => (
          <Card key={f.title} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image src={f.image} alt={f.title} />
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
  return (
    <div className="page-scroll">
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Title order={1}>Features</Title>
          <Text size="lg" c="dimmed">
            Everything you need to create, edit, and share SVG graphics — from a powerful code editor to AI-powered tools.
          </Text>
          <FeatureSection title="Code Editor" features={CODE_EDITOR_FEATURES} />
          <FeatureSection title="Live Preview" features={PREVIEW_FEATURES} />
          <FeatureSection title="AI-Powered Tools" features={AI_FEATURES} />
          <FeatureSection title="File Management" features={FILE_FEATURES} />
        </Stack>
      </Container>
    </div>
  );
}
