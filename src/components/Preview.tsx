import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconArrowsMaximize, IconTrash, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import DOMPurify from 'dompurify';
import { stepUp, stepDown, isAbsoluteLength, synthesizeViewBox, findSvgTarget, resolveXPath } from '../lib/preview-utils';

interface PreviewProps {
  svgCode: string;
  onElementSelect?: (tagName: string, index: number) => void;
  selectedXPath?: string;
  onDeleteElement?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export interface PreviewHandle {
  focus: () => void;
}

type BgMode = 'checkerboard' | 'checkerboard-dark' | 'white' | 'black';

const CHECKERBOARD_LIGHT =
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEX////g4OACVBJKAAAAFElEQVR42mNgAAJGIGDAwyAkDwQABMgAIUCVOUYAAAAASUVORK5CYII=")';

const CHECKERBOARD_DARK =
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAGElEQVR4nGNQQgLGSICBihLIHGRFVJQAAHT8H+GQ1mTOAAAAAElFTkSuQmCC")';

const BG: Record<BgMode, { background: string; backgroundImage?: string }> = {
  checkerboard: { background: 'transparent', backgroundImage: CHECKERBOARD_LIGHT },
  'checkerboard-dark': { background: 'transparent', backgroundImage: CHECKERBOARD_DARK },
  white: { background: '#fff' },
  black: { background: '#000' },
};

const BG_OPTIONS: { icon: string; value: BgMode; label: string }[] = [
  { icon: '▦', value: 'checkerboard', label: 'Light checkerboard' },
  { icon: '▧', value: 'checkerboard-dark', label: 'Dark checkerboard' },
  { icon: '□', value: 'white', label: 'White' },
  { icon: '■', value: 'black', label: 'Black' },
];

const SELECTION_FILTER_ID = '__esvg-select-filter';
const HOVER_FILTER_ID = '__esvg-hover-filter';
const SELECT_FILTER = `url(#${SELECTION_FILTER_ID})`;
const HOVER_FILTER = `url(#${HOVER_FILTER_ID})`;
const DATA_SELECTED = 'data-esvg-selected';

/** Inject selection/hover SVG filters into an <svg> element if not already present. */
function ensureFilters(svg: SVGSVGElement) {
  if (svg.getElementById(SELECTION_FILTER_ID)) return;
  const ns = 'http://www.w3.org/2000/svg';

  const makeDefs = () => {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(ns, 'defs');
      svg.prepend(defs);
    }
    return defs;
  };

  const buildFilter = (id: string, color: [number, number, number], dilate: number) => {
    const f = document.createElementNS(ns, 'filter');
    f.setAttribute('id', id);

    const morph = document.createElementNS(ns, 'feMorphology');
    morph.setAttribute('operator', 'dilate');
    morph.setAttribute('radius', String(dilate));
    f.appendChild(morph);

    const blur = document.createElementNS(ns, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '0.3');
    f.appendChild(blur);

    const [r, g, b] = color;
    const matrix = document.createElementNS(ns, 'feColorMatrix');
    matrix.setAttribute('type', 'matrix');
    matrix.setAttribute('values', `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 3 0`);
    matrix.setAttribute('result', 'outline');
    f.appendChild(matrix);

    const blend = document.createElementNS(ns, 'feBlend');
    blend.setAttribute('in', 'SourceGraphic');
    blend.setAttribute('in2', 'outline');
    blend.setAttribute('mode', 'normal');
    f.appendChild(blend);

    return f;
  };

  const defs = makeDefs();
  defs.appendChild(buildFilter(SELECTION_FILTER_ID, [0, 0.2, 1], 1.5));
  defs.appendChild(buildFilter(HOVER_FILTER_ID, [0, 0.2, 1], 1));
}

