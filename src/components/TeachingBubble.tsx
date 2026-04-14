import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Paper, Text, CloseButton, Group, Stack, ThemeIcon, Anchor } from '@mantine/core';
import { IconCode, IconSparkles } from '@tabler/icons-react';

const DISMISSED_KEY = 'esvg-teaching-bubble-dismissed';

interface TeachingBubbleProps {
  anchorSelector: string;
  active?: boolean;
  onActivate?: () => void;
}

export function TeachingBubble({ anchorSelector, active, onActivate }: TeachingBubbleProps) {
  const [visible, setVisible] = useState(() => !localStorage.getItem(DISMISSED_KEY));
  const [ready, setReady] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (active) {
      localStorage.setItem(DISMISSED_KEY, '1');
      setVisible(false);
    }
  }, [active]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(timer);
  }, [visible]);

  const reposition = useCallback(() => {
    const anchor = document.querySelector(anchorSelector);
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPos({
      top: rect.bottom + 12,
      left: rect.right,
    });
  }, [anchorSelector]);

  useEffect(() => {
    if (!visible) return;
    // Retry until the anchor element is in the DOM
    const interval = setInterval(() => {
      const anchor = document.querySelector(anchorSelector);
      if (anchor) {
        reposition();
        clearInterval(interval);
      }
    }, 100);
    window.addEventListener('resize', reposition);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', reposition);
    };
  }, [visible, anchorSelector, reposition]);

  if (!visible || !ready || !pos) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  return createPortal(
    <Paper
      shadow="lg"
      radius="md"
      p="sm"
      withBorder
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-100%)',
        zIndex: 10000,
        width: 280,
        backgroundColor: 'var(--mantine-color-dark-6)',
        borderColor: 'var(--mantine-color-blue-7)',
      }}
    >
      {/* Arrow pointing up toward the AI button */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          right: 12,
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid var(--mantine-color-blue-7)',
        }}
      />
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={4}>
        <Anchor size="sm" fw={700} c="blue.4" component="button" onClick={() => { onActivate?.(); dismiss(); }}>New: AI-Powered Editing ✨</Anchor>
        <CloseButton size="sm" onClick={dismiss} aria-label="Dismiss" />
      </Group>
      <Stack gap={6}>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size="sm" variant="light" color="blue"><IconSparkles size={14} /></ThemeIcon>
          <Text size="xs" c="dimmed">Describe changes in plain language and AI will edit your SVG</Text>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size="sm" variant="light" color="blue"><IconCode size={14} /></ThemeIcon>
          <Text size="xs" c="dimmed">Review proposals with a diff view before accepting</Text>
        </Group>
      </Stack>
    </Paper>,
    document.body,
  );
}
