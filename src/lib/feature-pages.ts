/**
 * The pages under /features/<slug>: one per feature, or per group of cards that belong together,
 * each saying what the feature is for, how to use it, where it stops, and opening the editor with
 * a drawing that shows it.
 *
 * Every page has to earn its place. A page that only restated its card would be the thin,
 * keyword-shaped page search engines discount and readers leave, so each says something a card
 * cannot: when it is the right tool, the steps, the limits, the questions people actually have.
 * Keep it true of the app — check a claim against the code before writing it.
 *
 * To add a page: add an entry here and its title and description to route-meta.json under
 * /features/<slug>. The client route, the build-time render and the sitemap all follow from this
 * list; a test fails if route-meta.json and this list disagree.
 *
 * Copy is whole sentences, never assembled from fragments, so each can be translated as written.
 * `backticks` mark code.
 */

export interface FeatureImage {
  /** Under /screenshots. Shown full size in the column. */
  src: string;
  /** Doubles as the caption: a sentence about what the picture shows. */
  alt: string;
  /** The file's pixel size, so the page reserves its box before it loads. A test checks it. */
  width: number;
  height: number;
  /** Set for a screenshot of part of the screen: it is shown at its own size, never stretched. */
  density?: number;
}

export interface FeatureSection {
  heading: string;
  paragraphs: string[];
  steps?: string[];
  image?: FeatureImage;
}

export interface FeaturePage {
  /** The URL is /features/<slug>. */
  slug: string;
  /** The page's heading. The <title> and description are in route-meta.json. */
  title: string;
  badge?: 'Pro';
  /** The opening paragraph: the job this does, before how it does it. */
  lead: string;
  /** A button that opens the editor on a drawing chosen to show the feature. */
  tryIt?: { label: string; svg: string; hint: string };
  sections: FeatureSection[];
  /** "Good to know": what it will not do, and what surprises people. */
  limits: string[];
  faq: { q: string; a: string }[];
  /** Other pages to read next, by slug. */
  related: string[];
}

/** The editor, opened on a drawing: the ?svg= link the editor reads when it loads. */
export function tryItHref(svg: string): string {
  return `/?svg=${encodeURIComponent(svg)}`;
}

// --- Sample drawings for the "Try it" buttons ----------------------------------------------

/** A small square logo: a gradient, a clip path, a few shapes — something worth exporting. */
const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8a5c"/>
      <stop offset="1" stop-color="#ffd27a"/>
    </linearGradient>
    <clipPath id="tile"><rect width="128" height="128" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#tile)">
    <rect width="128" height="128" fill="url(#sky)"/>
    <circle cx="64" cy="64" r="24" fill="#fff4d6"/>
    <path d="M-4 104 L36 60 L60 84 L84 58 L132 104 V132 H-4 Z" fill="#3b4a8c"/>
    <path d="M-4 110 Q32 100 64 110 T132 110 V132 H-4 Z" fill="#26346b"/>
  </g>
</svg>`;

/** Three boxes and their labels, coloured by one CSS rule: something to recolour and translate. */
const DIAGRAM = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="140" viewBox="0 0 440 140" font-family="sans-serif" font-size="15">
  <style>.box { fill: #e5e7eb; stroke: #334155; stroke-width: 2; }</style>
  <rect class="box" x="20" y="40" width="110" height="60" rx="10"/>
  <rect class="box" x="165" y="40" width="110" height="60" rx="10"/>
  <rect class="box" x="310" y="40" width="110" height="60" rx="10"/>
  <text x="75" y="75" text-anchor="middle">Order</text>
  <text x="220" y="75" text-anchor="middle">Payment</text>
  <text x="365" y="75" text-anchor="middle">Delivery</text>
  <path d="M130 70 H157 M275 70 H302" stroke="#334155" stroke-width="2"/>
  <path d="M157 64 L165 70 L157 76 Z M302 64 L310 70 L302 76 Z" fill="#334155"/>
</svg>`;

/** Nothing yet: room for a generated picture. */
const CANVAS = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"></svg>';

/** A button with space on its left, where an icon would go. */
const BUTTON = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80" font-family="sans-serif">
  <rect x="10" y="10" width="220" height="60" rx="30" fill="#2563eb"/>
  <text x="140" y="47" font-size="22" fill="white" text-anchor="middle">Settings</text>
