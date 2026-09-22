import { validateSvg } from './svg-dom';

/**
 * A whole SVG document pasted into the chat, ready to open in the editor — or null.
 *
 * People paste SVG they got from another assistant into the chat box, expecting to see it. The
 * model did the right thing with it, proposing it as the new document, and people rejected
 * that proposal anyway, having asked for nothing to be changed — and paid a credit for it. A
 * message that is nothing but a document is opened straight away instead, with no model call.
 * Anything else, a document with an instruction around it included, still goes to the model.
 *
 * Those assistants also mangle the namespace, writing xmlns="http://w3.org", which leaves a
 * document the browser will not draw as SVG; that one known damage is repaired. A document that
 * does not parse is left for the model, which can mend it.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

/** What may stand around the <svg> element: an XML declaration, a doctype, comments, space. */
const PROLOGUE = /^(?:\s|<\?xml[^>]*\?>|<!DOCTYPE[^>[]*(?:\[[^\]]*\])?\s*>|<!--[\s\S]*?-->)*/i;
const EPILOGUE = /(?:\s|<!--[\s\S]*?-->)*$/;

export function pastedSvgDocument(text: string): string | null {
  // A chat reply's code block, fence and all.
  const fenced = /^\s*```[\w-]*\s*\n([\s\S]*?)\n?```\s*$/.exec(text);
  let svg = (fenced ? fenced[1] : text).trim();

  const lead = PROLOGUE.exec(svg)![0].length;
  if (!/^<svg[\s>]/i.test(svg.slice(lead))) return null;
  const close = svg.toLowerCase().lastIndexOf('</svg>');
  if (close < 0 || EPILOGUE.exec(svg.slice(close + 6))![0].length !== svg.length - close - 6) return null;

  const rootTag = /^<svg\b(?:[^>"']|"[^"]*"|'[^']*')*>/i.exec(svg.slice(lead));
  if (!rootTag) return null;
  let tag = rootTag[0]
    .replace(/(\sxmlns\s*=\s*)(["'])(?:https?:\/\/)?(?:www\.)?w3\.org\/?\2/i, `$1"${SVG_NS}"`)
    .replace(/(\sxmlns:xlink\s*=\s*)(["'])(?:https?:\/\/)?(?:www\.)?w3\.org\/?\2/i, `$1"${XLINK_NS}"`);
  if (!/\sxmlns\s*=/.test(tag)) tag = tag.replace(/^<svg\b/i, `<svg xmlns="${SVG_NS}"`);
  svg = svg.slice(0, lead) + tag + svg.slice(lead + rootTag[0].length);

  return validateSvg(svg).doc ? svg : null;
}
