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
}

/** Newest first — the order the page renders them in. */
export const UPDATES: Update[] = [
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
