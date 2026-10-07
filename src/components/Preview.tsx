import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowsMaximize, IconTrash, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import { sanitizeSvg } from '../lib/sanitize';
import { CHECKERBOARD_LIGHT } from '../lib/checkerboard';
import { stepUp, stepDown, isAbsoluteLength, synthesizeViewBox, measureBBox, contentOverflowsViewport, bboxTracksViewport, findSvgTarget, resolveXPath, selectionChain, nextInChain, stampSourcePaths, findBySourcePath, SOURCE_PATH_ATTR } from '../lib/preview-utils';
import { pathOf, parseSvg, resolveSelector, isSelectorError } from '../lib/svg-dom';
import {
  planMove, planResize, invert, applyToVector, pixelsPerUnit, decimalsFor, roundTo,
  type Matrix, type Handle, type Rect,
} from '../lib/svg-geometry';
import { SelectionOverlay, type Point } from './SelectionOverlay';

interface PreviewProps {
  svgCode: string;
  /**
   * False while the document is still being fetched. `svgCode` is a stand-in
   * string until it lands, and painting that would put a small text box in the
   * middle of the pane that jumps to the drawing's size the moment one arrives.
   */
  documentReady?: boolean;
  /** The selected element's positional path, or null when nothing is. */
  onElementSelect?: (path: string | null) => void;
  selectedXPath?: string;
  onDeleteElement?: () => void;
  /** Whether the selection may be moved and resized: not while an AI proposal
   * is on show, and not while the document is still loading. */
  editable?: boolean;
  /**
   * Write a move or resize into the source: attributes of the element at
   * `path` to set, or to remove where the value is null. Returns the new
   * source, or null when the edit could not be applied.
   */
  onEditElement?: (path: string, attrs: Record<string, string | null>, action: EditAction) => string | null;
  onUndo?: () => void;
  onRedo?: () => void;
}

export type EditAction = 'move' | 'resize' | 'nudge';

export interface PreviewHandle {
  focus: () => void;
}

type BgMode = 'checkerboard' | 'checkerboard-dark' | 'white' | 'black';


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

/** How far the pointer must travel before a press becomes a drag, so a click
 * with a slightly unsteady hand still just selects. */
const DRAG_THRESHOLD = 3;

const INVALID_SOURCE = 'The code has an error, so this element cannot be moved or resized. Fix the code first.';
const NOT_IN_SOURCE = 'This element could not be found in the code, so it cannot be moved or resized.';
const NOT_APPLIED = 'The change could not be written to the code.';

const toMatrix = (m: DOMMatrix): Matrix => ({ a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f });

/**
 * Attribute changes shown on the preview's own copy of an element while a
 * gesture is under way, and taken back if it is cancelled or the source
 * refuses it. Each call states the whole change from the start of the
 * gesture, so an attribute no longer in it goes back to what it was.
 */
class LiveEdit {
  private originals = new Map<string, string | null>();
  constructor(private el: Element) {}

  private put(name: string, value: string | null) {
    if (value === null) this.el.removeAttribute(name);
    else this.el.setAttribute(name, value);
  }

  show(attrs: Record<string, string | null>) {
    for (const [name, original] of this.originals) if (!(name in attrs)) this.put(name, original);
    for (const [name, value] of Object.entries(attrs)) {
      if (!this.originals.has(name)) this.originals.set(name, this.el.getAttribute(name));
      this.put(name, value);
    }
  }

  revert() {
    for (const [name, original] of this.originals) this.put(name, original);
    this.originals.clear();
  }
}

interface Gesture {
  pointerId: number;
  mode: 'move' | 'resize';
  handle: Handle | null;
  startX: number;
  startY: number;
  target: SVGGraphicsElement;
  /** Filled in once the pointer has travelled far enough to be a drag. */
  drag?: {
    path: string;
    source: Element;
    /** Screen pixels to the units the edit is made in: the parent's for a
     * move, the element's own for a resize. */
    toUnits: Matrix;
    decimals: number;
    bbox: Rect;
    minSize: number;
    live: LiveEdit;
    attrs: Record<string, string | null>;
  };
}

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