</svg>`;

/** Colours written three ways, each of which gets a swatch in the editor. */
const COLOURS = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200" viewBox="0 0 360 200">
  <rect width="360" height="200" fill="#f8fafc"/>
  <circle cx="90" cy="100" r="60" fill="#e11d48"/>
  <circle cx="180" cy="100" r="60" fill="rgb(37, 99, 235)" fill-opacity="0.8"/>
  <circle cx="270" cy="100" r="60" fill="#16a34a" fill-opacity="0.8"/>
</svg>`;

/** Two plain shapes, with room to add more. */
const SHAPES = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect x="20" y="20" width="120" height="80" fill="#93c5fd"/>
  <circle cx="210" cy="120" r="50" fill="#fca5a5" stroke="#b91c1c"/>
</svg>`;

/** Overlapping, half-transparent circles: something to click, zoom and see through. */
const OVERLAP = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="230" viewBox="0 0 320 230">
  <g fill-opacity="0.6">
    <circle cx="120" cy="100" r="70" fill="#ef4444"/>
    <circle cx="200" cy="100" r="70" fill="#3b82f6"/>
    <circle cx="160" cy="160" r="50" fill="#f59e0b"/>
  </g>
</svg>`;

// --- The pages ---------------------------------------------------------------------------------

export const FEATURE_PAGES: FeaturePage[] = [
  {
    slug: 'export',
    title: 'Export as a picture, a favicon or code',
    lead: 'SVG is the right file for the web, but plenty of places will not take one: a slide, a document, an app store listing, a chat, a website\'s favicon. And when the drawing is going into code, it is often wanted as a data URI or a component rather than a file. The Download menu turns the drawing in the editor into each of these, and shows you the result before anything is saved or copied.',
    tryIt: {
      label: 'Try it with a sample logo',
      svg: LOGO,
      hint: 'Opens the editor with a small logo. Choose Download, then Image (PNG, WebP)… or Favicon and app icons….',
    },
    sections: [
      {
        heading: 'A picture: PNG or WebP',
        paragraphs: [
          '1× is the drawing\'s own size — what its width and height say, or its viewBox when it has neither — so a 24 px icon comes out as a 24 × 24 picture. The exact pixel size is shown before you save.',
          '2× and 3× are the same picture for sharp screens, such as phones and Retina laptops, where one point of layout is two or three real pixels. Pick several and they come together as one zip — `logo.png`, `logo@2x.png` and `logo@3x.png` — with the `<img srcset>` line that lets each screen load the one it needs.',
          'Custom takes any width and height. With the proportions locked, the other side follows as you type. Unlocked, the drawing is placed whole in a box of another shape — a square logo on a 1200 × 630 social card, say — and the position grid says where. It is never stretched or cropped.',
          'The background can be transparent, white or any colour. Copy image puts the picture on the clipboard instead of saving it, ready to paste into a chat, a document or a design tool.',
        ],
        image: {
          src: '/screenshots/28-export-image.png',
          alt: 'A square logo exported as a 1200 × 630 social card: with the proportions unlocked, the logo sits whole in the middle of the wider picture, on a white background.',
          width: 732, height: 1172, density: 1.5,
        },
      },
      {
        heading: 'Favicon and app icons',
        paragraphs: [
          'Favicon and app icons… makes the files a website\'s `<head>` points at: `favicon.ico` with 16, 32 and 48 pixel icons, `icon.svg`, the 180 pixel `apple-touch-icon.png` for iPhone home screens, and `icon-192.png` and `icon-512.png` for a web app manifest. Download `favicon.ico` on its own, or everything as a zip with `site.webmanifest` and the lines to paste into your page.',
          'The small sizes are previewed at their real size, which is where a detailed drawing turns to mush — better found out here than in a browser tab. A drawing that is not square is placed whole in the square, where the position grid says.',
          'iOS shows a transparent home-screen icon on black, so with Transparent chosen the iPhone icon alone gets a white background.',
        ],
        image: {
          src: '/screenshots/29-favicon-icons.png',
          alt: 'The favicon panel previews the logo at 16, 32 and 48 pixels and as an iPhone home-screen icon, and lists the lines to add to a page\'s <head>.',
          width: 732, height: 942, density: 1.5,
        },
      },
      {
        heading: 'Code: a data URI, CSS or a React component',
        paragraphs: [
          'Code (data URI, CSS, React)… shows the drawing in the form you are about to paste it into: the SVG markup itself; a data URI for an `<img src>` or a CSS `url()`; the same in Base64; a ready-made `background-image` declaration; or a React component.',
          'The component spells attributes the way React expects — `className`, `strokeWidth`, `xlinkHref` — turns style strings into objects, drops what drawing programs leave behind, such as comments and Inkscape markup, and passes its props on from the root, so it can be sized and styled where it is used.',
          'The code is shown with its length before it is copied — worth a look, since the data URI of a large drawing can be longer than you would want in a stylesheet. The form you used last is the one shown next time.',
        ],
        image: {
          src: '/screenshots/30-copy-as-code.png',
          alt: 'The same logo as a React component, ready to copy, with SVG, data URI, Base64 and CSS one click away.',
          width: 1002, height: 801, density: 1.5,
        },
      },
    ],
    limits: [
      'Text is drawn with the fonts on your computer, so a font the SVG names but does not include may come out differently in the picture. The panel says so when the drawing has text.',
      'Browsers do not load images or fonts from other websites when they draw an SVG as a picture, so those are left out of the export. Put them inside the SVG to be sure; the panel warns when a drawing loads any.',
      'The largest picture is 8192 pixels on a side and about 16.7 million pixels in all — the most every browser will draw. A larger request is scaled down to fit, and the panel says so.',
      'WebP is offered only where the browser can write it. Safari cannot, so there the choice is PNG.',
      'The picture is made in your browser. The drawing is not uploaded anywhere to export it.',
    ],
    faq: [
      {
        q: 'Why is there no JPEG?',
        a: 'JPEG cannot be transparent, and it blurs the sharp edges a drawing is made of. PNG keeps both, and WebP does the same in a smaller file.',
      },
      {
        q: 'Which size should I export for a website?',
        a: 'Often none: every browser shows SVG, and it stays sharp at any size and on any screen, so the .svg itself is usually the best file. Where a picture is needed, pick 1×, 2× and 3× together and use the `<img srcset>` line that comes in the zip.',
      },
      {
        q: 'Do I need an account?',
        a: 'No. Export works without signing in, and it is free.',
      },
      {
        q: 'My SVG has no xmlns attribute. Will it export?',
        a: 'Yes. SVG copied out of a web page often lacks the declarations a standalone SVG file needs. The editor\'s preview shows it anyway, and export reads it the same way.',
      },
    ],
    related: ['live-preview', 'save-and-share', 'code-editor'],
  },
  {
    slug: 'ai-chat',
    title: 'Edit SVG by describing the change',
    lead: 'Some changes are quicker to say than to make: recolour every box, translate the labels, add a title above the chart, make the outline thicker. Type what you want in the chat beside the editor, and the assistant reads your drawing, makes the change and shows it in the preview — then you keep it or throw it away. It works on any SVG, including one another AI wrote for you.',
    tryIt: {
      label: 'Try it with a small diagram',
      svg: DIAGRAM,
      hint: 'Opens a three-step diagram. Sign in for free, then ask "make the boxes light blue" or "translate the labels to German".',
    },
    sections: [
      {
        heading: 'How it works',
        paragraphs: [],
        steps: [
          'Open or paste your drawing in the editor. On a computer the chat is the AI Chat tab beside it; on a phone it sits under the preview.',
          'Describe the change in your own words — "make the circles red", "add a drop shadow to all text", "move the legend to the left".',
          'The assistant reads the drawing, works out what to change and proposes it with a one-line summary. The preview already shows the result.',
          'Accept keeps the change. Reject throws it away and puts your message back in the box, so you can say it differently.',
        ],
        image: {
          src: '/screenshots/23-structural-edits.png',
          alt: 'A diagram translated and recoloured from two requests in the chat, each proposal accepted in turn.',
          width: 1400, height: 760,
        },
      },
      {
        heading: 'A conversation, not a one-off',
        paragraphs: [
          'Each request builds on the last, and the assistant remembers the conversation, so "now a little darker" means what you would expect. Restore, above any earlier message, takes the drawing back to how it was at that point, and clicking an earlier message lets you change it and send it again.',
          'Replies stream in as they are written. On the models that think before answering, the reasoning shows while they work and folds away under Reasoning when the reply is done — useful when you want to know why it changed what it did.',
        ],
        image: {
          src: '/screenshots/27-streamed-reasoning.png',
          alt: 'A finished reply with its reasoning opened: before recolouring the boxes, the assistant worked out that their fill lives in the .box rule.',
          width: 1400, height: 760,
        },
      },
      {
        heading: 'What it can change',
        paragraphs: [
          'It works on the SVG code the way a careful person would: it looks up the elements it needs, reads the lines around them, and then changes an attribute, a CSS rule or a piece of text, adds or removes an element, or rewrites a part. Because it changes only what it has to, a recolour usually leaves the rest of the file — your formatting, ids and comments — as it was.',
          'A traced drawing often keeps several shapes of one colour in a single path, so a tree\'s trunk and leaves can be one shape. Asked to colour just the leaves, the assistant can split the path into its parts and colour each one, and it tells you which part it took for what.',
          'For a picture — an animal, a scene, a mascot — it can generate an image and trace it into shapes, and when you ask for a ready-made symbol it searches an icon library. Paste SVG code into the chat on its own and it simply opens in the editor, with no credits spent.',
        ],
        image: {
          src: '/screenshots/25-split-path.png',
          alt: 'A traced tree that was one shape, after asking for green leaves and a brown trunk: the path was split into its parts, and the reply says which parts it took for the leaves and which for the trunk.',
          width: 1400, height: 760,
        },
      },
      {
        heading: 'Models and credits',
        paragraphs: [
          'Every request costs credits, and how many depends on the model. A free account gets 30 credits a month and the free models: gpt-5.4-mini, the default, costs 3 credits a request, and gpt-5.4-nano costs 1. Pro adds larger models from OpenAI and Anthropic, such as claude-sonnet-5 at 20 credits, and 1,000 credits a month.',
          'A request is charged once, however many steps the assistant takes to finish it, and a request that fails costs nothing. Some models also let you choose their thinking effort: lower is quicker for a simple change, higher is more careful with a complicated one.',
        ],
        image: {
          src: '/screenshots/21-model-picker.png',
          alt: 'The model picker, grouped into free and Pro models, with the credits each request costs.',
          width: 2160, height: 1350,
        },
      },
    ],
    limits: [
      'The assistant needs a free account. You can type your message before signing in; it is sent as soon as you have.',
      'It reads the code, not the picture. For "the shape on the left" it works out from coordinates what is on the left, and says so when it had to guess.',
      'Exact geometry is where it is weakest: "make the line 25 px longer" or "line these up exactly" can come back close rather than exact. For that, change the numbers in the code.',
      'In a very large drawing the assistant reads the parts it needs rather than the whole file. Embedded images and fonts are passed over and kept exactly as they are; it cannot see inside them.',
      'On the free plan, a conversation that grows very long asks you to start a new chat on the drawing.',
      'A change waits for you: until you accept or reject it, the next message cannot be sent.',
    ],
    faq: [
      {
        q: 'Is it free?',
        a: 'A free account gets 30 credits every month — about ten requests with the default model. More credits come in packs, or with Pro.',
      },
      {
        q: 'Can it break my file?',
        a: 'Nothing changes until you accept it, and Restore takes the drawing back to any earlier point in the conversation. A change that would leave the SVG broken is flagged in red, with rejecting it marked as the safe choice.',
      },
      {
        q: 'Does it work on SVG from ChatGPT or another tool?',
        a: 'Yes. It works on any SVG: paste it into the editor, or into the chat on its own, and then ask for the change.',
      },
      {
        q: 'Which model should I choose?',
        a: 'Start with the default. If a change needs more care — a busy drawing, several steps at once — try a larger model or a higher effort.',
      },
    ],
    related: ['ai-images', 'icon-search', 'code-editor'],
  },
  {
    slug: 'ai-images',
    title: 'Generate a picture and trace it into SVG',
    lead: 'Some drawings are easier to describe than to build from shapes: a fox asleep in ferns, a mascot, a sticker. Ask for one in the chat and the assistant generates a picture, then traces it into SVG paths in your browser — a real vector drawing, whose shapes you can recolour, move or delete like any other.',
    tryIt: {
      label: 'Open an empty canvas',
      svg: CANVAS,
      hint: 'Sign in for free, then ask in the chat for a picture — for example "a cute fox asleep in ferns".',
    },
    sections: [
      {
        heading: 'How it works',
        paragraphs: [],
        steps: [
          'Ask for a picture in the chat: "a cute kitten", "a logo for a coffee shop", "a rocket sticker".',
          'The assistant asks before it spends anything: "This looks like a picture. Generate it?" Generating costs the image model\'s credits, 10 on the free plan; drawing it with shapes instead costs nothing extra, but comes out much simpler.',
          'The picture is generated, which usually takes 30 to 60 seconds, and traced into SVG shapes in your browser.',
          'Adjust the tracing if you like, then Accept to put the drawing into the editor.',
        ],
        image: {
          src: '/screenshots/11-image-generation.png',
          alt: 'Asked to draw a cute kitten, the assistant generated a picture and traced it: the SVG is in the preview, and the chat shows the original picture, the tracing settings, and Accept and Reject.',
          width: 1400, height: 900,
        },
      },
      {
        heading: 'Tuning the trace',
        paragraphs: [
          'The tracer turns each area of colour into a path. Colors sets how many colour levels it keeps, from 1 to 8: fewer gives a cleaner, flatter drawing, more keeps detail. Speckle drops patches smaller than it, which clears away noise. Curve chooses between smooth splines, straight-edged polygons and pixel-exact outlines.',
          'More settings has the finer controls: the corner and splice angles, the segment length, colour precision, and whether shapes are stacked or cut out of one another. Every change traces the picture again in a moment, so it costs nothing to try. Once accepted, the card also offers Save raster image, which keeps the original picture.',
        ],
      },
      {
        heading: 'Changing the picture',
        paragraphs: [
          'Ask for a change to a generated picture — "give the cat a red bow", "make it night" — and the assistant can edit the picture itself and trace it again. Each change builds on the last one you accepted, and costs the same as generating.',
          'For a change of colour it does not regenerate anything: it recolours the traced shapes directly, which costs no image credits and leaves every other shape exactly as it was.',
        ],
        image: {
          src: '/screenshots/16-image-modification.png',
          alt: 'The generated kitten after asking for a red bow: the picture was edited and traced again, and the chat keeps both steps.',
          width: 1920, height: 945,
        },
      },
    ],
    limits: [
      'Pictures need a free account, and the image credits come on top of the chat request: 10 for the free image model, 30 or 50 for the Pro ones.',
      'The tracer keeps flat areas of colour, so photographs, soft gradients and fine texture come out posterised. Pictures are asked for in a flat, cel-shaded style, because that is what traces well.',
      'Pictures are generated at 1024 × 1024, with a transparent background.',
      'A traced picture is many paths, not a hand-built drawing with named parts. Recolouring regions works well; for "the tail" the assistant has to work out which shapes are which from where they are and how big.',
      'The image provider\'s content filter refuses some requests, well-known characters and brands most often. Describe what you want differently.',
    ],
    faq: [
      {
        q: 'Is the result really SVG?',
        a: 'Yes: paths with flat fills, which you can edit in the code here or in any vector program. The picture it was traced from can be saved too.',
      },
      {
        q: 'Why did I get a simple drawing instead of a picture?',
        a: 'Choosing "Draw it with shapes instead" skips the picture and has the assistant draw with SVG shapes directly. It costs nothing extra but is much simpler. Ask again and choose Generate picture.',
      },
      {
        q: 'Why are the colours flatter than I expected?',
        a: 'Colors starts at 4 levels. Raise it, and lower Speckle, to keep more detail; lower it for a cleaner, poster-like drawing.',
      },
    ],
    related: ['ai-chat', 'icon-search', 'export'],
  },
  {
    slug: 'icon-search',
    title: 'Icons from a library of 200,000',
    lead: 'When a drawing needs a familiar symbol — a gear, a cart, a star — there is no need to draw one. Ask for it in the chat, and the assistant searches over 200,000 open-source icons, shows you a choice, and puts the one you pick into your drawing as plain SVG.',
    tryIt: {
      label: 'Try it with a button',
      svg: BUTTON,
      hint: 'Opens a button with room on its left. Sign in for free, then ask "add a gear icon to the left of the text".',
    },
    sections: [
      {
        heading: 'How it works',
        paragraphs: [
          'Icon search is one of the assistant\'s tools rather than a separate screen, so you ask for an icon the way you would ask for any change. It searches the open icon sets behind Iconify — Tabler, Lucide, Material, Font Awesome, Phosphor, Fluent and many more — and shows up to 30 matches, a different set\'s take on each where it can.',
        ],
        steps: [
          'Ask in the chat — "add a star icon", "put a trash icon in the corner".',
          'Pick one from the choice offered. More icons… shows another batch, and None — generate instead has the assistant make a picture instead.',
          'The assistant inserts the icon, then sizes, places and colours it to fit your drawing, and proposes the change for you to accept.',
        ],
        image: {
          src: '/screenshots/13-icon-picker.png',
          alt: 'Asked for a star icon, the chat offers a grid of stars from different icon sets to pick from.',
          width: 1400, height: 900,
        },
      },
      {
        heading: 'Licences',
        paragraphs: [
          'Only icons whose licence asks for no attribution are offered — MIT, Apache 2.0, ISC, BSD, the Unlicense and CC0 — so what you insert can be used anywhere without a credit line. The icon goes in as SVG markup, not a link, so the drawing does not depend on anything outside it.',
        ],
      },
    ],
    limits: [
      'Like everything in the chat, icon search needs a free account, and costs the chosen model\'s usual credits for the request — 3 with the default model. The search itself adds nothing.',
      'The assistant places and sizes the icon from the coordinates in your drawing. If it lands not quite where you wanted, say so, or adjust its numbers in the code.',
    ],
    faq: [
      {
        q: 'Can I use the icons in a commercial project?',
        a: 'Yes. Only icons under licences that allow use without attribution are offered.',
      },
      {
        q: 'What if none of the icons fit?',
        a: 'Ask for more icons, describe it differently, or choose "None — generate instead" to have the assistant make a picture of it.',
      },
    ],
    related: ['ai-chat', 'ai-images', 'code-editor'],
  },
  {
    slug: 'code-editor',
    title: 'A code editor made for SVG',
    lead: 'An SVG is code, and the quickest way to understand or fix one is often to read it. The editor is Monaco — the editor inside VS Code — with the drawing beside it, so every change you type shows a moment later, and every shape you click in the picture takes you to its line.',
    tryIt: {
      label: 'Try it with a sample drawing',
      svg: COLOURS,
      hint: 'Opens three circles. Click a colour\'s swatch in the code to change it, press F1 for every editor command, or Shift+Alt+F to tidy the code.',
    },
    sections: [
      {
        heading: 'The editor',
        paragraphs: [
          'Everything people expect of a code editor is there: syntax highlighting, matching brackets, folding, find and replace with regular expressions (Ctrl+F, Ctrl+H), several cursors at once (Alt+click), and the Command Palette on F1 with every action the editor has. Alt+Z turns word wrap on and off, and is remembered. The editor follows the site\'s light or dark theme.',
          'Format Document (Shift+Alt+F) indents the markup two spaces a level. It leaves the code alone if it cannot be read as XML, or if formatting would change anything you can see — and every file you open is formatted that way to begin with, so a one-line SVG from a chatbot arrives readable.',
        ],
        image: {
          src: '/screenshots/01-editor-full.png',
          alt: 'The editor with the SVG code on the left and its live preview on the right.',
          width: 1400, height: 900,
        },
      },
      {
        heading: 'Colours you can see and pick',
        paragraphs: [
          'Every hex, `rgb()` or `hsl()` colour in the code gets a small swatch beside it. Click the swatch to open a picker; the colour you pick is written back in place, and clicking the top of the picker switches between hex, RGB and HSL.',
        ],
        image: {
          src: '/screenshots/04-color-completion.png',
          alt: 'An rgb() colour in the code with its swatch, and the colour picker open on it.',
          width: 1400, height: 900,
        },
      },
      {
        heading: 'Opening a drawing',
        paragraphs: [
          'Paste the code in, or use Open to load an .svg file from your computer; each file opens as a drawing of its own and keeps its name for downloading. A link can carry a drawing too: `editsvgcode.com/?svg=` followed by the markup opens it, and `?url=` followed by the address of an SVG file on the web opens that file.',
        ],
      },
    ],
    limits: [
      'Broken markup is not underlined in the code. The preview still draws what it can, the way a browser does, and a shape missing from the picture is usually the clue.',
      'Colour swatches appear for hex, `rgb()` and `hsl()` values, not for colour names such as `red`.',
      'On a phone the editor shows the preview and the chat, without the code, which does not fit a small screen. Open the drawing on a computer or tablet to edit its code.',
    ],
    faq: [
      {
        q: 'Do I need to install anything?',
        a: 'No. It runs in the browser, and needs no account to edit, preview or export.',
      },
      {
        q: 'Does it change my code without asking?',
        a: 'Only to indent it when a file is opened, and only when that changes nothing in the picture. Formatting never adds or removes a tag.',
      },
    ],
    related: ['autocomplete', 'live-preview', 'export'],
  },
  {
    slug: 'autocomplete',
    title: 'Autocomplete and documentation for every SVG element',
    lead: 'SVG has dozens of elements and hundreds of attributes, and nobody remembers which attributes `<feTurbulence>` takes or what `preserveAspectRatio` accepts. The editor knows: it suggests the elements allowed where you are typing, the attributes of the element you are in, and the values an attribute can have, and it explains any of them when you hover.',
    tryIt: {
      label: 'Try it with a sample drawing',
      svg: SHAPES,
      hint: 'Opens two shapes. Start a new line before </svg> and type < for the elements allowed there; inside a tag, press space for its attributes; hover over a name to read about it.',
    },
    sections: [
      {
        heading: 'Elements',
        paragraphs: [
          'Type `<` and the list shows the elements allowed inside the one you are in — inside `<filter>`, the filter primitives; inside `<linearGradient>`, `<stop>` and the animation elements. Pick one and it is written out with its closing tag, or as a self-closing tag when it takes no children. The list covers 82 elements, including the deprecated ones, which are struck through and sorted last.',
        ],
        image: {
          src: '/screenshots/02-autocomplete.png',
          alt: 'Typing < inside the drawing lists the SVG elements allowed there, each with a short description.',
          width: 1400, height: 900,
        },
      },
      {
        heading: 'Attributes and their values',
        paragraphs: [
          'Inside a tag, a space or Ctrl+Space lists the attributes that element takes — for `<rect>`, `x`, `y`, `width`, `height`, `rx` and the rest — leaving out the ones it already has. Choosing one writes `name=""` with the cursor between the quotes.',
          'Inside the quotes, attributes with a fixed set of values offer them: `stroke-linecap` gives butt, round and square. Colour attributes such as `fill` and `stroke` offer the named colours, `none` and `currentColor`, and `rgb()`, `hsl()` and `url()` templates. Inside a path\'s `d`, the 20 path commands come as templates with each number labelled.',
        ],
        image: {
          src: '/screenshots/03-attribute-completion.png',
          alt: 'Inside a <rect> tag, the list offers the attributes a rectangle takes.',
          width: 1400, height: 900,
        },
      },
      {
        heading: 'Documentation on hover',
        paragraphs: [
          'Hover over an element or attribute name to read what it does, with the values it accepts and a link to its full page on MDN. Over 700 element–attribute pairs have a description of their own.',
        ],
        image: {
          src: '/screenshots/02b-hover-tooltip.png',
          alt: 'Hovering over <circle> shows what the element is, with a link to read more.',
          width: 1400, height: 900,
        },
      },
    ],
    limits: [
      'The suggestions come from the SVG 1.1 schema with the SVG 2 additions browsers support, such as `href` and `feDropShadow`. Newer SVG 2 elements that browsers never shipped, like `mesh`, are not offered.',
      'Values are suggested inside double quotes. CSS inside a `<style>` element gets no suggestions.',
      'At the very top of an empty document nothing is offered: start with `<svg>`, and the suggestions begin inside it.',
    ],
    faq: [
      {
        q: 'Where do the descriptions come from?',
        a: 'From MDN\'s SVG reference, linked from each description so you can read the full page.',
      },
      {
        q: 'Can I open the list without typing?',
        a: 'Yes: Ctrl+Space opens it wherever you are.',
      },
    ],
    related: ['code-editor', 'live-preview', 'ai-chat'],
  },
  {
    slug: 'live-preview',
    title: 'Live preview, with click-to-code',
    lead: 'The drawing sits beside its code and redraws a moment after you stop typing. Click a shape in the picture and its code is selected; put the cursor in the code and its shape lights up. Zoom in on detail, and switch the background to see exactly what is transparent.',
    tryIt: {
      label: 'Try it with a sample drawing',
      svg: OVERLAP,
      hint: 'Opens three half-transparent circles. Click one to find its code, Ctrl+scroll to zoom, and switch the background to see what shows through.',
    },
    sections: [
      {
        heading: 'Click a shape, find its code',
        paragraphs: [
          'Click a shape in the preview and the editor selects its element; hovering highlights a shape before you click. It works the other way too: move the cursor in the code and the element under it glows in the picture, which is the quickest way to find out what a line draws. Ctrl+click picks several shapes.',
          'With a shape selected in the preview, Del removes its element from the code, and Ctrl+Z puts it back.',
        ],
        image: {
          src: '/screenshots/07-click-to-select.png',
          alt: 'A circle clicked in the preview, highlighted there, with its line selected in the code.',
          width: 1400, height: 900,
        },
      },
      {
        heading: 'Zoom and backgrounds',
        paragraphs: [
          'Zoom with the toolbar or with Ctrl and the scroll wheel, from 1% up to 5000% and beyond, keeping the middle of the view where it was. Fit to window shows the whole drawing, and the right mouse button drags the view around. A drawing larger than the pane is fitted when it opens.',
          'The background can be a light or a dark checkerboard, white or black. The checkerboards show what is transparent; the solid ones show how a drawing looks on a light or a dark page.',
        ],
        image: {
          src: '/screenshots/06-background-modes.png',
          alt: 'The same drawing on the four backgrounds: light checkerboard, dark checkerboard, white and black.',
          width: 2804, height: 1804,
        },
      },
      {
        heading: 'Safe to open anything',
        paragraphs: [
          'An SVG can carry scripts. The preview removes them, and event handlers and embedded HTML with them, before drawing — in the picture only. Your code, the saved file and every download stay exactly as you wrote them. A drawing\'s own CSS is kept, and is contained so it cannot restyle the page around it.',
          'A drawing with no viewBox, or with shapes outside its own bounds, is still shown whole, sized from what it actually draws.',
        ],
      },
    ],
    limits: [
      'Clicking selects the shape itself. To select a group, put the cursor on its tag in the code.',
      'The preview redraws 300 milliseconds after you stop typing, not on every key.',
      'The background choice resets when the page is reloaded.',
    ],
    faq: [
      {
        q: 'Why does my drawing show here but not in my app?',
        a: 'The preview reads markup the forgiving way a web page does, so an SVG missing its `xmlns` declaration, for example, still shows. A standalone .svg file or an <img> needs it. Exporting the drawing as a data URI adds what is missing.',
      },
      {
        q: 'Can a pasted SVG run code on the page?',
        a: 'No. Scripts and event handlers are removed before the preview draws it.',
      },
    ],
    related: ['code-editor', 'autocomplete', 'export'],
  },
  {
    slug: 'save-and-share',
    title: 'Save, share and publish to the gallery',
    lead: 'A drawing can stay in your browser, or go to the cloud with a link of its own: kept private, shared with whoever has the link, or published to the public gallery for anyone to find and start from. Saving needs no account; signing in, which is free, makes your drawings private and keeps them together.',
    tryIt: {
      label: 'Try it with a sample logo',
      svg: LOGO,
      hint: 'Opens a small logo. Save puts it in the cloud with a link of its own; Share then sets who can see it.',
    },
    sections: [
      {
        heading: 'Saving',
        paragraphs: [
          'Save stores the drawing in the cloud and moves it to an address of its own, which opens it again from anywhere. Without an account, a saved drawing is unlisted — anyone with its link can view it. Signed in with Google, GitHub or Microsoft, it is private until you choose otherwise.',
          'Until you save, your work is kept in this browser, so closing the tab loses nothing. When signed in, a drawing you have chatted about but not saved appears under Drafts on the Files page, ready to pick up where you left off.',
        ],
        image: {
          src: '/screenshots/22-files-drafts.png',
          alt: 'The Files page, with saved drawings above and the Drafts list of unsaved drawings with a chat below.',
          width: 2160, height: 1350,
        },
      },
      {
        heading: 'Who can see it',
        paragraphs: [
          'Once a drawing is saved, Share sets who can see it. Private: only you. Unlisted: anyone with the link. Publish to gallery…: listed in the public gallery for anyone to find. Copy link puts its address on the clipboard. The Files page lists every saved drawing with its views and downloads.',
        ],
        image: {
          src: '/screenshots/19-share-menu.png',
          alt: 'The Share menu with its three choices: Private, Unlisted and Publish to gallery.',
          width: 2160, height: 1350,
        },
      },
      {
        heading: 'The gallery',
        paragraphs: [
          'Publishing asks for a title and a short description — filled in for you, or suggested by AI for 1 credit — and releases the drawing under CC0 1.0, free for anyone to use, change and share, commercially too. You can unpublish it later, though copies already made stay free to use.',
          'Anyone browsing the gallery can open a drawing, read its code and the AI chat that made it, and press Start from this to get their own copy, chat included, to carry on from.',
        ],
        image: {
          src: '/screenshots/17-gallery.png',
          alt: 'The public gallery: drawings released under CC0, with a filter for titles and descriptions.',
          width: 2160, height: 1350,
        },
      },
    ],
    limits: [
      'Without an account, drawings are saved unlisted and cannot be made private. Sign in to choose who can see them.',
      'A published drawing is credited to its author by first name and initial, with their avatar.',
      'The gallery shows the 60 most recently published drawings.',
    ],
    faq: [
      {
        q: 'Is saving free?',
        a: 'Yes. Saving, sharing, the gallery and the Files page cost nothing; only the AI assistant uses credits.',
      },
      {
        q: 'What does CC0 mean for my drawing?',
        a: 'That you give up your copyright in it: anyone may use, change and share it, for any purpose, without asking or crediting you. Publish only drawings you are happy to give away.',
      },
    ],
    related: ['export', 'ai-chat', 'code-editor'],
  },
];

export function featurePage(slug: string): FeaturePage | undefined {
  return FEATURE_PAGES.find((p) => p.slug === slug);
}
