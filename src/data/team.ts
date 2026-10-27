import type { TeamMember } from './types';

/**
 * Practitioner directory. Statements here are drawn from the Imela company
 * profile only. The previous website listed qualifications ("PhD in Clinical
 * Psychology", "15 years") that conflict with the company profile ("nearly a
 * decade of experience"), so qualifications stay unverified until Imela
 * confirms them. Never add credentials here without documentary verification.
 */
export const TEAM: TeamMember[] = [
  {
    slug: 'karen-mwangi',
    name: 'Karen Muthoni Mwangi',
    role: 'Founder & Lead Counsellor',
    bio: [
      'Karen is the founder of Imela Ventures and a seasoned counsellor and leader. Her work spans counselling individuals, couples and families, alongside corporate training, leadership development and employee support.',
      'She is known for tailoring her approach to the needs of each person she works with — a skilled communicator, a compassionate listener and a dedicated advocate for mental health and wellbeing.',
      "Karen's corporate training work includes programmes with organisations such as USAID Kenya, Katiba Institute, Brainwave Communications, Brown's Food Company and Parker Randall Consulting Eastern Africa.",
    ],
    areas: [
      'Individual counselling',
      'Couples counselling',
      'Family support',
      'Corporate training',
      'Leadership development',
      'Conflict resolution support',
    ],
    languages: null,
    formats: ['in_person', 'online'],
    qualifications: [],
    character: { variant: 'bloom', mood: 'hopeful', pose: 'wave', tone: 'butter', environment: 'sunrise' },
  },
];

export const TEAM_BY_SLUG: Record<string, TeamMember> = Object.fromEntries(TEAM.map((m) => [m.slug, m]));

export function getPractitioner(slug: string | undefined): TeamMember | undefined {
  return slug ? TEAM_BY_SLUG[slug] : undefined;
}
