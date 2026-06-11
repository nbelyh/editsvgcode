import DOMPurify from 'dompurify';

/**
 * Shared SVG sanitizer for every place that injects SVG markup into the live DOM
 * (preview, bounds measurement, icon rendering). Strips scripts, event handlers,
 * and foreignObject; allows <use> (excluded from the default svg profile —
 * browsers block cross-origin href references, so same-document use is safe enough).
 */
export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
  });
}
