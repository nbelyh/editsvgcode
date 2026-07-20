interface SvgThumbProps {
  text: string;
  height?: number;
  width?: number | string;
  radius?: number;
  alt?: string;
}

/** Inline SVG preview via a data URL — shared by gallery cards, file lists and
 * the publish dialog. Renders a neutral placeholder when there is no text. */
export function SvgThumb({ text, height = 140, width = '100%', radius = 0, alt = 'preview' }: SvgThumbProps) {
  const style: React.CSSProperties = {
    height,
    width,
    objectFit: 'contain',
    background: 'var(--mantine-color-gray-1)',
    borderRadius: radius,
  };
  if (!text) return <div style={style} />;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  return <img src={url} alt={alt} style={style} />;
}
