import { useRef, useEffect, useState, useCallback } from 'react';
import { ActionIcon, Group, SegmentedControl, Text, Tooltip } from '@mantine/core';
import { IconArrowsMaximize, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import DOMPurify from 'dompurify';

interface PreviewProps {
  svgCode: string;
}

type BgMode = 'checkerboard' | 'white' | 'black' | 'none';

const CHECKERBOARD =
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEX////g4OACVBJKAAAAFElEQVR42mNgAAJGIGDAwyAkDwQABMgAIUCVOUYAAAAASUVORK5CYII=")';

const BG: Record<BgMode, { background: string; backgroundImage?: string }> = {
  checkerboard: { background: 'transparent', backgroundImage: CHECKERBOARD },
  white: { background: '#fff' },
  black: { background: '#000' },
  none: { background: 'transparent' },
};

const LEVELS = [1, 2, 5, 10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 500, 800, 1000, 1500, 2000, 3000, 5000];

const stepUp = (z: number) => LEVELS.find((l) => l > z) ?? Math.round(z * 1.5);
const stepDown = (z: number) => [...LEVELS].reverse().find((l) => l < z) ?? Math.max(1, Math.round(z / 1.5));

const isAbsoluteLength = (v: string) => /^[\d.]+(?:px)?$/.test(v.trim());

/** Compute viewBox from getBBox, falling back to `fw x fh` if getBBox fails. */
function synthesizeViewBox(svg: SVGSVGElement, fw: number, fh: number) {
  try {
    const bb = svg.getBBox();
    if (bb.width > 0 && bb.height > 0) {
      const x = Math.min(0, bb.x);
      const y = Math.min(0, bb.y);
      const w = Math.max(fw, bb.x + bb.width) - x;
      const h = Math.max(fh, bb.y + bb.height) - y;
      svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
      return { w, h };
    }
  } catch { /* not rendered */ }
  if (fw > 0 && fh > 0) {
    svg.setAttribute('viewBox', `0 0 ${fw} ${fh}`);
    return { w: fw, h: fh };
  }
  return null;
}

export function Preview({ svgCode }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const naturalSize = useRef<{ w: number; h: number } | null>(null);
  const prevZoomRef = useRef(100);
  const [zoomPct, setZoomPct] = useState(100);
  const [bgMode, setBgMode] = useState<BgMode>('checkerboard');

  const zoomIn = useCallback(() => setZoomPct(stepUp), []);
  const zoomOut = useCallback(() => setZoomPct(stepDown), []);
  const zoomReset = useCallback(() => setZoomPct(100), []);
  const zoomFit = useCallback(() => {
    const el = scrollRef.current;
    const ns = naturalSize.current;
    if (!el || !ns) return;
    setZoomPct(Math.max(1, Math.floor(Math.min(el.clientWidth / ns.w, el.clientHeight / ns.h) * 100)));
  }, []);

  // Render sanitized SVG, determine natural size, auto-fit
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = DOMPurify.sanitize(svgCode, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['use'],
    });
    const svg = containerRef.current.querySelector('svg');
    if (!svg) { naturalSize.current = null; return; }

    const wAttr = svg.getAttribute('width') || '';
    const hAttr = svg.getAttribute('height') || '';
    const vb = svg.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
    const hasVb = vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0;

    let size: { w: number; h: number } | null = null;
    if (hasVb) {
      size = { w: vb[2], h: vb[3] };
    } else if (isAbsoluteLength(wAttr) && isAbsoluteLength(hAttr)) {
      size = synthesizeViewBox(svg, parseFloat(wAttr), parseFloat(hAttr));
    } else {
      size = synthesizeViewBox(svg, 0, 0);
    }

    if (!isAbsoluteLength(wAttr)) svg.removeAttribute('width');
    if (!isAbsoluteLength(hAttr)) svg.removeAttribute('height');
    naturalSize.current = size;

    // Auto-fit when SVG exceeds viewport
    const el = scrollRef.current;
    if (el && size) {
      const fit = Math.floor(Math.min(el.clientWidth / size.w, el.clientHeight / size.h) * 100);
      setZoomPct(size.w > el.clientWidth || size.h > el.clientHeight ? Math.max(1, fit) : 100);
    }
  }, [svgCode]);

  // Apply zoom + background + border
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg');
    const el = scrollRef.current;
    if (!svg || !naturalSize.current || !el) return;
    const { w, h } = naturalSize.current;

    // Preserve scroll center across zoom changes
    const prev = prevZoomRef.current;
    const cx = el.scrollWidth > 0 ? (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth : 0.5;
    const cy = el.scrollHeight > 0 ? (el.scrollTop + el.clientHeight / 2) / el.scrollHeight : 0.5;

    svg.setAttribute('width', String(w * zoomPct / 100));
    svg.setAttribute('height', String(h * zoomPct / 100));

    svg.style.border = '1px solid lightgray';
    const bg = BG[bgMode];
    svg.style.background = bg.background;
    svg.style.backgroundImage = bg.backgroundImage || '';

    if (prev !== zoomPct) {
      requestAnimationFrame(() => {
        el.scrollLeft = cx * el.scrollWidth - el.clientWidth / 2;
        el.scrollTop = cy * el.scrollHeight - el.clientHeight / 2;
      });
    }
    prevZoomRef.current = zoomPct;
  }, [svgCode, zoomPct, bgMode]);

  // Ctrl+scroll zoom (native listener for passive:false)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoomPct(e.deltaY < 0 ? stepUp : stepDown);
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Group
        gap="xs" px="xs" py={4}
        style={{ backgroundColor: '#252526', borderBottom: '1px solid #3c3c3c', flexShrink: 0 }}
      >
        <Tooltip label="Zoom in (Ctrl+Scroll)">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomIn}><IconZoomIn size={16} /></ActionIcon>
        </Tooltip>
        <Tooltip label="Zoom out (Ctrl+Scroll)">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomOut}><IconZoomOut size={16} /></ActionIcon>
        </Tooltip>
        <Tooltip label="Reset zoom to 100%">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomReset}><IconZoomReset size={16} /></ActionIcon>
        </Tooltip>
        <Tooltip label="Fit to window">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomFit}><IconArrowsMaximize size={16} /></ActionIcon>
        </Tooltip>
        <Text size="xs" c="dimmed" style={{ minWidth: 40, textAlign: 'center' }}>{zoomPct}%</Text>
        <SegmentedControl
          size="xs" value={bgMode} onChange={(v) => setBgMode(v as BgMode)}
          data={[
            { label: '▦', value: 'checkerboard' },
            { label: '□', value: 'white' },
            { label: '■', value: 'black' },
            { label: '∅', value: 'none' },
          ]}
          styles={{ root: { backgroundColor: '#1e1e1e' }, label: { padding: '2px 8px', fontSize: 12 } }}
        />
      </Group>

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ minWidth: '100%', minHeight: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={containerRef} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
