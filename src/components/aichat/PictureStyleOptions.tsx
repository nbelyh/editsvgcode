import { Checkbox, Group, Text } from '@mantine/core';
import type { ImageStyle } from '../../lib/models';

/**
 * How the next picture is drawn, chosen on the card that asks before it is made: two small,
 * independent options. They used to be one either/or toggle that bundled outlines with detail,
 * which read as two unrelated things forced together, and before that a setting at the bottom
 * of the model menu, where nobody would find it. The choice is remembered for the next picture.
 */
export function PictureStyleOptions({ value, onChange, label }: {
  value: ImageStyle;
  onChange: (value: ImageStyle) => void;
  /** Says what the options apply to, when the card offers more than drawing a picture. */
  label?: string;
}) {
  return (
    <Group gap="md" className="aui-picture-style">
      {label && <Text size="xs" c="dimmed">{label}</Text>}
      <Checkbox
        size="xs"
        label="Bold outlines"
        checked={value.outlines}
        onChange={e => onChange({ ...value, outlines: e.currentTarget.checked })}
      />
      <Checkbox
        size="xs"
        label="More detail"
        checked={value.detail}
        onChange={e => onChange({ ...value, detail: e.currentTarget.checked })}
      />
    </Group>
  );
}
