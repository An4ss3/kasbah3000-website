import seedData from '@content/seed/events.json';
import type { EventItem } from '@types';

/**
 * Return published events.
 *
 * Stage B: replace seedData with
 * `supabase.from('events').select('*').eq('is_published', true)`.
 *
 * Events with `startsAt === null` have no announced date yet and are treated as upcoming so
 * they stay visible while the schedule is being confirmed.
 */
export async function getEvents(): Promise<EventItem[]> {
  const events = seedData as unknown as EventItem[];

  return events
    .filter((event) => event.isPublished)
    .sort((a, b) => {
      // Dated events first, soonest first; undated announcements after them.
      if (a.startsAt && b.startsAt) {
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      }
      if (a.startsAt) return -1;
      if (b.startsAt) return 1;
      return a.sortOrder - b.sortOrder;
    });
}

/** True when the event has no announced date, or its start is still in the future. */
export function isUpcoming(event: EventItem, now = new Date()): boolean {
  if (!event.startsAt) return true;
  return new Date(event.startsAt).getTime() >= now.getTime();
}

export async function getUpcomingEvents(now = new Date()): Promise<EventItem[]> {
  return (await getEvents()).filter((event) => isUpcoming(event, now));
}

export async function getPastEvents(now = new Date()): Promise<EventItem[]> {
  return (await getEvents())
    .filter((event) => !isUpcoming(event, now))
    .sort((a, b) => new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime());
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  return (await getEvents()).find((event) => event.slug === slug);
}
