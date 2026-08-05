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
    lang: z.enum(['fr', 'en']),
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
    lang: z.enum(['fr', 'en']),
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
    icon: z.string().optional(),
    excerpt: z.string(),
    order: z.number(),
    lang: z.enum(['fr', 'en']),
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
    lang: z.enum(['fr', 'en']),
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
    lang: z.enum(['fr', 'en']),
  }),
});

export const collections = {
  pages: pagesCollection,
  project: projectCollection,
  principles: principlesCollection,
  about: aboutCollection,
  legal: legalCollection,
};
