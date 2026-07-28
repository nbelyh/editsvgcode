interface SvgThumbProps {
  text: string;
  height?: number;
  width?: number | string;
  /**
   * CSS aspect-ratio for the box (e.g. '4 / 3'), used instead of a fixed
   * height. A full-width thumb with a fixed height letterboxes badly: at three
   * columns it becomes ~2.5:1, so anything square or portrait sits in a narrow
   * strip between wide grey margins. A ratio keeps the box proportional to
   * whatever column width it lands in.
   */
  ratio?: string;
  radius?: number;
  alt?: string;
}

/** Inline SVG preview via a data URL — shared by gallery cards, file lists and
 * the publish dialog. Renders a neutral placeholder when there is no text. */
export function SvgThumb({ text, height = 140, width = '100%', ratio, radius = 0, alt = 'preview' }: SvgThumbProps) {
  const style: React.CSSProperties = {
    ...(ratio ? { aspectRatio: ratio, height: 'auto' } : { height }),
    width,
    objectFit: 'contain',
    background: 'var(--mantine-color-gray-1)',
    borderRadius: radius,
  };
  if (!text) return <div style={style} />;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  return <img src={url} alt={alt} style={style} />;
}
