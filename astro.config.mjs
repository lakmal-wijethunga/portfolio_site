// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployed as a GitHub Pages project site:
// https://lakmal-wijethunga.github.io/portfolio_site/
export default defineConfig({
  site: 'https://lakmal-wijethunga.github.io',
  base: '/portfolio_site',
  integrations: [sitemap()],
  build: {
    // Hoist all component CSS into a single stylesheet — the whole site is
    // one page, so per-component chunks only add requests.
    inlineStylesheets: 'auto',
  },
});
