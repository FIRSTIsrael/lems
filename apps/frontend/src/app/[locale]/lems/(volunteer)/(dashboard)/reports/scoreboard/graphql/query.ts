import { gql, TypedDocumentNode } from '@apollo/client';
import {
  compareRobotGameScores,
  getRankingStrategy,
  getRobotGameHeadlineScore,
  getRobotGameRank,
  getScoreboardRoundCount,
  indexScoresByRound
} from '@lems/shared/utils';
import { getEdition } from '@lems/shared/edition';
import type { QueryData, QueryVars, ScoreboardTeam } from './types';

export const GET_SCOREBOARD: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetScoreboard($divisionId: String!) {
    division(id: $divisionId) {
      id
      futureEdition
      field {
        divisionId
        currentStage
        rankingRoundCount
      }
      teams {
        id
        number
        name
        scoresheets {
          id
          round
          stage
          status
          data {
            score
          }
        }
      }
    }
  }
`;

export function parseScoreboard(data: QueryData): ScoreboardTeam[] {
  if (!data.division) return [];

  const teams = data.division.teams;
  const currentStage = data.division.field?.currentStage || 'PRACTICE';
  const strategy = getRankingStrategy(getEdition({ futureEdition: data.division.futureEdition }));
  const rankingRoundCount = data.division.field?.rankingRoundCount ?? 0;

  const submittedByTeam = teams.map(team =>
    team.scoresheets.filter(s => s.status === 'submitted' && s.stage === currentStage && s.data)
  );
  const roundCount = getScoreboardRoundCount(
    currentStage,
    rankingRoundCount,
    submittedByTeam.flat().map(scoresheet => scoresheet.round)
  );

  const indexedScores = new Map(
    teams.map((team, index) => [
      team.id,
      indexScoresByRound(
        submittedByTeam[index].map(scoresheet => ({
          round: scoresheet.round,
          score: scoresheet.data?.score ?? 0
        })),
        roundCount
      )
    ])
  );

  const rows: ScoreboardTeam[] = teams.map(team => {
    const scores = (indexedScores.get(team.id) ?? []).map(score => score ?? null);
    const hasScore = scores.some(score => score != null);

    return {
      id: team.id,
      number: team.number,
      name: team.name,
      scores,
      maxScore: hasScore ? getRobotGameHeadlineScore(scores, strategy) : null,
      rank: null
    };
  });

  const ranked = rows.filter(team => team.maxScore !== null);
  const unranked = rows.filter(team => team.maxScore === null);
  ranked.sort((a, b) => compareRobotGameScores(a.scores, b.scores, strategy));
  ranked.forEach(team => {
    team.rank = getRobotGameRank(
      team.scores,
      ranked.map(candidate => candidate.scores),
      strategy
    );
  });

  return [...ranked, ...unranked];
}
