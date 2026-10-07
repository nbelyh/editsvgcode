import type { Handle } from '../lib/svg-geometry';

export type Point = { x: number; y: number };

interface SelectionOverlayProps {
  /** The selection's bounding box as four corners in overlay pixels — nw, ne,
   * se, sw in the element's OWN frame, so a rotated element gets a rotated box. */
  quad: Point[] | null;
  /** Bigger handles for a finger than for a mouse. */
  coarse: boolean;
}

const mid = (p: Point, q: Point): Point => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });

/** The resize cursor pointing the way this handle actually faces on screen,
 * which for a rotated element is not the way its name says. */
function cursorFor(centre: Point, at: Point): string {
  const deg = ((Math.atan2(at.y - centre.y, at.x - centre.x) * 180) / Math.PI + 180) % 180;
  if (deg < 22.5 || deg >= 157.5) return 'ew-resize';
  if (deg < 67.5) return 'nwse-resize';
  if (deg < 112.5) return 'ns-resize';
  return 'nesw-resize';
}

/**
 * The selection box and its eight resize handles, drawn over the preview.
 *
 * In a layer of its own rather than inside the user's drawing: nothing here may
 * end up in their document, their CSS must not restyle it, and the handles
 * should stay the same size on screen at any zoom. Only the handles take the
 * pointer; everything else passes through to the drawing underneath.
 */
export function SelectionOverlay({ quad, coarse }: SelectionOverlayProps) {
  if (!quad) return null;
  const [nw, ne, se, sw] = quad;
  const centre = mid(nw, se);
  const size = coarse ? 14 : 8;
  const width = Math.hypot(ne.x - nw.x, ne.y - nw.y);
  const height = Math.hypot(sw.x - nw.x, sw.y - nw.y);

  // On a small element the side handles would sit on top of the corners and
  // leave nothing to grab, so only the corners are offered.
  const sides = width > size * 3 && height > size * 3;
  const handles: [Handle, Point][] = [
    ['nw', nw], ['ne', ne], ['se', se], ['sw', sw],
    ...(sides ? [['n', mid(nw, ne)], ['e', mid(ne, se)], ['s', mid(se, sw)], ['w', mid(sw, nw)]] as [Handle, Point][] : []),
  ];
  // A line or a flat shape has no area to drag the far side of.
  const usable = handles.filter(([, p]) => Math.hypot(p.x - centre.x, p.y - centre.y) > 1);

  return (
    <svg
      data-testid="selection-overlay"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
    >
      <polygon
        points={quad.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#228be6"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      {usable.map(([name, p]) => (
        <rect
          key={name}
          data-handle={name}
          x={p.x - size / 2}
          y={p.y - size / 2}
          width={size}
          height={size}
          fill="#fff"
          stroke="#228be6"
          strokeWidth={1.5}
          style={{ pointerEvents: 'all', cursor: cursorFor(centre, p), touchAction: 'none' }}
        />
      ))}
    </svg>
  );
}
