export var SvgSchema = {
  "svg": {
    "name": "svg",
    "detail": "svg element",
    "description": "The `svg` element is a container that defines a new coordinate system and [viewport](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox). It is used as the outermost element of SVG documents, but it can also be used to embed an SVG fragment inside an SVG or HTML document.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** The `xmlns` attribute is only required on the outermost `svg` element of *SVG documents*. It is unnecessary for inner `svg` elements or inside HTML documents.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onunload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onabort",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onerror",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onresize",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onscroll",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onzoom",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "The SVG viewport coordinates for the current SVG fragment. *Value type*: **[<list-of-numbers>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "How the `svg` fragment must be deformed if it is displayed with a different aspect ratio. *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "zoomAndPan",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": "The displayed x coordinate of the svg container. No effect on outermost `svg` elements. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The displayed y coordinate of the svg container. No effect on outermost `svg` elements. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The displayed width of the rectangular viewport. (Not the width of its coordinate system.) *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The displayed height of the rectangular viewport. (Not the height of its coordinate system.) *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "contentScriptType",
        "description": "The default scripting language used by the SVG fragment. *Value type*: **`<string>`** ; *Default value*: `application/ecmascript`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "contentStyleType",
        "description": "The default style sheet language used by the SVG fragment. *Value type*: **`<string>`** ; *Default value*: `text/css`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "version",
        "description": "Which version of SVG is used for the inner content of the element. *Value type*: **[`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)** ; *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "g": {
    "name": "g",
    "detail": "svg element",
    "description": "The **`<g>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element is a container used to group other SVG elements.\r\n\r\nTransformations applied to the `<g>` element are performed on its child elements, and its attributes are inherited by its children. It can also group multiple elements to be referenced later with the [`<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "defs": {
    "name": "defs",
    "detail": "svg element",
    "description": "The **`<defs>`** element is used to store graphical objects that will be used at a later time. Objects created inside a `<defs>` element are not rendered directly. To display them you have to reference them (with a [`<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) element for example).\r\n\r\nGraphical objects can be referenced from anywhere, however, defining these objects inside of a `<defs>` element promotes understandability of the SVG content and is beneficial to the overall accessibility of the document. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "desc": {
    "name": "desc",
    "detail": "svg element",
    "description": "The **`<desc>`** element provides an accessible, long-text description of any SVG [container element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#container_elements) or [graphics element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#graphics_elements).\r\n\r\nText in a `<desc>` element is not rendered as part of the graphic. If the element can be described by visible text, it is possible to reference that text with the [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) attribute. If `aria-describedby` is used, it will take precedence over `<desc>`.\r\n\r\nThe hidden text of a `<desc>` element can also be concatenated with the visible text of other elements using multiple IDs in an `aria-describedby` value. In that case, the `<desc>` element must provide an ID for reference. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "content",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "title": {
    "name": "title",
    "detail": "svg element",
    "description": "The **`<title>`** element provides an accessible, short-text description of any SVG [container element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#container_elements) or [graphics element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#graphics_elements).\r\n\r\nText in a `<title>` element is not rendered as part of the graphic, but browsers usually display it as a tooltip. If an element can be described by visible text, it is recommended to reference that text with an [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) attribute rather than using the `<title>` element.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** For backward compatibility with SVG 1.1, `<title>` elements should be the first child element of their parent.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "content",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "symbol": {
    "name": "symbol",
    "detail": "svg element",
    "description": "The **`<symbol>`** element is used to define graphical template objects which can be instantiated by a [`<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) element.\r\n\r\nThe use of `<symbol>` elements for graphics that are used multiple times in the same document adds structure and semantics. Documents that are rich in structure may be rendered graphically, as speech, or as Braille, and thus promote accessibility. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "This attribute defines the bound of the SVG viewport for the current symbol. *Value type*: **[<list-of-numbers>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "This attribute defines how the svg fragment must be deformed if it is embedded in a container with a different aspect ratio. *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "use": {
    "name": "use",
    "detail": "svg element",
    "description": "The **`<use>`** element takes nodes from within the SVG document, and duplicates them somewhere else. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": "The x coordinate of the use element. *Value type*: [**<coordinate>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the use element. *Value type*: [**<coordinate>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The width of the use element. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The height of the use element. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "image": {
    "name": "image",
    "detail": "svg element",
    "description": "The **`<image>`** SVG element includes images inside SVG documents. It can display [raster image](https://developer.mozilla.org/en-US/docs/Glossary/Raster_image) files or other SVG files.\r\n\r\nThe only image formats SVG software must support are [JPEG](https://developer.mozilla.org/en-US/docs/Glossary/jpeg), [PNG](https://developer.mozilla.org/en-US/docs/Glossary/PNG), and other SVG files. Animated [GIF](https://developer.mozilla.org/en-US/docs/Glossary/gif) behavior is undefined.\r\n\r\nSVG files displayed with `<image>` are [treated as an image](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_as_an_Image): external resources aren't loaded, [`:visited`](https://developer.mozilla.org/en-US/docs/Web/CSS/:visited) styles [aren't applied](https://developer.mozilla.org/en-US/docs/Web/CSS/Privacy_and_the_:visited_selector), and they cannot be interactive. To include dynamic SVG elements, try [`<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) with an external URL. To include SVG files and run scripts inside them, try [`<object>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object) inside of [`<foreignObject>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject).\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** The HTML spec defines `<image>` as a synonym for [`<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img) while parsing HTML. This specific element and its behavior only apply inside SVG documents or inline SVGs.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip",
        "description": "It defines what portion of an element is visible. *Value*: **`auto`**|[`<shape>`](https://developer.mozilla.org/en-US/docs/Web/CSS/shape)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit"
        ]
      },
      {
        "name": "overflow",
        "description": "Specifies whether the content of a block-level element is clipped when it overflows the element's box. *Value*: **`visible`**|`hidden|scroll`|`auto`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "height",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "switch": {
    "name": "switch",
    "detail": "svg element",
    "description": "The **`<switch>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element evaluates any [`requiredFeatures`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/requiredFeatures), `[requiredExtensions](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/requiredExtensions \"This is a link to an unwritten page\")` and [`systemLanguage`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/systemLanguage) attributes on its direct child elements in order, and then renders the first child where these attributes evaluate to true.\r\n\r\nOther direct children will be bypassed and therefore not rendered. If a child element is a container element, like [`<g>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g), then its subtree is also processed/rendered or bypassed/not rendered.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** The `display` and `visibility` properties have no effect on `<switch>` element processing. In particular, setting `display:none` on a child has no effect on the true/false testing for `<switch>` processing.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/switch)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "switch",
      "a",
      "foreignObject",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "style": {
    "name": "style",
    "detail": "svg element",
    "description": "The SVG **`<style>`** element allows style sheets to be embedded directly within SVG content.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** SVG's `style` element has the same attributes as the corresponding element in HTML (see HTML's [`<style>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style) element).\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "type",
        "description": "This attribute defines type of the style sheet language to use as a media type string. *Value type*: [**`<string>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#string); *Default value*: `text/css`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "media",
        "description": "This attribute defines to which [`media`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media) the style applies. *Value type*: [**`<string>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#string); *Default value*: `all`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "title",
        "description": "This attribute the title of the style sheet which can be used to switch between [alternate style sheets](https://developer.mozilla.org/en-US/docs/Web/CSS/Alternative_style_sheets). *Value type*: [**`<string>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#string); *Default value*: *none*; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "path": {
    "name": "path",
    "detail": "svg element",
    "description": "The **`<path>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element is the generic element to define a shape. All the basic shapes can be created with a path element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "marker-start",
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "d",
        "description": "This attribute defines the shape of the path. *Value type*: **`<string>`** ; *Default value*: `''`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "pathLength",
        "description": "This attribute lets authors specify the total length for the path, in user units. *Value type*: [**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "rect": {
    "name": "rect",
    "detail": "svg element",
    "description": "The **`<rect>`** element is a [basic SVG shape](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes) that draws rectangles, defined by their position, width, and height. The rectangles may have their corners rounded. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": "The x coordinate of the rect. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the rect. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The width of the rect. *Value type*: `auto`|[**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The height of the rect. *Value type*: `auto`|[**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "rx",
        "description": "The horizontal corner radius of the rect. Defaults to `ry` if it is specified. *Value type*: `auto`|[**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "ry",
        "description": "The vertical corner radius of the rect. Defaults to `rx` if it is specified. *Value type*: `auto`|[**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "circle": {
    "name": "circle",
    "detail": "svg element",
    "description": "The **`<circle>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element is an [SVG basic shape](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes), used to draw circles based on a center point and a radius. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "cx",
        "description": "The x-axis coordinate of the center of the circle. *Value type*: **[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)**|**[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "cy",
        "description": "The y-axis coordinate of the center of the circle. *Value type*: **[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)**|**[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "r",
        "description": "The radius of the circle. A value lower or equal to zero disables rendering of the circle. *Value type*: **[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)**|**[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "ellipse": {
    "name": "ellipse",
    "detail": "svg element",
    "description": "The **`<ellipse>`** element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** Ellipses are unable to specify the exact orientation of the ellipse (if, for example, you wanted to draw an ellipse tilted at a 45 degree angle), but it can be rotated by using the [`transform`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform) attribute.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "cx",
        "description": "The x position of the ellipse. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "cy",
        "description": "The y position of the ellipse. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "rx",
        "description": "The radius of the ellipse on the x axis. *Value type*: `auto`|[**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "ry",
        "description": "The radius of the ellipse on the y axis. *Value type*: `auto`|[**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "line": {
    "name": "line",
    "detail": "svg element",
    "description": "The **`<line>`** element is an SVG basic shape used to create a line connecting two points. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "marker-start",
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x1",
        "description": "Defines the x-axis coordinate of the line starting point. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y1",
        "description": "Defines the y-axis coordinate of the line starting point. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "x2",
        "description": "Defines the x-axis coordinate of the line ending point. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y2",
        "description": "Defines the y-axis coordinate of the line ending point. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "polyline": {
    "name": "polyline",
    "detail": "svg element",
    "description": "The **`<polyline>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element is an SVG basic shape that creates straight lines connecting several points. Typically a `polyline` is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the [`<polygon>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "marker-start",
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "points",
        "description": "This attribute defines the list of points (pairs of x,y absolute coordinates) required to draw the polyline *Value type*: [**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)+ ; *Default value*: `\"\"`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "polygon": {
    "name": "polygon",
    "detail": "svg element",
    "description": "The **`<polygon>`** element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point.\r\n\r\nFor open shapes, see the [`<polyline>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "marker-start",
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shape. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "points",
        "description": "This attribute defines the list of points (pairs of `x,y` absolute coordinates) required to draw the polygon. *Value type*: [**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)+ ; *Default value*: `\"\"`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "text": {
    "name": "text",
    "detail": "svg element",
    "description": "The SVG **`<text>`** element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to `<text>`, like any other SVG graphics element.\r\n\r\nIf text is included in SVG not inside of a `<text>` element, it is not rendered. This is different than being hidden by default, as setting the [`display`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/display) property won't show the text. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "tspan",
      "tref",
      "textPath",
      "altGlyph",
      "a",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "normal",
          "wider",
          "narrower",
          "ultra-condensed",
          "extra-condensed",
          "semi-condensed",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded",
          "inherit"
        ]
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "alignment-baseline",
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent. *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. *Value*: **`auto`**|`baseline`|`super`|`sub`|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text. *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box's text and inline-level contents. *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal. *Value*: [`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical. *Value*: **`auto`**|[`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters. *Value*: **`normal`**|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "text-anchor",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "text-decoration",
        "description": null,
        "detail": null,
        "options": [
          "none",
          "underline",
          "overline",
          "line-through"
        ]
      },
      {
        "name": "unicode-bidi",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "word-spacing",
        "description": null,
        "detail": null,
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "writing-mode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": "The x coordinate of the starting point of the text baseline. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the starting point of the text baseline. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "textLength",
        "description": "A width that the text should be scaled to fit. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "lengthAdjust",
        "description": "How the text is stretched or compressed to fit the width defined by the `textLength` attribute. *Value type*: `spacing`|`spacingAndGlyphs`; *Default value*: `spacing`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "tspan": {
    "name": "tspan",
    "detail": "svg element",
    "description": "The SVG **`<tspan>`** element defines a subtext within a [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) element or another `<tspan>` element. It allows for adjustment of the style and/or position of that subtext as needed. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "tspan",
      "tref",
      "altGlyph",
      "a",
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "normal",
          "wider",
          "narrower",
          "ultra-condensed",
          "extra-condensed",
          "semi-condensed",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded",
          "inherit"
        ]
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "alignment-baseline",
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent. *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. *Value*: **`auto`**|`baseline`|`super`|`sub`|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text. *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box's text and inline-level contents. *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal. *Value*: [`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical. *Value*: **`auto`**|[`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters. *Value*: **`normal`**|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "text-anchor",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "text-decoration",
        "description": null,
        "detail": null,
        "options": [
          "none",
          "underline",
          "overline",
          "line-through"
        ]
      },
      {
        "name": "unicode-bidi",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "word-spacing",
        "description": null,
        "detail": null,
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "The x coordinate of the starting point of the text baseline. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value: none; Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the starting point of the text baseline. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value: none; Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "dx",
        "description": "Shifts the text position horizontally from a previous text element. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "dy",
        "description": "Shifts the text position vertically from a previous text element. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value: none; Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "rotate",
        "description": "Rotates orientation of each individual glyph. Can rotate glyphs individually. *Value type*: [**<list-of-number>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts) ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "textLength",
        "description": "A width that the text should be scaled to fit. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "lengthAdjust",
        "description": "How the text is stretched or compressed to fit the width defined by the `textLength` attribute. *Value type*: `spacing`|`spacingAndGlyphs`; *Default value*: `spacing`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "tref": {
    "name": "tref",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe textual content for a [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element can be either character data directly embedded within the [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) element or the character data content of a referenced element, where the referencing is specified with a **`<tref>`** element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tref)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "normal",
          "wider",
          "narrower",
          "ultra-condensed",
          "extra-condensed",
          "semi-condensed",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded",
          "inherit"
        ]
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "alignment-baseline",
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent. *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. *Value*: **`auto`**|`baseline`|`super`|`sub`|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text. *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box's text and inline-level contents. *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal. *Value*: [`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical. *Value*: **`auto`**|[`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters. *Value*: **`normal`**|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "text-anchor",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "text-decoration",
        "description": null,
        "detail": null,
        "options": [
          "none",
          "underline",
          "overline",
          "line-through"
        ]
      },
      {
        "name": "unicode-bidi",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "word-spacing",
        "description": null,
        "detail": null,
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dx",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dy",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "rotate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "textLength",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "lengthAdjust",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "textPath": {
    "name": "textPath",
    "detail": "svg element",
    "description": "To render text along the shape of a [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path), enclose the text in a **`<textPath>`** element that has an [`href`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/href) attribute with a reference to the [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "tspan",
      "tref",
      "altGlyph",
      "a",
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "normal",
          "wider",
          "narrower",
          "ultra-condensed",
          "extra-condensed",
          "semi-condensed",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded",
          "inherit"
        ]
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "alignment-baseline",
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent. *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. *Value*: **`auto`**|`baseline`|`super`|`sub`|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text. *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box's text and inline-level contents. *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal. *Value*: [`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical. *Value*: **`auto`**|[`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters. *Value*: **`normal`**|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "text-anchor",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "text-decoration",
        "description": null,
        "detail": null,
        "options": [
          "none",
          "underline",
          "overline",
          "line-through"
        ]
      },
      {
        "name": "unicode-bidi",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "word-spacing",
        "description": null,
        "detail": null,
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "startOffset",
        "description": "How far the beginning of the text should be offset from the beginning of the path. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "textLength",
        "description": "The width of the space into which the text will render. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number) ; *Default value*: *auto*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "lengthAdjust",
        "description": "Where length adjustment should be applied to the text: the space between glyphs, or both the space and the glyphs themselves. *Value type*: `spacing`|`spacingAndGlyphs`; *Default value*: `spacing`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "method",
        "description": "Which method to render individual glyphs along the path. *Value type*: `align`|`stretch` ; *Default value*: `align`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "spacing",
        "description": "How space between glyphs should be handled. *Value type*: `auto`|`exact` ; *Default value*: `exact`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "altGlyph": {
    "name": "altGlyph",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<altGlyph>`** SVG element allows sophisticated selection of the glyphs used to render its child character data. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "color",
        "description": "It provides a potential indirect value (`currentcolor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "white",
          "silver",
          "gray",
          "black",
          "navy",
          "blue",
          "aqua",
          "teal",
          "green",
          "olive"
        ]
      },
      {
        "name": "color-interpolation",
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing. *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations. *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "normal",
          "wider",
          "narrower",
          "ultra-condensed",
          "extra-condensed",
          "semi-condensed",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded",
          "inherit"
        ]
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "alignment-baseline",
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent. *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. *Value*: **`auto`**|`baseline`|`super`|`sub`|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text. *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box's text and inline-level contents. *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal. *Value*: [`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical. *Value*: **`auto`**|[`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters. *Value*: **`normal`**|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "text-anchor",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "text-decoration",
        "description": null,
        "detail": null,
        "options": [
          "none",
          "underline",
          "overline",
          "line-through"
        ]
      },
      {
        "name": "unicode-bidi",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "word-spacing",
        "description": null,
        "detail": null,
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "glyphRef",
        "description": "The glyph identifier, the format of which is dependent on the format defined by the `format` attribute of the given font. *Value type*: **`<string>`** ; *Default value*: *none*; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "format",
        "description": "The format of the given font. *Value type*: **<string**[**>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: *none*; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "This attribute defines the corresponding absolute x-coordinates for rendering the element. *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts) ; *Default value*: Absolute x-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "This attribute defines the corresponding absolute y-coordinates for rendering the element. *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts) ; *Default value*: Absolute y-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "dx",
        "description": "This attribute indicates a shift along the x-axis on the position of the element. *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts) ; *Default value*: Relative x-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "dy",
        "description": "This attribute indicates a shift along the x-axis on the position of the element. *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts) ; *Default value*: Relative y-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "rotate",
        "description": "This attribute defines the supplemental rotation that will be applied to the element. *Value type*: [**<list-of-numbers>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts) ; *Default value*: *none*; *Animatable*: **yes (non-additive)** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "altGlyphDef": {
    "name": "altGlyphDef",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<altGlyphDef>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a substitution representation for glyphs. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyphDef)",
    "elements": [
      "altGlyphItem",
      "glyphRef"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      }
    ]
  },
  "altGlyphItem": {
    "name": "altGlyphItem",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<altGlyphItem>`** element provides a set of candidates for glyph substitution by the [`<altGlyph>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyphItem)",
    "elements": [
      "glyphRef"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      }
    ]
  },
  "glyphRef": {
    "name": "glyphRef",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe `glyphRef` element provides a single possible glyph to the referencing [`<altGlyph>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph) substitution. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/glyphRef)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "normal",
          "wider",
          "narrower",
          "ultra-condensed",
          "extra-condensed",
          "semi-condensed",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded",
          "inherit"
        ]
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "glyphRef",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "format",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dx",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dy",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "marker": {
    "name": "marker",
    "detail": "svg element",
    "description": "The **`<marker>`** element defines the graphic that is to be used for drawing arrowheads or polymarkers on a given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path), [`<line>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line), [`<polyline>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline) or [`<polygon>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon) element.\r\n\r\nMarkers are attached to shapes using the [`marker-start`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-start), [`marker-mid`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-mid), and [`marker-end`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end) properties. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "This attribute defines the bound of the SVG viewport for the current SVG fragment. *Value type*: **[<list-of-numbers>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "This attribute defines how the svg fragment must be deformed if it is embedded in a container with a different aspect ratio. *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "refX",
        "description": "This attribute defines the x coordinate for the reference point of the marker. *Value type*: `left`|`center`|`right`|**[`<coordinate>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "refY",
        "description": "This attribute defines the y coordinate for the reference point of the marker. *Value type*: `top`|`center`|`bottom`|**[`<coordinate>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "markerUnits",
        "description": "This attribute defines the coordinate system for the attributes `markerWidth`, `markerHeight` and the contents of the `<marker>`. *Value type*: `userSpaceOnUse`|`strokeWidth` ; *Default value*: `strokeWidth`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "markerWidth",
        "description": "This attribute defines the width of the marker viewport. *Value type*: **[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)** ; *Default value*: `3`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "markerHeight",
        "description": "This attribute defines the height of the marker viewport. *Value type*: **[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)** ; *Default value*: `3`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "orient",
        "description": "This attribute defines the orientation of the marker relative to the shape it is attached to. *Value type*: `auto`|`auto-start-reverse`|**[`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "color-profile": {
    "name": "color-profile",
    "detail": null,
    "description": null,
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "local",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "name",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "rendering-intent",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "linearGradient": {
    "name": "linearGradient",
    "detail": "svg element",
    "description": "The **`<linearGradient>`** element lets authors define linear gradients to apply to other SVG elements. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "stop",
      "animate",
      "set",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "gradientUnits",
        "description": "This attribute defines the coordinate system for attributes `x1`, `x2`, `y1`, `y2` *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "gradientTransform",
        "description": "This attribute provides additional [transformation](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform) to the gradient coordinate system. *Value type*: **[<transform-list>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#transform-list)** ; *Default value*: *identity transform*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "x1",
        "description": "This attribute defines the x coordinate of the starting point of the vector gradient along which the linear gradient is drawn. *Value type*: [`<length-percentage>`](https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/CSS/number); *Default value*: `0%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y1",
        "description": "This attribute defines the y coordinate of the starting point of the vector gradient along which the linear gradient is drawn. *Value type*: [`<length-percentage>`](https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/CSS/number); *Default value*: `0%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "x2",
        "description": "This attribute defines the x coordinate of the ending point of the vector gradient along which the linear gradient is drawn. *Value type*: [`<length-percentage>`](https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/CSS/number); *Default value*: `100%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y2",
        "description": "This attribute defines the y coordinate of the ending point of the vector gradient along which the linear gradient is drawn. *Value type*: [`<length-percentage>`](https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/CSS/number); *Default value*: `0%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "spreadMethod",
        "description": "This attribute indicates how the gradient behaves if it starts or ends inside the bounds of the shape containing the gradient. *Value type*: `pad`|`reflect`|`repeat` ; *Default value*: `pad`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "radialGradient": {
    "name": "radialGradient",
    "detail": "svg element",
    "description": "The **`<radialGradient>`** element lets authors define radial gradients that can be applied to fill or stroke of graphical elements.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** Don't be confused with CSS [`radial-gradient()`](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient) as CSS gradients can only apply to HTML elements where SVG gradient can only apply to SVG elements.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "stop",
      "animate",
      "set",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "gradientUnits",
        "description": "This attribute defines the coordinate system for attributes `cx`, `cy`, `r`, `fx`, `fy`, `fr` *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "gradientTransform",
        "description": "This attribute provides additional [transformation](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform) to the gradient coordinate system. *Value type*: **[<transform-list>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#transform-list)** ; *Default value*: *identity transform*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "cx",
        "description": "This attribute defines the x coordinate of the end circle of the radial gradient. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: `50%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "cy",
        "description": "This attribute defines the y coordinate of the end circle of the radial gradient. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: `50%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "r",
        "description": "This attribute defines the radius of the end circle of the radial gradient. The gradient will be drawn such that the 100% [`<stop>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop) is mapped to the perimeter of the end circle. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: `50%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "fx",
        "description": "This attribute defines the x coordinate of the start circle of the radial gradient. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: Same as `cx`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "fy",
        "description": "This attribute defines the y coordinate of the start circle of the radial gradient. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: Same as `cy`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "spreadMethod",
        "description": "This attribute indicates how the gradient behaves if it starts or ends inside the bounds of the shape containing the gradient. *Value type*: `pad`|`reflect`|`repeat` ; *Default value*: `pad`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "stop": {
    "name": "stop",
    "detail": "svg element",
    "description": "The SVG **`<stop>`** element defines a color and its position to use on a gradient. This element is always a child of a [`<linearGradient>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient) or [`<radialGradient>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
    "elements": [
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "stop-color",
        "description": "This attribute defines the color of the gradient stop. It can be used as a CSS property. *Value type*: `currentcolor`|[**<color>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color)|[**<icccolor>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#icccolor); *Default value*: `black`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "stop-opacity",
        "description": "This attribute defines the opacity of the gradient stop. It can be used as a CSS property. *Value type*: [**<opacity>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Default value*: `1`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "offset",
        "description": "This attribute defines where the gradient stop is placed along the gradient vector. *Value type*: [**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "pattern": {
    "name": "pattern",
    "detail": "svg element",
    "description": "The **`<pattern>`** element defines a graphics object which can be redrawn at repeated x- and y-coordinate intervals (\"tiled\") to cover an area.\r\n\r\nThe `<pattern>` is referenced by the [`fill`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill) and/or [`stroke`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke) attributes on other [graphics elements](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes) to fill or stroke those elements with the referenced pattern. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "This attribute defines the bound of the SVG viewport for the pattern fragment. *Value type*: **[<list-of-numbers>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "This attribute defines how the SVG fragment must be deformed if it is embedded in a container with a different aspect ratio. *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "patternUnits",
        "description": "This attribute defines the coordinate system for attributes `x`, `y`, `width`, and `height`. *Value type*: `userSpaceOnUse`|`objectBoundingBox`; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "patternTransform",
        "description": "This attribute contains the definition of an optional additional transformation from the pattern coordinate system onto the target coordinate system. *Value type*: **[<transform-list>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#transform-list)**; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "This attribute determines the x coordinate shift of the pattern tile. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "This attribute determines the y coordinate shift of the pattern tile. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "This attribute determines the width of the pattern tile. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "This attribute determines the height of the pattern tile. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "clipPath": {
    "name": "clipPath",
    "detail": "svg element",
    "description": "The **`<clipPath>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a clipping path, to be used by the [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/clip-path) property.\r\n\r\nA clipping path restricts the region to which paint can be applied. Conceptually, parts of the drawing that lie outside of the region bounded by the clipping path are not drawn. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape. *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array. *Value*: [`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "stroke-linecap",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-linejoin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-miterlimit",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-opacity",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stroke-width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "normal",
          "wider",
          "narrower",
          "ultra-condensed",
          "extra-condensed",
          "semi-condensed",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded",
          "inherit"
        ]
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element. *Value*: **`none`**|[`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) should clip its target. *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|[`<keywords>`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "crosshair",
          "default",
          "pointer",
          "move",
          "e-resize",
          "ne-resize",
          "nw-resize",
          "n-resize",
          "se-resize",
          "sw-resize",
          "s-resize",
          "w-resize",
          "text",
          "wait",
          "help",
          "inherit"
        ]
      },
      {
        "name": "display",
        "description": "It allows to control the rendering of graphical or container elements. *Value*: see CSS [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) element that shall be applied to its element. *Value*: [`<FuncIRI>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing. *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points. *Value*: see CSS [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects. *Value*: [<opacity-value>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event. *Value*: `bounding-box`|**`visiblePainted`**|`visibleFill`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element or basic shapes. *Value*: **`auto`**|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "text-rendering",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "visibility",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "alignment-baseline",
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent. *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. *Value*: **`auto`**|`baseline`|`super`|`sub`|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage)|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text. *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box's text and inline-level contents. *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal. *Value*: [`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical. *Value*: **`auto`**|[`<angle>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters. *Value*: **`normal`**|[`<length>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "text-anchor",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "text-decoration",
        "description": null,
        "detail": null,
        "options": [
          "none",
          "underline",
          "overline",
          "line-through"
        ]
      },
      {
        "name": "unicode-bidi",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "word-spacing",
        "description": null,
        "detail": null,
        "options": [
          "auto",
          "exact"
        ]
      },
      {
        "name": "writing-mode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "clipPathUnits",
        "description": "Defines the coordinate system for the contents of the `<clipPath>` element. *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `userSpaceOnUse`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "mask": {
    "name": "mask",
    "detail": "svg element",
    "description": "The **`<mask>`** element defines an alpha mask for compositing the current object into the background. A mask is used/referenced using the [`mask`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/mask) property. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "maskUnits",
        "description": "This attribute defines the coordinate system for attributes [`x`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/x), [`y`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/y), [`width`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/width) and [`height`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/height) on the `<mask>`. *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "This attribute defines the x-axis coordinate of the top-left corner of the masking area. *Value type*: [**<coordinate>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate) ; *Default value*: `-10%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "This attribute defines the y-axis coordinate of the top-left corner of the masking area. *Value type*: [**<coordinate>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate) ; *Default value*: `-10%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "This attribute defines the width of the masking area. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: `120%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "This attribute defines the height of the masking area. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length) ; *Default value*: `120%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "filter": {
    "name": "filter",
    "detail": "svg element",
    "description": "The **`<filter>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the [`filter`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/filter) attribute on SVG elements, or the [`filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) [CSS](https://developer.mozilla.org/en-US/docs/Glossary/CSS) property for SVG/HTML elements. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "feBlend",
      "feFlood",
      "feColorMatrix",
      "feComponentTransfer",
      "feComposite",
      "feConvolveMatrix",
      "feDiffuseLighting",
      "feDisplacementMap",
      "feGaussianBlur",
      "feImage",
      "feMerge",
      "feMorphology",
      "feOffset",
      "feSpecularLighting",
      "feTile",
      "feTurbulence",
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "filterUnits",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "primitiveUnits",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "height",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "filterRes",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feDistantLight": {
    "name": "feDistantLight",
    "detail": "svg element",
    "description": "The **`<feDistantLight>`** filter primitive defines a distant light source that can be used within a lighting filter primitive: [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting) or [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDistantLight)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "azimuth",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "elevation",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "fePointLight": {
    "name": "fePointLight",
    "detail": "svg element",
    "description": "The **`<fePointLight>`** filter primitive defines a light source which allows to create a point light effect. It that can be used within a lighting filter primitive: [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting) or [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/fePointLight)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "z",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feSpotLight": {
    "name": "feSpotLight",
    "detail": "svg element",
    "description": "The **`<feSpotLight>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines a light source that can be used to create a spotlight effect. It is used within a lighting filter primitive: [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting) or [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpotLight)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "z",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "pointsAtX",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "pointsAtY",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "pointsAtZ",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "specularExponent",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "limitingConeAngle",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feBlend": {
    "name": "feBlend",
    "detail": "svg element",
    "description": "The **`<feBlend>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive composes two objects together ruled by a certain blending mode. This is similar to what is known from image editing software when blending two layers. The mode is defined by the [`mode`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/mode) attribute. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feBlend)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "in2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "mode",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feColorMatrix": {
    "name": "feColorMatrix",
    "detail": "svg element",
    "description": "The **`<feColorMatrix>`** SVG filter element changes colors based on a transformation matrix. Every pixel's color value `[R,G,B,A]` is [matrix multiplied](https://en.wikipedia.org/wiki/Matrix_multiplication) by a 5 by 5 color matrix to create new color `[R',G',B',A']`.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** The prime symbol **`'`** is used in mathematics indicate the result of a transformation.\r\n\n</div>\n<div class=\"code-example\">\r\n\r\n| R' |     | r1 r2 r3 r4 r5 |   | R |\n| G' |     | g1 g2 g3 g4 g5 |   | G |\n| B' |  =  | b1 b2 b3 b4 b5 | * | B |\n| A' |     | a1 a2 a3 a4 a5 |   | A |\n| 1  |     | 0  0  0  0  1 |   | 1 |\r\n\r\n</div>\r\n\r\nIn simplified terms, below is how each color channel in the new pixel is calculated. The last row is ignored because its values are constant.\r\n\r\nR' = r1*R + r2*G + r3*B + r4*A + r5\nG' = g1*R + g2*G + g3*B + g4*A + g5\nB' = b1*R + b2*G + b3*B + b4*A + b5\nA' = a1*R + a2*G + a3*B + a4*A + a5\r\n\r\nTake the amount of red in the new pixel, or `R'`:\r\n\r\nIt is the sum of:\r\n\r\n*   `r1` times the old pixel's red `R`,\r\n\r\n*   `r2` times the old pixel's green `G`,\r\n\r\n*   `r3` times of the old pixel's blue `B`,\r\n\r\n*   `r4` times the old pixel's alpha `A`,\r\n\r\n*   plus a shift `r5`.\r\n\r\nThese specified amounts can be any real number, though the final **R'** will be clamped between 0 and 1. The same goes for **G'**, **B'**, and **A'**.\r\n\n<div class=\"code-example\">\r\n\r\nR'      =      r1 * R      +        r2 * G      +       r3 * B      +       r4 * A       +       r5\nNew red = [ r1 * old red ] + [ r2 * old green ] + [ r3 * old Blue ] + [ r4 * old Alpha ] + [ shift of r5 ]\r\n\r\n</div>\r\n\r\nIf, say, we want to make a completely black image redder, we can make the `r5` a positive real number *x*, boosting the redness on every pixel of the new image by *x*.\r\n\r\nAn **identity matrix** looks like this:\r\n\n<div class=\"code-example\">\r\n\r\n     R G B A W\nR' | 1 0 0 0 0 |\nG' | 0 1 0 0 0 |\nB' | 0 0 1 0 0 |\nA' | 0 0 0 1 0 |\r\n\r\n</div>\r\n\r\nIn it, every new value is exactly 1 times its old value, with nothing else added. It is recommended to start manipulating the matrix from here. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "values",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feComponentTransfer": {
    "name": "feComponentTransfer",
    "detail": "svg element",
    "description": "The **`<feComponentTransfer>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.\r\n\r\nThe calculations are performed on non-premultiplied color values. The colors are modified by changing each channel (R, G, B, and A) to the result of what the children [`<feFuncR>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncR), [`<feFuncB>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncB), [`<feFuncG>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncG), and [`<feFuncA>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncA) return. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer)",
    "elements": [
      "feFuncR",
      "feFuncG",
      "feFuncB",
      "feFuncA"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feFuncR": {
    "name": "feFuncR",
    "detail": "svg element",
    "description": "The **`<feFuncR>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the red component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncR)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "type",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "tableValues",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "slope",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "intercept",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "amplitude",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "exponent",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "offset",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type2",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feFuncG": {
    "name": "feFuncG",
    "detail": "svg element",
    "description": "The **`<feFuncG>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the green component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncG)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "type",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "tableValues",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "slope",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "intercept",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "amplitude",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "exponent",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "offset",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type2",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feFuncB": {
    "name": "feFuncB",
    "detail": "svg element",
    "description": "The **`<feFuncB>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the blue component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncB)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "type",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "tableValues",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "slope",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "intercept",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "amplitude",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "exponent",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "offset",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type2",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feFuncA": {
    "name": "feFuncA",
    "detail": "svg element",
    "description": "The **`<feFuncA>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the alpha component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer) element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncA)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "type",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "tableValues",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "slope",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "intercept",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "amplitude",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "exponent",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "offset",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type3",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feComposite": {
    "name": "feComposite",
    "detail": "svg element",
    "description": "The **`<feComposite>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: `over`, `in`, `atop`, `out`, `xor`, `lighter`, or `arithmetic`.\r\n\r\nThe table below shows each of these operations using an image of the MDN logo composited with a red circle:\r\n\n<figure class=\"table-container\"><table class=\"no-markdown\">\n  <tbody>\n    <tr>\n      <th>Operation</th>\n      <th>Description</th>\n    </tr>\n    <tr>\n      <td>\r\n\r\nover ![over operator](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite/operation_over.png) \r\n\n      </td>\n      <td>\n        The source graphic defined by the [`in`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in) attribute\n        (the MDN logo) is placed over the destination graphic defined by the\n        [`in2`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in2) attribute (the circle).\r\n\r\n This is the *default operation*, which will be used if no operation or an unsupported operation is specified. \r\n\n      </td>\n    </tr>\n    <tr>\n      <td>\r\n\r\nin ![in operator](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite/operation_in.png) \r\n\n      </td>\n      <td>\n        The parts of the source graphic defined by the `in` attribute\n        that overlap the destination graphic defined in the\n        `in2` attribute, replace the destination graphic.\n      </td>\n    </tr>\n    <tr>\n      <td>\r\n\r\nout ![out operator](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite/operation_out.png) \r\n\n      </td>\n      <td>\n        The parts of the source graphic defined by the `in` attribute\n        that fall outside the destination graphic defined in the\n        `in2` attribute, are displayed.\n      </td>\n    </tr>\n    <tr>\n      <td>\r\n\r\natop ![atop operator](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite/operation_atop.png) \r\n\n      </td>\n      <td>\n        The parts of the source graphic defined in the\n        `in` attribute, which overlap the destination graphic defined\n        in the `in2` attribute, replace the destination graphic. The\n        parts of the destination graphic that do not overlap with the source\n        graphic stay untouched.\n      </td>\n    </tr>\n    <tr>\n      <td>\r\n\r\nxor ![xor operator](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite/operation_xor.png) \r\n\n      </td>\n      <td>\n        The non-overlapping regions of the source graphic defined in the\n        `in` attribute and the destination graphic defined in the\n        `in2` attribute are combined.\n      </td>\n    </tr>\n    <tr>\n      <td>\r\n\r\nlighter ![lighter operator](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite/operation_lighter.png) \r\n\n      </td>\n      <td>\n        The sum of the source graphic defined in the `in` attribute\n        and the destination graphic defined in the `in2` attribute is\n        displayed.\n      </td>\n    </tr>\n    <tr>\n      <td>\r\n\r\n arithmetic ![arithmetic operator](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite/operation_arithmetic.png) \r\n\n      </td>\n      <td>\r\n\r\n The `arithmetic` operation is useful for combining the output from the [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting) and [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting) filters with texture data. If the `arithmetic` operation is chosen, each result pixel is computed using the following formula: \r\n\n        <div class=\"code-example\">\r\n\r\nresult = k1*i1*i2 + k2*i1 + k3*i2 + k4\r\n</div>\r\n\r\nwhere:\r\n\r\n*   `i1` and `i2` indicate the corresponding pixel\n            channel values of the input image, which map to\n            [`in`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in) and [`in2`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in2) respectively\r\n\r\n*   [`k1`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/k1), [`k2`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/k2),\n            [`k3`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/k3), and [`k4`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/k4) indicate the\n            values of the attributes with the same name.\r\n\r\n      </td>\n    </tr>\n  </tbody>\n</table></figure> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "in2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "operator",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "k1",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "k2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "k3",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "k4",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feConvolveMatrix": {
    "name": "feConvolveMatrix",
    "detail": "svg element",
    "description": "The **`<feConvolveMatrix>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive applies a matrix convolution filter effect. A convolution combines pixels in the input image with neighboring pixels to produce a resulting image. A wide variety of imaging operations can be achieved through convolutions, including blurring, edge detection, sharpening, embossing and beveling.\r\n\r\nA matrix convolution is based on an n-by-m matrix (the convolution kernel) which describes how a given pixel value in the input image is combined with its neighboring pixel values to produce a resulting pixel value. Each result pixel is determined by applying the kernel matrix to the corresponding source pixel and its neighboring pixels. The basic convolution formula which is applied to each color value for a given pixel is:\r\n\r\n COLOR<sub>X,Y</sub> = ( SUM <sub>I=0 to [[orderY](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementOrderAttribute)-1]</sub> { SUM <sub>J=0 to [[orderX](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementOrderAttribute)-1]</sub> { SOURCE <sub>X-[targetX](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementTargetXAttribute)+J, Y-[targetY](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementTargetYAttribute)+I</sub> * [kernelMatrix](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementKernelMatrixAttribute)<sub>[orderX](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementOrderAttribute)-J-1, [orderY](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementOrderAttribute)-I-1</sub> } } ) / [divisor](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementDivisorAttribute) + [bias](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementBiasAttribute) * ALPHA<sub>X,Y</sub> \r\n\r\nwhere \"orderX\" and \"orderY\" represent the X and Y values for the ['order'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementOrderAttribute) attribute, \"targetX\" represents the value of the ['targetX'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementTargetXAttribute) attribute, \"targetY\" represents the value of the ['targetY'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementTargetYAttribute) attribute, \"kernelMatrix\" represents the value of the ['kernelMatrix'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementKernelMatrixAttribute) attribute, \"divisor\" represents the value of the ['divisor'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementDivisorAttribute) attribute, and \"bias\" represents the value of the ['bias'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementBiasAttribute) attribute.\r\n\r\nNote in the above formulas that the values in the kernel matrix are applied such that the kernel matrix is rotated 180 degrees relative to the source and destination images in order to match convolution theory as described in many computer graphics textbooks.\r\n\r\nTo illustrate, suppose you have an input image which is 5 pixels by 5 pixels, whose color values for one of the color channels are as follows:\r\n\n<div class=\"code-example\">\r\n\r\n0    20  40 235 235\n100 120 140 235 235\n200 220 240 235 235\n225 225 255 255 255\n225 225 255 255 255\r\n\r\n</div>\r\n\r\nand you define a 3-by-3 convolution kernel as follows:\r\n\n<div class=\"code-example\">\r\n\r\n1 2 3\n4 5 6\n7 8 9\r\n\r\n</div>\r\n\r\nLet's focus on the color value at the second row and second column of the image (source pixel value is 120). Assuming the simplest case (where the input image's pixel grid aligns perfectly with the kernel's pixel grid) and assuming default values for attributes ['divisor'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementDivisorAttribute), ['targetX'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementTargetXAttribute) and ['targetY'](https://www.w3.org/TR/SVG11/filters.html#feConvolveMatrixElementTargetYAttribute), then resulting color value will be:\r\n\n<div class=\"code-example\">\r\n\r\n(9*0   + 8*20  + 7*40 +\n 6*100 + 5*120 + 4*140 +\n 3*200 + 2*220 + 1*240) / (9+8+7+6+5+4+3+2+1)\r\n\r\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feConvolveMatrix)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "order",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "kernelMatrix",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "divisor",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "bias",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "targetX",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "targetY",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "edgeMode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "kernelUnitLength",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "preserveAlpha",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feDiffuseLighting": {
    "name": "feDiffuseLighting",
    "detail": "svg element",
    "description": "The **`<feDiffuseLighting>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.\r\n\r\nThe light map produced by this filter primitive can be combined with a texture image using the multiply term of the `arithmetic` operator of the [`<feComposite>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite) filter primitive. Multiple light sources can be simulated by adding several of these light maps together before applying it to the texture image. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting)",
    "elements": [
      "feDistantLight",
      "fePointLight",
      "feSpotLight",
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "lighting-color",
        "description": "It defines the color of the light source for filter primitives elements [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting) and [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting). *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "surfaceScale",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "diffuseConstant",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feDisplacementMap": {
    "name": "feDisplacementMap",
    "detail": "svg element",
    "description": "The **`<feDisplacementMap>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive uses the pixel values from the image from [`in2`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in2) to spatially displace the image from [`in`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in).\r\n\r\nThe formula for the transformation looks like this:\r\n\r\n`P'(x,y) ← P(x + scale * (XC(x,y) - 0.5), y + scale * (YC(x,y) - 0.5))`\r\n\r\nwhere `P(x,y)` is the input image, [`in`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in), and `P'(x,y)` is the destination. `XC(x,y)` and `YC(x,y)` are the component values of the channel designated by [`xChannelSelector`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xChannelSelector) and [`yChannelSelector`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/yChannelSelector). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "in2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "scale",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "xChannelSelector",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "yChannelSelector",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feFlood": {
    "name": "feFlood",
    "detail": "svg element",
    "description": "The **`<feFlood>`** SVG filter primitive fills the filter subregion with the color and opacity defined by [`flood-color`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/flood-color) and [`flood-opacity`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/flood-opacity). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood)",
    "elements": [
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "flood-color",
        "description": "It indicates what color to use to flood the current filter primitive subregion defined through the [`<feFlood>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood) or [`<feDropShadow>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow) element. *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "flood-opacity",
        "description": "It indicates the opacity value to use across the current filter primitive subregion defined through the [`<feFlood>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood) or [`<feDropShadow>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow) element. *Value*: [`<number>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|[`<percentage>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      }
    ]
  },
  "feGaussianBlur": {
    "name": "feGaussianBlur",
    "detail": "svg element",
    "description": "The **`<feGaussianBlur>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive blurs the input image by the amount specified in [`stdDeviation`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stdDeviation), which defines the bell-curve. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stdDeviation",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feImage": {
    "name": "feImage",
    "detail": "svg element",
    "description": "The **`<feImage>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized.) [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feImage)",
    "elements": [
      "animate",
      "set",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "height",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "result",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feMerge": {
    "name": "feMerge",
    "detail": "svg element",
    "description": "The **`<feMerge>`** SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the [`result`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/result) attribute and then accessing it in a [`<feMergeNode>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode) child. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge)",
    "elements": [
      "feMergeNode"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "height",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "result",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feMergeNode": {
    "name": "feMergeNode",
    "detail": "svg element",
    "description": "The `feMergeNode` takes the result of another filter to be processed by its parent [`<feMerge>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feMorphology": {
    "name": "feMorphology",
    "detail": "svg element",
    "description": "The **`<feMorphology>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive is used to erode or dilate the input image. Its usefulness lies especially in fattening or thinning effects. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "operator",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "radius",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feOffset": {
    "name": "feOffset",
    "detail": "svg element",
    "description": "The **`<feOffset>`** SVG filter primitive allows to offset the input image. The input image as a whole is offset by the values specified in the [`dx`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dx) and [`dy`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dy) attributes. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feOffset)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dx",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dy",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feSpecularLighting": {
    "name": "feSpecularLighting",
    "detail": "svg element",
    "description": "The **`<feSpecularLighting>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of [the Phong lighting model](https://en.wikipedia.org/wiki/Phong_reflection_model). The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.\r\n\r\nThis filter primitive produces an image which contains the specular reflection part of the lighting calculation. Such a map is intended to be combined with a texture using the `add` term of the arithmetic [`<feComposite>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite) method. Multiple light sources can be simulated by adding several of these light maps before applying it to the texture image. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting)",
    "elements": [
      "feDistantLight",
      "fePointLight",
      "feSpotLight",
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "lighting-color",
        "description": "It defines the color of the light source for filter primitives elements [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting) and [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting). *Value*: [`<color>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "surfaceScale",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "specularConstant",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "specularExponent",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feTile": {
    "name": "feTile",
    "detail": "svg element",
    "description": "The **`<feTile>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. The effect is similar to the one of a [`<pattern>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTile)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "in",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "feTurbulence": {
    "name": "feTurbulence",
    "detail": "svg element",
    "description": "The **`<feTurbulence>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive creates an image using the [Perlin turbulence function](https://en.wikipedia.org/wiki/Perlin_noise). It allows the synthesis of artificial textures like clouds or marble. The resulting image will fill the entire filter primitive subregion. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "width",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "height",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "result",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "baseFrequency",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "numOctaves",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "seed",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stitchTiles",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "cursor": {
    "name": "cursor",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\n<div class=\"notecard note\" id=\"sect2\">\r\n\r\n**Note:** The CSS [`cursor`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor) property should be used instead of this element.\r\n\n</div>\r\n\r\nThe **`<cursor>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element can be used to define a platform-independent custom cursor. A recommended approach for defining a platform-independent custom cursor is to create a PNG image and define a `cursor` element that references the PNG image and identifies the exact position within the image which is the pointer position (i.e., the hot spot).\r\n\r\nThe PNG format is recommended because it supports the ability to define a transparency mask via an alpha channel. If a different image format is used, this format should support the definition of a transparency mask (two options: provide an explicit alpha channel or use a particular pixel color to indicate transparency). If the transparency mask can be determined, the mask defines the shape of the cursor; otherwise, the cursor is an opaque rectangle. Typically, the other pixel information (e.g., the R, G and B channels) defines the colors for those parts of the cursor which are not masked out. Note that cursors usually contain at least two colors so that the cursor can be visible over most backgrounds. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/cursor)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "y",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "a": {
    "name": "a",
    "detail": "svg element",
    "description": "The **<a>** SVG element creates a hyperlink to other web pages, files, locations in the same page, email addresses, or any other URL. It is very similar to HTML's [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a) element.\r\n\r\nSVG's `<a>` element is a container, which means you can create a link around text (like in HTML) but also around any shape. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/a)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "target",
        "description": "The [URL](https://developer.mozilla.org/en-US/docs/Glossary/URL) or URL fragment the hyperlink points to. *Value type*: **[`<URL>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#url)** ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/a)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "view": {
    "name": "view",
    "detail": "svg element",
    "description": "A view is a defined way to view the image, like a zoom level or a detail view. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/view)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "viewBox",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "zoomAndPan",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "viewTarget",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "script": {
    "name": "script",
    "detail": "svg element",
    "description": "The SVG `script` element allows to add scripts to an SVG document.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** While SVG's `script` element is equivalent to the HTML [`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) element, it has some discrepancies, like it uses the [`href`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/href) attribute instead of [`src`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-src) and it doesn't support ECMAScript modules so far (See browser compatibility below for details)\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type",
        "description": "The [URL](https://developer.mozilla.org/en-US/docs/Glossary/URL) to the script to load. *Value type*: **[`<URL>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#url)** ; *Default value*: *none*; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "animate": {
    "name": "animate",
    "detail": "svg element",
    "description": "The SVG **`<animate>`** element provides a way to animate an attribute of an element over time. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onbegin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onend",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onrepeat",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "begin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "end",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "min",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "max",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "restart",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatCount",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatDur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "calcMode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "values",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keyTimes",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keySplines",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "from",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "to",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "by",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "additive",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "accumulate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "set": {
    "name": "set",
    "detail": "svg element",
    "description": "The SVG **`<set>`** element provides a simple means of just setting the value of an attribute for a specified duration.\r\n\r\nIt supports all attribute types, including those that cannot reasonably be interpolated, such as string and boolean values. For attributes that can be reasonably be interpolated, the [`<animate>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate) is usually preferred.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** The `<set>` element is non-additive. The [`additive`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/additive) and [`accumulate`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/accumulate) attributes are not allowed, and will be ignored if specified.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onbegin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onend",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onrepeat",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "begin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "end",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "min",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "max",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "restart",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatCount",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatDur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "to",
        "description": "This attribute defines the value to be applied to the target attribute for the duration of the animation. The value must match the requirements of the target attribute. *Value type*: [**<anything>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#anything); *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set)",
        "detail": "svg item attribute",
        "options": null
      }
    ]
  },
  "animateMotion": {
    "name": "animateMotion",
    "detail": "svg element",
    "description": "The SVG **`<animateMotion>`** element provides a way to define how an element moves along a motion path.\r\n\n<div class=\"notecard note\" id=\"sect1\">\r\n\r\n**Note:** To reuse an existing path, it will be necessary to use an [`<mpath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mpath) element inside the `<animateMotion>` element instead of the [`path`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/path) attribute.\r\n\n</div> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "mpath"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onbegin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onend",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onrepeat",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "begin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "end",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "min",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "max",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "restart",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatCount",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatDur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "calcMode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "values",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keyTimes",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keySplines",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "from",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "to",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "by",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "additive",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "accumulate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "path",
        "description": "This attribute defines the path of the motion, using the same syntax as the [`d`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) attribute. *Value type*: **`<string>`**; *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "keyPoints",
        "description": "This attribute indicate, in the range [0,1], how far is the object along the path for each [`keyTimes`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keyTimes) associated values. *Value type*: [**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)*; *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "rotate",
        "description": "This attribute defines a rotation applied to the element animated along a path, usually to make it pointing in the direction of the animation. *Value type*: [**`<number>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number)|`auto`|`auto-reverse`; *Default value*: `0`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "origin",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "mpath": {
    "name": "mpath",
    "detail": "svg element",
    "description": "The **`<mpath>`** sub-element for the [`<animateMotion>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion) element provides the ability to reference an external [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element as the definition of a motion path. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mpath)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "animateColor": {
    "name": "animateColor",
    "detail": "svg element",
    "description": "The SVG **`<animate>`** element provides a way to animate an attribute of an element over time. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateColor)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onbegin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onend",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onrepeat",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "begin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "end",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "min",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "max",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "restart",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatCount",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatDur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "calcMode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "values",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keyTimes",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keySplines",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "from",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "to",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "by",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "additive",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "accumulate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "animateTransform": {
    "name": "animateTransform",
    "detail": "svg element",
    "description": "The `animateTransform` element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onbegin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onend",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onrepeat",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "begin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "dur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "end",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "min",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "max",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "restart",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatCount",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "repeatDur",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to. *Value*: [`<paint>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "calcMode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "values",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keyTimes",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "keySplines",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "from",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "to",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "by",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "additive",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "accumulate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "type",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "font": {
    "name": "font",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<font>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a font to be used for text layout. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "font-face",
      "missing-glyph",
      "glyph",
      "hkern",
      "vkern"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "horiz-origin-x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "horiz-origin-y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "horiz-adv-x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "vert-origin-x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "vert-origin-y",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "vert-adv-y",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "glyph": {
    "name": "glyph",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nA **`<glyph>`** defines a single glyph in an SVG font. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/glyph)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "unicode",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "glyph-name",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "d",
        "description": "It defines a path to be drawn. *Value*: [path()](https://developer.mozilla.org/en-US/docs/Web/CSS/path)|`none` [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "vert-text-orient",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "arabic",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "han",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "horiz-adv-x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "vert-adv-y",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "missing-glyph": {
    "name": "missing-glyph",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<missing-glyph>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element's content is rendered, if for a given character the font doesn't define an appropriate [`<glyph>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/glyph). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/missing-glyph)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "defs",
      "path",
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "use",
      "image",
      "svg",
      "g",
      "view",
      "switch",
      "a",
      "altGlyphDef",
      "script",
      "style",
      "symbol",
      "marker",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "pattern",
      "filter",
      "cursor",
      "font",
      "animate",
      "set",
      "animateMotion",
      "animateColor",
      "animateTransform",
      "color-profile",
      "font-face"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "d",
        "description": "It defines a path to be drawn. *Value*: [path()](https://developer.mozilla.org/en-US/docs/Web/CSS/path)|`none` [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "horiz-adv-x",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "vert-adv-y",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "hkern": {
    "name": "hkern",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<hkern>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element allows to fine-tweak the horizontal distance between two glyphs. This process is known as [kerning](https://en.wikipedia.org/wiki/Kerning). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/hkern)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "u1",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "g1",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "u2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "g2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "k",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "vkern": {
    "name": "vkern",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<vkern>`** SVG element allows to fine-tweak the vertical distance between two glyphs in top-to-bottom fonts. This process is known as [kerning](https://en.wikipedia.org/wiki/Kerning). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/vkern)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "u1",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "g1",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "u2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "g2",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "k",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "font-face": {
    "name": "font-face",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<font-face>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element corresponds to the CSS [`@font-face`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) rule. It defines a font's outer properties. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "font-face-src",
      "definition-src"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element. *Value*: see CSS [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family). *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures. *Value*: see CSS [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font. *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font. *Value*: see CSS [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font. *Value*: see CSS [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "svg presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "unicode-range",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "units-per-em",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "panose-1",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stemv",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "stemh",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "slope",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "cap-height",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x-height",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "accent-height",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "ascent",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "descent",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "widths",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "bbox",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "ideographic",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "baseline",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "centerline",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "mathline",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "hanging",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "topline",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "underline-position",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "underline-thickness",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "strikethrough-position",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "strikethrough-thickness",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "overline-position",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "overline-thickness",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "font-face-src": {
    "name": "font-face-src",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<font-face-src>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element corresponds to the [`src`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src) descriptor in CSS [`@font-face`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) rules. It serves as container for [`<font-face-name>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-name), pointing to locally installed copies of this font, and [`<font-face-uri>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-uri), utilizing remotely defined fonts. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-src)",
    "elements": [
      "font-face-uri",
      "font-face-name"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      }
    ]
  },
  "font-face-uri": {
    "name": "font-face-uri",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<font-face-uri>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element points to a remote definition of the current font. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-uri)",
    "elements": [
      "font-face-format"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      }
    ]
  },
  "font-face-format": {
    "name": "font-face-format",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<font-face-format>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element describes the type of font referenced by its parent [`<font-face-uri>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-uri). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-format)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "string",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "font-face-name": {
    "name": "font-face-name",
    "detail": "svg element",
    "description": "<div class=\"notecard deprecated\" id=\"sect1\">\r\n\r\n**Deprecated:** This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the [compatibility table](#browser_compatibility) at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.\r\n</div>\r\n\r\nThe **`<font-face-name>`** element points to a locally installed copy of this font, identified by its name. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-name)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "name",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "definition-src": {
    "name": "definition-src",
    "detail": null,
    "description": null,
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  },
  "metadata": {
    "name": "metadata",
    "detail": "svg element",
    "description": "The **`<metadata>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element adds metadata to SVG content. Metadata is structured information about data. The contents of `<metadata>` should be elements from other [XML](https://developer.mozilla.org/en-US/docs/Glossary/XML) [namespaces](https://developer.mozilla.org/en-US/docs/Glossary/Namespace) such as [RDF](https://developer.mozilla.org/en-US/docs/Glossary/RDF), [FOAF](https://en.wikipedia.org/wiki/FOAF_(ontology)), etc. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/metadata)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      }
    ]
  },
  "foreignObject": {
    "name": "foreignObject",
    "detail": "svg element",
    "description": "The **`<foreignObject>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element includes elements from a different XML namespace. In the context of a browser, it is most likely (X)HTML. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "svg core attribute",
        "options": null
      },
      {
        "name": "requiredFeatures",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "requiredExtensions",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "systemLanguage",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusin",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onfocusout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onactivate",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onclick",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousedown",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseup",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseover",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmousemove",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onmouseout",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "onload",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "externalResourcesRequired",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#class) attribute in HTML. *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#style) attribute in HTML. *Value*: Any valid style string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "svg styling attribute",
        "options": null
      },
      {
        "name": "transform",
        "description": null,
        "detail": null,
        "options": null
      },
      {
        "name": "x",
        "description": "The x coordinate of the foreignObject. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the foreignObject. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The width of the foreignObject. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The height of the foreignObject. *Value type*: [**`<length>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length)|[**`<percentage>`**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "svg item attribute",
        "options": null
      },
      {
        "name": "content",
        "description": null,
        "detail": null,
        "options": null
      }
    ]
  }
}