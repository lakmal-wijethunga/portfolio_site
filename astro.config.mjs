// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployed on GitHub Pages under a custom domain, served from the root:
// https://lakmal.site/
export default defineConfig({
  site: 'https://lakmal.site',
  base: '/',
  integrations: [sitemap()],
  build: {
    // Hoist all component CSS into a single stylesheet — the whole site is
    // one page, so per-component chunks only add requests.
    inlineStylesheets: 'auto',
  },
});
