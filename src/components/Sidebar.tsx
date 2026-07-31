import type { ReactNode } from 'react';
import { Stack, Title, Text, Anchor, Kbd } from '@mantine/core';

interface SidebarProps {
  onOpenCommandPalette?: () => void;
  onOpenAiChat?: () => void;
  /** Pinned to the foot of the panel when there is something to say about the
   *  document itself — currently the read-only notice for somebody else's file.
   *  Passed in rather than derived here: the page already knows, and this panel
   *  stays a plain presentational one, clear of firebase.ts and its
   *  module-level side effects. */
  notice?: ReactNode;
}

// The Carbon placement used to live at the bottom of this panel, which meant it
// only ever rendered on the Info tab. It now sits in the sidebar shell so it is
// visible whichever tab is open — see CarbonAd / EditorPage.
export function Sidebar({ onOpenCommandPalette, onOpenAiChat, notice }: SidebarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Same bar as the AI tab's header, so switching tabs doesn't shift the
          content up or down. Nothing to put in it yet beyond the label. */}
      <div className="esvg-panel-header">
        <Text size="xs" fw={600} c="dimmed">About</Text>
      </div>
      <Stack
        p="md"
        style={{ flex: 1, minHeight: 0, backgroundColor: 'var(--esvg-chrome-bg)', overflow: 'auto' }}
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
      {/* Outside the scrolling stack, so it sits where the AI tab's identical
          strip does — replacing the composer at the foot of the panel. */}
      {notice}
    </div>
  );
}
