import { RefereeMatch } from './graphql';

export const hasTeamOnTable = (match: RefereeMatch, tableId: string): boolean => {
  const participant = match.participants.find(p => p.table.id === tableId);
  return !!participant?.team;
};

export const sortMatchesByTime = (matches: RefereeMatch[]): RefereeMatch[] => {
  return [...matches].sort(
    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );
};

interface ScoresheetRedirect {
  teamSlug: string;
  scoresheetSlug: string;
}

export const getUnscoredScoresheets = (
  sortedMatches: RefereeMatch[],
  tableId: string
): ScoresheetRedirect | null => {
  const completedMatchesWithPresence = sortedMatches
    .filter(match => match.status === 'completed')
    .filter(match => {
      const participant = match.participants.find(p => p.table.id === tableId);
      return participant?.present && participant?.team && participant.team.arrived;
    });

  for (const match of completedMatchesWithPresence) {
    const participant = match.participants.find(p => p.table.id === tableId && p.team);
    if (!participant?.team || !participant.team.arrived || !participant.present) continue;

    const scoresheet = participant.scoresheet;
    if (scoresheet && scoresheet.status !== 'submitted' && !scoresheet.escalated) {
      return {
        teamSlug: participant.team.slug,
        scoresheetSlug: scoresheet.slug
      };
    }
  }

  return null;
};
