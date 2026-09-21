import seedData from '@content/seed/team.json';
import { publishedAssetPath, publishedExternalUrl } from '@lib/utils/media';
import type { TeamMember } from '@types';

export async function getTeamMembers(): Promise<TeamMember[]> {
  // Stage B: replace seedData with supabase.from('team_members').select('*').eq('is_published', true).
  const members = seedData as unknown as TeamMember[];

  return members
    .filter((member) => member.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((member) => ({
      ...member,
      // Reserved seed paths/URLs are dropped so the card renders its monogram instead of a
      // broken image, and omits the LinkedIn action instead of linking to a dead profile.
      photoPath: publishedAssetPath(member.photoPath),
      linkedinUrl: publishedExternalUrl(member.linkedinUrl),
    }));
}

export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  const members = await getTeamMembers();
  return members.find((member) => member.id === id);
}
