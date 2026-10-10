import { describe, it, expect } from 'vitest';
import { pictureFileFrom, isSvgFile, traceSize, isPictureTool, isPictureActionTool, TRACE_IMAGE_TOOL, REDRAW_IMAGE_TOOL } from '../pasted-image';

/**
 * A picture pasted, dropped or picked is attached to the chat message. These pick the picture
 * out of the clipboard or the drop, size it, and tell the picture card's work from the chat
 * model's.
 */

function transfer({ text = '', files = [] as File[], items = [] as File[] } = {}): DataTransfer {
  return {
    getData: (type: string) => (type === 'text/plain' ? text : ''),
    files,
    items: items.map(f => ({ kind: 'file', type: f.type, getAsFile: () => f })),
  } as unknown as DataTransfer;
}

const png = new File([new Uint8Array([1])], 'shot.png', { type: 'image/png' });
const jpeg = new File([new Uint8Array([1])], 'photo.jpg', { type: 'image/jpeg' });
const svg = new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' });
const pdf = new File([new Uint8Array([1])], 'doc.pdf', { type: 'application/pdf' });

describe('pictureFileFrom', () => {
  it('takes a pasted screenshot', () => {
    expect(pictureFileFrom(transfer({ files: [png] }), 'paste')).toBe(png);
  });

  it('finds a picture that only the items list carries', () => {
    expect(pictureFileFrom(transfer({ items: [jpeg] }), 'paste')).toBe(jpeg);
  });

  it('leaves a paste with text to paste as text, as Word and Excel add a picture of it', () => {
    expect(pictureFileFrom(transfer({ text: 'Q3 totals', files: [png] }), 'paste')).toBeNull();
  });

  it('takes a dropped picture whatever text comes with it', () => {
    expect(pictureFileFrom(transfer({ text: 'https://example.com/a.png', files: [png] }), 'drop')).toBe(png);
  });

  it('takes an SVG file, to be opened, and nothing that is not a picture', () => {
    expect(pictureFileFrom(transfer({ files: [pdf, svg] }), 'drop')).toBe(svg);
    expect(pictureFileFrom(transfer({ files: [pdf] }), 'drop')).toBeNull();
  });

  it('has nothing to take from a plain text paste or no data', () => {
    expect(pictureFileFrom(transfer({ text: 'make it blue' }), 'paste')).toBeNull();
    expect(pictureFileFrom(null, 'paste')).toBeNull();
  });
});

describe('isSvgFile', () => {
  it('knows an SVG file by its type or, when the system gives none, its name', () => {
    expect(isSvgFile(svg)).toBe(true);
    expect(isSvgFile(new File(['<svg/>'], 'Logo.SVG', { type: '' }))).toBe(true);
    expect(isSvgFile(png)).toBe(false);
  });
});

describe('traceSize', () => {
  it('keeps a picture already the size the vectorizer is tuned for', () => {
    expect(traceSize(1024, 1024)).toEqual({ width: 1024, height: 1024 });
    expect(traceSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('brings a large photo down to 1024 on its longest side', () => {
    expect(traceSize(4000, 3000)).toEqual({ width: 1024, height: 768 });
    expect(traceSize(1080, 2400)).toEqual({ width: 461, height: 1024 });
  });

  it('brings a small icon up to 512, so the speckle filter does not eat its detail', () => {
    expect(traceSize(64, 64)).toEqual({ width: 512, height: 512 });
    expect(traceSize(200, 50)).toEqual({ width: 512, height: 128 });
  });

  it('never makes a side zero', () => {
    expect(traceSize(5000, 1).height).toBe(1);
  });
});

describe('isPictureTool', () => {
  it('covers generated, modified, traced and redrawn pictures, and nothing else', () => {
    expect(['generate_image', 'modify_image', TRACE_IMAGE_TOOL, REDRAW_IMAGE_TOOL].every(isPictureTool)).toBe(true);
    expect(isPictureTool('replace_svg')).toBe(false);
  });
});

describe('isPictureActionTool', () => {
  it('tells the picture card buttons from the image tools the chat model calls', () => {
    expect(isPictureActionTool(TRACE_IMAGE_TOOL)).toBe(true);
    expect(isPictureActionTool(REDRAW_IMAGE_TOOL)).toBe(true);
    expect(isPictureActionTool('modify_image')).toBe(false);
  });
});
