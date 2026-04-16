import { Group, ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconFilePlus, IconFolderOpen, IconDownload, IconCloudUpload, IconLock, IconWorld, IconEye, IconEyeOff } from '@tabler/icons-react';

interface EditorToolbarProps {
  onNew: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onSave: () => void;
  saving: boolean;
  routeFileId?: string;
  isPrivate: boolean;
  onTogglePrivate: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export function EditorToolbar({ onNew, onUpload, onDownload, onSave, saving, routeFileId, isPrivate, onTogglePrivate, showPreview, onTogglePreview }: EditorToolbarProps) {
  return (
    <Group gap="xs" px={8} py={4} justify="space-between" style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderBottom: '1px solid var(--mantine-color-dark-4)', flexShrink: 0, height: 36 }}>
      <Group gap="xs">
        <Tooltip label="Create a blank SVG document">
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
        <Tooltip label={routeFileId ? "Save changes" : "Save to the cloud"}>
          <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconCloudUpload size={14} />} onClick={onSave} loading={saving}>
            Save
          </Button>
        </Tooltip>
        {routeFileId && (
          <Tooltip label={isPrivate ? 'Private — only you can view. Click to make public.' : 'Public — anyone with the link can view. Click to make private.'}>
            <ActionIcon variant="subtle" color={isPrivate ? 'gray' : 'blue'} size="sm" onClick={onTogglePrivate}>
              {isPrivate ? <IconLock size={14} /> : <IconWorld size={14} />}
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Tooltip label={showPreview ? 'Hide preview' : 'Show preview'}>
        <ActionIcon variant="subtle" color="gray" size="sm" onClick={onTogglePreview}>
          {showPreview ? <IconEye size={14} /> : <IconEyeOff size={14} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
