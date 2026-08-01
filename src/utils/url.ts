/**
 * Prefix a public/ asset path with the configured base path
 * (currently '/', since the site is served from lakmal.site's root).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\//, '')}`;
}

/**
 * Resolve a section anchor for the page it is rendered on.
 *
 * The nav is a list of bare hashes (`#about`), which only works on the
 * homepage — from `/work/foo/` a bare `#about` points at a section that isn't
 * there. On any other page the hash is rewritten to `/#about` so it navigates
 * home and then scrolls.
 */
export function navHref(hash: string, pathname: string): string {
  const home = withBase('');
  const isHome = pathname === home || pathname === home.replace(/\/$/, '');
  return isHome ? hash : `${home}${hash}`;
}
