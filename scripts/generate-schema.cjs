#!/usr/bin/env node
/**
 * SVG Schema Enhancement Script
 *
 * Takes the existing svg-schema.js (produced from SVG 1.1 XSD + MDN scraping)
 * and enhances it with SVG2 additions, deprecation flags, attribute value
 * enumerations, path command data, and color name completions.
 *
 * Usage: node scripts/generate-schema.cjs
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Load existing schema
// ---------------------------------------------------------------------------

const schemaPath = path.join(__dirname, '..', 'src', 'svg-schema.js');
const raw = fs.readFileSync(schemaPath, 'utf8');
const json = raw.replace(/^export var SvgSchema = /, '').trimEnd();
const schema = JSON.parse(json);

console.log(`Loaded ${Object.keys(schema).length} elements from existing schema`);

// ---------------------------------------------------------------------------
// 2. Deprecated elements
// ---------------------------------------------------------------------------

const DEPRECATED_ELEMENTS = new Set([
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'glyphRef',
  'tref', 'cursor', 'animateColor',
  'font', 'glyph', 'missing-glyph', 'hkern', 'vkern',
  'font-face', 'font-face-src', 'font-face-uri',
  'font-face-format', 'font-face-name',
  'definition-src', 'color-profile',
]);

let deprecatedCount = 0;
for (const [name, el] of Object.entries(schema)) {
  if (DEPRECATED_ELEMENTS.has(name)) {
    el.deprecated = true;
    deprecatedCount++;
  } else {
    el.deprecated = false;
  }
}
console.log(`Marked ${deprecatedCount} elements as deprecated`);

// ---------------------------------------------------------------------------
// 3. Deprecated attributes (global)
// ---------------------------------------------------------------------------

const DEPRECATED_ATTRIBUTES = new Set([
  'clip', 'glyph-orientation-horizontal', 'glyph-orientation-vertical',
  'xml:lang', 'xml:space', 'xlink:href', 'xlink:title', 'xlink:show',
  'xlink:actuate', 'xlink:type', 'xlink:role', 'xlink:arcrole',
  'requiredFeatures', 'externalResourcesRequired', 'enable-background',
  'contentScriptType', 'contentStyleType', 'zoomAndPan', 'version',
  'baseProfile',
]);

let deprecatedAttrCount = 0;
for (const el of Object.values(schema)) {
  if (!el.attributes) continue;
  for (const attr of el.attributes) {
    if (DEPRECATED_ATTRIBUTES.has(attr.name)) {
      attr.deprecated = true;
      deprecatedAttrCount++;
    }
  }
}
console.log(`Marked ${deprecatedAttrCount} attribute instances as deprecated`);

// ---------------------------------------------------------------------------
// 4. Add new SVG2 element: feDropShadow
// ---------------------------------------------------------------------------

if (!schema['feDropShadow']) {
  schema['feDropShadow'] = {
    name: 'feDropShadow',
    detail: 'svg element',
    description: 'The **`<feDropShadow>`** SVG filter primitive creates a drop shadow of the input image. It is a shorthand filter that combines `<feGaussianBlur>` and `<feOffset>`. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow)',
    deprecated: false,
    elements: [],
    attributes: [
      { name: 'in', description: 'Identifies input for the filter primitive.', detail: 'svg filter attribute', options: ['SourceGraphic', 'SourceAlpha', 'BackgroundImage', 'BackgroundAlpha', 'FillPaint', 'StrokePaint'] },
      { name: 'dx', description: 'The x offset of the drop shadow.', detail: 'svg item attribute', options: null },
      { name: 'dy', description: 'The y offset of the drop shadow.', detail: 'svg item attribute', options: null },
      { name: 'stdDeviation', description: 'The standard deviation for the blur operation in the drop shadow.', detail: 'svg item attribute', options: null },
      { name: 'flood-color', description: 'The color of the drop shadow.', detail: 'svg item attribute', options: null },
      { name: 'flood-opacity', description: 'The opacity of the drop shadow.', detail: 'svg item attribute', options: null },
      { name: 'result', description: 'Assigns a name to the filter output.', detail: 'svg filter attribute', options: null },
      { name: 'x', description: 'The x coordinate of the filter subregion.', detail: 'svg filter attribute', options: null },
      { name: 'y', description: 'The y coordinate of the filter subregion.', detail: 'svg filter attribute', options: null },
      { name: 'width', description: 'The width of the filter subregion.', detail: 'svg filter attribute', options: null },
      { name: 'height', description: 'The height of the filter subregion.', detail: 'svg filter attribute', options: null },
    ],
  };
  // Add feDropShadow to filter's child elements
  if (schema.filter?.elements && !schema.filter.elements.includes('feDropShadow')) {
    schema.filter.elements.push('feDropShadow');
  }
  console.log('Added feDropShadow element');
}

// ---------------------------------------------------------------------------
// 5. Add SVG2 attributes to existing elements
// ---------------------------------------------------------------------------

function addAttribute(elementName, attr) {
  const el = schema[elementName];
  if (!el) return;
  if (!el.attributes) el.attributes = [];
  if (el.attributes.some(a => a.name === attr.name)) return;
  el.attributes.push(attr);
}

function addAttributeToMany(elementNames, attr) {
  for (const name of elementNames) {
    addAttribute(name, { ...attr });
  }
}

// href (SVG2 replacement for xlink:href)
const HREF_ELEMENTS = [
  'a', 'image', 'use', 'linearGradient', 'radialGradient', 'pattern',
  'feImage', 'mpath', 'script', 'set', 'animate', 'animateMotion',
  'animateTransform', 'textPath',
];
addAttributeToMany(HREF_ELEMENTS, {
  name: 'href',
  description: 'The URL of a linked resource. Replaces `xlink:href` in SVG 2.',
  detail: 'svg2 attribute',
  options: null,
});
console.log(`Added href attribute to ${HREF_ELEMENTS.length} elements`);

// pathLength (SVG2: now on all basic shapes, not just <path>)
const PATHLENGTH_ELEMENTS = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'];
addAttributeToMany(PATHLENGTH_ELEMENTS, {
  name: 'pathLength',
  description: 'Lets authors specify the total length for the path, in user units. Used to calibrate `stroke-dasharray` and `stroke-dashoffset`.',
  detail: 'svg2 attribute',
  options: null,
});
console.log(`Added pathLength attribute to ${PATHLENGTH_ELEMENTS.length} elements`);

// fr (focal radius on radialGradient - SVG2)
addAttribute('radialGradient', {
  name: 'fr',
  description: 'The radius of the focal circle of the radial gradient (SVG 2).',
  detail: 'svg2 attribute',
  options: null,
});

// tabindex + autofocus (global SVG2 attributes — add to all non-deprecated container/graphics elements)
const INTERACTIVE_ELEMENTS = [
  'svg', 'g', 'a', 'use', 'image', 'foreignObject', 'switch',
  'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'textPath',
];
addAttributeToMany(INTERACTIVE_ELEMENTS, {
  name: 'tabindex',
  description: 'A numeric value indicating the tabbing order of the element.',
  detail: 'svg2 global attribute',
  options: null,
});
addAttributeToMany(INTERACTIVE_ELEMENTS, {
  name: 'autofocus',
  description: 'Indicates that the element should be focused on page load.',
  detail: 'svg2 global attribute',
  options: ['true', 'false'],
});

// transform-origin (add to elements that have transform)
const TRANSFORM_ELEMENTS = [
  'svg', 'g', 'use', 'image', 'foreignObject',
  'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'textPath', 'a', 'switch', 'symbol',
  'marker', 'clipPath', 'mask', 'pattern',
];
addAttributeToMany(TRANSFORM_ELEMENTS, {
  name: 'transform-origin',
  description: 'Sets the origin for transformations. Similar to CSS `transform-origin`.',
  detail: 'svg2 presentation attribute',
  options: null,
});

// vector-effect (add to all graphics elements)
const GRAPHICS_ELEMENTS = [
  'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'textPath', 'image', 'use', 'foreignObject',
];
addAttributeToMany(GRAPHICS_ELEMENTS, {
  name: 'vector-effect',
  description: 'Specifies the vector effect to use when drawing the object. Most commonly used for `non-scaling-stroke`.',
  detail: 'svg2 presentation attribute',
  options: ['none', 'non-scaling-stroke', 'non-scaling-size', 'non-rotation', 'fixed-position'],
});

console.log('Added SVG2 global attributes (tabindex, autofocus, transform-origin, vector-effect)');

// ---------------------------------------------------------------------------
// 6. Attribute value enumerations
// ---------------------------------------------------------------------------

// Map of attribute name → options. Applied to every element that has the attribute.
const ATTRIBUTE_ENUMERATIONS = {
  // Presentation attributes
  'stroke-linecap': ['butt', 'round', 'square'],
  'stroke-linejoin': ['arcs', 'bevel', 'miter', 'miter-clip', 'round'],
  'fill-rule': ['nonzero', 'evenodd'],
  'clip-rule': ['nonzero', 'evenodd'],
  'text-anchor': ['start', 'middle', 'end'],
  'dominant-baseline': ['auto', 'text-bottom', 'alphabetic', 'ideographic', 'middle', 'central', 'mathematical', 'hanging', 'text-top'],
  'alignment-baseline': ['auto', 'baseline', 'before-edge', 'text-before-edge', 'middle', 'central', 'after-edge', 'text-after-edge', 'ideographic', 'alphabetic', 'hanging', 'mathematical'],
  'text-decoration': ['none', 'underline', 'overline', 'line-through'],
  'font-style': ['normal', 'italic', 'oblique'],
  'font-weight': ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  'font-stretch': ['normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'],
  'visibility': ['visible', 'hidden', 'collapse'],
  'overflow': ['visible', 'hidden', 'scroll', 'auto'],
  'display': ['inline', 'block', 'none'],
  'pointer-events': ['visiblePainted', 'visibleFill', 'visibleStroke', 'visible', 'painted', 'fill', 'stroke', 'all', 'none'],
  'shape-rendering': ['auto', 'optimizeSpeed', 'crispEdges', 'geometricPrecision'],
  'text-rendering': ['auto', 'optimizeSpeed', 'optimizeLegibility', 'geometricPrecision'],
  'image-rendering': ['auto', 'optimizeSpeed', 'optimizeQuality', 'crisp-edges', 'pixelated'],
  'color-interpolation': ['auto', 'sRGB', 'linearRGB'],
  'color-interpolation-filters': ['auto', 'sRGB', 'linearRGB'],
  'writing-mode': ['horizontal-tb', 'vertical-rl', 'vertical-lr', 'lr', 'lr-tb', 'rl', 'rl-tb', 'tb', 'tb-rl'],
  'unicode-bidi': ['normal', 'embed', 'bidi-override', 'isolate', 'isolate-override', 'plaintext'],
  'direction': ['ltr', 'rtl'],
  'paint-order': ['normal', 'fill', 'stroke', 'markers', 'fill stroke', 'stroke fill', 'fill markers', 'stroke markers'],
  'cursor': ['auto', 'crosshair', 'default', 'pointer', 'move', 'text', 'wait', 'help', 'n-resize', 's-resize', 'e-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize'],

  // Element-specific enumerated attributes
  'spreadMethod': ['pad', 'reflect', 'repeat'],
  'gradientUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'clipPathUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'maskUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'maskContentUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'patternUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'patternContentUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'filterUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'primitiveUnits': ['userSpaceOnUse', 'objectBoundingBox'],
  'markerUnits': ['strokeWidth', 'userSpaceOnUse'],
  'orient': ['auto', 'auto-start-reverse'],
  'lengthAdjust': ['spacing', 'spacingAndGlyphs'],
  'method': ['align', 'stretch'],
  'spacing': ['auto', 'exact'],
  'textLength': null, // numeric, no enum
  'preserveAspectRatio': ['none', 'xMinYMin', 'xMidYMin', 'xMaxYMin', 'xMinYMid', 'xMidYMid', 'xMaxYMid', 'xMinYMax', 'xMidYMax', 'xMaxYMax', 'meet', 'slice'],
  'target': ['_self', '_parent', '_top', '_blank'],

  // Filter primitive enumerations
  'in': ['SourceGraphic', 'SourceAlpha', 'BackgroundImage', 'BackgroundAlpha', 'FillPaint', 'StrokePaint'],
  'in2': ['SourceGraphic', 'SourceAlpha', 'BackgroundImage', 'BackgroundAlpha', 'FillPaint', 'StrokePaint'],
  'mode': ['normal', 'multiply', 'screen', 'darken', 'lighten', 'overlay', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
  'operator': ['over', 'in', 'out', 'atop', 'xor', 'lighter', 'arithmetic', 'erode', 'dilate'],
  'edgeMode': ['duplicate', 'wrap', 'none'],
  'xChannelSelector': ['R', 'G', 'B', 'A'],
  'yChannelSelector': ['R', 'G', 'B', 'A'],
  'stitchTiles': ['stitch', 'noStitch'],

  // Animation enumerations
  'calcMode': ['discrete', 'linear', 'paced', 'spline'],
  'additive': ['replace', 'sum'],
  'accumulate': ['none', 'sum'],
  'attributeType': ['CSS', 'XML', 'auto'],
  'restart': ['always', 'whenNotActive', 'never'],
  'fill': ['freeze', 'remove'], // NOTE: this is animation fill, not paint fill
  'rotate': ['auto', 'auto-reverse'],
  'repeatCount': ['indefinite'],

  // Type attributes (shared name, different values per element — use union)
  'type': ['translate', 'scale', 'rotate', 'skewX', 'skewY', // animateTransform
           'matrix', 'saturate', 'hueRotate', 'luminanceToAlpha', // feColorMatrix
           'fractalNoise', 'turbulence', // feTurbulence
           'identity', 'table', 'discrete', 'linear', 'gamma', // feFuncR/G/B/A
  ],
};

// Special handling: 'fill' as a paint attribute should NOT get animation options.
// Animation elements have a separate 'fill' meaning. We handle this by only
// applying animation fill options to animation elements.
const ANIMATION_ELEMENTS = new Set([
  'animate', 'animateMotion', 'animateTransform', 'animateColor', 'set',
]);

let enumCount = 0;
for (const el of Object.values(schema)) {
  if (!el.attributes) continue;
  for (const attr of el.attributes) {
    if (attr.name === 'fill' && !ANIMATION_ELEMENTS.has(el.name)) {
      // Paint fill — skip enum (it takes color values, handled by color completions)
      continue;
    }
    const options = ATTRIBUTE_ENUMERATIONS[attr.name];
    if (options) {
      if (!attr.options) enumCount++;
      attr.options = options;
    }
  }
}
console.log(`Added enumerations to ${enumCount} attribute instances`);

// ---------------------------------------------------------------------------
// 7. Path command data (stored as __pathCommands in schema)
// ---------------------------------------------------------------------------

schema.__pathCommands = [
  { name: 'M', insert: 'M ${1:x} ${2:y}', description: '**Move to** (absolute) — Start a new sub-path at (x, y)' },
  { name: 'm', insert: 'm ${1:dx} ${2:dy}', description: '**Move to** (relative) — Start a new sub-path offset by (dx, dy)' },
  { name: 'L', insert: 'L ${1:x} ${2:y}', description: '**Line to** (absolute) — Draw a line to (x, y)' },
  { name: 'l', insert: 'l ${1:dx} ${2:dy}', description: '**Line to** (relative) — Draw a line offset by (dx, dy)' },
  { name: 'H', insert: 'H ${1:x}', description: '**Horizontal line** (absolute) — Draw a horizontal line to x' },
  { name: 'h', insert: 'h ${1:dx}', description: '**Horizontal line** (relative) — Draw a horizontal line offset by dx' },
  { name: 'V', insert: 'V ${1:y}', description: '**Vertical line** (absolute) — Draw a vertical line to y' },
  { name: 'v', insert: 'v ${1:dy}', description: '**Vertical line** (relative) — Draw a vertical line offset by dy' },
  { name: 'C', insert: 'C ${1:x1} ${2:y1} ${3:x2} ${4:y2} ${5:x} ${6:y}', description: '**Cubic Bézier** (absolute) — Curve with control points (x1,y1), (x2,y2) to endpoint (x,y)' },
  { name: 'c', insert: 'c ${1:dx1} ${2:dy1} ${3:dx2} ${4:dy2} ${5:dx} ${6:dy}', description: '**Cubic Bézier** (relative) — Curve with relative control points' },
  { name: 'S', insert: 'S ${1:x2} ${2:y2} ${3:x} ${4:y}', description: '**Smooth cubic Bézier** (absolute) — First control point reflected from previous curve' },
  { name: 's', insert: 's ${1:dx2} ${2:dy2} ${3:dx} ${4:dy}', description: '**Smooth cubic Bézier** (relative)' },
  { name: 'Q', insert: 'Q ${1:x1} ${2:y1} ${3:x} ${4:y}', description: '**Quadratic Bézier** (absolute) — Curve with control point (x1,y1) to endpoint (x,y)' },
  { name: 'q', insert: 'q ${1:dx1} ${2:dy1} ${3:dx} ${4:dy}', description: '**Quadratic Bézier** (relative)' },
  { name: 'T', insert: 'T ${1:x} ${2:y}', description: '**Smooth quadratic Bézier** (absolute) — Control point reflected from previous curve' },
  { name: 't', insert: 't ${1:dx} ${2:dy}', description: '**Smooth quadratic Bézier** (relative)' },
  { name: 'A', insert: 'A ${1:rx} ${2:ry} ${3:rotation} ${4:large-arc} ${5:sweep} ${6:x} ${7:y}', description: '**Arc** (absolute) — Elliptical arc: rx ry x-rotation large-arc-flag sweep-flag x y' },
  { name: 'a', insert: 'a ${1:rx} ${2:ry} ${3:rotation} ${4:large-arc} ${5:sweep} ${6:dx} ${7:dy}', description: '**Arc** (relative) — Elliptical arc with relative endpoint' },
  { name: 'Z', insert: 'Z', description: '**Close path** — Draw a straight line back to the start of the sub-path' },
  { name: 'z', insert: 'z', description: '**Close path** — Same as Z (case-insensitive)' },
];
console.log(`Added ${schema.__pathCommands.length} path commands`);

// ---------------------------------------------------------------------------
// 8. CSS named colors (stored as __colorNames in schema)
// ---------------------------------------------------------------------------

schema.__colorNames = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
  'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown',
  'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue',
  'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod',
  'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta',
  'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon',
  'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey',
  'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
  'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen',
  'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green',
  'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
  'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon',
  'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray',
  'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
  'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
  'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon',
  'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
  'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
  'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
  'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange',
  'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
  'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
  'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue',
  'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
  'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
  'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise',
  'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
  // Special values
  'none', 'currentColor', 'inherit', 'transparent',
];
console.log(`Added ${schema.__colorNames.length} color names`);

// Mark which attributes accept color values (for completion provider)
const COLOR_ATTRIBUTES = new Set([
  'fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color', 'color',
]);

for (const el of Object.values(schema)) {
  if (!el.attributes || typeof el === 'object' && Array.isArray(el)) continue;
  if (!el.attributes) continue;
  for (const attr of el.attributes) {
    if (COLOR_ATTRIBUTES.has(attr.name)) {
      attr.colorAttribute = true;
    }
  }
}

// ---------------------------------------------------------------------------
// 9. Add child elements for foreignObject (empty in XSD but useful)
// ---------------------------------------------------------------------------

if (schema.foreignObject && (!schema.foreignObject.elements || schema.foreignObject.elements.length === 0)) {
  // foreignObject accepts any HTML content, but we don't list HTML elements.
  // Keep empty — it's a container for non-SVG content.
}

// ---------------------------------------------------------------------------
// 10. Ensure all elements have MDN-style detail field
// ---------------------------------------------------------------------------

for (const [name, el] of Object.entries(schema)) {
  if (name.startsWith('__')) continue;
  if (!el.detail) {
    el.detail = el.deprecated ? 'svg element (deprecated)' : 'svg element';
  } else if (el.deprecated && !el.detail.includes('deprecated')) {
    el.detail += ' (deprecated)';
  }
}

// ---------------------------------------------------------------------------
// 11. Write output
// ---------------------------------------------------------------------------

// Keep original element order, just append meta entries at the end
const elementEntries = Object.entries(schema).filter(([k]) => !k.startsWith('__'));
const metaEntries = Object.entries(schema).filter(([k]) => k.startsWith('__'));
const sortedEntries = [...elementEntries, ...metaEntries];

const sortedSchema = Object.fromEntries(sortedEntries);

const output = 'export var SvgSchema = ' + JSON.stringify(sortedSchema, null, 2);
fs.writeFileSync(schemaPath, output, 'utf8');

const stats = {
  elements: Object.keys(sortedSchema).filter(k => !k.startsWith('__')).length,
  deprecated: Object.values(sortedSchema).filter(v => v.deprecated).length,
  active: Object.keys(sortedSchema).filter(k => !k.startsWith('__')).length - Object.values(sortedSchema).filter(v => v.deprecated).length,
  meta: Object.keys(sortedSchema).filter(k => k.startsWith('__')).length,
};
console.log(`\nWritten ${schemaPath}`);
console.log(`  ${stats.elements} elements (${stats.active} active, ${stats.deprecated} deprecated)`);
console.log(`  ${stats.meta} meta entries (__pathCommands, __colorNames)`);
console.log(`  ${(output.length / 1024).toFixed(0)} KB`);
