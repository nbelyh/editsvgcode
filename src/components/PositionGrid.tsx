import { ActionIcon } from '@mantine/core';
import type { Align } from '../lib/svg-export';

/** The grid, row by row, each with the name a screen reader says. */
const POSITIONS: { value: Align; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top', label: 'Top' },
  { value: 'top-right', label: 'Top right' },
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'bottom-right', label: 'Bottom right' },
];

/** Where the drawing sits in a box of another shape: nine buttons, one chosen. */
export function PositionGrid({ value, onChange }: { value: Align; onChange: (value: Align) => void }) {
  return (
    <div role="radiogroup" aria-label="Position" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 22px)', gap: 3, flexShrink: 0 }}>
      {POSITIONS.map((p) => {
        const selected = value === p.value;
        return (
          <ActionIcon
            key={p.value}
            role="radio"
            aria-checked={selected}
            aria-label={p.label}
            size={22}
            variant={selected ? 'filled' : 'default'}
            onClick={() => onChange(p.value)}
          >
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor', opacity: selected ? 1 : 0.4 }} />
          </ActionIcon>
        );
      })}
    </div>
  );
}
