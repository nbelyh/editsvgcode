import { useRef, useEffect, useState, useCallback } from 'react';
import { ActionIcon, Group, SegmentedControl, Text, Tooltip } from '@mantine/core';
import { IconArrowsMaximize, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import DOMPurify from 'dompurify';

interface PreviewProps {
  svgCode: string;
}

type BgMode = 'checkerboard' | 'white' | 'black' | 'none';

const CHECKERBOARD_URL =
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEX////g4OACVBJKAAAAFElEQVR42mNgAAJGIGDAwyAkDwQABMgAIUCVOUYAAAAASUVORK5CYII=")';

const BG_STYLES: Record<BgMode, { background: string; backgroundImage?: string }> = {
  checkerboard: { background: 'transparent', backgroundImage: CHECKERBOARD_URL },
  white: { background: '#ffffff' },
  black: { background: '#000000' },
  none: { background: 'transparent' },
};

const ZOOM_LEVELS = [1, 2, 5, 10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 500, 800, 1000, 1500, 2000, 3000, 5000];

export function Preview({ svgCode }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [bgMode, setBgMode] = useState<BgMode>('checkerboard');
  // Natural (100%) size of the SVG
  const naturalSize = useRef<{ w: number; h: number } | null>(null);

  const zoomIn = useCallback(() => {
    setZoomPct((z) => ZOOM_LEVELS.find((l) => l > z) ?? Math.round(z * 1.5));
  }, []);
  const zoomOut = useCallback(() => {
    setZoomPct((z) => [...ZOOM_LEVELS].reverse().find((l) => l < z) ?? Math.max(1, Math.round(z / 1.5)));
  }, []);
  const zoomReset = useCallback(() => setZoomPct(100), []);

  const zoomFit = useCallback(() => {
    const el = scrollRef.current;
    const ns = naturalSize.current;
    if (!el || !ns) return;
    const pct = Math.floor(Math.min(el.clientWidth / ns.w, el.clientHeight / ns.h) * 100);
    setZoomPct(Math.max(1, pct));
  }, []);

  // Render sanitized SVG, determine natural size, and auto-fit
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = DOMPurify.sanitize(svgCode, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['use'],
    });
    const svg = containerRef.current.querySelector('svg');
    if (!svg) { naturalSize.current = null; return; }

    // Determine natural dimensions and ensure a viewBox exists for scaling.
    const wAttr = svg.getAttribute('width') || '';
    const hAttr = svg.getAttribute('height') || '';
    const isAbsolute = (v: string) => /^[\d.]+(?:px)?$/.test(v.trim());
    const existingVb = svg.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
    const hasViewBox = existingVb && existingVb.length === 4 && existingVb[2] > 0 && existingVb[3] > 0;

    let w = 0;
    let h = 0;
    if (hasViewBox) {
      // Trust the existing viewBox — use its width/height as natural size
      w = existingVb[2];
      h = existingVb[3];
    } else if (isAbsolute(wAttr) && isAbsolute(hAttr)) {
      // No viewBox but absolute width/height — use them and synthesize viewBox via getBBox
      w = parseFloat(wAttr);
      h = parseFloat(hAttr);
      try {
        const bb = svg.getBBox();
        if (bb.width > 0 && bb.height > 0) {
          const vbX = Math.min(0, bb.x);
          const vbY = Math.min(0, bb.y);
          const vbW = Math.max(w, bb.x + bb.width) - vbX;
          const vbH = Math.max(h, bb.y + bb.height) - vbY;
          svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
          w = vbW;
          h = vbH;
        } else {
          svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        }
      } catch {
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }
    } else {
      // No viewBox and no absolute dimensions (e.g. width="100%") — measure via getBBox
      try {
        const bb = svg.getBBox();
        if (bb.width > 0 && bb.height > 0) {
          const vbX = Math.min(0, bb.x);
          const vbY = Math.min(0, bb.y);
          w = bb.x + bb.width - vbX;
          h = bb.y + bb.height - vbY;
          svg.setAttribute('viewBox', `${vbX} ${vbY} ${w} ${h}`);
        }
      } catch { /* getBBox can throw if not rendered */ }
    }

    // Remove percentage/relative sizing so our pixel sizing takes effect
    if (!isAbsolute(wAttr)) svg.removeAttribute('width');
    if (!isAbsolute(hAttr)) svg.removeAttribute('height');
    naturalSize.current = (w > 0 && h > 0) ? { w, h } : null;

    // Auto-fit: if the SVG is larger than the viewport, scale down to fit
    const el = scrollRef.current;
    if (el && naturalSize.current) {
      const { w: nw, h: nh } = naturalSize.current;
      if (nw > el.clientWidth || nh > el.clientHeight) {
        const pct = Math.floor(Math.min(el.clientWidth / nw, el.clientHeight / nh) * 100);
        setZoomPct(Math.max(1, pct));
      } else {
        setZoomPct(100);
      }
    }
  }, [svgCode]);

  // Apply zoom by setting SVG width/height, preserving scroll center point
  const prevZoomRef = useRef(zoomPct);
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg');
    const el = scrollRef.current;
    if (!svg || !naturalSize.current || !el) return;
    const { w, h } = naturalSize.current;

    // Record center of visible area as fraction of scroll content
    const prevZoom = prevZoomRef.current;
    const cx = el.scrollWidth > 0 ? (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth : 0.5;
    const cy = el.scrollHeight > 0 ? (el.scrollTop + el.clientHeight / 2) / el.scrollHeight : 0.5;

    svg.setAttribute('width', String(w * zoomPct / 100));
    svg.setAttribute('height', String(h * zoomPct / 100));

    // Restore center point after size change (only when zoom changed, not on initial render)
    if (prevZoom !== zoomPct) {
      requestAnimationFrame(() => {
        el.scrollLeft = cx * el.scrollWidth - el.clientWidth / 2;
        el.scrollTop = cy * el.scrollHeight - el.clientHeight / 2;
      });
    }
    prevZoomRef.current = zoomPct;
  }, [svgCode, zoomPct]);

  // Apply background + border to rendered SVG element
  useEffect(() => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.border = '1px solid lightgray';
        const bgStyle = BG_STYLES[bgMode];
        svg.style.background = bgStyle.background;
        svg.style.backgroundImage = bgStyle.backgroundImage || '';
      }
    }
  }, [svgCode, bgMode]);

  // Zoom with mouse wheel — must use native listener for passive:false
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setZoomPct((z) => ZOOM_LEVELS.find((l) => l > z) ?? Math.round(z * 1.5));
        } else {
          setZoomPct((z) => [...ZOOM_LEVELS].reverse().find((l) => l < z) ?? Math.max(1, Math.round(z / 1.5)));
        }
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Group
        gap="xs"
        px="xs"
        py={4}
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
        <Text size="xs" c="dimmed" style={{ minWidth: 40, textAlign: 'center' }}>
          {zoomPct}%
        </Text>
        <SegmentedControl
          size="xs"
          value={bgMode}
          onChange={(v) => setBgMode(v as BgMode)}
          data={[
            { label: '▦', value: 'checkerboard' },
            { label: '□', value: 'white' },
            { label: '■', value: 'black' },
            { label: '∅', value: 'none' },
          ]}
          styles={{
            root: { backgroundColor: '#1e1e1e' },
            label: { padding: '2px 8px', fontSize: 12 },
          }}
        />
      </Group>

      {/* SVG container */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            minWidth: '100%',
            minHeight: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div ref={containerRef} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
