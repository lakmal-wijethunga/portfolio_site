/**
 * URL and structured-data helpers.
 *
 * Everything here produces absolute URLs, because both canonical tags and
 * JSON-LD `@id` values must be absolute to be interpreted correctly.
 */
import { site, socials, toolkit, services } from '../data/site';

/**
 * Absolute, normalized URL for a page.
 *
 * Astro's static build emits `work/foo/index.html`, so the canonical form of
 * every route is a directory path with a trailing slash. `Astro.url.pathname`
 * is not consistent about that trailing slash between dev and build, and two
 * canonicals that differ only by a slash are two URLs to Google — so normalize
 * here rather than trusting the caller.
 */
export function absoluteUrl(pathname: string, siteUrl: URL | undefined): string {
  const base = siteUrl ?? new URL('https://lakmal.site');
  let path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // Leave real files (sitemap.xml, the CV pdf) alone; only directory-style
  // routes get the trailing slash.
  const isFile = /\.[a-z0-9]+$/i.test(path);
  if (!isFile && !path.endsWith('/')) path = `${path}/`;
  return new URL(path, base).href;
}

/** Stable `@id` for the one Person node, referenced from every other node. */
export const personId = (siteUrl: URL | undefined) => `${absoluteUrl('/', siteUrl)}#person`;

/**
 * The Person node. Defined once on every page and referenced by `@id`
 * elsewhere, so Google resolves one entity rather than one per page.
 */
export function personSchema(siteUrl: URL | undefined) {
  return {
    '@type': 'Person',
    '@id': personId(siteUrl),
    name: site.name,
    jobTitle: site.role,
    url: absoluteUrl('/', siteUrl),
    email: site.email,
    telephone: site.phoneHref,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mirigama',
      addressRegion: site.region,
      addressCountry: site.country,
    },
    knowsAbout: [...toolkit],
    sameAs: socials.map((s) => s.url),
    // What is actually for sale. Without this the entity reads as a person who
    // happens to know Blender rather than one who takes commissions.
    makesOffer: services.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.text,
        provider: { '@id': personId(siteUrl) },
      },
    })),
    workLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mirigama',
        addressRegion: site.region,
        addressCountry: site.country,
      },
    },
  };
}

/** Ties the domain to the Person so name searches resolve to this site. */
export function websiteSchema(siteUrl: URL | undefined) {
  return {
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/', siteUrl)}#website`,
    url: absoluteUrl('/', siteUrl),
    name: `${site.name} — ${site.role}`,
    inLanguage: 'en',
    publisher: { '@id': personId(siteUrl) },
  };
}

/**
 * Trim to `max` characters on a word boundary. Google truncates a description
 * around 155–160 characters, and a description cut mid-word in the SERP reads
 * as neglect.
 */
export function clamp(text: string, max = 158): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]$/, '')}…`;
}

/**
 * Compose a <title> that fits.
 *
 * Google renders roughly 60 characters before truncating, and some project
 * titles are long enough that "<title> — <category> | <name>" blows past it.
 * Rather than cutting mid-word, drop the least valuable part first: the
 * category, then the brand. The project name itself is the keyword and is only
 * ever clamped if it exceeds the budget on its own.
 */
export function pageTitle(subject: string, qualifier: string, max = 60): string {
  const candidates = [
    `${subject} — ${qualifier} | ${site.name}`,
    `${subject} | ${site.name}`,
    subject,
  ];
  return candidates.find((c) => c.length <= max) ?? clamp(subject, max);
}

/**
 * Meta description for a project.
 *
 * Project descriptions were written as on-page copy, so they run long (up to
 * 260 characters) and occasionally very short. Long ones get clamped; short
 * ones get discipline and tooling appended, because a 30-character description
 * gives Google nothing to match a query against.
 */
export function projectDescription(project: {
  description: string;
  category: string;
  tools: readonly string[];
  categoryLabel: string;
}): string {
  const base = project.description.trim().replace(/\s+/g, ' ');
  if (base.length >= 90) return clamp(base);

  const tools = project.tools.slice(0, 3).join(', ');
  const suffix = tools
    ? `${project.categoryLabel} by ${site.name}, built with ${tools}.`
    : `${project.categoryLabel} by ${site.name}.`;
  return clamp(`${base.replace(/[.…]+$/, '')} — ${suffix}`);
}

/** Trail of `{ name, path }`, innermost last. The current page needs no URL. */
export function breadcrumbSchema(
  trail: { name: string; path: string }[],
  siteUrl: URL | undefined
) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, siteUrl),
    })),
  };
}
