import { defineCollection, z } from 'astro:content';

// Pages collection (Home, About, etc.)
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['fr', 'en']),
  }),
});

// Project collection
const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['fr', 'en']),
  }),
});

// Principles collection (12 sustainability principles)
const principlesCollection = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['fr', 'en']),
  }),
});

// Legal collection (privacy, terms, cookies)
const legalCollection = defineCollection({
  type: 'content',
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
