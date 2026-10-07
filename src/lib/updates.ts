/**
 * The product updates shown on /blog — one entry per shipped change worth
 * telling people about, newest first.
 *
 * To publish an update: prepend one entry. Nothing else needs touching — both
 * the page and the prerendered <head> read from here.
 *
 * `version` is optional on purpose. Not every update lines up with a version
 * bump, and stamping an invented number on one would misdate the release
 * history. Set it only when package.json actually moved.
 *
 * Screenshots must show what the entry describes. An old picture of a screen
 * that has since changed is worse than no picture: reuse one only when the
 * feature in it is genuinely the thing being announced.
 */

import theAssistantLooks from './articles/the-assistant-looks.md?raw';

export type ChangeKind = 'new' | 'improved' | 'fixed';

export interface UpdateChange {
  kind: ChangeKind;
  /** A whole sentence, written out in full — never assembled from fragments. */
  text: string;
}

export interface UpdateImage {
  /** Full-size screenshot under /screenshots, opened when the picture is clicked. */
  src: string;
  /** Half-size version under /screenshots/thumbs — what the page itself loads. */
  thumb: string;
  /** What the picture shows. Doubles as the caption, so write it as a sentence
   *  a reader would want to read, not as a filename. */
  alt: string;
  /**
   * The pixel density a screenshot of part of the screen was taken at. Such a picture is shown
   * at its own size, here and when opened, and never stretched: scaled up, its small text blurs.
   */
  density?: number;
}

export interface Update {
  /** Stable kebab-case id. Also the anchor the entry can be linked to. */
  id: string;
  /** ISO calendar date, YYYY-MM-DD. */
  date: string;
  /** Headline, sentence case, no trailing period. */
  title: string;
  /** Only when this update matches a package.json version bump. */
  version?: string;
  /** Lead paragraph — say why the change matters before listing what changed. */
  summary: string;
  images?: UpdateImage[];
  changes: UpdateChange[];
  /** The full write-up, when one was published on the company blog. */
  readMoreUrl?: string;
  /**
   * A longer write-up in Markdown, shown on the update's own page between its summary and its
   * changes: the story behind a release, with pictures under /screenshots/articles/<id>/. Kept
   * in a file of its own under ./articles and imported raw.
   */
  article?: string;
}

