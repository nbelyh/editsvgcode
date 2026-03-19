import type { Monaco } from '@monaco-editor/react';
import type { editor, Position, CancellationToken, languages } from 'monaco-editor';
import { SvgSchema } from '../svg-schema';

function getAreaInfo(text: string) {
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

function getLastOpenedTag(text: string) {
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

function isItemAvailable(itemName: string, maxOccurs: string | undefined, items: string[]) {
  maxOccurs = maxOccurs || '1';
  if (maxOccurs === 'unbounded') return true;
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i] === itemName) count++;
  }
  return count === 0 || parseInt(maxOccurs) > count;
}

function getAvailableAttributes(monaco: Monaco, lastOpenedTag: { tagName: string }, usedChildTags: string[]) {
  const info = (SvgSchema as Record<string, any>)[lastOpenedTag.tagName];
  if (!info?.attributes) return [];
  const availableItems: any[] = [];
  for (let i = 0; i < info.attributes.length; i++) {
    const attribute = info.attributes[i];
    if (isItemAvailable(attribute.name, attribute.maxOccurs, usedChildTags)) {
      availableItems.push({
        label: attribute.name,
        insertText: `${attribute.name}="\${1}"`,
        kind: monaco.languages.CompletionItemKind.Property,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: attribute.detail,
        documentation: { value: attribute.description || '', isTrusted: true },
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
  const info = (SvgSchema as Record<string, any>)[lastOpenedTag.tagName];
  if (!info?.elements) return [];
  const availableItems: any[] = [];
  for (let i = 0; i < info.elements.length; i++) {
    const element = info.elements[i];
    const elementInfo = (SvgSchema as Record<string, any>)[element];
    if (!elementInfo) continue;
    const selfClosing = VOID_ELEMENTS.has(element);
    availableItems.push({
      label: element,
      insertText: selfClosing
        ? `${element} \${1}/`
        : `${element}>\${1}</${element}`,
      kind: monaco.languages.CompletionItemKind.Class,
      detail: elementInfo.detail,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: { value: elementInfo.description || '', isTrusted: true },
    });
  }
  return availableItems;
}

function formatXml(xml: string): string {
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
    triggerCharacters: ['<', ' '],
    provideCompletionItems(model: editor.ITextModel, position: Position) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const areaInfo = getAreaInfo(textUntilPosition);
      if (!areaInfo.isCompletionAvailable) return { suggestions: [] };

      const lastOpenedTag = getLastOpenedTag(areaInfo.clearedText);
      const usedItems: string[] = [];
      const isAttributeSearch = lastOpenedTag?.isAttributeSearch;

      if (lastOpenedTag) {
        if (isAttributeSearch) {
          // For attributes: extract already-used attribute names from the current
          // (possibly incomplete) tag text, instead of DOMParser which finds the
          // wrong element when there are multiple same-name tags.
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
          // For child elements: use DOMParser to find existing children
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
        const info = (SvgSchema as Record<string, any>)[wordInfo.word];
        if (info) {
          return {
            contents: [{ value: `**${wordInfo.word}**` }, { value: info.description }],
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
          const info = (SvgSchema as Record<string, any>)[lastOpenedTag.tagName];
          if (info?.attributes) {
            for (let i = 0; i < info.attributes.length; i++) {
              const attribute = info.attributes[i];
              if (attribute.name === wordInfo.word) {
                return {
                  contents: [{ value: `**${wordInfo.word}**` }, { value: attribute.description }],
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
