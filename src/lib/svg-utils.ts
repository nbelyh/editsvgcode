/**
 * Pure utility functions extracted from App.tsx for testability.
 */

import xmlFormat from 'xml-formatter';

/** Extract document ID from the URL pathname (first segment after '/') */
export function getUniqueId(): string {
  return document.location.pathname.split('/')[1] || '';
}

/** Generate a new random unique ID */
export function getNewUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/** Strip BOM from uploaded file text */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

/** Pretty-print XML/SVG with proper indentation */
export function formatXml(xml: string): string {
  if (!xml.trim()) return xml;
  return xmlFormat(xml, {
    indentation: '  ',
    collapseContent: true,
    lineSeparator: '\n',
  });
}

/**
 * Find the start/end offsets and line/column positions of the Nth occurrence of `<tagName` in source.
 * Returns null if the occurrence is not found.
 */
export function findElementRange(svgCode: string, tagName: string, index: number) {
  if (!tagName || index < 0) return null;

  const openRegex = new RegExp(`<${tagName}[\\s>/]`, 'gi');
  let match: RegExpExecArray | null;
  let count = 0;
  let startOffset = -1;
  while ((match = openRegex.exec(svgCode)) !== null) {
    if (count === index) { startOffset = match.index; break; }
    count++;
  }
  if (startOffset < 0) return null;

  // Find the end: self-closing "/>" or closing "</tagName>"
  let endOffset = startOffset;
  const selfClose = svgCode.indexOf('/>', startOffset);
  const closeTag = svgCode.indexOf(`</${tagName}>`, startOffset);
  const openEnd = svgCode.indexOf('>', startOffset);
  if (selfClose >= 0 && selfClose <= openEnd) {
    endOffset = selfClose + 2;
  } else if (closeTag >= 0) {
    endOffset = closeTag + tagName.length + 3; // </tagName>
  } else if (openEnd >= 0) {
    endOffset = openEnd + 1;
  }

  const before = svgCode.substring(0, startOffset);
  const startLine = before.split('\n').length;
  const startCol = startOffset - before.lastIndexOf('\n');
  const upToEnd = svgCode.substring(0, endOffset);
  const endLine = upToEnd.split('\n').length;
  const endCol = endOffset - upToEnd.lastIndexOf('\n');

  return { startLine, startCol, endLine, endCol, startOffset, endOffset };
}

/**
 * Given a cursor offset in SVG source, find the enclosing element's xpath.
 * Uses DOMParser for accurate nesting, then maps back to source positions.
 * Returns xpath, element text, and line range, or null if cursor is outside any element.
 */
export function findElementAtOffset(svgCode: string, offset: number) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'text/xml');
  if (doc.querySelector('parsererror')) return null;

  // Build a list of elements with their source offsets using opening tag regex
  // and match to DOM order via a tree-walk
  const domElements: Element[] = [];
  const walk = (el: Element) => {
    domElements.push(el);
    for (let i = 0; i < el.children.length; i++) walk(el.children[i]);
  };
  if (doc.documentElement) walk(doc.documentElement);

  // Find source ranges for each DOM element in document order
  const openRegex = /<([a-zA-Z][\w.:-]*)/g;
  const sourceElements: { el: Element; tagName: string; start: number; end: number }[] = [];
  let domIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = openRegex.exec(svgCode)) !== null) {
    // Skip closing tags (matched by accident) - the regex only matches opening
    if (svgCode[m.index - 1] === '/') continue;
    
    const tagStart = m.index;
    const tagName = m[1];
    const domEl = domElements[domIdx];
    if (!domEl || domEl.tagName.toLowerCase() !== tagName.toLowerCase()) continue;
    domIdx++;

    // Find end of this element
    let tagEnd = tagStart;
    const selfClose = svgCode.indexOf('/>', tagStart);
    const openEnd = svgCode.indexOf('>', tagStart);
    if (selfClose >= 0 && selfClose <= openEnd) {
      tagEnd = selfClose + 2;
    } else {
      const closeTag = svgCode.indexOf(`</${tagName}>`, tagStart);
      if (closeTag >= 0) {
        tagEnd = closeTag + tagName.length + 3;
      } else if (openEnd >= 0) {
        tagEnd = openEnd + 1;
      }
    }
    sourceElements.push({ el: domEl, tagName, start: tagStart, end: tagEnd });
  }

  // Find the tightest enclosing element
  let best: (typeof sourceElements)[number] | null = null;
  for (const se of sourceElements) {
    if (offset >= se.start && offset <= se.end) {
      if (!best || (se.start >= best.start && se.end <= best.end)) {
        best = se;
      }
    }
  }
  if (!best) return null;

  // Compute xpath
  const xpath = computeXPath(best.el);

  const before = svgCode.substring(0, best.start);
  const startLine = before.split('\n').length;
  const upToEnd = svgCode.substring(0, best.end);
  const endLine = upToEnd.split('\n').length;

  return {
    element: svgCode.substring(best.start, best.end),
    xpath,
    startLine,
    endLine,
  };
}

/** Compute a positional xpath for an element, e.g. "/svg[1]/g[1]/path[3]" */
export function computeXPath(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current.nodeType === 1) {
    const tag = current.tagName.toLowerCase();
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.tagName.toLowerCase() === tag) index++;
      sibling = sibling.previousElementSibling;
    }
    parts.unshift(`${tag}[${index}]`);
    current = current.parentElement;
  }
  return '/' + parts.join('/');
}