/** Newest first — the order the page renders them in. */
export const UPDATES: Update[] = [
  {
    id: 'move-and-resize',
    date: '2026-10-07',
    title: 'Move and resize shapes in the preview',
    summary:
      'The preview could show you a shape\'s code and delete it, but moving or resizing anything meant editing numbers by hand. Now you can drag a shape to move it and drag its handles to resize it, and the change is written into the code the way you would write it yourself: a circle\'s cx and r, a rectangle\'s x and width, a traced path\'s translate. The rest of the file stays exactly as it was, and one Ctrl+Z undoes a whole drag.',
    images: [
      {
        src: '/screenshots/32-move-resize.png',
        thumb: '/screenshots/thumbs/32-move-resize.png',
        alt: 'The sun dragged across the sky and enlarged from a corner handle: it is still selected in the preview, and its line in the code now reads cx="334" cy="60" r="34".',
      },
    ],
    changes: [
      { kind: 'new', text: 'Drag a selected shape to move it, or one of the eight handles around it to resize it. Hold Shift to keep its proportions, and press Esc during a drag to put it back.' },
      { kind: 'new', text: 'The arrow keys move the selected shape by one unit, and by ten with Shift.' },
      { kind: 'new', text: 'Clicking walks into groups: the first click selects the whole group a shape belongs to, and each further click goes one level deeper, down to the shape itself.' },
      { kind: 'improved', text: 'Shapes without a position of their own, such as paths, groups and text, are moved and resized with a transform, and a second resize updates that transform instead of adding another.' },
      { kind: 'improved', text: 'Del removes exactly the selected element from the code, even when it shares a line with other elements.' },
      { kind: 'improved', text: 'Once the drawing is larger than the pane, Ctrl and the scroll wheel zoom toward the pointer, so the spot you are looking at stays under it instead of drifting away.' },
      { kind: 'fixed', text: 'In a file with markup commented out, clicking a shape could select a different element in the code.' },
      { kind: 'fixed', text: 'Zooming into a drawing sized 100% with no viewBox, as Visio exports are, now magnifies it instead of only making the canvas bigger.' },
    ],
  },
  {
    id: 'the-assistant-looks',
    date: '2026-10-07',
    title: 'The assistant can look at your drawing',
    article: theAssistantLooks,
    summary:
      'In a traced picture every shape is an unnamed path, so "make the hat red" had to be worked out from colours and coordinates, and the assistant could repaint the wrong brown. It can now look before it edits: your browser draws the picture with the shapes it suspects outlined in colour, and it changes the ones that sit on the part you named. Icons got a lot better too: they come in at a sensible size, an icon asked for on its own becomes the whole drawing, and brand logos are found rather than redrawn by hand.',
    images: [
      {
        src: '/screenshots/31-ai-looks.png',
        thumb: '/screenshots/thumbs/31-ai-looks.png',
        alt: 'What the assistant saw while looking for the glass of a magnifying glass: the whole drawing with four candidate shapes outlined and the rest faded, and a close-up of the lens.',
      },
    ],
    changes: [
      { kind: 'new', text: 'When the code does not say which unnamed shape is the part you mean, the assistant can look at the drawing: it outlines up to four shapes it suspects, each in its own colour, and edits the ones that sit on that part.' },
      { kind: 'new', text: 'An edit that leaves the drawing looking empty, such as white lettering left on a white page after the box behind it was removed, now says "Applied, but the drawing may look empty".' },
      { kind: 'improved', text: 'A picked icon comes in at a sensible size: about a quarter of the drawing in a corner, the height of the text beside a title, and within the shape it was put in.' },
      { kind: 'improved', text: 'Asked for an icon on an empty canvas or on the starter drawing, the assistant makes the icon the whole drawing.' },
      { kind: 'improved', text: 'Brand logos are found even when the search is narrowed to one icon style, so the assistant offers the real logo instead of drawing a look-alike.' },
      { kind: 'improved', text: 'Icon searches ask the icon library for far fewer files, so several searches in a row no longer leave the icons failing to load.' },
      { kind: 'improved', text: 'A part drawn in several shades, such as a ball with a highlight and a shadow, is more often recoloured as a whole.' },
      { kind: 'improved', text: 'Qwen 3.8 Flash now acts on requests it often answered with a question about what to change.' },
      { kind: 'fixed', text: 'Requests to the Qwen models no longer fail with an error.' },
    ],
  },
  {
    id: 'export',
    date: '2026-10-03',
    title: 'Export as a picture, a favicon or code',
    summary:
      'Download used to give you the .svg and nothing else, so a picture for a slide, a favicon for a site or the markup in the shape a web page wants meant taking the drawing to another tool. Download now opens a menu: the SVG file as before, a PNG or WebP picture at any size, a favicon with the app icons that go with it, or the drawing as code — a data URI, a CSS background or a React component. Each one is shown before anything is saved or copied, so what you get is what you saw.',
    images: [
      {
        src: '/screenshots/28-export-image.png',
        thumb: '/screenshots/thumbs/28-export-image.png',
        density: 1.5,
        alt: 'A square logo exported as a 1200 × 630 social card: with the proportions unlocked, the logo sits whole in the middle of the wider picture, on a white background.',
      },
      {
        src: '/screenshots/29-favicon-icons.png',
        thumb: '/screenshots/thumbs/29-favicon-icons.png',
        density: 1.5,
        alt: 'The favicon panel previews the logo at 16, 32 and 48 pixels and as an iPhone home-screen icon, and lists the lines to add to a page\'s <head>.',
      },
      {
        src: '/screenshots/30-copy-as-code.png',
        thumb: '/screenshots/thumbs/30-copy-as-code.png',
        density: 1.5,
        alt: 'The same logo as a React component, ready to copy, with SVG, data URI, Base64 and CSS one click away.',
      },
    ],
    changes: [
      { kind: 'new', text: 'Download opens a menu with four choices: the SVG file, an image, a favicon with app icons, or the drawing as code.' },
      { kind: 'new', text: 'Export a PNG or WebP picture at the drawing\'s own size, at 2× or 3× for sharp screens such as phones and Retina laptops, or at any width and height, on a transparent, white or coloured background — then save it, or copy it straight to the clipboard.' },
      { kind: 'new', text: 'Pick 1×, 2× and 3× together to get all three at once — logo.png, logo@2x.png and logo@3x.png — zipped with the <img srcset> line that lets each screen load the one it needs.' },
      { kind: 'new', text: 'Unlock the proportions to export into a box of another shape, such as a square logo on a 1200 × 630 social card, and choose where the drawing sits in it; it always stays whole and is never stretched.' },
      { kind: 'new', text: 'Make a favicon.ico with 16, 32 and 48 pixel icons, or download a zip with every icon a site links to — an SVG favicon, the iPhone home-screen icon and the 192 and 512 pixel icons for a web app manifest — together with the lines to paste into your page.' },
      { kind: 'new', text: 'Copy the drawing as SVG, a data URI, Base64, a CSS background or a React component, and read it before you copy it.' },
      { kind: 'improved', text: 'The size, background and form you chose last time are remembered, so someone who always wants the 2× and 3× set or a React component chooses it once.' },
      { kind: 'improved', text: 'An SVG copied out of a web page, which often lacks the declarations a standalone SVG needs, exports just as the preview shows it.' },
      { kind: 'improved', text: 'The panel warns when text may come out in a different font, or when the drawing loads images from other websites, which browsers leave out of an exported picture.' },
    ],
  },
  {
    id: 'open-from-a-link',
    date: '2026-09-29',
    title: 'Open a drawing straight from a link',
    summary:
      'An assistant that has just written SVG for you leaves it sitting in the chat, and the editor opens on its own starter drawing — so the markup has to be copied across by hand. A link can now carry the drawing instead: open editsvgcode.com/?svg= followed by the markup and it opens ready to edit, or point ?url= at an SVG file already on the web, such as a raw file on a code host. Either way it opens as a new drawing, the way opening a file from your computer does.',
    changes: [
      { kind: 'new', text: 'A link can carry a drawing: /?svg= followed by the markup opens it in the editor, ready to edit.' },
      { kind: 'new', text: '/?url= followed by the address of an SVG file on the web opens that file, as long as the site holding it lets a browser read it.' },
      { kind: 'improved', text: 'The free models now start at medium thinking effort rather than high, which makes an ordinary edit quicker; high and extra-high are still there in the picker whenever a change needs more thought.' },
      { kind: 'improved', text: 'Free accounts now get 30 AI credits a month rather than 50. Almost nobody reached the old limit, and the change keeps the assistant free for everyone rather than rationing it later.' },
    ],
  },
  {
    id: 'recolour-part-of-a-drawing',
    date: '2026-09-22',
    title: 'Recolour one part of a traced drawing',
    summary:
      'A traced drawing keeps every region of one colour in a single shape, so a tree\'s trunk and its leaves can be one path. Asked to colour the trunk, the assistant could only recolour that whole path, painting the leaves with it — and asked again, it did the same thing again. It can now see the separate parts inside a path, tell a trunk from a leaf by where each sits and how big it is, and give each part its own path and colour, without moving anything else. This release also makes the chat friendlier around the edges: pasted SVG code opens straight away, a dropped connection says what happened, and the assistant tells you when it had to guess.',
    images: [
      {
        src: '/screenshots/25-split-path.png',
        thumb: '/screenshots/thumbs/25-split-path.png',
        alt: 'A traced tree that was one black shape, after asking for green leaves and a brown trunk: the assistant looked inside the path, split it into its parts, and says which parts it took for the leaves and which for the trunk.',
      },
      {
        src: '/screenshots/26-pasted-svg.png',
        thumb: '/screenshots/thumbs/26-pasted-svg.png',
        alt: 'SVG code pasted into the chat opens in the editor at once: a sunset badge appears in the preview, with no request sent to the assistant.',
      },
    ],
    changes: [
      { kind: 'new', text: 'The assistant can colour part of a traced drawing — the leaves but not the trunk, the small dots but not the outline — by splitting the path that holds them into one path per part.' },
      { kind: 'new', text: 'It tells you which parts it took for what, since it cannot see the picture, so a wrong guess is easy to correct in the next message.' },
      { kind: 'new', text: 'Pasting SVG code into the chat opens it in the editor straight away, with no credit spent and no sign-in needed, and Restore brings back the drawing you had.' },
      { kind: 'improved', text: 'SVG pasted from other assistants with a mangled namespace, which browsers refuse to draw, is repaired as it opens.' },
      { kind: 'improved', text: 'When the connection drops before a reply arrives — most often when the app is left in the background on a phone — the chat says your drawing is unchanged and offers Retry, instead of showing "network error".' },
      { kind: 'improved', text: 'A request the AI provider\'s content filter blocks now comes with an explanation and a suggestion, instead of a raw error.' },
      { kind: 'improved', text: 'When the assistant can only approximate what you asked, or has to guess which shapes you meant, it says so alongside the edit instead of sending it without a word.' },
      { kind: 'fixed', text: '"Applied, but with no visible effect" now appears only when an edit really will not show on screen, and no longer on edits that removed or changed several shapes at once.' },
    ],
  },
  {
    id: 'streaming-replies',
    date: '2026-09-15',
    title: 'Replies stream in as they are written',
    summary:
      'A reply used to arrive all at once, after a wait with nothing to watch but "Thinking…" — long enough on a big drawing to wonder whether anything was happening. Replies now appear as they are written, the assistant\'s reasoning shows while it works, and each tool it calls is named as it starts.',
    images: [
      {
        src: '/screenshots/27-streamed-reasoning.png',
        thumb: '/screenshots/thumbs/27-streamed-reasoning.png',
        alt: 'A finished reply with its reasoning opened: before recolouring the boxes, the assistant worked out that their fill lives in the .box rule, and chose a blue that keeps the labels readable.',
      },
    ],
    changes: [
      { kind: 'new', text: 'Replies stream into the chat as the assistant writes them, and the tool it is calling is shown while it works.' },
      { kind: 'new', text: 'The assistant\'s reasoning is shown while it thinks, then folds away under a Reasoning toggle once the reply is done, for the rest of the session.' },
      { kind: 'new', text: 'On the free plan, a turn that goes wrong — an edit you reject, or an error — is kept for 90 days so we can see what failed and fix it; the privacy policy says what is kept, and Pro users can choose to share one from the thumbs-down.' },
      { kind: 'improved', text: 'Asking for scattered decoration, such as some random stars, draws them into the picture instead of opening the icon library.' },
      { kind: 'improved', text: 'Choosing a sample prompt puts the cursor in the message box, ready to send or add to.' },
      { kind: 'fixed', text: 'Drawings with an embedded photo no longer fail with "input exceeds the context window"; the assistant edits around the photo and keeps it intact.' },
      { kind: 'fixed', text: 'A Pro subscription that stops renewing now stays active until the end of the period that was paid for.' },
    ],
  },
  {
    id: 'claude-models',
    date: '2026-08-13',
    title: 'Claude joins the model picker',
    summary:
      'Three Claude models are now available to Pro subscribers. Claude Sonnet 5 is the one the picker offers by default, at twenty credits; Claude Haiku 4.5 is quicker and cheaper at five, and Claude Opus 5 is the strongest at thirty, both under "Show all". Sonnet and Opus take the same thinking-effort setting the gpt-5 models do, so you can ask for a quick answer on a small change and a careful one on a drawing that needs thinking about.',
    changes: [
      { kind: 'new', text: 'Claude Sonnet 5 joins the model picker for Pro subscribers at twenty credits, with Claude Haiku 4.5 at five and Claude Opus 5 at thirty under "Show all".' },
      { kind: 'new', text: 'Sonnet and Opus offer the low, medium, high and extra-high effort levels, with high as the starting point.' },
      { kind: 'improved', text: 'All three reuse the unchanging part of each request between messages, which is what keeps them at the credit prices shown rather than several times those.' },
    ],
  },
  {
    id: 'richer-generated-images',
    date: '2026-08-12',
    title: 'Generated pictures keep their detail',
    summary:
      'Some drawings the assistant writes as SVG itself; a picture of something — an animal, a scene, a logo — it generates as an image and then traces into shapes. On that second route, the instructions we send along with your words were working against you: they asked for the fewest possible colour regions and forbade fine detail, on the theory that simpler images trace more cleanly. They do — into something much plainer than you asked for. A fox curled asleep in ferns came back as a flat orange disc. Those instructions now ask for flat, cel-shaded colour instead of the least colour possible, and say nothing about how many colours to use, so a busy subject stays busy and a plain one stays plain.',
    images: [
      {
        src: '/screenshots/24-richer-generated-images.png',
        thumb: '/screenshots/thumbs/24-richer-generated-images.png',
        alt: 'The same three prompts before and after the change: the fox gains fur tones and depth where it was one flat orange shape, the cottage gains wood and shingles where it was flat yellow, and the tile fills out into a proper repeating pattern.',
      },
    ],
    changes: [
      { kind: 'improved', text: 'Generated pictures keep the detail the subject calls for — scenes, ornament and painterly styles no longer flatten into a few large blocks of colour.' },
      { kind: 'improved', text: 'Shading now comes through as a few flat tones per colour, so a drawing has depth without gaining the smooth blends that cannot be traced into shapes.' },
      { kind: 'improved', text: 'Nothing assumes a colour scheme on your behalf any more, so asking for an icon gives you a full-colour one and asking for a monochrome icon gives you a single-colour silhouette you can recolour in one edit.' },
      { kind: 'fixed', text: 'Two instructions that no image generator can act on have been dropped, freeing that space for describing the picture you actually want.' },
    ],
  },
  {
    id: 'structural-ai-editing',
    date: '2026-08-10',
    version: '2.1',
    title: 'The assistant edits shapes, not lines',
    summary:
      'Rewriting a line means retyping all of it, coordinates and all, so one slip moves a label — and the edit costs whatever that line is long, which on a traced path is thousands of characters. A minified drawing has no lines to address at all. The assistant can now write only what you asked to change instead, addressed by id, class or position: translating two hundred labels is one call to find them and one to rewrite them, and recolouring a traced drawing is a single edit. Line editing has not gone anywhere — it is still how the assistant works on a document that is mid-edit and not yet valid XML, where elements cannot be addressed at all.',
    images: [
      {
        src: '/screenshots/23-structural-edits.png',
        thumb: '/screenshots/thumbs/23-structural-edits.png',
        alt: 'Asking the assistant to translate a diagram and recolour it: it looks the labels up with query, rewrites them with set_text, and changes the fill once in the .box rule with set_style_rule.',
      },
    ],
    changes: [
      { kind: 'new', text: 'The assistant moves, restyles, duplicates and deletes shapes by identity rather than by line number, so edits no longer depend on how the file is formatted.' },
      { kind: 'new', text: 'Six new tools do that work: query to find out what is in the drawing, then set_text, set_attribute, set_style_rule, insert_element and remove_element to change it.' },
      { kind: 'improved', text: 'Recolouring a diagram exported from a design tool now changes the one rule in its style block, rather than trying to set a fill on each shape and appearing to do nothing.' },
      { kind: 'new', text: 'It can look through the drawing to answer questions such as "where is the text?" instead of replying that it cannot find anything.' },
      { kind: 'improved', text: 'Text split across several tspans is now recognised as one label, so asking to change wording works on drawings exported from design tools.' },
      { kind: 'improved', text: 'Selecting a shape in the preview tells the assistant which element you picked, and the badge names that element instead of showing raw path data.' },
      { kind: 'improved', text: 'When a turn runs out of tool calls the assistant says so and offers to carry on, rather than stopping as though it had finished.' },
      { kind: 'fixed', text: 'Saving a document immediately after opening it no longer erases its owner.' },
      { kind: 'fixed', text: 'Safari and other WebKit browsers no longer stall on half-loaded pages or hang while saving.' },
      { kind: 'fixed', text: 'New opens a genuinely new document instead of reusing the previous document id and showing a blank canvas.' },
      { kind: 'fixed', text: 'The preview sizes drawings measured in percent correctly, and no longer shows a scrollbar for a drawing that fits.' },
    ],
  },
  {
    id: 'faster-first-paint',
    date: '2026-08-01',
    title: 'A faster first paint, and a phone layout that behaves',
    summary:
      'Opening the editor used to mean watching "Loading…" while the code editor downloaded, and the page shifted about as pieces arrived. The first screen now shows your drawing straight away.',
    changes: [
      { kind: 'improved', text: 'The editor shows your document immediately and swaps in the full code editor once it has arrived, instead of holding the screen on a loading message.' },
      { kind: 'improved', text: 'Phones pick their layout before rendering, so they no longer download the desktop code editor at all.' },
      { kind: 'improved', text: 'The header no longer jumps as the logo decodes, and the advert sits below the fold on phones rather than pushing the drawing down.' },
      { kind: 'fixed', text: 'The editor opens even when signing in fails, instead of leaving you on an empty page.' },
      { kind: 'fixed', text: 'The cookie banner no longer sits on top of dialog buttons.' },
    ],
  },
  {
    id: 'public-gallery',
    date: '2026-07-31',
    title: 'A public SVG gallery',
    summary:
      'Drawings can now be published for everyone to see. Browse the gallery, open any entry to read its code — and its AI conversation — and clone it into a drawing of your own. Sharing grew from a single checkbox into three clear states.',
    images: [
      {
        src: '/screenshots/17-gallery.png',
        thumb: '/screenshots/thumbs/17-gallery.png',
        alt: 'The public gallery: a grid of shared SVG drawings with titles, authors and a filter box.',
      },
      {
        src: '/screenshots/19-share-menu.png',
        thumb: '/screenshots/thumbs/19-share-menu.png',
        alt: 'The Share menu offering the three visibility states: Private, Unlisted, and Publish to gallery.',
      },
      {
        src: '/screenshots/20-publish-dialog.png',
        thumb: '/screenshots/thumbs/20-publish-dialog.png',
        alt: 'The publish dialog asking for a title and description, with the CC0 terms and a Suggest with AI button.',
      },
      {
        src: '/screenshots/18-clone-with-chat.png',
        thumb: '/screenshots/thumbs/18-clone-with-chat.png',
        alt: 'A cloned gallery drawing opened as a draft, with the original AI conversation still in the sidebar.',
      },
    ],
    changes: [
      { kind: 'new', text: 'A public gallery of shared drawings, with a filter over titles and descriptions.' },
      { kind: 'new', text: 'Cloning a gallery entry gives you the drawing and the AI conversation that produced it, as a draft of your own.' },
      { kind: 'new', text: 'Sharing has three states — private, unlisted, and published to the gallery — chosen from a Share menu.' },
      { kind: 'new', text: 'Gallery entries are published under CC0 1.0, so anything you find there is yours to use.' },
      { kind: 'new', text: 'The publish dialog can write a title and description for you with AI, for one credit.' },
      { kind: 'improved', text: 'The Info tab says whose document you are looking at.' },
      { kind: 'improved', text: 'Every page carries its own title, description and canonical link, and the static pages are prerendered so they read correctly when shared or crawled.' },
    ],
    readMoreUrl: 'https://unmanagedvisio.com/editsvgcode-gallery-cloud-chat-and-new-models/',
  },
  {
    id: 'model-line-up',
    date: '2026-07-25',
    title: 'A rebuilt model line-up',
    summary:
      'The model picker had grown into a list of near-identical options. It now offers one model per price point, grouped into free and pro tiers, with the credit cost of a request shown next to each.',
    images: [
      {
        src: '/screenshots/21-model-picker.png',
        thumb: '/screenshots/thumbs/21-model-picker.png',
        alt: 'The model picker grouped into Free and Pro tiers, each model showing what a request costs in credits.',
      },
    ],
    changes: [
      { kind: 'new', text: 'The gpt-5.6 tiers are available, alongside Kimi-K2.6 on the free tier.' },
      { kind: 'improved', text: 'The picker is grouped into free and pro tiers and curated down to one model per price point.' },
      { kind: 'improved', text: 'Every model now reasons at high effort by default, which is the setting most edits benefit from.' },
      { kind: 'fixed', text: 'Declining an image modification no longer swallows the follow-up work the assistant had queued up.' },
    ],
    readMoreUrl: 'https://unmanagedvisio.com/editsvgcode-gallery-cloud-chat-and-new-models/',
  },
  {
    id: 'cloud-chat-history',
    date: '2026-07-19',
    title: 'Chat history moved to the cloud',
    summary:
      'AI conversations used to live in the browser, which meant they were gone if you switched device or cleared your data. They are now stored with your account, along with the drawing each message produced — so undo still works after a reload, and an unfinished drawing is waiting for you on the Files page.',
    images: [
      {
        src: '/screenshots/22-files-drafts.png',
        thumb: '/screenshots/thumbs/22-files-drafts.png',
        alt: 'The Files page with the new Drafts list, holding documents that have a conversation but were never saved.',
      },
    ],
    changes: [
      { kind: 'new', text: 'Conversations continue after a reload, and on another device.' },
      { kind: 'new', text: 'Drawings you never saved appear as drafts on the Files page instead of disappearing.' },
      { kind: 'new', text: 'Guests can write a prompt before signing in; the prompt is sent for you once you are in.' },
      { kind: 'improved', text: 'Undo is derived from the drawing attached to each message, so the history survives a reload.' },
      { kind: 'improved', text: 'Conversations made before this change are carried up from the browser the next time you open the document.' },
      { kind: 'fixed', text: 'Deleting a document deletes its conversation with it.' },
    ],
    readMoreUrl: 'https://unmanagedvisio.com/editsvgcode-gallery-cloud-chat-and-new-models/',
  },
  {
    id: 'ai-requires-sign-in',
    date: '2026-06-11',
    title: 'AI features now need an account',
    summary:
      'Anonymous AI use was being abused faster than it could be paid for. AI features now require signing in, and every account gets a free monthly allowance of credits. The editor itself stays free and needs no account at all.',
    changes: [
      { kind: 'new', text: 'Signing in is required before using the AI assistant or buying credits.' },
      { kind: 'improved', text: 'A warning appears while your credit balance is running low, rather than at the moment a request fails.' },
      { kind: 'improved', text: 'Every place an SVG is put on the page now goes through one sanitizer, closing the gaps where a crafted drawing could run script.' },
      { kind: 'improved', text: 'Signing in redirects rather than opening a popup, which the stricter browsers were blocking.' },
    ],
  },
  {
    id: 'editor-2-0',
    date: '2026-05-11',
    version: '2.0',
    title: 'A rebuilt editor with an AI assistant',
    summary:
      'The editor was rewritten from the ground up: a resizable live preview, schema-aware autocomplete drawn from the W3C SVG specification, and an AI assistant that edits your drawing from a plain-language instruction — or draws one from scratch and vectorizes it.',
    images: [
      {
        src: '/screenshots/01-editor-full.png',
        thumb: '/screenshots/thumbs/01-editor-full.png',
        alt: 'The rebuilt editor: SVG source on the left with syntax highlighting, live preview on the right.',
      },
      {
        src: '/screenshots/08-chat-conversation.png',
        thumb: '/screenshots/thumbs/08-chat-conversation.png',
        alt: 'The AI assistant answering a plain-language edit request and offering the change as a diff to accept or reject.',
      },
      {
        src: '/screenshots/11-image-generation.png',
        thumb: '/screenshots/thumbs/11-image-generation.png',
        alt: 'An image generated from a text prompt, shown beside the editable SVG the vectorizer produced from it.',
      },
      {
        src: '/screenshots/13-icon-picker.png',
        thumb: '/screenshots/thumbs/13-icon-picker.png',
        alt: 'Icon search results, ready to insert into the drawing as inline SVG paths.',
      },
    ],
    changes: [
      { kind: 'new', text: 'A rebuilt interface with a resizable live preview, a light and a dark theme, and a layout that works on a phone.' },
      { kind: 'new', text: 'An AI assistant that edits your drawing from a plain-language instruction and shows the change as a diff before you keep it.' },
      { kind: 'new', text: 'Image generation from a text prompt, vectorized in the browser into editable SVG paths.' },
      { kind: 'new', text: 'Search across open-source icon sets and insert an icon as inline paths, with no external dependency.' },
      { kind: 'new', text: 'Cloud storage for your drawings, with thumbnails and shareable links.' },
      { kind: 'improved', text: 'Autocomplete and hover documentation come from the W3C SVG specification, so they cover the whole element and attribute set.' },
      { kind: 'improved', text: 'Click an element in the preview to jump to its code, with a bounding box drawn around it.' },
    ],
    readMoreUrl: 'https://unmanagedvisio.com/editsvgcode-an-ai-powered-online-svg-editor/',
  },
];

