import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Paper, Text, CloseButton, Group, Stack, ThemeIcon, Anchor } from '@mantine/core';
import { IconCode, IconSparkles } from '@tabler/icons-react';

const DISMISSED_KEY = 'esvg-teaching-bubble-dismissed';

interface TeachingBubbleProps {
  anchorSelector: string;
  onActivate?: () => void;
}

export function TeachingBubble({ anchorSelector, onActivate }: TeachingBubbleProps) {
  const [visible, setVisible] = useState(() => !localStorage.getItem(DISMISSED_KEY));
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const reposition = useCallback(() => {
    const anchor = document.querySelector(anchorSelector);
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPos({
      top: rect.top + rect.height / 2,
      left: rect.left - 12,
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

  if (!visible || !pos) return null;

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
        transform: 'translate(-100%, -50%)',
        zIndex: 10000,
        width: 280,
        backgroundColor: 'var(--mantine-color-dark-6)',
        borderColor: 'var(--mantine-color-blue-7)',
      }}
    >
      {/* Arrow pointing right toward the AI button */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: -8,
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: '8px solid var(--mantine-color-blue-7)',
        }}
      />
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={4}>
        <Anchor size="sm" fw={700} c="blue.4" component="button" onClick={() => { onActivate?.(); dismiss(); }}>Try AI Chat →</Anchor>
        <CloseButton size="sm" onClick={dismiss} aria-label="Dismiss" />
      </Group>
      <Stack gap={6}>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size="sm" variant="light" color="blue"><IconSparkles size={14} /></ThemeIcon>
          <Text size="xs" c="dimmed">Describe changes in plain English and AI will edit your SVG</Text>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size="sm" variant="light" color="blue"><IconCode size={14} /></ThemeIcon>
          <Text size="xs" c="dimmed">Review AI proposals with a diff view before accepting</Text>
        </Group>
      </Stack>
    </Paper>,
    document.body,
  );
}
