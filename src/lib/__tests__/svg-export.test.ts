import { describe, it, expect } from 'vitest';
import {
  parseSvg, intrinsicSize, outputSize, sizedMarkup, preserveAspectRatio, base64, svgDataUri, svgBase64DataUri, cssBackground,
  componentName, reactComponent, loadsFromOtherSites, scaledName, srcsetImg, MAX_SIDE, MAX_PIXELS,
} from '../svg-export';

const root = (svg: string) => {
  const parsed = parseSvg(svg);
  if ('error' in parsed) throw new Error(parsed.error);
  return parsed;
};
const size = (svg: string) => intrinsicSize(root(svg).root);

describe('parseSvg — reads what the preview shows', () => {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  it('takes SVG copied out of a web page, which strict SVG refuses', () => {
    for (const svg of [
      '<svg width="40" height="20"><rect width="40" height="20"/></svg>',                                            // no xmlns
      '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#a"/></svg>',                                        // xlink never declared
      '<svg xmlns="http://www.w3.org/2000/svg"><text>a&nbsp;b &copy;</text></svg>',                                   // HTML entities
    ]) {
      const parsed = parseSvg(svg);
      if ('error' in parsed) throw new Error(`refused: ${svg}`);
      expect(parsed.root.namespaceURI).toBe(SVG_NS);
    }
    const use = root('<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#a"/></svg>').root.firstElementChild!;
    expect(use.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('#a');
    expect(root('<svg xmlns="http://www.w3.org/2000/svg"><text>a&nbsp;b</text></svg>').root.textContent).toBe('a b');
  });

  it('refuses what is not an SVG at all', () => {
    expect(parseSvg('just some text')).toMatchObject({ error: expect.stringContaining('error in its code') });
  });
});

describe('a set of screen densities', () => {
  it('names each file the way iOS and Figma do', () => {
    expect(scaledName('logo', 1, 'png')).toBe('logo.png');
    expect(scaledName('logo', 2, 'png')).toBe('logo@2x.png');
    expect(scaledName('logo', 3, 'webp')).toBe('logo@3x.webp');
  });

  it('writes the <img> that lets the browser pick, laid out at the drawing’s own size', () => {
    expect(srcsetImg('logo', 'png', [3, 1, 2], { width: 40, height: 20 }))
      .toBe('<img src="logo.png" srcset="logo.png 1x, logo@2x.png 2x, logo@3x.png 3x" width="40" height="20" alt="">');
    // A space would end a srcset entry, and a comma would start the next.
    expect(srcsetImg('my logo, v2', 'png', [2], { width: 37.5, height: 19 }))
      .toBe('<img src="my%20logo%2C%20v2@2x.png" srcset="my%20logo%2C%20v2@2x.png 2x" width="38" height="19" alt="">');
  });
});

describe('loadsFromOtherSites', () => {
  it('spots images, fonts and styles fetched from elsewhere, and only those', () => {
    expect(loadsFromOtherSites('<svg><image href="https://x.test/a.png"/></svg>')).toBe(true);
    expect(loadsFromOtherSites('<svg><image xlink:href="//x.test/a.png"/></svg>')).toBe(true);
    expect(loadsFromOtherSites('<svg><style>@import url(https://fonts.test/a.css);</style></svg>')).toBe(true);
    expect(loadsFromOtherSites('<svg><rect style="fill: url(https://x.test/p.svg#g)"/></svg>')).toBe(true);
    expect(loadsFromOtherSites('<svg xmlns="http://www.w3.org/2000/svg"><a href="https://x.test"><use href="#a"/></a><image href="data:image/png;base64,AA"/></svg>')).toBe(false);
  });
});

describe('intrinsicSize — what 1× means', () => {
  it('takes width and height when both are lengths', () => {
    expect(size('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 10 10"/>')).toEqual({ width: 400, height: 300 });
  });

  it('converts real-world units to pixels', () => {
    expect(size('<svg xmlns="http://www.w3.org/2000/svg" width="1in" height="72pt"/>')).toEqual({ width: 96, height: 96 });
    const mm = size('<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm"/>');
    expect(Math.round(mm.width)).toBe(794);
  });

  it('takes the other side from the viewBox proportions when only one is given', () => {
    expect(size('<svg xmlns="http://www.w3.org/2000/svg" width="200" viewBox="0 0 100 50"/>')).toEqual({ width: 200, height: 100 });
  });

  it('falls back to the viewBox when width and height are missing or percentages', () => {
    expect(size('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"/>')).toEqual({ width: 640, height: 480 });
    expect(size('<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"/>')).toEqual({ width: 24, height: 24 });
  });

  it('uses what a browser uses when there is nothing at all', () => {
    expect(size('<svg xmlns="http://www.w3.org/2000/svg"/>')).toEqual({ width: 300, height: 150 });
  });
});

describe('outputSize', () => {
  it('scales by the chosen factor', () => {
    expect(outputSize({ width: 400, height: 300 }, { scale: 2 })).toEqual({ width: 800, height: 600, reduced: false });
  });

  it('takes a custom width and keeps the proportions', () => {
    expect(outputSize({ width: 400, height: 300 }, { width: 1000 })).toEqual({ width: 1000, height: 750, reduced: false });
  });

  it('takes an exact box as it is, whatever the drawing’s proportions', () => {
    expect(outputSize({ width: 400, height: 300 }, { width: 512, height: 512 })).toEqual({ width: 512, height: 512, reduced: false });
  });

  it('scales down what no browser will draw, and says so', () => {
    const tall = outputSize({ width: 100, height: 5000 }, { scale: 4 });
    expect(tall.height).toBeLessThanOrEqual(MAX_SIDE);
    expect(tall.reduced).toBe(true);
    const big = outputSize({ width: 6000, height: 6000 }, { scale: 1 });
    expect(big.width * big.height).toBeLessThanOrEqual(MAX_PIXELS);
    expect(big.reduced).toBe(true);
  });
});

describe('sizedMarkup', () => {
  it('declares the target size, and adds a viewBox so the drawing scales rather than crops', () => {
    const { doc, root: r } = root('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>');
    const out = sizedMarkup(doc, r, { width: 160, height: 80 });
    expect(out).toContain('width="160"');
    expect(out).toContain('height="80"');
    expect(out).toContain('viewBox="0 0 40 20"');
  });

  it('places the drawing in a box of another shape, whole', () => {
    const { doc, root: r } = root('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"/>');
    expect(sizedMarkup(doc, r, { width: 100, height: 100 }, 'top')).toContain('preserveAspectRatio="xMidYMin meet"');
    expect(sizedMarkup(doc, r, { width: 100, height: 100 })).not.toContain('preserveAspectRatio');
  });

  it('keeps a viewBox the drawing already has', () => {
    const { doc, root: r } = root('<svg xmlns="http://www.w3.org/2000/svg" viewBox="5 5 10 10"/>');
    expect(sizedMarkup(doc, r, { width: 100, height: 100 })).toContain('viewBox="5 5 10 10"');
  });
});

describe('preserveAspectRatio', () => {
  it('names each position the way SVG does, never cropping', () => {
    expect(preserveAspectRatio('center')).toBe('xMidYMid meet');
    expect(preserveAspectRatio('top-left')).toBe('xMinYMin meet');
    expect(preserveAspectRatio('right')).toBe('xMaxYMid meet');
    expect(preserveAspectRatio('bottom')).toBe('xMidYMax meet');
    expect(preserveAspectRatio('bottom-right')).toBe('xMaxYMax meet');
  });
});

describe('copy as code', () => {
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text>Café &amp; "quotes"</text></svg>';

  it('encodes a data URI that is safe inside quotes and decodes back exactly', () => {
    const uri = svgDataUri(SVG);
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(uri).not.toMatch(/["'\s]/);
    expect(decodeURIComponent(uri.slice(uri.indexOf(',') + 1))).toBe(SVG);
  });

  it('base64-encodes UTF-8 correctly, which plain btoa would not', () => {
    const uri = svgBase64DataUri(SVG);
    const bytes = Uint8Array.from(atob(uri.slice(uri.indexOf(',') + 1)), (c) => c.charCodeAt(0));
    expect(new TextDecoder().decode(bytes)).toBe(SVG);
    expect(base64('é')).toBe('w6k=');
  });

  it('makes a drawing with no xmlns one an <img> will draw', () => {
    const uri = svgDataUri('<svg width="4" height="2"><rect width="4" height="2"/></svg>');
    expect(decodeURIComponent(uri.slice(uri.indexOf(',') + 1))).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });

  it('writes a CSS background around the data URI', () => {
    expect(cssBackground(SVG)).toBe(`background-image: url("${svgDataUri(SVG)}");`);
  });
});

describe('reactComponent', () => {
  const component = (svg: string, name = 'logo') => {
    const out = reactComponent(svg, name);
    if (typeof out !== 'string') throw new Error(out.error);
    return out;
  };

  it('names the component after the file', () => {
    expect(componentName('my-logo.svg')).toBe('MyLogo');
    expect(componentName('2024 chart')).toBe('Svg2024Chart');
    // An unnamed drawing has only a generated id, and "X3z33advpomusfw3or" is no component name.
    expect(componentName('')).toBe('SvgImage');
    expect(component('<svg xmlns="http://www.w3.org/2000/svg"/>', 'my-logo')).toContain('export default function MyLogo(props) {');
  });

  it('spells attributes the way React does, and passes props on from the root', () => {
    const out = component('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="icon" viewBox="0 0 10 10"><path stroke-width="2" fill-rule="evenodd" clip-path="url(#c)" d="M0 0"/><use xlink:href="#a" data-id="x" aria-label="mark"/></svg>');
    expect(out).toContain('className="icon"');
    expect(out).toContain('strokeWidth="2"');
    expect(out).toContain('fillRule="evenodd"');
    expect(out).toContain('clipPath="url(#c)"');
    expect(out).toContain('xlinkHref="#a"');
    expect(out).toContain('xmlnsXlink=');
    expect(out).toContain('data-id="x"');
    expect(out).toContain('aria-label="mark"');
    expect(out).toMatch(/<svg [^>]*\{\.\.\.props\}>/);
  });

  it('turns a style string into an object', () => {
    expect(component('<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill: red; stroke-width: 2px"/></svg>'))
      .toContain('style={{ fill: "red", strokeWidth: "2px" }}');
    // The semicolon inside url(…) belongs to the value.
    expect(component('<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill: url(data:image/png;base64,AA); opacity: .5"/></svg>'))
      .toContain('style={{ fill: "url(data:image/png;base64,AA)", opacity: ".5" }}');
  });

  it('drops editor bookkeeping that JSX cannot hold', () => {
    const out = component('<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" inkscape:version="1.3"><!-- a comment --><sodipodi:namedview id="v"/><g inkscape:label="Layer 1"><rect width="1" height="1"/></g></svg>');
    expect(out).not.toContain('inkscape');
    expect(out).not.toContain('sodipodi');
    expect(out).not.toContain('comment');
    expect(out).toContain('<rect width="1" height="1" />');
  });

  it('keeps text and CSS exactly, braces and all', () => {
    const out = component('<svg xmlns="http://www.w3.org/2000/svg"><style>.a { fill: red; }</style><text>{x} &lt; y</text></svg>');
    expect(out).toContain('{".a { fill: red; }"}');
    expect(out).toContain('{"{x} < y"}');
  });

  it('says why when the markup is not an SVG', () => {
    expect(reactComponent('just some text', 'x')).toMatchObject({ error: expect.stringContaining('error in its code') });
  });
});
