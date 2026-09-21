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

export type EventType = 'webinar' | 'workshop' | 'visit' | 'conference';

/**
 * Registration state for an event.
 *
 * `announced` means the event exists but joining details are not published yet — the
 * interest form is still shown so people can be notified. Nothing here implies a
 * confirmed date; use `startsAt === null` for "date to be announced".
 */
export type RegistrationStatus = 'announced' | 'open' | 'closed' | 'full';

// Events and webinars
export interface EventItem {
  id: string;
  slug: string;
  type: EventType;
  title: LocalizedString;
  summary: LocalizedString;
  /** ISO 8601 start instant, or null when no date has been announced. */
  startsAt: string | null;
  /** Scheduled length in minutes, or null when not announced. */
  durationMinutes: number | null;
  /** IANA timezone used to present `startsAt`, or null when not announced. */
  timezone: string | null;
  /** Where the event happens (e.g. "Online"), or null when not announced. */
  location: LocalizedString | null;
  registrationStatus: RegistrationStatus;
  /**
   * External registration or joining URL. Empty string until the organisers publish one —
   * never fabricate a meeting link.
   */
  registrationUrl: string;
  /**
   * True for structural template entries that carry no confirmed factual detail. The UI
   * labels these explicitly so they are never mistaken for a scheduled event.
   */
  isPlaceholder: boolean;
  isPublished: boolean;
  sortOrder: number;
}
