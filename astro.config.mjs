// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployed as a GitHub Pages project site:
// https://lakmal-wijethunga.github.io/portfolio_site/
export default defineConfig({
  site: 'https://lakmal-wijethunga.github.io',
  base: '/portfolio_site',
  integrations: [sitemap()],
});
