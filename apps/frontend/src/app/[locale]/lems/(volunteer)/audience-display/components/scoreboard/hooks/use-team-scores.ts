import { useMemo } from 'react';
import { compareRobotGameScores, getRobotGameHeadlineScore, RankingStrategy } from '@lems/shared/utils';
import type { Scoresheet, Match } from '../graphql';

/** Round-indexes scores for display, leaving missing rounds `undefined` (shown as "—"). */
const indexScoresByRound = (
  scoresByRound: Array<{ round: number; score: number }>,
  rankingRoundCount: number
): (number | undefined)[] => {
  const indexed = new Array<number | undefined>(Math.max(rankingRoundCount, 0)).fill(undefined);
  scoresByRound.forEach(({ round, score }) => {
    if (round >= 1 && round <= rankingRoundCount) {
      indexed[round - 1] = score;
    }
  });
  return indexed;
};

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
  currentStage: string,
  rankingRoundCount: number,
  rankingStrategy: RankingStrategy = 'max'
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
        scoresByRound: Array<{ round: number; score: number }>;
      }
    >();

    const relevantScoresheets = scoresheets.filter(s => s.stage === currentStage);

    relevantScoresheets.forEach(scoresheet => {
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
          scoresByRound: []
        });
      }

      const team = teamsMap.get(teamId)!;
      if (scoresheet.status === 'submitted' && scoresheet.data) {
        team.scoresByRound.push({ round: scoresheet.round, score: scoresheet.data.score });
      }
    });

    return Array.from(teamsMap.values())
      .map(team => {
        const scores = indexScoresByRound(team.scoresByRound, rankingRoundCount);
        return {
          ...team,
          scores,
          maxScore: getRobotGameHeadlineScore(scores, rankingStrategy)
        };
      })
      .sort((a, b) => compareRobotGameScores(a.scores, b.scores, rankingStrategy))
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [scoresheets, matches, currentStage, rankingRoundCount, rankingStrategy]);
};
