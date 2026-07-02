# Lakmal Wijethunga — Portfolio

Personal portfolio of Lakmal Wijethunga, 3D Artist & Digital Creator.
Live at **https://lakmal-wijethunga.github.io/portfolio_site/**

Built with [Astro](https://astro.build). Images are optimized (responsive WebP)
at build time; project like counters use Firebase Realtime Database, loaded
lazily so it never blocks first paint.

## Development

```sh
npm install
npm run dev      # dev server at http://localhost:4321/portfolio_site
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Adding or editing a project

Each project is one YAML file in [`src/content/projects/`](src/content/projects/).
The filename is the project id — it's used for the Firebase like counter, so
renaming a file resets that project's likes.

```yaml
title: My Project
category: product        # animations | environments | product | ai
order: 15                # position in the grid (ascending)
tools: [Blender, Fusion 360]
description: >-
  What the project is and why it's interesting.
media:
  # 1 video -> video card, 1 image -> image card, 2+ items -> slideshow
  - { type: image, src: ../../assets/projects/my-project/01.png }
  - { type: video, src: videos/my-project.mp4 }
links: # optional
  - label: Breakdown
    url: https://example.com
```

- **Images** go in `src/assets/projects/<project-id>/` and are referenced with
  a relative path. Drop in full-resolution files — Astro generates optimized
  WebP variants at build time.
- **Videos** go in `public/videos/` and are referenced as `videos/<name>.mp4`
  (no leading slash). Keep them small (H.264, a few MB) — they are served
  as-is.

## Structure

```
src/
  assets/            images optimized at build time (hero, portrait, projects)
  components/        one .astro component per page section + Icon.astro
  content/projects/  one YAML file per portfolio project
  layouts/           BaseLayout.astro (head, SEO, structured data)
  pages/             index.astro (the single page)
  scripts/           main.ts (all interactions), likes.ts (Firebase, lazy)
  styles/            global.css (design tokens + all styling)
public/
  videos/            project videos, served as-is
  documents/         CV pdf
```

## Deployment

Pushes to `main` build and deploy automatically to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
One-time setup: in the repo's **Settings → Pages**, set *Source* to
**GitHub Actions**.

## Firebase like counters

`firebase-rules.json` contains the recommended Realtime Database rules —
everything locked down except public, non-negative `likes/<projectId>`
counters. Apply via Firebase console → Realtime Database → Rules.
