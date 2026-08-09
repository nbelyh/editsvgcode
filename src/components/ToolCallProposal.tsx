import { useState, useEffect, useRef } from 'react';
import { IconPencil, IconCode, IconCheck, IconX, IconPhoto, IconChevronDown, IconChevronRight, IconDownload } from '@tabler/icons-react';
import type { ChatToolCall } from '../lib/api-client';
import { vectorize, DEFAULT_VECTORIZER_PARAMS, type VectorizerParams } from '../lib/image-gen';

/**
 * Notes attached to a proposal — edits that missed, edits that changed nothing
 * on screen.
 *
 * Folded away behind a count, because the list is as long as the job is big: a
 * translation of a floor plan sends a hundred edits, and two of them missing is
 * a footnote, not an alarm. Printed one per line rather than through
 * JSON.stringify, which showed the raw array with every quote backslashed and
 * made a footnote look like a stack trace.
 */
function ProposalNotes({ items, total, tone, summary, advice }: {
  items: unknown;
  /** How many edits the call carried, so a couple of misses read as a couple. */
  total?: number;
  tone: string;
  summary: string;
  advice?: string;
}) {
  const [open, setOpen] = useState(false);
  const list = (Array.isArray(items) ? items : [items]).map(String).filter((s) => s.trim() !== '');
  if (list.length === 0) return null;
  return (
    // The rule down the left is what separates a note from the assistant's own
    // words — dimmed text alone read as more output — and its colour says which
    // kind. The words stay dimmed rather than taking the hue: orange and yellow
    // cannot carry 11px text at readable contrast on white, and the shades that
    // can on dark glare. A rule carries no reading load, so it can be as
    // saturated as it likes.
    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--mantine-color-dimmed)', borderLeft: `2px solid ${tone}`, paddingLeft: 6 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit' }}
      >
        {open ? <IconChevronDown size={11} /> : <IconChevronRight size={11} />}
        <span>{summary}</span>
        {/* Bare numbers rather than a sentence built around them: the count is
            what makes two misses out of ninety read as small, and it stays
            translatable because no prose is assembled from fragments. */}
        <span>{total !== undefined ? `(${list.length}/${total})` : `(${list.length})`}</span>
      </button>
      {open && (
        <>
          {/* Said before the detail, because the detail is not addressed to the
              reader. These strings are written for the assistant — "use query to
              see what is there", "a positional path has to start with /" — and
              are kept verbatim only so a person debugging can see them. What the
              reader needs is whether their drawing is affected and what to do. */}
          {advice && <div style={{ margin: '4px 0 0' }}>{advice}</div>}
          {/* Labelled so the wording below is not mistaken for instructions to
              the reader: it tells the assistant which addresses to use. */}
          <div style={{ margin: '6px 0 0', opacity: 0.75 }}>Details, for the assistant:</div>
          <ul style={{ margin: '2px 0 0', paddingLeft: 18, listStyle: 'disc', opacity: 0.75 }}>
            {list.map((line, i) => (
              <li key={i} style={{ marginBottom: 2, wordBreak: 'break-word' }}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export interface StoredToolCall extends ChatToolCall {
  status: 'pending' | 'accepted' | 'rejected';
  /** Document SVG at the moment this call was accepted — the undo target.
   * Persisted with the message, so undo survives reload and other devices. */
  prevSvg?: string;
}

interface ToolCallProposalProps {
  tc: StoredToolCall;
  onAccept: () => void;
  onReject: () => void;
  onUpdateSvg?: (newSvg: string) => void;
}

// Build the popup via DOM properties rather than HTML interpolation: no markup context
// means no injection, regardless of where pngDataUrl comes from (stored transcripts will
// cross user boundaries once threads are shared/cloud-synced) or what scheme it uses later.
function openImageInNewTab(pngDataUrl: string) {
  const w = window.open('', '_blank');
  if (!w) return;
  const d = w.document;
  d.title = 'Generated Image';
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

      </div>
    </div>
  );
}

/** Tools that edit the existing document in place, and how they read in the card. */
const EDIT_TOOL_LABELS: Record<string, string> = {
  replace_lines: 'Edit lines',
  set_text: 'Set text',
  set_attribute: 'Set attribute',
  set_style_rule: 'Edit style rule',
  insert_element: 'Insert element',
  remove_element: 'Remove element',
};

export function ToolCallProposal({ tc, onAccept, onReject, onUpdateSvg }: ToolCallProposalProps) {
  const pngDataUrl = (tc.name === 'generate_image' || tc.name === 'modify_image') ? (tc.arguments.pngDataUrl as string | undefined) : undefined;

  return (
    <div className="aui-proposal" style={{ marginBottom: 2 }}>
      <div className="aui-proposal-header">
        {EDIT_TOOL_LABELS[tc.name] ? <IconPencil size={14} /> : (tc.name === 'generate_image' || tc.name === 'modify_image') ? <IconPhoto size={14} /> : <IconCode size={14} />}
        <span className="aui-proposal-summary">
          {(tc.arguments.summary as string) || EDIT_TOOL_LABELS[tc.name] || (tc.name === 'generate_image' ? 'Generate image' : tc.name === 'modify_image' ? 'Modify image' : 'Replace SVG')}
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
              openImageInNewTab(pngDataUrl);
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
          <button className="aui-action-btn aui-action-btn-primary" onClick={onAccept}>Accept</button>
          <button className="aui-action-btn" onClick={onReject}>Reject</button>
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
        // Dimmed, not red: the rest of the call applied, and the drawing in the
        // preview is the result. Red belongs to documentBroken below, where the
        // document actually stopped parsing.
        <ProposalNotes
          items={tc.arguments.failedOperations}
          total={Array.isArray(tc.arguments.edits) ? tc.arguments.edits.length : undefined}
          tone="var(--esvg-note-missed)"
          summary="Some changes were not applied"
          advice="Nothing was lost: the preview shows every change that did apply, and you can accept it. If something you asked for is still wrong, say which label in the chat and it will be fixed."
        />
      )}
      {'warnings' in tc.arguments && (
        // An edit that applied but changes nothing on screen. Without this the
        // assistant reports success over a drawing that did not move.
        <ProposalNotes
          items={tc.arguments.warnings}
          total={Array.isArray(tc.arguments.edits) ? tc.arguments.edits.length : undefined}
          tone="var(--esvg-note-ineffective)"
          summary="Applied, but with no visible effect"
          advice="The markup changed but the picture did not, usually because a style rule overrides the value that was set. Ask for the style rule to be changed instead."
        />
      )}
      {'documentBroken' in tc.arguments && (
        // Red, and worded as damage. This shares nothing but a colour with the
        // note above: there the markup changed and the picture did not, here the
        // document stopped parsing.
        // Never folded and never dimmed: the other two are notes about an edit,
        // this is the drawing no longer parsing, and it is the one thing here a
        // reader must not accept without looking.
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--esvg-note-broken)', borderLeft: '2px solid var(--esvg-note-broken)', paddingLeft: 6 }}>
          <div>This change breaks the SVG — rejecting it is the safe option.</div>
          <div style={{ opacity: 0.75, marginTop: 2 }}>{String(tc.arguments.documentBroken)}</div>
        </div>
      )}
    </div>
  );
}
