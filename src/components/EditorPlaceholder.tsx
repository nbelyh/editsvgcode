/**
 * Static stand-in for Monaco while it downloads, in place of its default
 * "Loading..." label. Monaco comes from a CDN in a chain that cannot start
 * until the app has booted, and this keeps the document readable in the
 * meantime — including when Monaco is slow, blocked or never arrives.
 *
 * Metrics below are Monaco's defaults, so the hand-off does not shift.
 */
interface EditorPlaceholderProps {
  /** The document to show. Rendered as inert text — never edited here. */
  value: string;
  /** Monaco theme id, as passed to the real editor: 'vs' or 'vs-dark'. */
  theme?: string;
}

const THEMES = {
  'vs-dark': { bg: '#1E1E1E', fg: '#D4D4D4', gutter: '#858585' },
  vs: { bg: '#FFFFFE', fg: '#000000', gutter: '#237893' },
};

const FONT = "Consolas, 'Courier New', monospace";
const LINE_HEIGHT = 19;

/** Shared by both columns so the numbers line up with the code beside them. */
const COLUMN: React.CSSProperties = {
  margin: 0,
  font: `14px/${LINE_HEIGHT}px ${FONT}`,
  whiteSpace: 'pre',
};

export function EditorPlaceholder({ value, theme }: EditorPlaceholderProps) {
  const c = theme === 'vs-dark' ? THEMES['vs-dark'] : THEMES.vs;
  const lineCount = value.split('\n').length;
  const gutter = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div
      // Not aria-hidden: that silenced the "Loading..." this replaced, leaving
      // screen readers nothing at all. aria-busy says the region is still
      // settling, and the status line below names what is happening.
      aria-busy="true"
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: c.bg,
        color: c.fg,
        display: 'flex',
        // Deliberately not 'text'. The listing is inert, and anything typed
        // here is discarded when Monaco takes over, so it must not present
        // itself as an editable surface — most of all when Monaco is slow or
        // blocked and this is on screen for a long time.
        cursor: 'default',
      }}
    >
      <pre
        style={{
          ...COLUMN,
          color: c.gutter,
          textAlign: 'right',
          paddingRight: 14,
          flex: '0 0 52px',
          userSelect: 'none',
        }}
      >
        {gutter}
      </pre>
      <pre style={{ ...COLUMN, flex: 1, overflow: 'hidden' }}>{value}</pre>
      {/* Announced to screen readers, and visible enough that a sighted user
          understands why typing does nothing yet. */}
      <div
        role="status"
        style={{
          position: 'absolute',
          right: 12,
          bottom: 8,
          font: `12px/1.4 ${FONT}`,
          color: c.gutter,
          pointerEvents: 'none',
        }}
      >
        Loading editor…
      </div>
    </div>
  );
}