/**
 * "10 August 2026".
 *
 * The parts are split by hand rather than handed to `new Date(iso)`: that parses
 * a bare YYYY-MM-DD as UTC midnight, which renders as the previous day for every
 * visitor west of Greenwich.
 */
export function formatUpdateDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** The page an update has to itself. /blog lists them; each one opens here. */
export function updatePath(update: Update): string {
  return `/blog/${update.id}`;
}

export function updateById(id: string): Update | undefined {
  return UPDATES.find(u => u.id === id);
}

/** Search engines show about this much of a description before cutting it off. */
const DESCRIPTION_LIMIT = 160;

/**
 * An update's own page title, description and share picture, taken from the entry itself, so
 * publishing an update stays one entry here and nothing else. The description is as many whole
 * sentences of the summary as fit, or the first one cut at a word if even that is too long.
 */
export function updateMeta(update: Update): { title: string; description: string; image?: string } {
  const sentences = update.summary.split(/(?<=[.!?])\s+/);
  let description = '';
  for (const sentence of sentences) {
    const next = description ? `${description} ${sentence}` : sentence;
    if (next.length > DESCRIPTION_LIMIT) break;
    description = next;
  }
  if (!description) {
    const cut = update.summary.slice(0, DESCRIPTION_LIMIT - 1);
    description = `${cut.slice(0, cut.lastIndexOf(' '))}…`;
  }
  return { title: update.title, description, image: update.images?.[0]?.src };
}
