import { useRef, useEffect, useState, useCallback } from 'react';
import { ActionIcon, Group, SegmentedControl, Text, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconArrowsMaximize, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import DOMPurify from 'dompurify';

interface PreviewProps {
  svgCode: string;
  onElementSelect?: (tagName: string, index: number) => void;
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

const HIGHLIGHT_FILTER = 'drop-shadow(0 0 0.5px #0066ff) drop-shadow(0 0 0.5px #0066ff) drop-shadow(0 0 0.5px #0066ff) drop-shadow(0 0 0.5px #0066ff)';
const HOVER_FILTER = HIGHLIGHT_FILTER;
const SELECT_FILTER = HIGHLIGHT_FILTER;
const DATA_SELECTED = 'data-esvg-selected';

/** Find the nearest meaningful SVG child element from a click/hover target */
function findSvgTarget(target: Element, svg: SVGSVGElement, container: HTMLDivElement): Element | null {
  while (target && target !== svg && target !== container) {
    if (target instanceof SVGElement && target.tagName !== 'svg') return target;
    target = target.parentElement as Element;
  }
  return null;
}

export function Preview({ svgCode, onElementSelect }: PreviewProps) {
  const [debouncedSvg] = useDebouncedValue(svgCode, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const naturalSize = useRef<{ w: number; h: number } | null>(null);
  const prevZoomRef = useRef(100);
  const savedScrollRef = useRef<{ left: number; top: number } | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [bgMode, setBgMode] = useState<BgMode>('checkerboard');
  const hoveredRef = useRef<SVGElement | null>(null);
  const fittedSvgRef = useRef<string | null>(null);

  const clearAllSelections = useCallback(() => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
    svg.querySelectorAll(`[${DATA_SELECTED}]`).forEach((el) => {
      el.removeAttribute(DATA_SELECTED);
      (el as SVGElement).style.filter = '';
    });
  }, []);

  const applySelectionFilter = useCallback((el: SVGElement, selected: boolean) => {
    if (selected) {
      el.setAttribute(DATA_SELECTED, '');
      el.style.filter = SELECT_FILTER;
    } else {
      el.removeAttribute(DATA_SELECTED);
      el.style.filter = '';
    }
  }, []);

  const notifySelection = useCallback(() => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) { onElementSelect?.('', -1); return; }
    const selected = svg.querySelectorAll(`[${DATA_SELECTED}]`);
    if (selected.length === 0) { onElementSelect?.('', -1); return; }
    // Notify about the last selected element
    const last = selected[selected.length - 1];
    const tagName = last.tagName.toLowerCase();
    const allSameTag = Array.from(svg.querySelectorAll(tagName));
    onElementSelect?.(tagName, allSameTag.indexOf(last));
  }, [onElementSelect]);

  // Click-to-select handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const target = findSvgTarget(e.target as Element, svg, container);

    if (!target || !(target instanceof SVGElement)) {
      clearAllSelections();
      notifySelection();
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      // Toggle selection on this element
      const isSelected = target.hasAttribute(DATA_SELECTED);
      applySelectionFilter(target, !isSelected);
    } else {
      // Single select: clear others, select this one
      clearAllSelections();
      applySelectionFilter(target, true);
    }
    notifySelection();
  }, [clearAllSelections, applySelectionFilter, notifySelection]);

  // Hover highlight
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const target = findSvgTarget(e.target as Element, svg, container) as SVGElement | null;
    const prev = hoveredRef.current;

    if (target === prev) return;

    // Remove hover from previous (restore selection filter if selected, else clear)
    if (prev) {
      prev.style.filter = prev.hasAttribute(DATA_SELECTED) ? SELECT_FILTER : '';
    }

    // Apply hover to new target (if not already selected)
    if (target && !target.hasAttribute(DATA_SELECTED)) {
      target.style.filter = HOVER_FILTER;
    }
    hoveredRef.current = target;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const prev = hoveredRef.current;
    if (prev) {
      prev.style.filter = prev.hasAttribute(DATA_SELECTED) ? SELECT_FILTER : '';
      hoveredRef.current = null;
    }
  }, []);

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
    // Save scroll position before DOM replacement
    const el = scrollRef.current;
    if (el) savedScrollRef.current = { left: el.scrollLeft, top: el.scrollTop };
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

    // Auto-fit only when a new/different SVG is loaded (not on every edit)
    const sizeKey = size ? `${size.w}x${size.h}` : '';
    if (sizeKey && sizeKey !== fittedSvgRef.current) {
      fittedSvgRef.current = sizeKey;
      const el = scrollRef.current;
      if (el) {
        const fit = Math.floor(Math.min(el.clientWidth / size!.w, el.clientHeight / size!.h) * 100);
        setZoomPct(size!.w > el.clientWidth || size!.h > el.clientHeight ? Math.max(1, fit) : 100);
      }
    }
  }, [debouncedSvg]);

  // Apply zoom + background + border
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg');
    const el = scrollRef.current;
    if (!svg || !naturalSize.current || !el) return;
    const { w, h } = naturalSize.current;

    // Capture scroll center before resizing (for zoom changes)
    const cx = el.scrollWidth > 0 ? (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth : 0.5;
    const cy = el.scrollHeight > 0 ? (el.scrollTop + el.clientHeight / 2) / el.scrollHeight : 0.5;

    svg.setAttribute('width', String(w * zoomPct / 100));
    svg.setAttribute('height', String(h * zoomPct / 100));

    svg.style.border = '1px solid lightgray';
    const bg = BG[bgMode];
    svg.style.background = bg.background;
    svg.style.backgroundImage = bg.backgroundImage || '';

    // Preserve scroll: recenter on zoom changes, restore position on content edits
    const prev = prevZoomRef.current;
    if (prev !== zoomPct) {
      requestAnimationFrame(() => {
        el.scrollLeft = cx * el.scrollWidth - el.clientWidth / 2;
        el.scrollTop = cy * el.scrollHeight - el.clientHeight / 2;
      });
    } else if (savedScrollRef.current) {
      requestAnimationFrame(() => {
        el.scrollLeft = savedScrollRef.current!.left;
        el.scrollTop = savedScrollRef.current!.top;
      });
    }
    prevZoomRef.current = zoomPct;
  }, [debouncedSvg, zoomPct, bgMode]);

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

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto' }} onClick={handleClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div style={{ minWidth: '100%', minHeight: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={containerRef} style={{ flexShrink: 0, cursor: 'crosshair' }} />
        </div>
      </div>
    </div>
  );
}
