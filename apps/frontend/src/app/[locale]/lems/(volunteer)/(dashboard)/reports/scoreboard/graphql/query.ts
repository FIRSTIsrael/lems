import { gql, TypedDocumentNode } from '@apollo/client';
import {
  compareRobotGameScores,
  getRankingStrategy,
  getRobotGameHeadlineScore
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

  // Get all submitted rounds
  const rounds = [
    ...new Set(
      teams.flatMap(t =>
        t.scoresheets
          .filter(s => s.status === 'submitted' && s.stage === currentStage)
          .map(s => s.round)
      )
    )
  ].sort((a, b) => a - b);
  // Use the division's configured ranking round count (not inferred from submitted sheets),
  // so missing/no-show rounds still pad correctly for ranking comparisons.
  const rankingRoundCount = data.division.field?.rankingRoundCount ?? 0;

  // Padded (round-indexed) score arrays per team, used only for ranking comparisons
  const comparisonScores = new Map<string, number[]>(
    teams.map(team => {
      const submitted = team.scoresheets.filter(
        s => s.status === 'submitted' && s.stage === currentStage
      );
      const padded = new Array(rankingRoundCount).fill(0);
      submitted.forEach(s => {
        if (s.round >= 1 && s.round <= rankingRoundCount) {
          padded[s.round - 1] = s.data?.score ?? 0;
        }
      });
      return [team.id, padded];
    })
  );

  // Build team rows
  const rows: ScoreboardTeam[] = teams.map(team => {
    const submitted = team.scoresheets.filter(
      s => s.status === 'submitted' && s.stage === currentStage
    );
    const scores = rounds.map(r => submitted.find(s => s.round === r)?.data?.score ?? null);

    return {
      id: team.id,
      number: team.number,
      name: team.name,
      scores,
      maxScore: submitted.length
        ? getRobotGameHeadlineScore(comparisonScores.get(team.id)!, strategy)
        : null,
      rank: null
    };
  });

  // Sort by scores and assign ranks
  rows.sort(
    (a, b) =>
      compareRobotGameScores(comparisonScores.get(a.id)!, comparisonScores.get(b.id)!, strategy)
  );

  let currentRank = 1;
  let lastRankedIndex = -1;

  rows.forEach((team, i) => {
    if (team.maxScore === null) return;

    if (lastRankedIndex === -1) {
      team.rank = currentRank;
    } else {
      const prev = rows[lastRankedIndex];
      const tied =
        compareRobotGameScores(
          comparisonScores.get(prev.id)!,
          comparisonScores.get(team.id)!,
          strategy
        ) === 0;
      team.rank = tied ? prev.rank : (currentRank = i + 1);
    }

    lastRankedIndex = i;
  });

  return rows.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
}
