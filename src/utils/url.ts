/**
 * Prefix a public/ asset path with the configured base path
 * (the site deploys under /portfolio_site/ on GitHub Pages).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\//, '')}`;
}
