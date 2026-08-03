/**
 * Content Types
 * Types for content collections (articles, gallery, FAQ, team, partners)
 * Matches Supabase schema (6 tables)
 */

import type { LocalizedString } from './common';

// Articles (Blog/News)
export interface Article {
  id: string;
  slug: string;
  type: 'article' | 'news' | 'press';
  category?: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  body: LocalizedString;
  coverPath?: string;
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Media Assets (Gallery)
export interface MediaAsset {
  id: string;
  type: 'photo' | 'video' | 'plan' | 'render' | 'drone';
  title: LocalizedString;
  album?: string;
  storage: 'supabase' | 'r2';
  path: string;
  posterPath?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
}

// FAQ
export interface FAQ {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
  sortOrder: number;
  isPublished: boolean;
}

// Team Members
export interface TeamMember {
  id: string;
  fullName: string;
  role: LocalizedString;
  bio: LocalizedString;
  photoPath?: string;
  linkedinUrl?: string;
  skills?: string[];
  sortOrder: number;
  isPublished: boolean;
}

// Partners
export interface Partner {
  id: string;
  name: string;
  category: 'academic' | 'corporate' | 'government' | 'ngo' | 'other';
  logoPath?: string;
  description: LocalizedString;
  websiteUrl?: string;
  sortOrder: number;
  isPublished: boolean;
}

// Principle (12 sustainability pillars)
export interface Principle {
  slug: string;
  title: LocalizedString;
  icon?: string; // Lucide icon name
  excerpt: LocalizedString;
  content: string; // Markdown content
  order: number;
}
