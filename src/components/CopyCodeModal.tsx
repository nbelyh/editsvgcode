import { useMemo, useState } from 'react';
import { Modal, Stack, Group, Text, Button, SegmentedControl, ScrollArea, Code } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { svgDataUri, svgBase64DataUri, cssBackground, reactComponent } from '../lib/svg-export';
import { trackCopyAs } from '../lib/analytics';

/**
 * The drawing as code, shown before it is copied: the markup itself, a data URI for an <img>,
 * a CSS background, a React component. Copying straight from the menu put something on the
 * clipboard nobody had seen, so a React component with a wrong name or a data URI too long for
 * its purpose turned up only after it had been pasted.
 */

export type CopyKind = 'svg' | 'datauri' | 'base64' | 'css' | 'react';

/** Whole sentences per kind, so each can be translated as written. */
const COPIED: Record<CopyKind, string> = {
  svg: 'SVG code copied',
  datauri: 'Data URI copied',
  base64: 'Base64 data URI copied',
  css: 'CSS background copied',
  react: 'React component copied',
};

const KINDS: Array<{ value: CopyKind; label: string }> = [
  { value: 'svg', label: 'SVG' },
  { value: 'datauri', label: 'Data URI' },
  { value: 'base64', label: 'Base64' },
  { value: 'css', label: 'CSS' },
  { value: 'react', label: 'React' },
];

/** The code for one kind, or why there is none. */
function codeFor(kind: CopyKind, svg: string, fileName: string): string | { error: string } {
  if (kind === 'react') return reactComponent(svg, fileName);
  if (kind === 'datauri') return svgDataUri(svg);
  if (kind === 'base64') return svgBase64DataUri(svg);
  if (kind === 'css') return cssBackground(svg);
  return svg;
}

const STORAGE_KEY = 'esvg-copy-kind';

/** The form last copied, so someone who always wants a React component sees it first. */
function loadKind(): CopyKind {
  try {
    const kind = localStorage.getItem(STORAGE_KEY);
    return KINDS.some((k) => k.value === kind) ? kind as CopyKind : 'svg';
  } catch {
    return 'svg';
  }
}

interface CopyCodeModalProps {
  opened: boolean;
  onClose: () => void;
  svg: string;
  fileName: string;
}

export function CopyCodeModal({ opened, onClose, svg, fileName }: CopyCodeModalProps) {
  const [shown, setShown] = useState<CopyKind>(loadKind);
  const choose = (kind: CopyKind) => {
    setShown(kind);
    try {
      localStorage.setItem(STORAGE_KEY, kind);
    } catch { /* private mode: not remembered */ }
  };

  const code = useMemo(() => (opened ? codeFor(shown, svg, fileName) : ''), [opened, shown, svg, fileName]);
  const error = typeof code === 'string' ? null : code.error;
  const text = typeof code === 'string' ? code : '';
  // A data URI is one unbroken line; wrapped anywhere, it stays readable in the box.
  const oneLine = shown === 'datauri' || shown === 'base64' || shown === 'css';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      trackCopyAs(shown);
      notifications.show({ title: COPIED[shown], message: 'Paste it wherever you need it.', color: 'blue' });
      onClose();
    } catch {
      notifications.show({ title: 'Could not copy', message: 'This browser did not allow access to the clipboard.', color: 'red' });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Copy as code" centered size="lg">
      <Stack gap="sm">
        <SegmentedControl fullWidth size="xs" value={shown} onChange={(v) => choose(v as CopyKind)} data={KINDS} />
        {error ? (
          <Text size="sm" c="red">{error}</Text>
        ) : (
          <ScrollArea.Autosize mah={320} type="auto" style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 4 }}>
            <Code
              block
              data-testid="copy-code-preview"
              style={{ whiteSpace: oneLine ? 'pre-wrap' : 'pre', wordBreak: oneLine ? 'break-all' : 'normal', fontSize: 12 }}
            >
              {text}
            </Code>
          </ScrollArea.Autosize>
        )}
        <Group justify="space-between" gap="xs">
          <Text size="xs" c="dimmed" data-testid="copy-code-length">{text.length.toLocaleString()} characters</Text>
          <Button leftSection={<IconCopy size={14} />} disabled={!!error} onClick={copy}>Copy</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
