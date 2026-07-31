import { Stack, Title, Text, Anchor, Kbd } from '@mantine/core';

interface SidebarProps {
  onOpenCommandPalette?: () => void;
  onOpenAiChat?: () => void;
}

// The Carbon placement used to live at the bottom of this panel, which meant it
// only ever rendered on the Info tab. It now sits in the sidebar shell so it is
// visible whichever tab is open — see CarbonAd / EditorPage.
export function Sidebar({ onOpenCommandPalette, onOpenAiChat }: SidebarProps) {
  return (
    <Stack
      p="md"
      h="100%"
      style={{ backgroundColor: 'var(--esvg-chrome-bg)', overflow: 'auto' }}
    >
      <div>
        <Title order={4}>SVG Code Sandbox</Title>
        <Text size="sm" mt="xs">Upload or paste SVG code for editing.</Text>
        <Text size="sm" mt="xs">Autocomplete assists with tags and attributes, with real-time preview.</Text>
        <Text size="sm" mt="xs">Save your work by copying, downloading, or sharing via a public link.</Text>
        <Text size="sm" mt="xs">
          Press <Kbd>F1</Kbd> to open the{' '}
          <Anchor component="button" size="sm" onClick={onOpenCommandPalette}>Command Palette</Anchor>
          {' '}for additional editor actions.
        </Text>
        <Text size="sm" mt="xs">
          Use{' '}
          <Anchor component="button" size="sm" onClick={onOpenAiChat}>AI Chat</Anchor>
          {' '}to edit your SVG with natural language. Describe what you want to change and the AI will propose edits you can accept or reject.
        </Text>
      </div>
    </Stack>
  );
}
