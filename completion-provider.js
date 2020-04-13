
function getAreaInfo(text) {
  // opening for strings, comments and CDATA
  var items = ['"', '\'', '<!--', '<![CDATA['];
  var isCompletionAvailable = true;
  // remove all comments, strings and CDATA
  text = text.replace(/"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g, '');
  for (var i = 0; i < items.length; i++) {
    var itemIdx = text.indexOf(items[i]);
    if (itemIdx > -1) {
      // we are inside one of unavailable areas, so we remove that area
      // from our clear text
      text = text.substring(0, itemIdx);
      // and the completion is not available
      isCompletionAvailable = false;
    }
  }
  return {
    isCompletionAvailable: isCompletionAvailable,
    clearedText: text
  };
}

function getLastOpenedTag(text) {
  // get all tags inside of the content
  var tags = text.match(/<\/*(?=\S*)([a-zA-Z-]+)/g);
  if (!tags) {
      return undefined;
  }
  // we need to know which tags are closed
  var closingTags = [];
  for (var i = tags.length - 1; i >= 0; i--) {
      if (tags[i].indexOf('</') === 0) {
          closingTags.push(tags[i].substring('</'.length));
      }
      else {
          // get the last position of the tag
          var tagPosition = text.lastIndexOf(tags[i]);
          var tag = tags[i].substring('<'.length);
          var closingBracketIdx = text.indexOf('/>', tagPosition);
          // if the tag wasn't closed
          if (closingBracketIdx === -1) {
              // if there are no closing tags or the current tag wasn't closed
              if (!closingTags.length || closingTags[closingTags.length - 1] !== tag) {
                  // we found our tag, but let's get the information if we are looking for
                  // a child element or an attribute
                  text = text.substring(tagPosition);
                  return {
                      tagName: tag,
                      isAttributeSearch: text.indexOf('<') > text.indexOf('>')
                  };
              }
              // remove the last closed tag
              closingTags.splice(closingTags.length - 1, 1);
          }
          // remove the last checked tag and continue processing the rest of the content
          text = text.substring(0, tagPosition);
      }
  }
}

function getElementAttributes(element) {
  var attrs = {};
  for (var i = 0; i < element.attributes.length; i++) {
      attrs[element.attributes[i].name] = element.attributes[i].value;
  }
  // return all attributes as an object
  return attrs;
}

function isItemAvailable(itemName, maxOccurs, items) {
  // the default for 'maxOccurs' is 1
  maxOccurs = maxOccurs || '1';
  // the element can appear infinite times, so it is available
  if (maxOccurs && maxOccurs === 'unbounded') {
      return true;
  }
  // count how many times the element appeared
  var count = 0;
  for (var i = 0; i < items.length; i++) {
      if (items[i] === itemName) {
          count++;
      }
  }
  // if it didn't appear yet, or it can appear again, then it
  // is available, otherwise it't not
  return count === 0 || parseInt(maxOccurs) > count;
}

function getItemDocumentation(element) {
  for (var i = 0; i < element.children.length; i++) {
      // annotation contains documentation, so calculate the
      // documentation from it's child elements
      if (element.children[i].tagName === 'annotation') {
          return getItemDocumentation(element.children[0]);
      }
      // if it's the documentation element, just get the value
      else if (element.children[i].tagName === 'documentation') {
          return element.children[i].textContent;
      }
  }
}

function findAttributes(elements) {
  var attrs = [];
  for (var i = 0; i < elements.length; i++) {
      // skip level if it is a 'complexType' tag
      if (elements[i].tagName === 'complexType') {
          var child = findAttributes(elements[i].children);
          if (child) {
              return child;
          }
      }
      // we need only those XSD elements that have a
      // tag 'attribute'
      else if (elements[i].tagName === 'attribute') {
          attrs.push(elements[i]);
      }
  }
  return attrs;
}

function getAvailableAttribute(monaco, elements, usedChildTags) {
  var availableItems = [];
  var children;
  for (var i = 0; i < elements.length; i++) {
      // annotation element only contains documentation,
      // so no need to process it here
      if (elements[i].tagName !== 'annotation') {
          // get all child elements that have 'attribute' tag
          children = findAttributes([elements[i]])
      }
  }
  // if there are no attributes, then there are no
  // suggestions available
  if (!children) {
      return [];
  }
  for (var i = 0; i < children.length; i++) {
      // get all attributes for the element
      var attrs = getElementAttributes(children[i]);
      // accept it in a suggestion list only if it is available
      if (isItemAvailable(attrs.name, attrs.maxOccurs, usedChildTags)) {
          // mark it as a 'property', and get the documentation
          availableItems.push({
              label: attrs.name,
              insertText: new monaco.SnippetString(`${attrs.name}=""`),
              kind: monaco.languages.CompletionItemKind.Property,
              detail: attrs.type,
              documentation: getItemDocumentation(children[i])
          });
      }
  }
  // return the elements we found
  return availableItems;
}

function resolver(prefix) {
  if (prefix === 'xs')
    return 'http://www.w3.org/2001/XMLSchema';
  else
    return null;
}

function getAvailableElements(monaco, lastOpenedTag, usedItems) {
  var availableItems = [];

  var children = SvgSchema.evaluate(`//xs:complexType[@name='${lastOpenedTag.tagName}Type']//xs:choice//xs:element`, 
    SvgSchema, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  // if there are no such elements, then there are no suggestions
  if (!children.snapshotLength) {
      return [];
  }
  for (var i = 0; i < children.snapshotLength; i++) {
    var child = children.snapshotItem(i);
    var ref = child.getAttribute('ref')
    availableItems.push({
        label: ref,
        insertText: `${ref}>$\{1\}</${ref}`,
        kind: monaco.languages.CompletionItemKind.Property,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: getItemDocumentation(child)
    });
  }

  // return the suggestions we found
  return availableItems;
}

function getXmlCompletionProvider(monaco) {

  return {
    triggerCharacters: ['<'],
    provideCompletionItems: function (model, position) {
      // get editor content before the pointer
      let textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column })
      // get content info - are we inside of the area where we don't want suggestions,
      // what is the content without those areas
      let info = getAreaInfo(textUntilPosition); // isCompletionAvailable, clearedText
      // if we don't want any suggestions, return empty array
      if (!info.isCompletionAvailable) {
        return [];
      }
      // if we want suggestions, inside of which tag are we?
      var lastOpenedTag = getLastOpenedTag(info.clearedText);
      // parse the content (not cleared text) into an xml document
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(textUntilPosition, 'text/xml');
      // get opened tags to see what tag we should look for in the XSD schema
      var openedTags = [];
      // get the elements/attributes that are already mentioned in the element we're in
      var usedItems = [];
      var isAttributeSearch = lastOpenedTag && lastOpenedTag.isAttributeSearch;

      // no need to calculate the position in the XSD schema if we are in the root element
      if (lastOpenedTag) {
        // parse the content (not cleared text) into an xml document
        var lastChild = xmlDoc.lastElementChild;
        while (lastChild) {
          openedTags.push(lastChild.tagName);
          // if we found our last opened tag
          if (lastChild.tagName === lastOpenedTag.tagName) {
            // if we are looking for attributes, then used items should
            // be the attributes we already used
            if (lastOpenedTag.isAttributeSearch) {
              var attrs = lastChild.attributes;
              for (var i = 0; i< attrs.length; i++) {
                usedItems.push(attrs[i].nodeName);
              }
            }
            else {
              // if we are looking for child elements, then used items
              // should be the elements that were already used
              var children = lastChild.children;
              for (var i = 0; i < children.length; i++) {
                usedItems.push(children[i].tagName);
              }
            }
            break;
          }
          // we haven't found the last opened tag yet, so we move to
          // the next element
          lastChild = lastChild.lastElementChild;
        }
      }

      const suggestions = lastOpenedTag
        ? isAttributeSearch
          ? [] // getAvailableAttribute(monaco, currentItem.children, usedItems)
          : getAvailableElements(monaco, lastOpenedTag, usedItems)
        : [];
      
      console.log(suggestions);

      return {
        suggestions: suggestions };
    }
  };
}
