import { WithId } from 'mongodb';
import {
  compareRobotGameScores,
  getRankingStrategy,
  getRobotGameHeadlineScore,
  getScoreboardRoundCount,
  indexScoresByRound
} from '@lems/shared/utils';
import { getEdition } from '@lems/shared/edition';
import { Scoresheet } from '@lems/database';
import db from '../../../lib/database';

export interface RankingData {
  rank: number;
  /** Headline robot-game score for the team's ranking strategy (max attempt or average). */
  maxScore: number;
  /**
   * Round-indexed scores (index `i` -> round `i + 1`).
   * `null` is a round that has not been scored and is excluded from the average.
   */
  scores: (number | null)[];
  scoresWithRounds: Array<{ round: number; score: number }>;
}

/**
 * Calculate robot game rankings for all teams in a division.
 * Uses compareRobotGameScores (edition-aware: max attempt for Founders, average of
 * scored matches for Future). Unscored rounds are blank and do not affect the average.
 * Identical score vectors share a rank.
 *
 * @param divisionId - The division ID
 * @returns Map of teamId -> RankingData
 */
export async function calculateRobotGameRankings(
  divisionId: string
): Promise<Map<string, RankingData>> {
  const division = await db.divisions.byId(divisionId).get();
  if (!division) {
    throw new Error(`Division not found: ${divisionId}`);
  }
  const divisionState = division.state;

  if (!divisionState?.field?.currentStage) {
    return new Map<string, RankingData>();
  }

  const strategy = getRankingStrategy(getEdition(division));
  const stage = divisionState.field.currentStage;
  const rankingRoundCount = await db.robotGameMatches.byDivision(divisionId).getRankingRoundCount();

  const scoresheets = await db.scoresheets.byDivision(divisionId).byStage(stage).getAll();

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
      score: scoresheet.data!.score
    });
  }

  const roundCount = getScoreboardRoundCount(
    stage,
    rankingRoundCount,
    submitted.map(scoresheet => scoresheet.round)
  );

  const teamMetrics = Array.from(teamScores.entries()).map(([teamId, scoresWithRounds]) => {
    const scores = indexScoresByRound(scoresWithRounds, roundCount).map(score => score ?? null);
    return {
      teamId,
      scores,
      maxScore: getRobotGameHeadlineScore(scores, strategy),
      scoresWithRounds
    };
  });

  teamMetrics.sort((a, b) => compareRobotGameScores(a.scores, b.scores, strategy));

  // Assign ranks, handling ties
  let currentRank = 1;
  const rankingMap = new Map<string, RankingData>();

  for (let i = 0; i < teamMetrics.length; i++) {
    const metrics = teamMetrics[i];
    let rank = currentRank;

    // Check if tied with previous team (same score arrays)
    if (
      i > 0 &&
      compareRobotGameScores(metrics.scores, teamMetrics[i - 1].scores, strategy) === 0
    ) {
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
