import { useState, useEffect, useRef } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { vectorize, LEGACY_VECTORIZER_PARAMS, MAX_TRACE_CHARS, type VectorizerParams } from '../lib/trace';
import './TraceControls.css';

/**
 * The tracer's settings beside the picture they trace, retracing as they change: on an AI
 * proposal in the chat (ToolCallProposal) and in the MCP picture widget.
 */

// Build the popup via DOM properties rather than HTML interpolation: no markup context
// means no injection, regardless of where pngDataUrl comes from (stored transcripts will
// cross user boundaries once threads are shared/cloud-synced) or what scheme it uses later.
export function openImageInNewTab(pngDataUrl: string) {
  const w = window.open('', '_blank');
  if (!w) return;
  const d = w.document;
  d.title = 'Picture';
  d.body.style.cssText = 'margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a1a1a';
  const img = d.createElement('img');
  img.src = pngDataUrl;
  img.style.cssText = 'max-width:100%;max-height:100vh';
  d.body.appendChild(img);
}

function SegmentedControl({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="aui-vectorizer-seg">
      {options.map(o => (
        <button
          key={o.value}
          className={`aui-vectorizer-seg-btn${o.value === value ? ' active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="aui-vectorizer-row">
      <span className="aui-vectorizer-label">{label}&nbsp;<strong>{value}</strong></span>
      <input
        className="aui-vectorizer-range"
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(+e.target.value)}
      />
    </div>
  );
}

export function ImageGenerationControls({ pngDataUrl, initialParams, onUpdateSvg }: { pngDataUrl: string; initialParams?: VectorizerParams; onUpdateSvg?: (svg: string) => void }) {
  // Opens at the settings the picture was traced with: a detailed one may have been traced
  // coarser than the default to stay small enough to save, and one with none recorded was
  // traced before the defaults changed.
  const [params, setParams] = useState<VectorizerParams>(initialParams ?? LEGACY_VECTORIZER_PARAMS);
  // A retrace past the size limit is not applied: saved, it would stop the chat saving.
  const [tooDetailed, setTooDetailed] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof VectorizerParams>(key: K, val: VectorizerParams[K]) =>
    setParams(p => ({ ...p, [key]: val }));

  const revectorizeRef = useRef(0);
  const onUpdateSvgRef = useRef(onUpdateSvg);
  onUpdateSvgRef.current = onUpdateSvg;

  // Auto re-vectorize on param change (debounced)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const id = ++revectorizeRef.current;
    const timer = setTimeout(async () => {
      const svg = await vectorize(pngDataUrl, params);
      if (revectorizeRef.current !== id) return;
      setTooDetailed(svg.length > MAX_TRACE_CHARS);
      if (svg.length <= MAX_TRACE_CHARS) onUpdateSvgRef.current?.(svg);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="aui-vectorizer">
      <div className="aui-vectorizer-preview">
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            openImageInNewTab(pngDataUrl);
          }}
          title="Open full size"
        >
          <img src={pngDataUrl} alt="Generated PNG" />
        </a>
      </div>
      <div className="aui-vectorizer-controls">
        {/* Primary controls — always visible */}
        <div className="aui-vectorizer-row">
          <span className="aui-vectorizer-label">Curve</span>
          <SegmentedControl
            value={params.mode}
            options={[{ value: 'none', label: 'Pixel' }, { value: 'polygon', label: 'Polygon' }, { value: 'spline', label: 'Spline' }]}
            onChange={v => set('mode', v as VectorizerParams['mode'])}
          />
        </div>
        <SliderRow label="Colors" value={params.colorPrecision} min={1} max={8} step={1} onChange={v => set('colorPrecision', v)} />
        <SliderRow label="Speckle" value={params.filterSpeckle} min={1} max={16} step={1} onChange={v => set('filterSpeckle', v)} />
        <SliderRow label="Gradient" value={params.layerDifference} min={0} max={64} step={1} onChange={v => set('layerDifference', v)} />

        {/* Expandable advanced controls */}
        <button className="aui-vectorizer-toggle" onClick={() => setShowAdvanced(s => !s)}>
          {showAdvanced ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
          More settings
        </button>
        {showAdvanced && (
          <div className="aui-vectorizer-advanced">
            <div className="aui-vectorizer-row">
              <span className="aui-vectorizer-label">Clustering</span>
              <SegmentedControl
                value={params.clusteringMode}
                options={[{ value: 'binary', label: 'B/W' }, { value: 'color', label: 'Color' }]}
                onChange={v => set('clusteringMode', v as VectorizerParams['clusteringMode'])}
              />
            </div>
            <div className="aui-vectorizer-row">
              <span className="aui-vectorizer-label">Hierarchy</span>
              <SegmentedControl
                value={params.hierarchical}
                options={[{ value: 'cutout', label: 'Cutout' }, { value: 'stacked', label: 'Stacked' }]}
                onChange={v => set('hierarchical', v as VectorizerParams['hierarchical'])}
              />
            </div>
            <SliderRow label="Corner" value={params.cornerThreshold} min={0} max={180} step={1} onChange={v => set('cornerThreshold', v)} />
            <SliderRow label="Length" value={params.lengthThreshold} min={1} max={20} step={0.5} onChange={v => set('lengthThreshold', v)} />
            <SliderRow label="Splice" value={params.spliceThreshold} min={0} max={180} step={1} onChange={v => set('spliceThreshold', v)} />
            <SliderRow label="Precision" value={params.pathPrecision} min={0} max={16} step={1} onChange={v => set('pathPrecision', v)} />
          </div>
        )}
        {tooDetailed && (
          <div className="aui-image-confirm-hint">Too detailed to keep at these settings. Raise Speckle or lower Colors.</div>
        )}

      </div>
    </div>
  );
}
