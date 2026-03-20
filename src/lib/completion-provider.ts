import type { Monaco } from '@monaco-editor/react';
import type { editor, Position } from 'monaco-editor';
import { SvgSchema } from '../svg-schema';

const schema = SvgSchema as Record<string, any>;

export function getAreaInfo(text: string) {
  const items = ['"', "'", '<!--', '<![CDATA['];
  let isCompletionAvailable = true;
  text = text.replace(
    /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g,
    '',
  );
  for (let i = 0; i < items.length; i++) {
    const itemIdx = text.indexOf(items[i]);
    if (itemIdx > -1) {
      text = text.substring(0, itemIdx);
      isCompletionAvailable = false;
    }
  }
  text = text.replace(/<\/*[a-zA-Z-]+$/, '');
  return { isCompletionAvailable, clearedText: text };
}

export function getLastOpenedTag(text: string) {
  const tags = text.match(/<\/*(?=\S*)([a-zA-Z-]+)/g);
  if (!tags) return undefined;
  const closingTags: string[] = [];
  for (let i = tags.length - 1; i >= 0; i--) {
    if (tags[i].indexOf('</') === 0) {
      closingTags.push(tags[i].substring('</'.length));
    } else {
      const tagPosition = text.lastIndexOf(tags[i]);
      const tag = tags[i].substring('<'.length);
      const closingBracketIdx = text.indexOf('/>', tagPosition);
      if (closingBracketIdx === -1) {
        if (!closingTags.length || closingTags[closingTags.length - 1] !== tag) {
          text = text.substring(tagPosition);
          return { tagName: tag, isAttributeSearch: text.indexOf('<') > text.indexOf('>') };
        }
        closingTags.splice(closingTags.length - 1, 1);
      }
      text = text.substring(0, tagPosition);
    }
  }
}

export function isItemAvailable(itemName: string, maxOccurs: string | undefined, items: string[]) {
  maxOccurs = maxOccurs || '1';
  if (maxOccurs === 'unbounded') return true;
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i] === itemName) count++;
  }
  return count === 0 || parseInt(maxOccurs) > count;
}

function getAvailableAttributes(monaco: Monaco, lastOpenedTag: { tagName: string }, usedChildTags: string[]) {
  const info = schema[lastOpenedTag.tagName];
  if (!info?.attributes) return [];
  const availableItems: any[] = [];
  for (const attribute of info.attributes) {
    if (isItemAvailable(attribute.name, attribute.maxOccurs, usedChildTags)) {
      const deprecated = attribute.deprecated === true;
      const label = deprecated ? `${attribute.name}` : attribute.name;
      availableItems.push({
        label,
        insertText: `${attribute.name}="\${1}"`,
        kind: monaco.languages.CompletionItemKind.Property,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: attribute.detail || (deprecated ? '(deprecated)' : undefined),
        documentation: { value: attribute.description || '', isTrusted: true },
        tags: deprecated ? [monaco.languages.CompletionItemTag.Deprecated] : undefined,
        sortText: deprecated ? `zzz_${attribute.name}` : attribute.name,
      });
    }
  }
  return availableItems;
}

// Elements that are typically self-closing (no children in practice)
const VOID_ELEMENTS = new Set([
  'animate', 'animateMotion', 'animateTransform', 'circle', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'hatchpath', 'image',
  'line', 'mpath', 'path', 'polygon', 'polyline', 'rect', 'set',
  'stop', 'use',
]);

function getAvailableElements(monaco: Monaco, lastOpenedTag: { tagName: string }, _usedItems: string[]) {
  const info = schema[lastOpenedTag.tagName];
  if (!info?.elements) return [];
  const availableItems: any[] = [];
  for (const element of info.elements) {
    const elementInfo = schema[element];
    if (!elementInfo) continue;
    const selfClosing = VOID_ELEMENTS.has(element);
    const deprecated = elementInfo.deprecated === true;
    availableItems.push({
      label: element,
      insertText: selfClosing
        ? `${element} \${1}/`
        : `${element}>\${1}</${element}`,
      kind: monaco.languages.CompletionItemKind.Class,
      detail: elementInfo.detail,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: { value: elementInfo.description || '', isTrusted: true },
      tags: deprecated ? [monaco.languages.CompletionItemTag.Deprecated] : undefined,
      sortText: deprecated ? `zzz_${element}` : element,
    });
  }
  return availableItems;
}

// Detect if cursor is inside an attribute value and return context
export function getAttributeValueContext(textUntilPosition: string) {
  // Match pattern: attrName="partialValue  (cursor is after the opening quote)
  const match = textUntilPosition.match(/([a-zA-Z][\w-:]*)\s*=\s*"([^"]*)$/);
  if (!match) return null;
  return { attrName: match[1], partialValue: match[2] };
}

function getAttributeValueCompletions(
  monaco: Monaco,
  tagName: string,
  attrName: string,
  _partialValue: string,
) {
  const suggestions: any[] = [];

  // Path commands for d attribute
  if (attrName === 'd' && schema.__pathCommands) {
    for (const cmd of schema.__pathCommands) {
      suggestions.push({
        label: cmd.name,
        insertText: cmd.insert,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'path command',
        documentation: { value: cmd.description, isTrusted: true },
        sortText: cmd.name.toLowerCase() + (cmd.name === cmd.name.toUpperCase() ? '0' : '1'),
      });
    }
    return suggestions;
  }

  // Color names for color attributes
  const info = schema[tagName];
  const attrInfo = info?.attributes?.find((a: any) => a.name === attrName);
  if (attrInfo?.colorAttribute && schema.__colorNames) {
    for (const color of schema.__colorNames) {
      suggestions.push({
        label: color,
        insertText: color,
        kind: monaco.languages.CompletionItemKind.Color,
        detail: 'color',
      });
    }
    // Also add functional color hints
    for (const fn of ['rgb(${1:r}, ${2:g}, ${3:b})', 'rgba(${1:r}, ${2:g}, ${3:b}, ${4:a})', 'hsl(${1:h}, ${2:s}%, ${3:l}%)', 'url(#${1:id})']) {
      suggestions.push({
        label: fn.split('(')[0] + '(…)',
        insertText: fn,
        kind: monaco.languages.CompletionItemKind.Function,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'color function',
      });
    }
    return suggestions;
  }

  // Enumerated attribute values
  if (attrInfo?.options) {
    for (const option of attrInfo.options) {
      suggestions.push({
        label: option,
        insertText: option,
        kind: monaco.languages.CompletionItemKind.EnumMember,
        detail: `${attrName} value`,
      });
    }
    return suggestions;
  }

  return suggestions;
}

export function formatXml(xml: string): string {
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let pad = 0;
  xml = xml.replace(reg, '$1\r\n$2$3');
  return xml
    .split('\r\n')
    .map((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/) && pad > 0) {
        pad -= 1;
      } else if (node.match(/^<\w[^>]*[^/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      pad += indent;
      return PADDING.repeat(pad - indent) + node;
    })
    .join('\r\n');
}

export function registerSvgProviders(monaco: Monaco) {
  // XML formatting
  monaco.languages.registerDocumentFormattingEditProvider('xml', {
    provideDocumentFormattingEdits(model: editor.ITextModel) {
      return [{ range: model.getFullModelRange(), text: formatXml(model.getValue()) }];
    },
  });

  // Completion provider
  monaco.languages.registerCompletionItemProvider('xml', {
    triggerCharacters: ['<', ' ', '"'],
    provideCompletionItems(model: editor.ITextModel, position: Position) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Check if we're inside an attribute value (between quotes)
      const attrValueCtx = getAttributeValueContext(textUntilPosition);
      if (attrValueCtx) {
        // Find the tag name for context
        const beforeAttr = textUntilPosition.substring(0, textUntilPosition.lastIndexOf(attrValueCtx.attrName));
        const areaInfo = getAreaInfo(beforeAttr);
        const lastOpenedTag = getLastOpenedTag(areaInfo.clearedText);
        if (lastOpenedTag) {
          const suggestions = getAttributeValueCompletions(
            monaco,
            lastOpenedTag.tagName,
            attrValueCtx.attrName,
            attrValueCtx.partialValue,
          );
          if (suggestions.length > 0) {
            return { suggestions };
          }
        }
        return { suggestions: [] };
      }

      const areaInfo = getAreaInfo(textUntilPosition);
      if (!areaInfo.isCompletionAvailable) return { suggestions: [] };

      const lastOpenedTag = getLastOpenedTag(areaInfo.clearedText);
      const usedItems: string[] = [];
      const isAttributeSearch = lastOpenedTag?.isAttributeSearch;

      if (lastOpenedTag) {
        if (isAttributeSearch) {
          const tagMatch = textUntilPosition.match(
            new RegExp('<' + lastOpenedTag.tagName + '\\s([^>]*)$'),
          );
          if (tagMatch) {
            const attrMatches = tagMatch[1].matchAll(/([a-zA-Z][\w-:]*)\s*=/g);
            for (const m of attrMatches) {
              usedItems.push(m[1]);
            }
          }
        } else {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(textUntilPosition, 'text/xml');
          let lastChild = xmlDoc.lastElementChild;
          while (lastChild) {
            if (lastChild.tagName === lastOpenedTag.tagName) {
              const children = lastChild.children;
              for (let i = 0; i < children.length; i++) {
                usedItems.push(children[i].tagName);
              }
              break;
            }
            lastChild = lastChild.lastElementChild;
          }
        }
      }

      const suggestions = lastOpenedTag
        ? isAttributeSearch
          ? getAvailableAttributes(monaco, lastOpenedTag, usedItems)
          : getAvailableElements(monaco, lastOpenedTag, usedItems)
        : [];

      return { suggestions };
    },
  });

  // Hover provider
  monaco.languages.registerHoverProvider('xml', {
    provideHover(model: editor.ITextModel, position: Position) {
      const wordInfo = model.getWordAtPosition(position);
      if (!wordInfo) return;

      const line = model.getLineContent(position.lineNumber);
      if (line.substr(wordInfo.startColumn - 2, 1) === '<') {
        const info = schema[wordInfo.word];
        if (info) {
          const prefix = info.deprecated ? '~~**`' + wordInfo.word + '`**~~ *(deprecated)*' : `**${wordInfo.word}**`;
          return {
            contents: [{ value: prefix }, { value: info.description }],
            range: new monaco.Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn),
          };
        }
      } else {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        const areaInfo = getAreaInfo(textUntilPosition);
        if (areaInfo.isCompletionAvailable) {
          const lastOpenedTag = getLastOpenedTag(areaInfo.clearedText);
          if (!lastOpenedTag) return;
          const info = schema[lastOpenedTag.tagName];
          if (info?.attributes) {
            for (const attribute of info.attributes) {
              if (attribute.name === wordInfo.word) {
                const prefix = attribute.deprecated
                  ? '~~**`' + wordInfo.word + '`**~~ *(deprecated)*'
                  : `**${wordInfo.word}**`;
                const parts = [{ value: prefix }];
                if (attribute.description) parts.push({ value: attribute.description });
                if (attribute.options) {
                  parts.push({ value: 'Values: `' + attribute.options.join('` | `') + '`' });
                }
                return {
                  contents: parts,
                  range: new monaco.Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn),
                };
              }
            }
          }
        }
      }
    },
  });
}
