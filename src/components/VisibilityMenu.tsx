import { Menu, ActionIcon, Button, Tooltip, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLock, IconLink, IconWorld, IconCheck, IconCopy } from '@tabler/icons-react';
import type { Visibility } from '../lib/firebase';

const OPTIONS: Array<{ value: Visibility; label: string; description: string; icon: React.ReactNode }> = [
  { value: 'private', label: 'Private', description: 'Only you can view', icon: <IconLock size={14} /> },
  { value: 'unlisted', label: 'Unlisted', description: 'Anyone with the link can view', icon: <IconLink size={14} /> },
  { value: 'public', label: 'Public', description: 'Listed in the gallery for anyone to find and clone', icon: <IconWorld size={14} /> },
];

export const VISIBILITY_ICON: Record<Visibility, React.ReactNode> = {
  private: <IconLock size={14} />,
  unlisted: <IconLink size={14} />,
  public: <IconWorld size={14} />,
};

interface VisibilityMenuProps {
  visibility: Visibility;
  onChange: (v: Visibility) => void;
  /** When set, visibility options are hidden and this shows as a hint instead
   * (anonymous user / not the owner). Copy-link stays available. */
  disabledReason?: string;
  /** Absolute URL offered under "Copy link". */
  shareUrl?: string;
  /** Render the target as a labeled "Share" toolbar button instead of an icon. */
  asButton?: boolean;
}

/** Share menu: explicit visibility choices plus copy-link. */
export function VisibilityMenu({ visibility, onChange, disabledReason, shareUrl, asButton }: VisibilityMenuProps) {
  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    notifications.show({ title: 'Link copied', message: shareUrl, color: 'blue' });
  };

  // Single icon: the current visibility state doubles as the button icon,
  // which also keeps it visually distinct from Save's cloud icon.
  const target = asButton ? (
    <Button variant="subtle" color="gray" size="compact-xs" leftSection={VISIBILITY_ICON[visibility]}>
      Share
    </Button>
  ) : (
    <Tooltip label={disabledReason ?? `Visibility: ${OPTIONS.find(o => o.value === visibility)?.label}`}>
      <ActionIcon variant="subtle" color={visibility === 'private' ? 'gray' : 'blue'} size="sm">
        {VISIBILITY_ICON[visibility]}
      </ActionIcon>
    </Tooltip>
  );

  return (
    <Menu withinPortal position="bottom-start" width={290}>
      <Menu.Target>{target}</Menu.Target>
      <Menu.Dropdown>
        {disabledReason ? (
          <Menu.Label>{disabledReason}</Menu.Label>
        ) : (
          <>
            <Menu.Label>Who can see this file</Menu.Label>
            {OPTIONS.map((o) => (
              <Menu.Item
                key={o.value}
                leftSection={o.icon}
                rightSection={o.value === visibility ? <IconCheck size={14} /> : undefined}
                onClick={() => onChange(o.value)}
              >
                <Text size="sm">{o.label}</Text>
                <Text size="xs" c="dimmed">{o.description}</Text>
              </Menu.Item>
            ))}
          </>
        )}
        {shareUrl && (
          <>
            <Menu.Divider />
            <Menu.Item leftSection={<IconCopy size={14} />} onClick={copyLink}>
              <Text size="sm">Copy link</Text>
              {visibility === 'private' && !disabledReason && (
                <Text size="xs" c="dimmed">Private — the link only works for you</Text>
              )}
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
