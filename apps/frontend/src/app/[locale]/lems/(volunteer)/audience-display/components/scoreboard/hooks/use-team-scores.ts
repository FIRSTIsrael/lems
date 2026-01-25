import { useMemo } from 'react';
import { compareScoreArrays } from '@lems/shared/utils/arrays';
import type { Scoresheet, Match } from '../graphql';

export interface TeamScoreData {
  teamId: string;
  number: number;
  name: string;
  affiliation?: string;
  city?: string;
  logoUrl?: string;
  scores: (number | undefined)[];
  maxScore: number;
  rank: number;
}

export const useTeamScores = (
  scoresheets: Scoresheet[],
  matches: Match[],
  currentStage: string
): TeamScoreData[] => {
  return useMemo(() => {
    const teamsMap = new Map<
      string,
      {
        teamId: string;
        number: number;
        name: string;
        affiliation?: string;
        city?: string;
        logoUrl?: string;
        scores: (number | undefined)[];
        maxScore: number;
      }
    >();

    scoresheets
      .filter(s => s.stage === currentStage)
      .forEach(scoresheet => {
        const matchParticipant = matches
          .flatMap(m => m.participants)
          .find(p => p.team?.id === scoresheet.team.id);

        if (!matchParticipant?.team) return;

        const teamId = matchParticipant.team.id;
        if (!teamsMap.has(teamId)) {
          teamsMap.set(teamId, {
            teamId,
            number: matchParticipant.team.number,
            name: matchParticipant.team.name,
            affiliation: matchParticipant.team.affiliation,
            city: matchParticipant.team.city,
            logoUrl: matchParticipant.team.logoUrl,
            scores: [],
            maxScore: 0
          });
        }

        const team = teamsMap.get(teamId)!;
        if (scoresheet.status === 'submitted' && scoresheet.data) {
          team.scores.push(scoresheet.data.score);
          team.maxScore = Math.max(team.maxScore, scoresheet.data.score);
        } else {
          team.scores.push(undefined);
        }
      });

    return Array.from(teamsMap.values())
      .sort((a, b) => compareScoreArrays(a.scores, b.scores))
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [scoresheets, matches, currentStage]);
};
