/**
 * Prefix a public/ asset path with the configured base path
 * (currently '/', since the site is served from lakmal.site's root).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\//, '')}`;
}
