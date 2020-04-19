var SvgSchema = {
  "svg": {
    "name": "svg",
    "description": "The `svg` element is a container that defines a new coordinate system and [viewport](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox). It is used as the outermost element of SVG documents, but it can also be used to embed a SVG fragment inside an SVG or HTML document. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "The SVG viewport coordinates for the current SVG fragment.  \r\n\n *Value type*: **[<list-of-numbers>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#List-of-Ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "How the `svg` fragment must be deformed if it is displayed with a different aspect ratio.  \r\n\n *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
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
        "description": "The displayed x coordinate of the svg container. No effect on outermost `svg` elements.  \r\n\n *Value type*: [**<length>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Length)|[**<percentage>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The displayed y coordinate of the svg container. No effect on outermost `svg` elements.  \r\n\n *Value type*: [**<length>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Length)|[**<percentage>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The displayed width of the rectangular viewport. (Not the width of its coordinate system.)  \r\n\n *Value type*: [**<length>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Length)|[**<percentage>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The displayed height of the rectangular viewport. (Not the height of its coordinate system.)  \r\n\n *Value type*: [**<length>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Length)|[**<percentage>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "contentScriptType",
        "description": "The default scripting language used by the SVG fragment.  \r\n\n *Value type*: **<string>** ; *Default value*: `application/ecmascript`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "contentStyleType",
        "description": "The default style sheet language used by the SVG fragment.  \r\n\n *Value type*: **<string>** ; *Default value*: `text/css`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "version",
        "description": "Which version of SVG is used for the inner content of the element.  \r\n\n *Value type*: **[<number>](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#Number)** ; *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "g": {
    "name": "g",
    "description": "The **`<g>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element is a container used to group other SVG elements. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<defs>`** element is used to store graphical objects that will be used at a later time. Objects created inside a `<defs>` element are not rendered directly. To display them you have to reference them (with a [`<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use \"The <use> element takes nodes from within the SVG document, and duplicates them somewhere else.\") element for example). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<desc>`** element provides an accessible, long-text description of any SVG [container element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#Container_elements) or [graphics element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#Graphics_elements). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<title>`** element provides an accessible, short-text description of any SVG [container element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#Container_elements) or [graphics element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element#Graphics_elements). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<symbol>`** element is used to define graphical template objects which can be instantiated by a [`<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use \"The <use> element takes nodes from within the SVG document, and duplicates them somewhere else.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "This attribute defines the bound of the SVG viewport for the current symbol.  \r\n\n *Value type*: **[<list-of-numbers>](/docs/Web/SVG/Content_type#List-of-Ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "This attribute defines how the svg fragment must be deformed if it is embedded in a container with a different aspect ratio.  \r\n\n *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "use": {
    "name": "use",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "The x coordinate of the use element.  \r\n\n *Value type*: [**<coordinate>**](/docs/Web/SVG/Content_type#Coordinate) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the use element.  \r\n\n *Value type*: [**<coordinate>**](/docs/Web/SVG/Content_type#Coordinate) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The width of the use element.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The height of the use element.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "image": {
    "name": "image",
    "description": "<span class=\"seoSummary\">The **`<image>`** SVG element includes images inside SVG documents. It can display [raster image](https://developer.mozilla.org/en-US/docs/Glossary/raster_image) files or other SVG files.</span> [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It defines what portion of an element is visible.  \r\n\n *Value*: **`auto`**|[`<shape()>`](https://developer.mozilla.org/en-US/docs/Web/CSS/shape \"The <shape> CSS data type defines the specific form (shape) of a region. The region represents the part of an element to which the clip property applies.\")|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit"
        ]
      },
      {
        "name": "overflow",
        "description": "Specifies whether the content of a block-level element is clipped when it overflows the element's box.  \r\n\n *Value*: `**visible**`|`hidden|scroll`|`auto`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "<span class=\"seoSummary\">The **`<switch>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element evaluates any [`requiredFeatures`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/requiredFeatures), [`requiredExtensions`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/requiredExtensions) and [`systemLanguage`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/systemLanguage) attributes on its direct child elements in order, and then renders the first child where these attributes evaluate to true.</span> Other direct children will be bypassed and therefore not rendered. If a child element is a container element, like [`<g>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g \"The <g> SVG element is a container used to group other SVG elements.\"), then its subtree is also processed/rendered or bypassed/not rendered. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/switch)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The SVG **`<style>`** element allows style sheets to be embedded directly within SVG content. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "type",
        "description": "This attribute defines type of the style sheet language to use as a media type string.  \r\n\n *Value type*: [**<string>**](/docs/Web/SVG/Content_type#String); *Default value*: `text/css`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "media",
        "description": "This attribute defines to which [`media`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media \"The documentation about this has not yet been written; please consider contributing!\") the style applies.  \r\n\n *Value type*: [**<string>**](/docs/Web/SVG/Content_type#String); *Default value*: `all`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "title",
        "description": "This attribute the title of the style sheet which can be used to switch between alternate style sheets.  \r\n\n *Value type*: [**<string>**](/docs/Web/SVG/Content_type#String); *Default value*: *none*; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "path": {
    "name": "path",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "This attribute defines the shape of the path.  \r\n\n *Value type*: **<string>** ; *Default value*: `''`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "pathLength",
        "description": "This attribute lets authors specify the total length for the path, in user units.  \r\n\n *Value type*: [**<number>**](/docs/Web/SVG/Content_type#Number) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "rect": {
    "name": "rect",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "The x coordinate of the rect.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the rect.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The width of the rect.  \r\n\n *Value type*: `auto`|[**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The height of the rect.  \r\n\n *Value type*: `auto`|[**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "rx",
        "description": "The horizontal corner radius of the rect. Defaults to `ry` if it is specified.  \r\n\n *Value type*: `auto`|[**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "ry",
        "description": "The vertical corner radius of the rect. Defaults to `rx` if it is specified.  \r\n\n *Value type*: `auto`|[**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "circle": {
    "name": "circle",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "The x-axis coordinate of the center of the circle.  \r\n\n *Value type*: **[<length>](/docs/Web/SVG/Content_type#Length)**|**[<percentage>](/docs/Web/SVG/Content_type#Percentage)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "cy",
        "description": "The y-axis coordinate of the center of the circle.  \r\n\n *Value type*: **[<length>](/docs/Web/SVG/Content_type#Length)**|**[<percentage>](/docs/Web/SVG/Content_type#Percentage)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "r",
        "description": "The radius of the circle. A value lower or equal to zero disables rendering of the circle.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "ellipse": {
    "name": "ellipse",
    "description": "The **`<ellipse>`** element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "The x position of the ellipse.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "cy",
        "description": "The y position of the ellipse.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "rx",
        "description": "The radius of the ellipse on the x axis.  \r\n\n *Value type*: `auto`|[**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "ry",
        "description": "The radius of the ellipse on the y axis.  \r\n\n *Value type*: `auto`|[**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "line": {
    "name": "line",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "Defines the x-axis coordinate of the line starting point.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage)|[**<number>**](/docs/Web/SVG/Content_type#Number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y1",
        "description": "Defines the y-axis coordinate of the line starting point.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage)|[**<number>**](/docs/Web/SVG/Content_type#Number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "x2",
        "description": "Defines the x-axis coordinate of the line ending point.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage)|[**<number>**](/docs/Web/SVG/Content_type#Number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y2",
        "description": "Defines the y-axis coordinate of the line ending point.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage)|[**<number>**](/docs/Web/SVG/Content_type#Number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "polyline": {
    "name": "polyline",
    "description": "The **`<polyline>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element is an SVG basic shape that creates straight lines connecting several points. Typically a `polyline` is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the [`<polygon>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon \"The <polygon> element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point. For open shapes see the <polyline> element.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "This attribute defines the list of points (pairs of x,y absolute coordinates) required to draw the polyline  \r\n\n *Value type*: [**<number>**](/docs/Web/SVG/Content_type#Number)+ ; *Default value*: `\"\"`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "polygon": {
    "name": "polygon",
    "description": "The **`<polygon>`** element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It defines the arrowhead or polymarker that will be drawn at the first vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-mid",
        "description": "It defines the arrowhead or polymarker that will be drawn at every vertex other than the first and last vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "marker-end",
        "description": "It defines the arrowhead or polymarker that will be drawn at the final vertex of the given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shape.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "This attribute defines the list of points (pairs of `` absolute coordinates) required to draw the polygon.  \r\n\n *Value type*: [**<number>**](/docs/Web/SVG/Content_type#Number)+ ; *Default value*: `\"\"`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "text": {
    "name": "text",
    "description": "The SVG **`<text>`** element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to `<text>`, like any other SVG graphics element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|`**none**`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent.  \r\n\n *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element.  \r\n\n *Value*: **`auto`**|`baseline`|`super`|`sub`|[<percentage>](/docs/Web/SVG/Content_type#Percentage)|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text.  \r\n\n *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box’s text and inline-level contents.  \r\n\n *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal.  \r\n\n *Value*: [<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical.  \r\n\n *Value*: **`auto`**|[<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters.  \r\n\n *Value*: **`normal`**|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "The x coordinate of the starting point of the text baseline.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the starting point of the text baseline.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "textLength",
        "description": "A width that the text should be scaled to fit.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "lengthAdjust",
        "description": "How the text is stretched or compressed to fit the width defined by the `textLength` attribute.  \r\n\n *Value type*: `spacing`|`spacingAndGlyphs`; *Default value*: `spacing`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "tspan": {
    "name": "tspan",
    "description": "The SVG `**<tspan>**` element defines a subtext within a [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text \"The SVG <text> element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.\") element or another `<tspan>` element. It allows for adjustment of the style and/or position of that subtext as needed. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|`**none**`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent.  \r\n\n *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element.  \r\n\n *Value*: **`auto`**|`baseline`|`super`|`sub`|[<percentage>](/docs/Web/SVG/Content_type#Percentage)|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text.  \r\n\n *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box’s text and inline-level contents.  \r\n\n *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal.  \r\n\n *Value*: [<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical.  \r\n\n *Value*: **`auto`**|[<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters.  \r\n\n *Value*: **`normal`**|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "The x coordinate of the starting point of the text baseline.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value: none; Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the starting point of the text baseline.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value: none; Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "dx",
        "description": "Shifts the text position horizontally from a previous text element.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "dy",
        "description": "Shifts the text position vertically from a previous text element.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value: none; Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "rotate",
        "description": "Rotates orientation of each individual glyph. Can rotate glyphs individually.  \r\n\n *Value type*: [**<list-of-number>**](/docs/Web/SVG/Content_type#List-of-Ts) ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "textLength",
        "description": "A width that the text should be scaled to fit.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "lengthAdjust",
        "description": "How the text is stretched or compressed to fit the width defined by the `textLength` attribute.  \r\n\n *Value type*: `spacing`|`spacingAndGlyphs`; *Default value*: `spacing`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "tref": {
    "name": "tref",
    "description": "The textual content for a [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text \"The SVG <text> element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.\") [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element can be either character data directly embedded within the [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text \"The SVG <text> element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.\") element or the character data content of a referenced element, where the referencing is specified with a **`<tref>`** element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tref)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|`**none**`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent.  \r\n\n *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element.  \r\n\n *Value*: **`auto`**|`baseline`|`super`|`sub`|[<percentage>](/docs/Web/SVG/Content_type#Percentage)|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text.  \r\n\n *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box’s text and inline-level contents.  \r\n\n *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal.  \r\n\n *Value*: [<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical.  \r\n\n *Value*: **`auto`**|[<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters.  \r\n\n *Value*: **`normal`**|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "To render text along the shape of a [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\"), enclose the text in a **`<textPath>`** element that has an [`href`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/href) attribute with a reference to the [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|`**none**`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent.  \r\n\n *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element.  \r\n\n *Value*: **`auto`**|`baseline`|`super`|`sub`|[<percentage>](/docs/Web/SVG/Content_type#Percentage)|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text.  \r\n\n *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box’s text and inline-level contents.  \r\n\n *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal.  \r\n\n *Value*: [<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical.  \r\n\n *Value*: **`auto`**|[<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters.  \r\n\n *Value*: **`normal`**|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "startOffset",
        "description": "How far the beginning of the text should be offset from the beginning of the path.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage)|[**<number>**](/docs/Web/SVG/Content_type#Number) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "textLength",
        "description": "The width of the space into which the text will render.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage)|[**<number>**](/docs/Web/SVG/Content_type#Number) ; *Default value*: *auto*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "lengthAdjust",
        "description": "Where length adjustment should be applied to the text: the space between glyphs, or both the space and the glyphs themselves.  \r\n\n *Value type*: `spacing`|`spacingAndGlyphs`; *Default value*: `spacing`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "method",
        "description": "Which method to render individual glyphs along the path.  \r\n\n *Value type*: `align`|`stretch` ; *Default value*: `align`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "spacing",
        "description": "How space between glyphs should be handled.  \r\n\n *Value type*: `auto`|`exact` ; *Default value*: `exact`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "altGlyph": {
    "name": "altGlyph",
    "description": "The **`<altGlyph>`** SVG element allows sophisticated selection of the glyphs used to render its child character data. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It provides a potential indirect value (`currentColor`) for the `fill`, `stroke`, `stop-color`, `flood-color` and `lighting-color` presentation attributes.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies the color space for gradient interpolations, color animations, and alpha compositing.  \r\n\n *Value*: `auto`|**`sRGB`**|`linearRGB`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "color-rendering",
        "description": "It provides a hint to the browser about how to optimize its color interpolation and compositing operations.  \r\n\n *Value*: **`auto`**|`optimizeSpeed`|`optimizeQuality`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill",
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|`**none**`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent.  \r\n\n *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element.  \r\n\n *Value*: **`auto`**|`baseline`|`super`|`sub`|[<percentage>](/docs/Web/SVG/Content_type#Percentage)|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text.  \r\n\n *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box’s text and inline-level contents.  \r\n\n *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal.  \r\n\n *Value*: [<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical.  \r\n\n *Value*: **`auto`**|[<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters.  \r\n\n *Value*: **`normal`**|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "The glyph identifier, the format of which is dependent on the format defined by the `format` attribute of the given font.  \r\n\n *Value type*: **<string>** ; *Default value*: *none*; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "format",
        "description": "The format of the given font.  \r\n\n *Value type*: **<string**[**>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: *none*; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "item attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "This attribute defines the corresponding absolute x-coordinates for rendering the element.  \r\n\n *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#List-of-Ts) ; *Default value*: Absolute x-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text \"The SVG <text> element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.\") or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan \"The SVG <tspan> element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.\"); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "This attribute defines the corresponding absolute y-coordinates for rendering the element.  \r\n\n *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#List-of-Ts) ; *Default value*: Absolute y-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text \"The SVG <text> element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.\") or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan \"The SVG <tspan> element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.\"); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "dx",
        "description": "This attribute indicates a shift along the x-axis on the position of the element.  \r\n\n *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#List-of-Ts) ; *Default value*: Relative x-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text \"The SVG <text> element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.\") or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan \"The SVG <tspan> element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.\"); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "dy",
        "description": "This attribute indicates a shift along the x-axis on the position of the element.  \r\n\n *Value type*: [**<list-of-coordinates>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#List-of-Ts) ; *Default value*: Relative y-coordinate of ancestor [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text \"The SVG <text> element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.\") or [`<tspan>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan \"The SVG <tspan> element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.\"); *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "rotate",
        "description": "This attribute defines the supplemental rotation that will be applied to the element.  \r\n\n *Value type*: [**<list-of-numbers>**](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#List-of-Ts) ; *Default value*: *none*; *Animatable*: **yes (non-additive)** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "altGlyphDef": {
    "name": "altGlyphDef",
    "description": "The **`<altGlyphDef>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a substitution representation for glyphs. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyphDef)",
    "elements": [
      "altGlyphItem",
      "glyphRef"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      }
    ]
  },
  "altGlyphItem": {
    "name": "altGlyphItem",
    "description": "The **`<altGlyphItem>`** element provides a set of candidates for glyph substitution by the [`<altGlyph>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph \"The <altGlyph> SVG element allows sophisticated selection of the glyphs used to render its child character data.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyphItem)",
    "elements": [
      "glyphRef"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      }
    ]
  },
  "glyphRef": {
    "name": "glyphRef",
    "description": "The `glyphRef` element provides a single possible glyph to the referencing [`<altGlyph>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/altGlyph \"The <altGlyph> SVG element allows sophisticated selection of the glyphs used to render its child character data.\") substitution. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/glyphRef)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|`**none**`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<marker>`** element defines the graphic that is to be used for drawing arrowheads or polymarkers on a given [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\"), [`<line>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line \"The <line> element is an SVG basic shape used to create a line connecting two points.\"), [`<polyline>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline \"The <polyline> SVG element is an SVG basic shape that creates straight lines connecting several points. Typically a polyline is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the <polygon> element.\") or [`<polygon>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon \"The <polygon> element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point. For open shapes see the <polyline> element.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "This attribute defines the bound of the SVG viewport for the current SVG fragment.  \r\n\n *Value type*: **[<list-of-numbers>](/docs/Web/SVG/Content_type#List-of-Ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "This attribute defines how the svg fragment must be deformed if it is embedded in a container with a different aspect ratio.  \r\n\n *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "refX",
        "description": "This attribute defines the x coordinate for the reference point of the marker.  \r\n\n *Value type*: `left`|`center`|`right`|**[<coordinate>](/docs/Web/SVG/Content_type#Coordinate)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "refY",
        "description": "This attribute defines the y coordinate for the reference point of the marker.  \r\n\n *Value type*: `top`|`center`|`bottom`|**[<coordinate>](/docs/Web/SVG/Content_type#Coordinate)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "markerUnits",
        "description": "This attribute defines the coordinate system for the attributes `markerWidth`, `markerHeight` and the contents of the `<marker>`.  \r\n\n *Value type*: `userSpaceOnUse`|`strokeWidth` ; *Default value*: `strokeWidth`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "markerWidth",
        "description": "This attribute defines the width of the marker viewport.  \r\n\n *Value type*: **[<length>](/docs/Web/SVG/Content_type#Length)** ; *Default value*: `3`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "markerHeight",
        "description": "This attribute defines the height of the marker viewport.  \r\n\n *Value type*: **[<length>](/docs/Web/SVG/Content_type#Length)** ; *Default value*: `3`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "orient",
        "description": "This attribute defines the orientation of the marker relative to the shape it is attached to.  \r\n\n *Value type*: `auto`|`auto-start-reverse`|**[<angle>](/docs/Web/SVG/Content_type#Angle)** ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "color-profile": {
    "name": "color-profile",
    "description": "The **`<color-profile>`** element allows describing the color profile used for the image. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/color-profile)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<linearGradient>`** element lets authors define linear gradients that can be applied to fill or stroke of graphical elements. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "gradientUnits",
        "description": "This attribute defines the coordinate system for attributes `x1`, `x2`, `y1`, `y2`  \r\n\n *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "gradientTransform",
        "description": "This attribute provides additional [transformation](/docs/Web/SVG/Attribute/transform) to the gradient coordinate system.  \r\n\n *Value type*: **[<transform-list>](/docs/Web/SVG/Content_type#Transform-list)** ; *Default value*: *identity transform*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "x1",
        "description": "This attribute defines the x coordinate of the starting point of the vector gradient along which the linear gradient is drawn.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `0%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y1",
        "description": "This attribute defines the y coordinate of the starting point of the vector gradient along which the linear gradient is drawn.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `0%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "x2",
        "description": "This attribute defines the x coordinate of the ending point of the vector gradient along which the linear gradient is drawn.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `100%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y2",
        "description": "This attribute defines the y coordinate of the ending point of the vector gradient along which the linear gradient is drawn.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `0%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "spreadMethod",
        "description": "This attribute indicates how the gradient behaves if it starts or ends inside the bounds of the shape containing the gradient.  \r\n\n *Value type*: `pad`|`reflect`|`repeat` ; *Default value*: `pad`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "radialGradient": {
    "name": "radialGradient",
    "description": "The **`<radialGradient>`** element lets authors define radial gradients that can be applied to fill or stroke of graphical elements. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "This attribute defines the coordinate system for attributes `x1`, `x2`, `y1`, `y2`  \r\n\n *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "gradientTransform",
        "description": "This attribute provides additional [transformation](/docs/Web/SVG/Attribute/transform) to the gradient coordinate system.  \r\n\n *Value type*: **[<transform-list>](/docs/Web/SVG/Content_type#Transform-list)** ; *Default value*: *identity transform*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "cx",
        "description": "This attribute defines the x coordinate of the end circle of the radial gradient.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `50%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "cy",
        "description": "This attribute defines the y coordinate of the end circle of the radial gradient.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `50%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "r",
        "description": "This attribute defines the radius of the end circle of the radial gradient. The gradient will be drawn such that the 100% [`<stop>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop \"The SVG <stop> element defines a color and its position to use on a gradient. This element is always a child of a <linearGradient> or <radialGradient> element.\") is mapped to the perimeter of the end circle.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `50%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "fx",
        "description": "This attribute defines the x coordinate of the start circle of the radial gradient.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: Same as `cx`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "fy",
        "description": "This attribute defines the y coordinate of the start circle of the radial gradient.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: Same as `cy`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "spreadMethod",
        "description": "This attribute indicates how the gradient behaves if it starts or ends inside the bounds of the shape containing the gradient.  \r\n\n *Value type*: `pad`|`reflect`|`repeat` ; *Default value*: `pad`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "stop": {
    "name": "stop",
    "description": "The SVG **`<stop>`** element defines a color and its position to use on a gradient. This element is always a child of a [`<linearGradient>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient \"The <linearGradient> element lets authors define linear gradients that can be applied to fill or stroke of graphical elements.\") or [`<radialGradient>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient \"The <radialGradient> element lets authors define radial gradients that can be applied to fill or stroke of graphical elements.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
    "elements": [
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "stop-color",
        "description": "This attribute defines the color of the gradient stop. It can be used as a CSS property.  \r\n\n *Value type*: `currentColor`|[**<color>**](/docs/Web/SVG/Content_type#Color)|[**<icccolor>**](/docs/Web/SVG/Content_type#ICCColor); *Default value*: `black`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "stop-opacity",
        "description": "This attribute defines the opacity of the gradient stop. It can be used as a CSS property.  \r\n\n *Value type*: [**<opacity>**](/docs/Web/SVG/Content_type#Opacity_value); *Default value*: `1`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "offset",
        "description": "This attribute defines where the gradient stop is placed along the gradient vector.  \r\n\n *Value type*: [**<number>**](/docs/Web/SVG/Content_type#Number)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage); *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "pattern": {
    "name": "pattern",
    "description": "The **`<pattern>`** element defines a graphics object which can be redrawn at repeated x and y-coordinate intervals (\"tiled\") to cover an area. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "viewBox",
        "description": "This attribute defines the bound of the SVG viewport for the pattern fragment.  \r\n\n *Value type*: **[<list-of-numbers>](/docs/Web/SVG/Content_type#List-of-Ts)** ; *Default value*: none; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "preserveAspectRatio",
        "description": "This attribute defines how the svg fragment must be deformed if it is embedded in a container with a different aspect ratio.  \r\n\n *Value type*: (`none`| `xMinYMin`| `xMidYMin`| `xMaxYMin`| `xMinYMid`| `xMidYMid`| `xMaxYMid`| `xMinYMax`| `xMidYMax`| `xMaxYMax`) (`meet`|`slice`)? ; *Default value*: `xMidYMid meet`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "patternUnits",
        "description": "This attribute defines the coordinate system for attributes `x`, `y`, `width` and `height`.  \r\n\n *Value type*: `userSpaceOnUse`|`objectBoundingBox`; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "patternTransform",
        "description": "This attribute contains the definition of an optional additional transformation from the pattern coordinate system onto the target coordinate system.  \r\n\n *Value type*: **[<transform-list>](/docs/Web/SVG/Content_type#Transform-list)**; *Default value*: *none*; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "This attribute determines the x coordinate shift of the pattern tile.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "This attribute determines the y coordinate shift of the pattern tile.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "This attribute determines the width of the pattern tile.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "This attribute determines the height of the pattern tile.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage); *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "clipPath": {
    "name": "clipPath",
    "description": "The **`<clipPath>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a clipping path, to be used used by the [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/clip-path) property. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-opacity",
        "description": "It specifies the opacity of the color or the content the current object is filled with.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "fill-rule",
        "description": "It indicates how to determine what side of a path is inside a shape.  \r\n\n *Value*: **`nonzero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "stroke",
        "description": "Defines the color used to paint the outline of the shape.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dasharray",
        "description": "Defines the pattern of dashes and gaps used to paint the outline of the shape.  \r\n\n *Value*: `none`|`<dasharray>`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "stroke-dashoffset",
        "description": "Defines an offset on the rendering of the associated dash array.  \r\n\n *Value*: [<percentage>](/en/SVG/Content_type#Percentage \"en/SVG/Content_type#Percentage\")|[<span><length></span>](/en/SVG/Content_type#Length \"en/SVG/Content_type#Length\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "font-size-adjust",
        "description": "It specifies that the font size should be chosen based on the height of lowercase letters rather than the height of capital letters.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|`**none**`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "clip-path",
        "description": "It binds the element it is applied to with a given [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") element.  \r\n\n *Value*: **`none`**|[<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "auto",
          "inherit",
          "none"
        ]
      },
      {
        "name": "clip-rule",
        "description": "It indicates how to determine what side of a path is inside a shape in order to know how a [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath \"The <clipPath> SVG element defines a clipping path, to be used used by the clip-path property.\") should clip its target.  \r\n\n *Value*: **`nonezero`**|`evenodd`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "evenodd",
          "nonzero",
          "inherit"
        ]
      },
      {
        "name": "cursor",
        "description": "It specifies the mouse cursor displayed when the mouse pointer is over an element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|[<keywords>](/docs/Web/CSS/cursor#Values)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It allows to control the rendering of graphical or container elements.  \r\n\n *Value*: see css [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display \"The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "filter",
        "description": "It defines the filter effects defined by the [`<filter>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter \"The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.\") element that shall be applied to its element.  \r\n\n *Value*: [<FuncIRI>](/docs/Web/SVG/Content_type#FuncIRI)|**`none`**|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "image-rendering",
        "description": "It provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing.  \r\n\n *Value*: **`auto`**|`optimizeQuality`|`optimizeSpeed`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "mask",
        "description": "It alters the visibility of an element by either masking or clipping the image at specific points.  \r\n\n *Value*: see css [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask \"The mask CSS property hides an element (partially or fully) by masking or clipping the image at specific points.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "none",
          "inherit"
        ]
      },
      {
        "name": "opacity",
        "description": "It specifies the transparency of an object or a group of objects.  \r\n\n *Value*: [<opacity-value>](/docs/Web/SVG/Content_type#Opacity_value); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "pointer-events",
        "description": "Defines whether or when an element may be the target of a mouse event.  \r\n\n *Value*: `bounding-box`|`**visiblePainted**`|`visibleFil`|`visibleStroke`|`visible` |`painted`|`fill`|`stroke`|`all`|`none`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "shape-rendering",
        "description": "Hints about what tradeoffs to make as the browser renders [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element or basic shapes.  \r\n\n *Value*: `**auto**`|`optimizeSpeed`|`crispEdges`|`geometricPrecision` |`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "It specifies how an object is aligned along the font baseline with respect to its parent.  \r\n\n *Value*: **`auto`**|`baseline`|`before-edge`|`text-before-edge`|`middle`|`central`|`after-edge`|`text-after-edge`|`ideographic`|`alphabetic`|`hanging`|`mathematical`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "baseline-shift",
        "description": "It allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element.  \r\n\n *Value*: **`auto`**|`baseline`|`super`|`sub`|[<percentage>](/docs/Web/SVG/Content_type#Percentage)|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "baseline",
          "sub",
          "super",
          "inherit"
        ]
      },
      {
        "name": "direction",
        "description": "It specifies the base writing direction of text.  \r\n\n *Value*: **`ltr`**|`rtl`|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "dominant-baseline",
        "description": "It defines the baseline used to align the box’s text and inline-level contents.  \r\n\n *Value*: `auto`|`text-bottom`|`alphabetic`|`ideographic`|`middle`|`central`| `mathematical`|`hanging`|`text-top`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "glyph-orientation-horizontal",
        "description": "It controls glyph orientation when the inline-progression-direction is horizontal.  \r\n\n *Value*: [<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit"
        ]
      },
      {
        "name": "glyph-orientation-vertical",
        "description": "It controls glyph orientation when the inline-progression-direction is vertical.  \r\n\n *Value*: **`auto`**|[<angle>](/docs/Web/SVG/Content_type#Angle)|`inherit`; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": [
          "inherit",
          "auto"
        ]
      },
      {
        "name": "letter-spacing",
        "description": "It controls spacing between text characters.  \r\n\n *Value*: **`normal`**|[<length>](/docs/Web/SVG/Content_type#Length)|`inherit`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "Defines the coordinate system for the contents of the `<clipPath>` element.  \r\n\n *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `userSpaceOnUse`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "mask": {
    "name": "mask",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "This attribute defines defines the coordinate system for attributes [`x`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/x), [`y`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/y), [`width`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/width) and [`height`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/height) on the `<mask>`.  \r\n\n *Value type*: `userSpaceOnUse`|`objectBoundingBox` ; *Default value*: `objectBoundingBox`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "x",
        "description": "This attribute defines the x-axis coordinate of the top-left corner of the masking area.  \r\n\n *Value type*: [**<coordinate>**](/docs/Web/SVG/Content_type#Coordinate) ; *Default value*: `-10%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "This attribute defines the y-axis coordinate of the top-left corner of the masking area.  \r\n\n *Value type*: [**<coordinate>**](/docs/Web/SVG/Content_type#Coordinate) ; *Default value*: `-10%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "This attribute defines the width of the masking area.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `120%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "This attribute defines the height of the masking area.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length) ; *Default value*: `120%`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "filter": {
    "name": "filter",
    "description": "The **`<filter>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the [`filter`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/filter) attribute on SVG elements, or the [`filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/filter \"The filter CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.\") [CSS](https://developer.mozilla.org/en-US/docs/Glossary/CSS) property for SVG/HTML elements. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<feDistantLight>`** filter primitive defines a distant light source that can be used within a lighting filter primitive: [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting \"The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.\") or [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting \"The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.\"). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDistantLight)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<fePointLight>`** filter primitive defines a light source which allows to create a point light effect. It that can be used within a lighting filter primitive: [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting \"The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.\") or [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting \"The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.\"). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/fePointLight)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feSpotLight>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines a light source which allows to create a spotlight effect. It that can be used within a lighting filter primitive: [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting \"The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.\") or [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting \"The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.\"). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpotLight)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feBlend>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive composes two objects together ruled by a certain blending mode. This is similar to what is known from image editing software when blending two layers. The mode is defined by the [`mode`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/mode) attribute. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feBlend)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feColorMatrix>`** SVG filter element changes colors based on a transformation matrix. Every pixel's color value  `[R,G,B,A]` is [matrix multiplied](https://en.wikipedia.org/wiki/Matrix_multiplication \"http://en.wikipedia.org/wiki/Matrix_multiplication\") by a 5 by 5 color matrix to create new color `[R*'*,G*'*,B*'*,A*'*]`. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "Th **`<feComponentTransfer>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer)",
    "elements": [
      "feFuncR",
      "feFuncG",
      "feFuncB",
      "feFuncA"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The `**<feFuncR>**` [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the red component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer \"Th <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncR)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feFuncG>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the green component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer \"Th <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncG)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feFuncB>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the blue component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer \"Th <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncB)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feFuncA>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive defines the transfer function for the alpha component of the input graphic of its parent [`<feComponentTransfer>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer \"Th <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncA)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feComposite>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: `over`*,* `in`*,* `atop`*,* `out`*,* `xor`, and `lighter`. Additionally, a component-wise `arithmetic` operation (with the result clamped between [0..1]) can be applied. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feConvolveMatrix>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive applies a matrix convolution filter effect. A convolution combines pixels in the input image with neighboring pixels to produce a resulting image. A wide variety of imaging operations can be achieved through convolutions, including blurring, edge detection, sharpening, embossing and beveling. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feConvolveMatrix)",
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
    "description": "The **`<feDiffuseLighting>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "lighting-color",
        "description": "It defines the color of the light source for filter primitives elements [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting \"The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.\") and [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting \"The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.\").  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<feDisplacementMap>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive uses the pixel values from the image from [`in2`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in2) to spatially displace the image from [`in`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/in). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feFlood>`** SVG filter primitive fills the filter subregion with the color and opacity defined by [`flood-color`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/flood-color) and [`flood-opacity`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/flood-opacity). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood)",
    "elements": [
      "animate",
      "set",
      "animateColor"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "flood-color",
        "description": "It indicates what color to use to flood the current filter primitive subregion defined through the [`<feFlood>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood \"The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.\") or [`<feDropShadow>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow \"The SVG <feDropShadow> filter primitive creates a drop shadow of the input image. It can only be used inside a <filter> element.\") element.  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "flood-opacity",
        "description": "It indicates the opacity value to use across the current filter primitive subregion defined through the [`<feFlood>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood \"The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.\") or [`<feDropShadow>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow \"The SVG <feDropShadow> filter primitive creates a drop shadow of the input image. It can only be used inside a <filter> element.\") element.  \r\n\n *Value*: [<number>](/docs/Web/SVG/Content_type#Number)|[<percentage>](/docs/Web/SVG/Content_type#Percentage); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      }
    ]
  },
  "feGaussianBlur": {
    "name": "feGaussianBlur",
    "description": "The **`<feGaussianBlur>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive blurs the input image by the amount specified in [`stdDeviation`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stdDeviation), which defines the bell-curve. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feImage>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized.) [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feImage)",
    "elements": [
      "animate",
      "set",
      "animateTransform"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<feMerge>`** SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the [`result`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/result) attribute and then accessing it in a [`<feMergeNode>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode \"The feMergeNode takes the result of another filter to be processed by its parent <feMerge>.\") child. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge)",
    "elements": [
      "feMergeNode"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The `feMergeNode` takes the result of another filter to be processed by its parent [`<feMerge>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge \"The <feMerge> SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the result attribute and then accessing it in a <feMergeNode> child.\"). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feMorphology>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive is used to erode or dilate the input image. It's usefulness lies especially in fattening or thinning effects. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feOffset>`** SVG filter primitive allows to offset the input image. The input image as a whole is offset by the values specified in the [`dx`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dx) and [`dy`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dy) attributes. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feOffset)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feSpecularLighting>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of [the Phong lighting model](https://en.wikipedia.org/wiki/Phong_reflection_model \"http://en.wikipedia.org/wiki/Phong_reflection_model\"). The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "lighting-color",
        "description": "It defines the color of the light source for filter primitives elements [`<feDiffuseLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting \"The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.\") and [`<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting \"The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.\").  \r\n\n *Value*: [<color>](/docs/Web/SVG/Content_type#Color); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "The **`<feTile>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. The effect is similar to the one of a [`<pattern>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern \"The <pattern> element defines a graphics object which can be redrawn at repeated x and y-coordinate intervals (\"tiled\") to cover an area.\"). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTile)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<feTurbulence>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) filter primitive creates an image using the [Perlin turbulence function](https://en.wikipedia.org/wiki/Perlin_noise). It allows the synthesis of artificial textures like clouds or marble. The resulting image will fill the entire filter primitive subregion. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence)",
    "elements": [
      "animate",
      "set"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<cursor>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element can be used to define a platform-independent custom cursor. A recommended approach for defining a platform-independent custom cursor is to create a PNG image and define a `cursor` element that references the PNG image and identifies the exact position within the image which is the pointer position (i.e., the hot spot). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/cursor)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **<a>** SVG element creates a hyperlink to other web pages, files, locations in the same page, email addresses, or any other URL. It is very similar to HTML’s [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a \"The HTML <a> element (or anchor element), with its href attribute, creates a hyperlink to web pages, files, email addresses, locations in the same page, or anything else a URL can address.\") element. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/a)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "Where to display the linked [URL](https://developer.mozilla.org/en-US/docs/Glossary/URL).  \r\n\n *Value type*: `_self`|`_parent`|`_top`|`_blank`|**<name>** ; *Default value*: `_self`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/a)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "view": {
    "name": "view",
    "description": "A view is a defined way to view the image, like a zoom level or a detail view. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/view)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The SVG `script` element allows to add scripts to an SVG document. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "This attribute defines type of the script language to use.  \r\n\n *Value type*: [**<string>**](/docs/Web/SVG/Content_type#String); *Default value*: `application/ecmascript`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "animate": {
    "name": "animate",
    "description": "The SVG **`<animate>`** element provides a way to animate an attribute of an element over time. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
    "description": "The SVG **`<set>`** element provides a simple means of just setting the value of an attribute for a specified duration. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "This attribute defines the value to be applied to the target attribute for the duration of the animation. The value must match the requirements of the target attribute.  \r\n\n *Value type*: [**<anything>**](/docs/Web/SVG/Content_type#Anything); *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set)",
        "detail": "item attribute",
        "options": null
      }
    ]
  },
  "animateMotion": {
    "name": "animateMotion",
    "description": "The SVG **`<animateMotion>`** element let define how an element moves along a motion path. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
    "elements": [
      "desc",
      "title",
      "metadata",
      "mpath"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
        "description": "This attribute defines the path of the motion, using the same syntax as the [`d`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) attribute.  \r\n\n\t*Value type*: **<string>**; *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "keyPoints",
        "description": "This attribute indicate, in the range [0,1], how far is the object along the path for each [`keyTimes`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/keyTimes) associated values.  \r\n\n\t*Value type*: [**<number>**](/docs/Web/SVG/Content_type#Number)*; *Default value*: none; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "rotate",
        "description": "This attribute defines a rotation applied to the elment animated along a path, usually to make it pointing in the direction of the animation.  \r\n\n\t*Value type*: [**<number>**](/docs/Web/SVG/Content_type#Number)|`auto`|`auto-reverse`; *Default value*: `0`; *Animatable*: **no** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion)",
        "detail": "item attribute",
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
    "description": "The **`<mpath>`** sub-element for the [`<animateMotion>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion \"The SVG <animateMotion> element let define how an element moves along a motion path.\") element provides the ability to reference an external [`<path>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path \"The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.\") element as the definition of a motion path. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mpath)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<animateColor>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element specifies a color transformation over time. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateColor)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
    "description": "The `animateTransform` element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform)",
    "elements": [
      "desc",
      "title",
      "metadata"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "It defines the color of the inside of the graphical element it applies to.  \r\n\n *Value*: [<paint>](/docs/Web/SVG/Content_type#Paint); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
    "description": "The **`<font>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element defines a font to be used for text layout. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
    "description": "A **`<glyph>`** defines a single glyph in an SVG font. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/glyph)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": null,
        "detail": null,
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
    "description": "The **`<missing-glyph>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element's content is rendered, if for a given character the font doesn't define an appropriate [`<glyph>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/glyph \"A <glyph> defines a single glyph in an SVG font.\"). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/missing-glyph)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "class",
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "d",
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
  "hkern": {
    "name": "hkern",
    "description": "The **`<hkern>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element allows to fine-tweak the horizontal distance between two glyphs. This process is known as [kerning](https://en.wikipedia.org/wiki/Kerning). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/hkern)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<vkern>`** SVG element allows to fine-tweak the vertical distance between two glyphs in top-to-bottom fonts. This process is known as [kerning](https://en.wikipedia.org/wiki/Kerning). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/vkern)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<font-face>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element corresponds to the CSS [`@font-face`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face \"The @font-face CSS at-rule specifies a custom font with which to display text; the font can be loaded from either a remote server or a locally-installed font on the user's own computer.\") rule. It defines a font's outer properties. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face)",
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
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      },
      {
        "name": "font-family",
        "description": "It indicates which font family will be used to render the text of the element.  \r\n\n *Value*: see css [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family \"The font-family CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-style",
        "description": "It specifies whether a font should be styled with a normal, italic, or oblique face from its [`font-family`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/font-family).  \r\n\n *Value*: **`normal`**|`italic`|`oblique`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-variant",
        "description": "It specifies whether a font should be used with some of their variation such as small caps or ligatures.  \r\n\n *Value*: see css [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant \"The font-variant CSS property is a shorthand for the longhand properties font-variant-caps, font-variant-numeric, font-variant-alternates, font-variant-ligatures, and font-variant-east-asian. You can also set the CSS Level 2 (Revision 1) values of font-variant, (that is, normal or small-caps), by using the font shorthand.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-weight",
        "description": "It specifies the weight (or boldness) of the font.  \r\n\n *Value*: **`normal`**|`bold`|`lighter`|`bolder`|`100`|`200`|`300`|`400`|`500`|`600`|`700`|`800`|`900`; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-stretch",
        "description": "It selects a normal, condensed, or expanded face from a font.  \r\n\n *Value*: see css [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch \"The font-stretch CSS property selects a normal, condensed, or expanded face from a font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
        "options": null
      },
      {
        "name": "font-size",
        "description": "It specifies the size of the font.  \r\n\n *Value*: see css [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size \"The font-size CSS property sets the size of the font.\"); *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation)",
        "detail": "presentation attribute",
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
    "description": "The **`<font-face-src>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element corresponds to the [`src`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src \"The documentation about this has not yet been written; please consider contributing!\") descriptor in CSS [`@font-face`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face \"The @font-face CSS at-rule specifies a custom font with which to display text; the font can be loaded from either a remote server or a locally-installed font on the user's own computer.\") rules. It serves as container for [`<font-face-name>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-name \"The <font-face-name> element points to a locally installed copy of this font, identified by its name.\"), pointing to locally installed copies of this font, and [`<font-face-uri>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-uri \"The <font-face-uri> SVG element points to a remote definition of the current font.\"), utilizing remotely defined fonts. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-src)",
    "elements": [
      "font-face-uri",
      "font-face-name"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      }
    ]
  },
  "font-face-uri": {
    "name": "font-face-uri",
    "description": "The **`<font-face-uri>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element points to a remote definition of the current font. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-uri)",
    "elements": [
      "font-face-format"
    ],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      }
    ]
  },
  "font-face-format": {
    "name": "font-face-format",
    "description": "The **`<font-face-format>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element describes the type of font referenced by its parent [`<font-face-uri>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-uri \"The <font-face-uri> SVG element points to a remote definition of the current font.\"). [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-format)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<font-face-name>`** element points to a locally installed copy of this font, identified by its name. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/font-face-name)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
    "description": "The **`<metadata>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element adds metadata to SVG content. Metadata is structured information about data. The contents of `<metadata>` should be elements from other [XML](https://developer.mozilla.org/en-US/docs/Glossary/XML) [namespaces](https://developer.mozilla.org/en-US/docs/Glossary/namespace) such as [RDF](https://developer.mozilla.org/en-US/docs/Glossary/RDF), [FOAF](https://en.wikipedia.org/wiki/FOAF_(ontology)), etc. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/metadata)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
        "options": null
      }
    ]
  },
  "foreignObject": {
    "name": "foreignObject",
    "description": "The **`<foreignObject>`** [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) element includes elements from a different XML namespace. In the context of a browser, it is most likely (X)HTML. [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
    "elements": [],
    "attributes": [
      {
        "name": "id",
        "description": "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).  \r\n\n *Value*: Any valid ID string; *Animatable*: **No** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core)",
        "detail": "core attribute",
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
        "description": "Assigns a class name or set of class names to an element. It functions identically to the [`class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) attribute in HTML.  \r\n\n *Value*: Any valid ID string; *Animatable*: **Yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
        "options": null
      },
      {
        "name": "style",
        "description": "It specifies style information for its element. It functions identically to the [`style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-style) attribute in HTML.  \r\n\n *Value*: Any valid style string; *Animatable*: **No**\n \r\n\r\n\n  [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling)",
        "detail": "styling attribute",
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
        "description": "The x coordinate of the foreignObject.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "y",
        "description": "The y coordinate of the foreignObject.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `0`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "width",
        "description": "The width of the foreignObject.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "item attribute",
        "options": null
      },
      {
        "name": "height",
        "description": "The height of the foreignObject.  \r\n\n *Value type*: [**<length>**](/docs/Web/SVG/Content_type#Length)|[**<percentage>**](/docs/Web/SVG/Content_type#Percentage) ; *Default value*: `auto`; *Animatable*: **yes** [more...](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)",
        "detail": "item attribute",
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