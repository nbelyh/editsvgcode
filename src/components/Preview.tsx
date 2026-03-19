import { useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface PreviewProps {
  svgCode: string;
}

export function Preview({ svgCode }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = DOMPurify.sanitize(svgCode, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
      });
    }
  }, [svgCode]);

  // Apply checkerboard background + border to the rendered SVG element
  useEffect(() => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.border = '1px solid lightgray';
        svg.style.backgroundImage =
          'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAABlBMVEX////g4OACVBJKAAAAFElEQVR42mNgAAJGIGDAwyAkDwQABMgAIUCVOUYAAAAASUVORK5CYII=")';
      }
    }
  }, [svgCode]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    />
  );
}
