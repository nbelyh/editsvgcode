import { metaFor } from '../lib/route-meta';
import { DEFAULT_PRICING } from '../lib/pricing';

/**
 * What the home page says to a reader that cannot run JavaScript.
 *
 * The editor itself cannot be server-rendered — it is Monaco and a preview built
 * against the DOM — so "/" shipped an empty <div id="root"> and nothing else.
 * That is the one page every crawler and every assistant fetches: measured over
 * four weeks, ChatGPT-User asked for it 41 times, Perplexity 19, GPTBot 9 and
 * Googlebot 263, against one or two requests for the pages that do carry text.
 * All of them read a title, a description and no prose at all.
 *
 * So this sits in #root for them: a short description of what the page is, in
 * the same terms the page itself uses, and the links a crawler needs to find the
 * rest of the site. A browser never shows it — index.html hides it from anything
 * that runs JavaScript before the body is parsed, so readers see exactly what
 * they did before, and React replaces it on mount. It is a summary of the page,
 * never a different page: whatever is said here has to stay true of the editor,
 * or it is cloaking.
 */
export function HomeIntro() {
  return (
    // `home-intro` is what index.html hides from any browser that runs JavaScript, so a reader
    // never sees this flash before the editor: it is only ever read by what does not run JS.
    <main className="home-intro" style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
      <h1>Online SVG code editor</h1>
      <p>
        Paste SVG markup and it renders as you type. The code sits beside a live preview, so a
        drawing someone handed you — or one an AI assistant just wrote — can be looked at, fixed
        and exported without installing anything or creating an account.
      </p>
      <ul>
        <li>Live preview beside the markup, with zoom, fit-to-window and a choice of backgrounds for judging transparency.</li>
        <li>Schema-aware autocomplete, hover documentation and a colour picker, so attribute names are offered rather than remembered.</li>
        <li>Click a shape in the preview to select it in the code.</li>
        <li>An AI assistant that edits the drawing from a description — recolour, relabel, translate, add or remove a shape — and shows every change for you to accept or reject.</li>
        <li>Image generation traced into editable vector shapes, and a library of over 200,000 open-source icons.</li>
        <li>Export as SVG or PNG; sign in to keep drawings, share them by link, or publish them to the gallery.</li>
      </ul>
      <p>
        The editor is free and opens with no account. Signing in is free too and adds cloud storage
        and {DEFAULT_PRICING.freeMonthlyCredits} AI credits a month.
      </p>
      <nav>
        <p>
          <a href="/features">{metaFor('/features').title}</a>{' · '}
          <a href="/gallery">Gallery of published drawings</a>{' · '}
          <a href="/pricing">{metaFor('/pricing').title}</a>{' · '}
          <a href="/blog">What&rsquo;s new</a>{' · '}
          <a href="/about">About</a>{' · '}
          <a href="/support">Support</a>
        </p>
      </nav>
    </main>
  );
}
