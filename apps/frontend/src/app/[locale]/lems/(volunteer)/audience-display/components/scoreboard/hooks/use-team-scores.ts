import { useMemo } from 'react';
import {
  compareRobotGameScores,
  getRobotGameHeadlineScore,
  getRobotGameRank,
  indexScoresByRound,
  RankingStrategy
} from '@lems/shared/utils';
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
  currentStage: string,
  roundCount: number,
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

    const rows = Array.from(teamsMap.values())
      .map(team => {
        const scores = indexScoresByRound(team.scoresByRound, roundCount);
        return {
          ...team,
          scores,
          maxScore: getRobotGameHeadlineScore(scores, rankingStrategy)
        };
      })
      .sort((a, b) => compareRobotGameScores(a.scores, b.scores, rankingStrategy));

    return rows.map(team => ({
      ...team,
      rank: getRobotGameRank(
        team.scores,
        rows.map(candidate => candidate.scores),
        rankingStrategy
      )
    }));
  }, [scoresheets, matches, currentStage, roundCount, rankingStrategy]);
};
