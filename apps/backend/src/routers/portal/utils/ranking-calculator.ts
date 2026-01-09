import { WithId } from 'mongodb';
import { compareScoreArrays } from '@lems/shared/utils';
import { Scoresheet } from '@lems/database';
import db from '../../../lib/database';

export interface RankingData {
  rank: number;
  maxScore: number;
  scores: number[];
  scoresWithRounds: Array<{ round: number; score: number }>;
}

/**
 * Calculate robot game rankings for all teams in a division.
 * Uses compareScoreArrays to implement FLL ranking rules:
 * 1. Sort by highest score (descending)
 * 2. Tiebreaker: compare all scores element-by-element from highest to lowest
 * 3. Handle tied teams (same rank for identical score arrays)
 *
 * @param divisionId - The division ID
 * @returns Map of teamId -> RankingData
 */
export async function calculateRobotGameRankings(
  divisionId: string
): Promise<Map<string, RankingData>> {
  const scoresheets = await db.scoresheets.byDivision(divisionId).byStage('RANKING').getAll();

  const submitted = scoresheets.filter(
    (s): s is WithId<Scoresheet> => s.status === 'submitted' && s.data?.score != null
  );

  const teamScores = new Map<string, Array<{ round: number; score: number }>>();

  for (const scoresheet of submitted) {
    if (!teamScores.has(scoresheet.teamId)) {
      teamScores.set(scoresheet.teamId, []);
    }
    teamScores.get(scoresheet.teamId)!.push({
      round: scoresheet.round,
      score: scoresheet.data.score
    });
  }

  const teamMetrics = Array.from(teamScores.entries()).map(([teamId, scoresWithRounds]) => {
    const scores = scoresWithRounds.map(s => s.score);
    return {
      teamId,
      scores,
      maxScore: Math.max(...scores),
      scoresWithRounds
    };
  });

  teamMetrics.sort((a, b) => compareScoreArrays(a.scores, b.scores));

  // Assign ranks, handling ties
  let currentRank = 1;
  const rankingMap = new Map<string, RankingData>();

  for (let i = 0; i < teamMetrics.length; i++) {
    const metrics = teamMetrics[i];
    let rank = currentRank;

    // Check if tied with previous team (same score arrays)
    if (i > 0 && compareScoreArrays(metrics.scores, teamMetrics[i - 1].scores) === 0) {
      // Tied with previous team, use same rank
      rank = (rankingMap.get(teamMetrics[i - 1].teamId) || { rank: currentRank }).rank;
    }

    rankingMap.set(metrics.teamId, {
      rank,
      maxScore: metrics.maxScore,
      scores: metrics.scores,
      scoresWithRounds: metrics.scoresWithRounds
    });

    currentRank++;
  }

  return rankingMap;
}

/**
 * Get ranking data for a specific team in a division.
 * Convenience wrapper for single team lookup.
 *
 * @param divisionId - The division ID
 * @param teamId - The team ID
 * @returns RankingData or null if team has no submitted scoresheets
 */
export async function getTeamRankingData(
  divisionId: string,
  teamId: string
): Promise<RankingData | null> {
  const rankings = await calculateRobotGameRankings(divisionId);
  return rankings.get(teamId) ?? null;
}
