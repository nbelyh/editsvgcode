import data from './route-meta.json';

/**
 * Titles and descriptions for the routes whose content is fixed at build time.
 *
 * Kept in JSON rather than inline in each page because two consumers need it:
 * <PageMeta> at runtime, and scripts/prerender.cjs at deploy time, which bakes
 * these into per-route HTML so crawlers that do not run JS still get real tags.
 * A .cjs build script cannot import a .tsx page, and copy that lives in two
 * places drifts — so one file both can read.
 *
 * Routes NOT listed here are deliberate: `/` keeps the bare product title it
 * already ranks under, `/files` and `/profile` are signed-in and noindex, and
 * `/:fileId` takes its title from the drawing itself at runtime.
 */

export interface RouteMeta {
  title: string;
  description: string;
  /** Root-relative path to the share-card picture. Falls back to DEFAULT_IMAGE. */
  image?: string;
}

export const SITE_NAME: string = data.siteName;
export const DEFAULT_TITLE: string = data.defaultTitle;
export const DEFAULT_DESCRIPTION: string = data.defaultDescription;
export const DEFAULT_IMAGE: string = data.defaultImage;

const ROUTES: Record<string, RouteMeta> = data.routes;

export function metaFor(path: string): RouteMeta {
  const meta = ROUTES[path];
  if (!meta) throw new Error(`No route metadata for "${path}" — add it to route-meta.json`);
  return meta;
}
