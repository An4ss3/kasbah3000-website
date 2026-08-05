import seedData from '@content/seed/team.json';
import type { TeamMember } from '@types';

export async function getTeamMembers(): Promise<TeamMember[]> {
  // Stage B: replace seedData with supabase.from('team_members').select('*').eq('is_published', true).
  const members = seedData as unknown as TeamMember[];

  return members.filter((member) => member.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  const members = await getTeamMembers();
  return members.find((member) => member.id === id);
}
