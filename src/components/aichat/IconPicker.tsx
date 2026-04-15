import { useState } from 'react';
import type { IconResult } from '../../lib/api-client';

interface IconPickerProps {
  icons: IconResult[];
  onSelect: (icon: IconResult) => void;
}

export function IconPicker({ icons, onSelect }: IconPickerProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
            <span className="aui-icon-picker-name">
              {icon.name.split(':')[1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
