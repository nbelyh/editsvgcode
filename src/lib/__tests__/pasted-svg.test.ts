import { describe, it, expect } from 'vitest';
import { pastedSvgDocument } from '../pasted-svg';

/**
 * People paste SVG from another assistant into the chat to see it. A message that is only a
 * document opens in the editor with no model call; anything else still goes to the model.
 */

const DOC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="5" height="5"/></svg>';

describe('pastedSvgDocument', () => {
  it('takes a message that is only a document', () => {
    expect(pastedSvgDocument(`  ${DOC}\n`)).toBe(DOC);
  });

  it('takes one with a declaration, a doctype and comments around it', () => {
    const text = `<?xml version="1.0"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<!-- Compass Pose -->\n${DOC}\n<!-- end -->`;
    expect(pastedSvgDocument(text)).toBe(text);
  });

  it('takes a document inside a code block', () => {
    expect(pastedSvgDocument(`\`\`\`svg\n${DOC}\n\`\`\``)).toBe(DOC);
  });

  it('repairs the namespace other assistants mangle, which leaves nothing drawn', () => {
    const mangled = DOC.replace('http://www.w3.org/2000/svg', 'http://w3.org');
    expect(pastedSvgDocument(mangled)).toBe(DOC);
    expect(pastedSvgDocument(DOC.replace(' xmlns="http://www.w3.org/2000/svg"', ''))).toBe(DOC);
    const xlink = '<svg xmlns="http://w3.org" xmlns:xlink="http://w3.org"><use xlink:href="#a"/></svg>';
    expect(pastedSvgDocument(xlink)).toBe('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#a"/></svg>');
  });

  it('leaves a document with an instruction around it for the model', () => {
    expect(pastedSvgDocument(`make it red ${DOC}`)).toBeNull();
    expect(pastedSvgDocument(`${DOC} make it red`)).toBeNull();
  });

  it('leaves fragments, prose and broken markup for the model', () => {
    expect(pastedSvgDocument('<rect x="1" y="2" width="3" height="4"/>')).toBeNull();
    expect(pastedSvgDocument('draw me a circle')).toBeNull();
    expect(pastedSvgDocument('<svg xmlns="http://www.w3.org/2000/svg"><rect></svg>')).toBeNull();
    expect(pastedSvgDocument('<svgfoo></svgfoo>')).toBeNull();
  });
});
