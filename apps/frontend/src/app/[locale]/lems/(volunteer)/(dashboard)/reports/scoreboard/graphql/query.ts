import { gql, TypedDocumentNode } from '@apollo/client';
import { compareScoreArrays } from '@lems/shared/utils';
import type { QueryData, QueryVars, ScoreboardTeam } from './types';

export const GET_SCOREBOARD: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetScoreboard($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        divisionId
        currentStage
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

  // Build team rows
  const rows: ScoreboardTeam[] = teams.map(team => {
    const submitted = team.scoresheets.filter(
      s => s.status === 'submitted' && s.stage === currentStage
    );
    const scores = rounds.map(r => submitted.find(s => s.round === r)?.data?.score ?? null);
    const validScores = scores.filter((s): s is number => s !== null);

    return {
      id: team.id,
      number: team.number,
      name: team.name,
      scores,
      maxScore: validScores.length ? Math.max(...validScores) : null,
      rank: null
    };
  });

  // Sort by scores and assign ranks
  rows.sort((a, b) => {
    const scoresA = a.scores.filter((s): s is number => s !== null);
    const scoresB = b.scores.filter((s): s is number => s !== null);
    return compareScoreArrays(scoresA, scoresB);
  });

  let currentRank = 1;
  let lastRankedIndex = -1;

  rows.forEach((team, i) => {
    if (team.maxScore === null) return;

    const currScores = team.scores.filter((s): s is number => s !== null);

    if (lastRankedIndex === -1) {
      team.rank = currentRank;
    } else {
      const prev = rows[lastRankedIndex];
      const prevScores = prev.scores.filter((s): s is number => s !== null);
      const tied = compareScoreArrays(prevScores, currScores) === 0;
      team.rank = tied ? prev.rank : (currentRank = i + 1);
    }

    lastRankedIndex = i;
  });

  return rows.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
}
