import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Astro 7 deprecates re-exporting `z` from 'astro:content'; import it from
// 'astro/zod' instead so the schema keeps type-checking cleanly.
import { z } from 'astro/zod';

/**
 * Portfolio projects. One YAML file per project in src/content/projects/.
 *
 * The filename (minus .yaml) is the project id, used for the card's DOM id and
 * for the Firebase like counter — keep it stable, or the existing like count for
 * that project is orphaned.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(['animations', 'environments', 'product', 'ai', 'technical']),
      /** Display order in the grid (ascending). The lowest renders featured. */
      order: z.number(),
      description: z.string(),
      tools: z.array(z.string()).default([]),
      /**
       * One video  -> video card (plays only while on screen)
       * One image  -> single still
       * 2+ items   -> slideshow with arrows, dots and visibility-gated autoplay
       *
       * Image `src` paths are relative to the YAML file and are optimized at
       * build time. Video `src` paths are relative to public/ (e.g.
       * videos/x.mp4) and are served as-is.
       */
      media: z
        .array(
          z.discriminatedUnion('type', [
            z.object({ type: z.literal('image'), src: image(), alt: z.string().optional() }),
            z.object({ type: z.literal('video'), src: z.string() }),
          ])
        )
        .min(1),
      links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    }),
});

export const collections = { projects };
