import { Group, ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconFilePlus, IconFolderOpen, IconDownload, IconCloudUpload, IconEye, IconEyeOff } from '@tabler/icons-react';
import type { Visibility } from '../lib/firebase';
import { VisibilityMenu } from './VisibilityMenu';

interface EditorToolbarProps {
  onNew: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onSave: () => void;
  saving: boolean;
  routeFileId?: string;
  visibility: Visibility;
  isAnonymous: boolean;
  isOwner: boolean;
  onSetVisibility: (v: Visibility) => void;
  onEditMeta?: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  showPreviewToggle?: boolean;
}

export function EditorToolbar({ onNew, onUpload, onDownload, onSave, saving, routeFileId, visibility, isAnonymous, isOwner, onSetVisibility, onEditMeta, showPreview, onTogglePreview, showPreviewToggle = true }: EditorToolbarProps) {
  return (
    // minHeight (not height): on narrow panes the buttons wrap, and a fixed
    // height would leave the wrapped row invisibly overlapping the editor
    // below (Monaco's margin then swallows their clicks).
    <Group gap="xs" px={8} py={4} justify="space-between" style={{ backgroundColor: 'var(--esvg-chrome-bg)', borderBottom: '1px solid var(--esvg-chrome-border)', flexShrink: 0, minHeight: 36 }}>
      <Group gap="xs">
        <Tooltip label="Start a new SVG document">
          <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconFilePlus size={14} />} onClick={onNew}>
            New
          </Button>
        </Tooltip>
        <Tooltip label="Open an SVG file from your computer">
          <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconFolderOpen size={14} />} onClick={onUpload}>
            Open
          </Button>
        </Tooltip>
        <Tooltip label="Download the file to your computer">
          <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconDownload size={14} />} onClick={onDownload}>
            Download
          </Button>
        </Tooltip>
        <Tooltip label={isAnonymous ? (routeFileId ? "Save changes (unlisted)" : "Save to the cloud (unlisted — sign in to save privately)") : routeFileId ? "Save changes" : "Save to the cloud"}>
          <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconCloudUpload size={14} />} onClick={onSave} loading={saving}>
            Save
          </Button>
        </Tooltip>
        {routeFileId && (
          <VisibilityMenu
            asButton
            visibility={visibility}
            onChange={onSetVisibility}
            onEditMeta={onEditMeta}
            shareUrl={`${window.location.origin}/${routeFileId}`}
            disabledReason={isAnonymous ? 'Unlisted — sign in to manage visibility' : !isOwner ? 'You are not the owner of this file' : undefined}
          />
        )}
      </Group>
      {showPreviewToggle && (
        <Tooltip label={showPreview ? 'Hide preview' : 'Show preview'}>
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={onTogglePreview}>
            {showPreview ? <IconEye size={14} /> : <IconEyeOff size={14} />}
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
