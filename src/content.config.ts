import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Portfolio projects. One YAML file per project in src/content/projects/.
 * The filename (minus .yaml) is the project id, used for the DOM id and the
 * Firebase like counter — keep it stable or existing like counts are lost.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(['animations', 'environments', 'product', 'ai']),
      /** Display order in the grid (ascending). */
      order: z.number(),
      description: z.string(),
      tools: z.array(z.string()).default([]),
      /**
       * One video -> video card (plays only while on screen)
       * One image -> single image card
       * 2+ items  -> auto slideshow with arrows
       * Image src paths are relative to the YAML file and are optimized at
       * build time. Video src paths are relative to public/ (e.g. videos/x.mp4).
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
