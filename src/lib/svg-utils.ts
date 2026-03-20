/**
 * Pure utility functions extracted from App.tsx for testability.
 */

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