export const Preview = forwardRef<PreviewHandle, PreviewProps>(function Preview({ svgCode, documentReady = true, onElementSelect, selectedXPath, onDeleteElement, editable = false, onEditElement, onUndo, onRedo }, ref) {
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
  const overlayHostRef = useRef<HTMLDivElement>(null);
  const [quad, setQuad] = useState<Point[] | null>(null);
  const coarsePointer = useMediaQuery('(pointer: coarse)') ?? false;
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);
  const svgCodeRef = useRef(svgCode);
  svgCodeRef.current = svgCode;
  const editableRef = useRef(editable && !!onEditElement);
  editableRef.current = editable && !!onEditElement;
  /** The source text the preview's DOM currently shows. It trails svgCode by
   * the render debounce, and an element may only be edited while the two
   * agree — otherwise its path could name a different element in the code. */
  const renderedSourceRef = useRef<string | null>(null);
  const [renderTick, setRenderTick] = useState(0);

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

  /** The most recently selected element, which is the one the code pane shows. */
  const currentSelection = useCallback((): SVGElement | null => {
    const selected = getSvg()?.querySelectorAll<SVGElement>(`[${DATA_SELECTED}]`);
    return selected && selected.length > 0 ? selected[selected.length - 1] : null;
  }, []);

  /** Where a preview element came from in the source. Falls back to its place
   * in the preview's own tree when the source did not parse and nothing was
   * stamped — selection still works then, editing does not. */
  const sourcePathOf = (el: Element) => el.getAttribute(SOURCE_PATH_ATTR) ?? pathOf(el);

  const notifySelection = useCallback(() => {
    const last = currentSelection();
    // By position in the tree, which is how the source is addressed too.
    onElementSelect?.(last ? sourcePathOf(last) : null);
  }, [onElementSelect, currentSelection]);

  /**
   * What a click at this point would select: the top-level item under the
   * pointer first, then one level deeper with each click on the selection —
   * the way Visio walks from a group into its parts.
   */
  const chainAt = useCallback((e: React.MouseEvent): Element[] => {
    const container = containerRef.current;
    const svg = getSvg();
    if (!container || !svg) return [];
    const actual = (e.nativeEvent.composedPath()[0] as Element) || e.target;
    const leaf = findSvgTarget(actual, svg, container);
    return leaf ? selectionChain(leaf, svg) : [];
  }, []);

  const pickAt = useCallback((e: React.MouseEvent): SVGElement | null => {
    const pick = nextInChain(chainAt(e), currentSelection());
    return pick instanceof SVGElement ? pick : null;
  }, [chainAt, currentSelection]);

  /** Is the pointer on a resize handle rather than on the drawing? */
  const onHandle = (e: React.SyntheticEvent): Handle | null => {
    const actual = e.nativeEvent.composedPath()[0];
    const handle = actual instanceof Element ? actual.closest('[data-handle]') : null;
    return handle ? (handle.getAttribute('data-handle') as Handle) : null;
  };

  /** Place the selection box over the selected element, or take it away. */
  const refreshOverlay = useCallback(() => {
    const host = overlayHostRef.current;
    const svg = getSvg();
    const selected = svg?.querySelectorAll(`[${DATA_SELECTED}]`);
    const el = selected && selected.length === 1 ? selected[0] : null;
    if (!editableRef.current || !host || !(el instanceof SVGGraphicsElement)) { setQuad(null); return; }
    let bb: DOMRect;
    try {
      bb = el.getBBox();
    } catch {
      setQuad(null); // not rendered, so there is no box to show
      return;
    }
    const ctm = el.getScreenCTM();
    if (!ctm) { setQuad(null); return; }
    const origin = host.getBoundingClientRect();
    const corners = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x + bb.width, bb.y + bb.height], [bb.x, bb.y + bb.height]];
    setQuad(corners.map(([x, y]) => {
      const p = new DOMPoint(x, y).matrixTransform(ctm);
      return { x: p.x - origin.left, y: p.y - origin.top };
    }));
  }, []);

  const notify = (message: string) => notifications.show({ message, color: 'yellow' });

  /**
   * The source element behind a preview element, found by its path in a
   * strict parse of the code. An error with no message when the preview has
   * not caught up with the code yet: it will in a moment, and nothing is wrong.
   */
  const sourceFor = useCallback((target: Element): { path: string; source: Element } | { error: string | null } => {
    if (renderedSourceRef.current !== svgCodeRef.current) return { error: null };
    const doc = parseSvg(svgCodeRef.current);
    if (!doc) return { error: INVALID_SOURCE };
    const path = target.getAttribute(SOURCE_PATH_ATTR);
    if (!path) return { error: NOT_IN_SOURCE };
    const found = resolveSelector(doc, path);
    if (isSelectorError(found) || found.length !== 1 || found[0].tagName.toLowerCase() !== target.tagName.toLowerCase()) {
      return { error: NOT_IN_SOURCE };
    }
    return { path, source: found[0] };
  }, []);

  /** Hand an edit to the source; keep it on screen if it landed, take it back if not. */
  const commit = useCallback((path: string, attrs: Record<string, string | null>, action: EditAction, live: LiveEdit) => {
    if (Object.keys(attrs).length === 0) { live.revert(); return; }
    const next = onEditElement?.(path, attrs, action) ?? null;
    if (next === null) {
      live.revert();
      notify(NOT_APPLIED);
    } else {
      // The preview already shows this text, so editing can go on without
      // waiting for the re-render.
      renderedSourceRef.current = next;
    }
  }, [onEditElement]);

  /** Move the selection by whole units of its parent, from the keyboard. */
  const nudge = useCallback((dx: number, dy: number) => {
    const target = currentSelection();
    if (!editableRef.current || !target || gestureRef.current?.drag) return;
    const found = sourceFor(target);
    if ('error' in found) { if (found.error) notify(found.error); return; }
    const plan = planMove(found.source, dx, dy);
    if (!plan.ok) { notify(plan.reason); return; }
    const live = new LiveEdit(target);
    live.show(plan.attrs);
    commit(found.path, plan.attrs, 'nudge', live);
    refreshOverlay();
  }, [currentSelection, sourceFor, commit, refreshOverlay]);

  const cancelGesture = useCallback(() => {
    const g = gestureRef.current;
    gestureRef.current = null;
    if (!g?.drag) return;
    g.drag.live.revert();
    suppressClickRef.current = true;
    refreshOverlay();
  }, [refreshOverlay]);

  // DEL key: delete selected element when the preview pane is focused
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const arrow = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, [number, number]>)[e.key];
    if (arrow && editableRef.current && currentSelection() && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Instead of scrolling the pane, which is what the arrows did here before.
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      nudge(arrow[0] * step, arrow[1] * step);
    } else if (e.key === 'Escape') {
      if (gestureRef.current?.drag) {
        cancelGesture();
      } else {
        clearAllSelections();
        notifySelection();
        refreshOverlay();
      }
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && onDeleteElement) {
      e.preventDefault();
      onDeleteElement();
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      onUndo?.();
    } else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
      e.preventDefault();
      onRedo?.();
    }
  }, [onDeleteElement, onUndo, onRedo, nudge, cancelGesture, currentSelection, clearAllSelections, notifySelection, refreshOverlay]);

  // Click-to-select handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    // The click that ends a drag is not a request to select something else.
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    if (onHandle(e)) return;
    const target = pickAt(e);

    if (!target) {
      clearAllSelections();
      notifySelection();
      refreshOverlay();
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
    refreshOverlay();
    // Give focus to the scroll pane so DEL key works without extra click
    scrollRef.current?.focus();
  }, [pickAt, clearAllSelections, applySelectionFilter, notifySelection, refreshOverlay]);

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

    if (gestureRef.current?.drag || onHandle(e)) return;

    // Over the selection a press drags it; say so before it happens.
    const chain = chainAt(e);
    const current = currentSelection();
    if (containerRef.current) {
      containerRef.current.style.cursor = editableRef.current && current && chain.includes(current) ? 'move' : 'crosshair';
    }

    // Highlight what a click would select, so the next level down is visible
    // before it is chosen.
    const pick = nextInChain(chain, current);
    const target = pick instanceof SVGElement ? pick : null;
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
  }, [chainAt, currentSelection]);

  /**
   * Press: remember what a drag from here would move. Nothing happens until
   * the pointer travels — a press that does not is a click, and selects.
   * Pressing on the selection, or anywhere inside it, drags the selection;
   * pressing elsewhere drags whatever a click there would have selected.
   */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    suppressClickRef.current = false;
    if (e.button !== 0 || e.ctrlKey || e.metaKey || !editableRef.current) return;
    const handle = onHandle(e);
    const current = currentSelection();
    let target: Element | null;
    if (handle) {
      target = current;
    } else {
      const chain = chainAt(e);
      const onSelection = !!current && chain.includes(current);
      // A finger dragging anything but the selection means to scroll the pane.
      if (e.pointerType === 'touch' && !onSelection) return;
      target = onSelection ? current : nextInChain(chain, current);
    }
    if (!(target instanceof SVGGraphicsElement)) return;
    gestureRef.current = { pointerId: e.pointerId, mode: handle ? 'resize' : 'move', handle, startX: e.clientX, startY: e.clientY, target };
  }, [chainAt, currentSelection]);

  /** The drag begins: find the element in the source and measure its frame. */
  const beginDrag = useCallback((g: Gesture, e: React.PointerEvent): boolean => {
    const found = sourceFor(g.target);
    if ('error' in found) { if (found.error) notify(found.error); return false; }
    // A blocked element is refused before anything moves on screen.
    const probe = g.mode === 'move'
      ? planMove(found.source, 0, 0)
      : planResize(found.source, { handle: g.handle!, dx: 0, dy: 0, keepAspect: false, bbox: { x: 0, y: 0, width: 0, height: 0 }, minSize: 0, decimals: 0 });
    if (!probe.ok) { notify(probe.reason); return false; }

    const frame = g.mode === 'move' ? g.target.parentNode : g.target;
    const ctm = frame instanceof SVGGraphicsElement ? frame.getScreenCTM() : null;
    const m = ctm ? toMatrix(ctm) : null;
    const toUnits = m ? invert(m) : null;
    if (!m || !toUnits) return false;
    let bbox: Rect;
    try {
      const bb = g.target.getBBox();
      bbox = { x: bb.x, y: bb.y, width: bb.width, height: bb.height };
    } catch {
      return false;
    }

    if (!g.target.hasAttribute(DATA_SELECTED)) {
      clearAllSelections();
      applySelectionFilter(g.target, true);
      notifySelection();
    }
    if (hoveredRef.current && hoveredRef.current !== g.target) hoveredRef.current.style.filter = '';
    hoveredRef.current = null;
    const scale = pixelsPerUnit(m);
    g.drag = {
      path: found.path,
      source: found.source,
      toUnits,
      decimals: decimalsFor(scale),
      bbox,
      // Two screen pixels: small enough to go unnoticed, large enough that
      // the handles never sit on top of each other and become ungrabbable.
      minSize: 2 / scale,
      live: new LiveEdit(g.target),
      attrs: {},
    };
    scrollRef.current?.setPointerCapture(e.pointerId);
    scrollRef.current?.focus();
    return true;
  }, [sourceFor, clearAllSelections, applySelectionFilter, notifySelection]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g || e.pointerId !== g.pointerId) return;
    const sx = e.clientX - g.startX;
    const sy = e.clientY - g.startY;
    if (!g.drag) {
      if (Math.hypot(sx, sy) < DRAG_THRESHOLD) return;
      if (!beginDrag(g, e)) {
        gestureRef.current = null;
        suppressClickRef.current = true;
        return;
      }
    }
    const d = g.drag!;
    const v = applyToVector(d.toUnits, sx, sy);
    const dx = roundTo(v.x, d.decimals);
    const dy = roundTo(v.y, d.decimals);
    const plan = g.mode === 'move'
      ? planMove(d.source, dx, dy)
      : planResize(d.source, { handle: g.handle!, dx, dy, keepAspect: e.shiftKey, bbox: d.bbox, minSize: d.minSize, decimals: d.decimals });
    if (!plan.ok) { notify(plan.reason); cancelGesture(); return; }
    d.attrs = plan.attrs;
    d.live.show(plan.attrs);
    refreshOverlay();
  }, [beginDrag, cancelGesture, refreshOverlay]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g || e.pointerId !== g.pointerId) return;
    gestureRef.current = null;
    if (!g.drag) return; // a click, which onClick handles
    suppressClickRef.current = true;
    commit(g.drag.path, g.drag.attrs, g.mode, g.drag.live);
    refreshOverlay();
  }, [commit, refreshOverlay]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    if (gestureRef.current?.pointerId === e.pointerId) cancelGesture();
  }, [cancelGesture]);

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
    // Save scroll position before DOM replacement — and before the skip below
    // too: the zoom effect restores this position whenever the content
    // changes, rendered or not, and a stale one scrolled the whole view back
    // to wherever it was at the last real render the moment a drag landed.
    const el = scrollRef.current;
    if (el) savedScrollRef.current = { left: el.scrollLeft, top: el.scrollTop };
    // An edit made here has already been drawn here. Rendering it again would
    // swap every element out from under a second drag started within the
    // debounce, or a held arrow key, and cut it off half way.
    if (documentReady && renderedSourceRef.current === svgCode && shadow.querySelector('svg')) return;
    // Before the sanitize, not after: while the document is still loading there
    // is nothing worth parsing, and painting the stand-in string costs a layout
    // shift. Deliberately keyed on the load state rather than on "does this
    // text contain an <svg>" — a document the user has genuinely broken still
    // paints, which is how they find out it is broken.
    if (!documentReady) {
      renderedSourceRef.current = null;
      shadow.innerHTML = '';
      naturalSize.current = null;
      return;
    }
    // Stamped with source paths, so an element can be found in the code
    // again whatever the sanitizer does to the tree around it.
    shadow.innerHTML = sanitizeSvg(stampSourcePaths(svgCode) ?? svgCode);
    renderedSourceRef.current = svgCode;
    // The elements a gesture was holding have just been replaced.
    gestureRef.current = null;
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
    // Detect percentage-based dimensions (e.g. width="100%" height="100%")
    const isPercentW = wAttr.trim().endsWith('%');
    const isPercentH = hAttr.trim().endsWith('%');
    if (!size && (isPercentW || isPercentH)) {
      // Prefer viewBox for natural size so 100% zoom = true 1:1 pixels
      if (hasVb) {
        size = { w: vb[2], h: vb[3] };
      } else if (el) {
        const pw = el.clientWidth;
        const ph = el.clientHeight;
        size = { w: pw, h: ph };
        if (pw > 0 && ph > 0) {
          // A percentage needs a viewport to resolve against, so lay the drawing
          // out at the pane size and ask what actually got drawn. Content built
          // from percentages fills exactly that box, so the pane *is* its natural
          // size. Content built from absolute coordinates ignores the box and can
          // run far outside it — and with no viewBox there is nothing to scale it
          // back, so the pane would merely clip it and zoom would have nothing to
          // act on. That case gets a viewBox around the drawing, the same as a
          // dimensionless SVG already does.
          //
          // Restore the attributes afterwards: sizing the SVG here is only a
          // measurement, and leaving it sized makes the pane overflow, which
          // costs the auto-fit below a scrollbar's width of room.
          const savedW = svg.getAttribute('width');
          const savedH = svg.getAttribute('height');
          const measureAt = (w: number, h: number) => {
            svg.setAttribute('width', String(Math.max(1, Math.round(w))));
            svg.setAttribute('height', String(Math.max(1, Math.round(h))));
            return measureBBox(svg);
          };
          const atPane = measureAt(pw, ph);
          // Overflow on its own does not mean absolute coordinates: a drawing
          // built from percentages can still bleed past its edge on purpose, and
          // that a browser simply clips. Lay it out again at half the pane and
          // see whether the box follows — percentages do, absolute ones do not.
          const atHalf = measureAt(pw / 2, ph / 2);
          for (const [name, saved] of [['width', savedW], ['height', savedH]] as const) {
            if (saved === null) svg.removeAttribute(name); else svg.setAttribute(name, saved);
          }
          if (contentOverflowsViewport(atPane, pw, ph) && !bboxTracksViewport(atPane, atHalf)) {
            // Safe to re-measure inside synthesizeViewBox with the percentage
            // attributes back on: we only get here when the box ignores them.
            size = synthesizeViewBox(svg, pw, ph) ?? size;
          }
        }
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

    if (!isAbsoluteLength(wAttr) && !isPercentW) svg.removeAttribute('width');
    if (!isAbsoluteLength(hAttr) && !isPercentH) svg.removeAttribute('height');
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
  }, [debouncedSvg, documentReady, renderTick]);

  // An edit drawn here, then undone before the debounce fired, leaves the
  // code back where the debounced value already is — so it never changes, the
  // render above never runs, and the preview keeps showing the edit. Render
  // anyway. After the render effect, so an ordinary render has settled first.
  useEffect(() => {
    if (documentReady && svgCode === debouncedSvg && renderedSourceRef.current !== null && renderedSourceRef.current !== svgCode) {
      setRenderTick((n) => n + 1);
    }
  }, [svgCode, debouncedSvg, documentReady]);

  // Sync external selection (from editor cursor) via xpath
  useEffect(() => {
    const svg = getSvg();
    if (!svg) return;

    // Stamped when the source parses; when it does not, there is nothing
    // better than walking the preview's own tree.
    const target = !selectedXPath ? null
      : svg.hasAttribute(SOURCE_PATH_ATTR) ? findBySourcePath(svg, selectedXPath)
      : resolveXPath(svg, selectedXPath);
    // The preview reporting its own selection back. Leave it be: clearing
    // would drop every other shape a Ctrl+click had added.
    if (target && target === currentSelection()) return;

    clearAllSelections();
    if (target instanceof SVGElement && target !== svg) {
      applySelectionFilter(target, true);
    }
  }, [selectedXPath, debouncedSvg, clearAllSelections, applySelectionFilter, currentSelection]);

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

    // An <svg> defaults to display:inline, so it sits on the text baseline and
    // the line box reserves descender space beneath it — around 6px that the
    // preview then had to scroll, showing a scrollbar on a drawing that fits.
    svg.style.display = 'block';
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

  // After the effects above, which re-render, re-select and re-size the
  // drawing — each of which moves the selection on screen.
  useEffect(() => {
    refreshOverlay();
  }, [debouncedSvg, selectedXPath, zoomPct, bgMode, editable, onEditElement, refreshOverlay]);

  // The drawing is centred in the pane, so resizing the pane moves it too.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => refreshOverlay());
    ro.observe(el);
    return () => ro.disconnect();
  }, [refreshOverlay]);

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
        // minHeight (not height): wrapped rows on a narrow pane must grow the
        // bar instead of invisibly overlapping the preview area below it.
        style={{ backgroundColor: 'var(--esvg-chrome-bg)', borderBottom: '1px solid var(--esvg-chrome-border)', flexShrink: 0, minHeight: 36 }}
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

      <div ref={scrollRef} tabIndex={0} style={{ flex: 1, overflow: 'auto', outline: 'none' }} onClick={handleClick} onKeyDown={handleKeyDown} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel} onContextMenu={(e) => e.preventDefault()}>
        {/* inline-flex so the wrapper grows past the viewport when zoomed in,
            which block-level flex would not. verticalAlign top because inline
            level also means baseline-aligned, and the descender gap under it is
            scrollable height — a second phantom scrollbar on top of the one the
            SVG itself caused. */}
        <div ref={overlayHostRef} style={{ position: 'relative', minWidth: '100%', minHeight: '100%', display: 'inline-flex', verticalAlign: 'top', alignItems: 'center', justifyContent: 'center' }}>
          {/* userSelect: dragging across text in the drawing would select it.
              touchAction: with something selected, a finger on the drawing
              must reach the drag code instead of starting a browser pan,
              which cancels the gesture. Pinch-zoom stays the browser's. */}
          <div ref={containerRef} data-testid="svg-preview" style={{ flexShrink: 0, cursor: 'crosshair', userSelect: 'none', touchAction: quad ? 'pinch-zoom' : 'auto' }} />
          <SelectionOverlay quad={quad} coarse={coarsePointer} />
        </div>
      </div>
    </div>
  );
});