export const Preview = forwardRef<PreviewHandle, PreviewProps>(function Preview({ svgCode, onElementSelect, selectedXPath, onDeleteElement, onUndo, onRedo }, ref) {
  const [debouncedSvg] = useDebouncedValue(svgCode, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const naturalSize = useRef<{ w: number; h: number } | null>(null);
  const prevZoomRef = useRef(100);
  const savedScrollRef = useRef<{ left: number; top: number } | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [bgMode, setBgMode] = useState<BgMode>('checkerboard');
  const hoveredRef = useRef<SVGElement | null>(null);
  const fittedSvgRef = useRef<string | null>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Attach shadow DOM on mount for CSS isolation
  useEffect(() => {
    if (containerRef.current && !shadowRef.current) {
      shadowRef.current = containerRef.current.attachShadow({ mode: 'open' });
    }
  }, []);

  /** Get the SVG element from the shadow root */
  const getSvg = useCallback(() => shadowRef.current?.querySelector('svg') as SVGSVGElement | null, []);

  useImperativeHandle(ref, () => ({
    focus() { scrollRef.current?.focus(); },
  }), []);

  const clearAllSelections = useCallback(() => {
    const svg = getSvg();
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
    const svg = getSvg();
    if (!svg) { onElementSelect?.('', -1); return; }
    const selected = svg.querySelectorAll(`[${DATA_SELECTED}]`);
    if (selected.length === 0) { onElementSelect?.('', -1); return; }
    // Notify about the last selected element
    const last = selected[selected.length - 1];
    const tagName = last.tagName.toLowerCase();
    const allSameTag = Array.from(svg.querySelectorAll(tagName));
    onElementSelect?.(tagName, allSameTag.indexOf(last));
  }, [onElementSelect]);

  // DEL key: delete selected element when the preview pane is focused
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && onDeleteElement) {
      e.preventDefault();
      onDeleteElement();
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      onUndo?.();
    } else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
      e.preventDefault();
      onRedo?.();
    }
  }, [onDeleteElement, onUndo, onRedo]);

  // Click-to-select handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const svg = getSvg();
    if (!svg) return;

    const actual = (e.nativeEvent.composedPath()[0] as Element) || e.target;
    const target = findSvgTarget(actual, svg, container);

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
    // Give focus to the scroll pane so DEL key works without extra click
    scrollRef.current?.focus();
  }, [clearAllSelections, applySelectionFilter, notifySelection]);

  // Hover highlight + right-mouse-button pan
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning.current) {
      const el = scrollRef.current;
      if (el) {
        el.scrollLeft = panStart.current.scrollLeft - (e.clientX - panStart.current.x);
        el.scrollTop = panStart.current.scrollTop - (e.clientY - panStart.current.y);
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    const svg = getSvg();
    if (!svg) return;

    const actual = (e.nativeEvent.composedPath()[0] as Element) || e.target;
    const target = findSvgTarget(actual, svg, container) as SVGElement | null;
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault();
      isPanning.current = true;
      const el = scrollRef.current!;
      panStart.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
      containerRef.current!.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 2 && isPanning.current) {
      isPanning.current = false;
      containerRef.current!.style.cursor = 'crosshair';
    }
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
    const shadow = shadowRef.current;
    if (!shadow) return;
    // Save scroll position before DOM replacement
    const el = scrollRef.current;
    if (el) savedScrollRef.current = { left: el.scrollLeft, top: el.scrollTop };
    shadow.innerHTML = DOMPurify.sanitize(svgCode, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['use'],
    });
    const svg = shadow.querySelector('svg');
    if (!svg) { naturalSize.current = null; return; }
    ensureFilters(svg);

    const wAttr = svg.getAttribute('width') || '';
    const hAttr = svg.getAttribute('height') || '';
    const vb = svg.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
    const hasVb = vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0;

    // Detect CSS-specified dimensions (e.g. <style>svg { width: 50px }</style>)
    // by reading the rendered size before we apply any inline overrides.
    let size: { w: number; h: number } | null = null;
    const hasStyleSheet = shadow.querySelector('style') !== null;
    if (hasStyleSheet) {
      // Temporarily strip attrs so only CSS determines size
      const savedW = svg.getAttribute('width');
      const savedH = svg.getAttribute('height');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '';
      svg.style.height = '';
      const rect = svg.getBoundingClientRect();
      if (savedW) svg.setAttribute('width', savedW);
      if (savedH) svg.setAttribute('height', savedH);
      // Use CSS size if it looks intentional (not the default 300x150)
      if (rect.width > 0 && rect.height > 0 && !(rect.width === 300 && rect.height === 150)) {
        size = { w: rect.width, h: rect.height };
      }
    }
    if (!size) {
      if (hasVb) {
        size = { w: vb[2], h: vb[3] };
      } else if (isAbsoluteLength(wAttr) && isAbsoluteLength(hAttr)) {
        size = synthesizeViewBox(svg, parseFloat(wAttr), parseFloat(hAttr));
      } else {
        size = synthesizeViewBox(svg, 0, 0);
      }
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

  // Sync external selection (from editor cursor) via xpath
  useEffect(() => {
    const svg = getSvg();
    if (!svg) return;

    clearAllSelections();
    if (!selectedXPath) return;

    const target = resolveXPath(svg, selectedXPath);
    if (target) {
      applySelectionFilter(target, true);
    }
  }, [selectedXPath, debouncedSvg, clearAllSelections, applySelectionFilter]);

  // Apply zoom + background + border
  useEffect(() => {
    const svg = getSvg();
    const el = scrollRef.current;
    if (!svg || !naturalSize.current || !el) return;
    const { w, h } = naturalSize.current;

    // Capture scroll center before resizing (for zoom changes)
    const cx = el.scrollWidth > 0 ? (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth : 0.5;
    const cy = el.scrollHeight > 0 ? (el.scrollTop + el.clientHeight / 2) / el.scrollHeight : 0.5;

    svg.setAttribute('width', String(w * zoomPct / 100));
    svg.setAttribute('height', String(h * zoomPct / 100));
    // Inline styles override any <style>svg{width/height}</style> rules in the SVG
    svg.style.width = `${w * zoomPct / 100}px`;
    svg.style.height = `${h * zoomPct / 100}px`;

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
    <div data-testid="preview-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Group
        justify="space-between"
        px="xs" py={4}
        style={{ backgroundColor: 'var(--esvg-chrome-bg)', borderBottom: '1px solid var(--esvg-chrome-border)', flexShrink: 0, height: 36 }}
      >
        <Group gap="xs">
          <Tooltip label="Zoom in (Ctrl+Scroll)">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomIn} aria-label="Zoom in"><IconZoomIn size={16} /></ActionIcon>
          </Tooltip>
          <Tooltip label="Zoom out (Ctrl+Scroll)">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomOut} aria-label="Zoom out"><IconZoomOut size={16} /></ActionIcon>
          </Tooltip>
          <Tooltip label="Reset zoom to 100%">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomReset} aria-label="Reset zoom"><IconZoomReset size={16} /></ActionIcon>
          </Tooltip>
          <Tooltip label="Fit to window">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={zoomFit} aria-label="Fit to window"><IconArrowsMaximize size={16} /></ActionIcon>
          </Tooltip>
          <Text size="xs" c="dimmed" style={{ minWidth: 40, textAlign: 'center' }}>{zoomPct}%</Text>
          <div style={{ width: 1, height: 16, backgroundColor: 'var(--esvg-chrome-border)' }} />
          {BG_OPTIONS.map(({ icon, value, label }) => (
            <Tooltip key={value} label={label}>
              <ActionIcon
                variant={bgMode === value ? 'light' : 'subtle'}
                color={bgMode === value ? 'blue' : 'gray'}
                size="sm"
                onClick={() => setBgMode(value)}
                aria-label={label}
                style={{ fontSize: 12 }}
              >
                {icon}
              </ActionIcon>
            </Tooltip>
          ))}
        </Group>
        <Group gap="xs">
          {onDeleteElement && (
            <Tooltip label="Delete selected element (Del)">
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={onDeleteElement} aria-label="Delete element"><IconTrash size={16} /></ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      <div ref={scrollRef} tabIndex={0} style={{ flex: 1, overflow: 'auto', outline: 'none' }} onClick={handleClick} onKeyDown={handleKeyDown} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onContextMenu={(e) => e.preventDefault()}>
        <div style={{ minWidth: '100%', minHeight: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={containerRef} data-testid="svg-preview" style={{ flexShrink: 0, cursor: 'crosshair' }} />
        </div>
      </div>
    </div>
  );
});

