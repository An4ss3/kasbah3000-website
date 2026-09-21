import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localizedId = ({ entry }: { entry: string }) => entry.replace(/\.(?:md|mdx)$/, '');

// Pages collection (Home, About, etc.)
const pagesCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/pages',
    generateId: localizedId,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['fr', 'en', 'ar', 'de']),
  }),
});

// Project collection
const projectCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/project',
    generateId: localizedId,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['fr', 'en', 'ar', 'de']),
  }),
});

// Principles collection (12 sustainability principles)
const principlesCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/principles',
    generateId: localizedId,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    /** Lucide icon name from the frozen design system icon set (§8 of the design handoff). */
    icon: z.string().optional(),
    /**
     * Supporting photograph for the card and detail page. Optional on purpose: the design
     * handoff lists "principle illustrations ×6" as an asset still to be produced (§21), so
     * entries without a real photograph render without one rather than showing a substitute.
     */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    excerpt: z.string(),
    order: z.number(),
    lang: z.enum(['fr', 'en', 'ar', 'de']),
  }),
});

// About collection
const aboutCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/about',
    generateId: localizedId,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['fr', 'en', 'ar', 'de']),
  }),
});

// Legal collection (privacy, terms, cookies)
const legalCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/legal',
    generateId: localizedId,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    lastUpdated: z.date(),
    lang: z.enum(['fr', 'en', 'ar', 'de']),
  }),
});

export const collections = {
  pages: pagesCollection,
  project: projectCollection,
  principles: principlesCollection,
  about: aboutCollection,
  legal: legalCollection,
};
