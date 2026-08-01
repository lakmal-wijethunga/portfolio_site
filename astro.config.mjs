// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployed on GitHub Pages under a custom domain, served from the root:
// https://lakmal.site/
export default defineConfig({
  site: 'https://lakmal.site',
  base: '/',
  integrations: [
    sitemap({
      // The 404 is reachable but should never be a search result.
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        // The homepage is the entry point and changes most often; project
        // pages are the long-tail and are effectively static once published.
        if (item.url === 'https://lakmal.site/') {
          return { ...item, changefreq: 'weekly', priority: 1.0 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.8 };
      },
    }),
  ],
  build: {
    // Hoist all component CSS into a single stylesheet — the whole site is
    // one page, so per-component chunks only add requests.
    inlineStylesheets: 'auto',
  },
});
