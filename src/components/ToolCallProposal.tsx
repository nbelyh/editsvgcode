import { useState, useEffect, useRef } from 'react';
import { IconPencil, IconCode, IconCheck, IconX, IconPhoto, IconChevronDown, IconChevronRight, IconDownload } from '@tabler/icons-react';
import type { ChatToolCall } from '../lib/api-client';
import { vectorize, DEFAULT_VECTORIZER_PARAMS, type VectorizerParams } from '../lib/image-gen';

export interface StoredToolCall extends ChatToolCall {
  status: 'pending' | 'accepted' | 'rejected';
}

interface ToolCallProposalProps {
  tc: StoredToolCall;
  onAccept: () => void;
  onReject: () => void;
  onUpdateSvg?: (newSvg: string) => void;
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

function ImageGenerationControls({ pngDataUrl, onUpdateSvg }: { pngDataUrl: string; onUpdateSvg?: (svg: string) => void }) {
  const [params, setParams] = useState<VectorizerParams>(DEFAULT_VECTORIZER_PARAMS);
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
      if (revectorizeRef.current === id) {
        onUpdateSvgRef.current?.(svg);
      }
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
            const w = window.open('', '_blank');
            if (w) {
              w.document.write(`<!DOCTYPE html><html><head><title>Generated Image</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a1a1a}</style></head><body><img src="${pngDataUrl}" style="max-width:100%;max-height:100vh" /></body></html>`);
              w.document.close();
            }
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

      </div>
    </div>
  );
}

export function ToolCallProposal({ tc, onAccept, onReject, onUpdateSvg }: ToolCallProposalProps) {
  const pngDataUrl = tc.name === 'generate_image' ? (tc.arguments.pngDataUrl as string | undefined) : undefined;

  return (
    <div className="aui-proposal" style={{ marginBottom: 8 }}>
      <div className="aui-proposal-header">
        {tc.name === 'find_replace' ? <IconPencil size={14} /> : tc.name === 'generate_image' ? <IconPhoto size={14} /> : <IconCode size={14} />}
        <span className="aui-proposal-summary">
          {(tc.arguments.summary as string) || (tc.name === 'find_replace' ? 'Find & replace' : tc.name === 'generate_image' ? 'Generate image' : 'Replace SVG')}
        </span>
      </div>
      {pngDataUrl && tc.status === 'pending' && (
        <ImageGenerationControls pngDataUrl={pngDataUrl} onUpdateSvg={onUpdateSvg} />
      )}
      {pngDataUrl && tc.status !== 'pending' && (
        <div className="aui-vectorizer-preview aui-vectorizer-preview-row" style={{ marginTop: 8 }}>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              const w = window.open('', '_blank');
              if (w) {
                w.document.write(`<!DOCTYPE html><html><head><title>Generated Image</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a1a1a}</style></head><body><img src="${pngDataUrl}" style="max-width:100%;max-height:100vh" /></body></html>`);
                w.document.close();
              }
            }}
            title="Open full size"
          >
            <img src={pngDataUrl} alt="Generated PNG" />
          </a>
          <a className="aui-vectorizer-save-png" href={pngDataUrl} download="generated.png" title="Save generated raster image">
            <IconDownload size={12} /> Save raster image
          </a>
        </div>
      )}
      {tc.status === 'pending' && (
        <div className="aui-proposal-actions">
          <button
            className="aui-composer-send"
            style={{ fontSize: 11, padding: '3px 10px', height: 26 }}
            onClick={onAccept}
          >
            Accept
          </button>
          <button
            className="aui-composer-send"
            style={{ fontSize: 11, padding: '3px 10px', height: 26, backgroundColor: 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))' }}
            onClick={onReject}
          >
            Reject
          </button>
        </div>
      )}
      {tc.status === 'accepted' && (
        <div className="aui-proposal-status aui-status-accepted">
          <IconCheck size={12} />&nbsp;Accepted
        </div>
      )}
      {tc.status === 'rejected' && (
        <div className="aui-proposal-status aui-status-rejected">
          <IconX size={12} />&nbsp;Dismissed
        </div>
      )}
      {'failedOperations' in tc.arguments && (
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--mantine-color-red-filled)' }}>
          ⚠ Some edits failed: {JSON.stringify(tc.arguments.failedOperations)}
        </div>
      )}
    </div>
  );
}
