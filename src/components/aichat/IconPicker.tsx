import { useState } from 'react';
import type { IconResult } from '../../lib/api-client';

interface IconPickerProps {
  icons: IconResult[];
  onSelect: (icon: IconResult) => void;
  onMore: () => void;
  onNone: () => void;
  selectedIcon?: IconResult | null;
}

export function IconPicker({ icons, onSelect, onMore, onNone, selectedIcon }: IconPickerProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (selectedIcon) {
    return (
      <div className="aui-icon-picker aui-icon-picker-collapsed">
        <span className="aui-icon-picker-label">Selected icon:</span>
        <div className="aui-icon-picker-selected">
          <div
            className="aui-icon-picker-svg"
            dangerouslySetInnerHTML={{ __html: selectedIcon.svg }}
          />
          <span className="aui-icon-picker-selected-name">{selectedIcon.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aui-icon-picker">
      <div className="aui-icon-picker-label">Pick an icon:</div>
      <div className="aui-icon-picker-grid">
        {icons.map((icon, i) => (
          <button
            key={icon.name}
            className={`aui-icon-picker-item${hoveredIdx === i ? ' hovered' : ''}`}
            onClick={() => onSelect(icon)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            title={`${icon.name} — ${icon.setName} (${icon.license})`}
          >
            <div
              className="aui-icon-picker-svg"
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
          </button>
        ))}
      </div>
      <div className="aui-icon-picker-actions">
        <button className="aui-icon-picker-generate" onClick={onMore}>More icons…</button>
        <span className="aui-icon-picker-sep">·</span>
        <button className="aui-icon-picker-generate" onClick={onNone}>None — generate instead</button>
      </div>
    </div>
  );
}
