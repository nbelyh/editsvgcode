import { Text, Button } from '@mantine/core';
import { IconGitFork } from '@tabler/icons-react';
// Owns .aui-viewer-bar, so it carries the stylesheet rather than relying on
// whichever panel happens to have imported it.
import './AiChat.css';

interface ForeignDocNoticeProps {
  /** The whole message, ready to render — each panel can only promise what it
   *  governs, so it picks one of the FOREIGN_DOC_*_NOTICE constants in
   *  visibility.ts. Passed complete rather than assembled here: these are
   *  translatable strings and must not be built from fragments. */
  message: string;
  /** Fork this document. Injected rather than calling useCloneDocument here, so
   *  this component stays clear of firebase.ts and its module-level side
   *  effects and remains renderable in a plain jsdom test. */
  onStartFrom: () => void;
  cloning?: boolean;
}

/**
 * Shown on somebody else's document: the conversation and the drawing are
 * readable but not continuable, and forking gives the visitor a draft of their
 * own. Rendered by both the AI chat and the Info tab, as the same strip pinned
 * to the foot of the panel — a visitor switching tabs finds "Start from this"
 * where they left it, rather than having to look for it again.
 */
export function ForeignDocNotice({ message, onStartFrom, cloning }: ForeignDocNoticeProps) {
  return (
    <div className="aui-viewer-bar">
      <Text size="xs" c="dimmed">{message}</Text>
      <Button
        size="compact-sm"
        variant="light"
        leftSection={<IconGitFork size={14} />}
        loading={cloning}
        onClick={onStartFrom}
      >
        Start from this
      </Button>
    </div>
  );
}
