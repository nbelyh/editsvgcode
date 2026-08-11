/**
 * Build-time server entry: renders the static content routes to HTML so the
 * crawlers that never run JavaScript have something to read.
 *
 * Google renders JS and sees these pages already. This exists for the ones that
 * do not — GPTBot, ClaudeBot, PerplexityBot, and the social scrapers — which for
 * this site is not a rounding error: gemini.google.com sends more traffic than
 * Bing, and it is the only source still growing.
 *
 * Only the page is rendered, not <App>: the layout pulls in Firebase and the
 * runtime config, and `config.ts` reads `window.__CONFIG__` at module scope, so
 * importing it here would throw before anything rendered. The nav that <App>
 * draws is worth nothing to a crawler anyway — sitemap.xml lists those URLs.
 *
 * Pages that reach for Firebase or the runtime config are left out for the same
 * reason: /pricing (config, firebase/auth) and /gallery (firebase) still ship an
 * empty body. Adding them means giving those modules a server-side shim.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ImprintPage } from './pages/ImprintPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { SupportPage } from './pages/SupportPage';
import { TermsPage } from './pages/TermsPage';

/** Route path -> the component <Routes> mounts for it in main.tsx. Keep the two
 *  in step: a route rendered here that main.tsx maps elsewhere would serve a
 *  crawler one page and a reader another, which is the definition of cloaking. */
const PAGES: Record<string, () => React.JSX.Element> = {
  '/about': AboutPage,
  '/blog': BlogPage,
  '/features': FeaturesPage,
  '/imprint': ImprintPage,
  '/privacy': PrivacyPolicyPage,
  '/refund-policy': RefundPolicyPage,
  '/support': SupportPage,
  '/terms': TermsPage,
};

export const SSR_ROUTES = Object.keys(PAGES);

/** Render one route's markup, or null if that route is not server-rendered. */
export function renderRoute(route: string): string | null {
  const Page = PAGES[route];
  if (!Page) return null;
  // StaticRouter because the pages call useLocation() through usePageMeta.
  // The effects that hook runs never fire server-side, which is what keeps it
  // from touching document.head here.
  // Both style blocks off: the provider otherwise prepends every Mantine custom
  // property and every responsive helper class, and a crawler that strips tags
  // reads those as page text — hundreds of words of font stacks and media
  // queries ahead of the real copy. The stylesheet the shell already links
  // carries them, and this markup is replaced the moment React mounts.
  const html = renderToString(
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      withCssVariables={false}
      withGlobalClasses={false}
    >
      <StaticRouter location={route}>
        <Page />
      </StaticRouter>
    </MantineProvider>,
  );
  return html
    // Belt and braces: anything Mantine still chooses to inline is stripped, so
    // a future version quietly adding a third style block cannot put CSS back
    // into the text a crawler reads.
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // This markup paints before the bundle has run, so its <img>s would start
    // fetching ahead of the JavaScript — fifteen screenshots on /features
    // competing with the thing that replaces them. Same pictures either way and
    // the cache serves the second ask, so the only question is what loads
    // first; deferring here costs a crawler nothing and leaves the app's own
    // render exactly as it was.
    .replace(/<img (?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async" ');
}
