# Portfolio — Lakmal Wijethunga (v3, "Atelier")

A ground-up redesign of the previous portfolio, built on the same stack (Astro 7,
content collections, Firebase like counters, Formspree, GitHub Pages) with all
content, imagery and video carried over unchanged.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321/portfolio_site
npm run build    # static output in dist/
npm run preview  # serve the built output
npm run check    # astro check — types + template diagnostics
```

`node_modules/` is not included; `npm install` restores it.

## What changed from v2

**Dual theme.** Light and dark are both first-class. Every colour is declared
once per theme in `src/styles/tokens.css` and consumed only through semantic
names (`--surface`, `--ink`, `--accent`), so no component contains a raw hex
value or a theme-specific override. The theme resolves from `localStorage` first
and `prefers-color-scheme` second, in an inline script in `<head>` — before first
paint, so there is no flash of the wrong theme. All fifteen text/background
pairings clear WCAG AA in both themes; the gold accent is darkened to `#a85f00`
in light mode to get there.

**Hero.** The render was a dimmed full-bleed background, which weakened both the
image and the headline. It now sits in a framed "viewport" panel — corner
brackets, a mono slate caption — so the artwork is presented as work, with the
headline owning its own column against a faint drafting grid.

**Project cards.** Title, category and tools are always visible in a caption
under the media. Previously they lived in a hover overlay, so touch users never
saw them at all. Cards also carry their modal content in `data-*` attributes
rather than having it scraped back out of the visible DOM, and the media area is
a single full-bleed `<button>` — which means the like, sound and slideshow
controls are siblings rather than buttons nested inside a `role="button"`.

**Work grid.** An equal-width grid — three up, then two, then one — with a sticky
filter bar carrying per-category counts and a live "showing N of M" readout.
Filtering uses the `hidden` attribute instead of inline `display`, so layout
stays in the stylesheet.

**Services.** Numbered rows instead of a card grid — the descriptions vary a lot
in length, and rows let each run to its natural size.

**Contact.** The email address is promoted to a large primary link; the form is
secondary. Fields have persistent visible labels rather than placeholder-only
hints, which disappear the moment someone starts typing.

**Structure.** The old single 1,766-line stylesheet is split into five files by
role. Site-wide content (contact details, socials, nav, services, toolkit) lives
in `src/data/site.ts` instead of being duplicated across components. Client code
is split into focused modules — `theme`, `slideshow`, `modal`, `likes` — behind
one `main.ts` entry.

## Layout

```
src/
  assets/            source images, optimized at build time
  components/        one component per section, plus Icon and ThemeToggle
  content/projects/  14 YAML files — the only place project data lives
  data/site.ts       contact details, socials, nav, services, toolkit
  layouts/           document shell: fonts, SEO, schema, theme bootstrap
  pages/index.astro  the single page
  scripts/           main, theme, slideshow, modal, likes
  styles/            tokens → base → components → portfolio → contact
public/
  documents/  CV        videos/  project videos        favicon, robots
```

## Adding a project

Drop a YAML file in `src/content/projects/`. The filename becomes the project id,
which is also the Firebase like-counter key — **renaming a file orphans its like
count**. The schema in `src/content.config.ts` is authoritative; the build fails
on anything that does not match it.

```yaml
title: Project Name
category: product # animations | environments | product | ai
order: 15 # ascending — controls position in the grid
tools: [Blender, Fusion 360]
description: >-
  One or two sentences. Clamped to three lines on the card, shown in full
  in the dialog.
media: # 1 video → video card | 1 image → still | 2+ → slideshow
  - { type: image, src: ../../assets/projects/my-project/01.png }
links:
  - label: Breakdown
    url: https://example.com
```

Categories are a fixed enum. Adding one means updating the enum in
`src/content.config.ts` plus `categories` and `categoryLabel` in
`src/data/site.ts`.

## Performance and accessibility notes

- Images are optimized to WebP at build time with per-breakpoint `srcset`; the
  hero is `fetchpriority="high"`, everything else is lazy.
- Videos use `preload="metadata"` and play only while on screen; they pause when
  the tab is hidden, so audio never plays in the background.
- Firebase (~100KB gzipped) is dynamically imported on `requestIdleCallback`, so
  it is not on the critical path. Counts read `…` until it lands.
- Icons are Font Awesome SVGs inlined at build time — no icon font, no CDN.
- Fonts are self-hosted via `@fontsource`.
- Scroll work is coalesced into one `requestAnimationFrame` per frame.
- `prefers-reduced-motion` disables reveals, slideshow autoplay, Ken Burns drift
  and smooth scrolling.
- The dialog traps focus, closes on `Escape` and restores focus to the element
  that opened it. Slideshow autoplay pauses on hover and on focus.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push
to `main`. `astro.config.mjs` sets `base: '/portfolio_site'` — served from a
different path, that value and the repo name must change together.

Firebase Realtime Database rules are in `firebase-rules.json`: everything is
locked except `likes`, which is publicly readable and can only ever hold a
non-negative number.
