import { JudgingCategory } from '@lems/types/judging';
import { underscoresToHyphens } from '@lems/shared/utils';
import { MAX_PICKLIST_LIMIT, PICKLIST_LIMIT_MULTIPLIER } from '@lems/shared';
import type { Team, MetricPerCategory } from '../types';
import type { JudgingDeliberation } from './graphql/types';

// Re-export constants for backward compatibility
export { MAX_PICKLIST_LIMIT, PICKLIST_LIMIT_MULTIPLIER };

/**
 * Category abbreviations for field display labels.
 */
const CATEGORY_ABBREVIATIONS = {
  'innovation-project': 'IP',
  'robot-design': 'RD',
  'core-values': 'CV'
} as const;

/**
 * Computes raw category scores and total score for a team.
 *
 * Category scores are the sum of all field values in that rubric.
 * For core-values, also includes sum of GP scores (default 3 if not present).
 * Total score is the sum of all three categories.
 *
 * @param team - The team to compute scores for
 * @returns TeamScores object with all category and total scores
 */
export const computeTeamScores = (team: Team): MetricPerCategory => {
  // Compute innovation-project score
  const ipRubric = team.rubrics.innovation_project;
  const ipScore = ipRubric?.data?.fields
    ? Object.values(ipRubric.data.fields).reduce((sum, field) => sum + (field.value ?? 0), 0)
    : 0;

  // Compute robot-design score
  const rdRubric = team.rubrics.robot_design;
  const rdScore = rdRubric?.data?.fields
    ? Object.values(rdRubric.data.fields).reduce((sum, field) => sum + (field.value ?? 0), 0)
    : 0;

  // Compute core-values score (rubric fields + GP scores)
  const cvRubricValues = getOrganizedRubricFields(team, 'core-values');
  const cvRubricScore = Object.values(cvRubricValues).reduce((sum, value) => sum + (value ?? 0), 0);
  const gpScoresSum = (team.scoresheets ?? []).reduce(
    (sum, scoresheet) => sum + (scoresheet.data?.gp?.value ?? 3),
    0
  );
  const cvScore = cvRubricScore + gpScoresSum;

  const totalScore = ipScore + rdScore + cvRubricScore;

  return {
    'innovation-project': ipScore,
    'robot-design': rdScore,
    'core-values': cvScore,
    'core-values-no-gp': cvRubricScore,
    total: totalScore
  };
};

/**
 * Computes room normalization metrics by aggregating team scores per room.
 *
 * Room metrics are used to normalize team scores based on the difficulty of their room.
 * This is computed by averaging scores of all teams in each room.
 *
 * @param teamScores - Array of TeamScores for all teams (parallel to teams array)
 * @param teams - Array of teams (provides room information)
 * @returns Map of room ID to RoomMetrics
 */
export function computeRoomMetrics(
  teamScores: MetricPerCategory[],
  teams?: Team[]
): RoomMetricsMap {
  const roomAggregates: Record<string, { scores: MetricPerCategory[]; count: number }> = {};

  teamScores.forEach((scores, index) => {
    const room = teams?.[index]?.judgingSession?.room;
    if (!room) return;

    if (!roomAggregates[room.id]) {
      roomAggregates[room.id] = { scores: [], count: 0 };
    }
    roomAggregates[room.id].scores.push(scores);
    roomAggregates[room.id].count++;
  });

  const result: RoomMetricsMap = {};

  Object.entries(roomAggregates).forEach(([roomId, { scores }]) => {
    const avgIP = scores.reduce((sum, s) => sum + s['innovation-project'], 0) / scores.length;
    const avgRD = scores.reduce((sum, s) => sum + s['robot-design'], 0) / scores.length;
    const avgCV = scores.reduce((sum, s) => sum + s['core-values'], 0) / scores.length;
    const avgCVNoGP = scores.reduce((sum, s) => sum + s['core-values-no-gp'], 0) / scores.length;
    const avgTotal = scores.reduce((sum, s) => sum + s.total, 0) / scores.length;

    result[roomId] = {
      avgScores: {
        'innovation-project': avgIP,
        'robot-design': avgRD,
        'core-values': avgCV,
        'core-values-no-gp': avgCVNoGP,
        total: avgTotal
      },
      teamCount: scores.length
    };
  });

  return result;
}

/**
 * Computes normalized scores using room normalization factors.
 *
 * Normalization formula: normalizedScore = rawScore * (divisionAvg / roomAvg)
 * This adjusts for room difficulty by comparing each room's average to the division average.
 *
 * @param scores - Raw team scores
 * @param roomMetrics - Room metrics map
 * @param roomId - The team's room ID (can be null/undefined)
 * @returns Object with normalized scores for each category and total
 */
export function computeNormalizedScores(
  scores: MetricPerCategory,
  roomMetrics: RoomMetricsMap,
  roomId?: string | null
): Record<JudgingCategory | 'total', number> {
  // If no room data, return raw scores
  if (!roomId || !roomMetrics[roomId]) {
    return {
      'innovation-project': scores['innovation-project'],
      'robot-design': scores['robot-design'],
      'core-values': scores['core-values'],
      total: scores.total
    };
  }

  // Compute division averages across all rooms
  const allRoomIds = Object.keys(roomMetrics);
  const divisionAvgIP =
    allRoomIds.reduce((sum, rid) => sum + roomMetrics[rid].avgScores['innovation-project'], 0) /
    allRoomIds.length;
  const divisionAvgRD =
    allRoomIds.reduce((sum, rid) => sum + roomMetrics[rid].avgScores['robot-design'], 0) /
    allRoomIds.length;
  const divisionAvgCV =
    allRoomIds.reduce((sum, rid) => sum + roomMetrics[rid].avgScores['core-values'], 0) /
    allRoomIds.length;
  const divisionAvgTotal =
    allRoomIds.reduce((sum, rid) => sum + roomMetrics[rid].avgScores.total, 0) / allRoomIds.length;

  const roomMetric = roomMetrics[roomId];

  // Apply normalization formula: normalized = raw * (divisionAvg / roomAvg)
  return {
    'innovation-project':
      scores['innovation-project'] * (divisionAvgIP / roomMetric.avgScores['innovation-project']),
    'robot-design': scores['robot-design'] * (divisionAvgRD / roomMetric.avgScores['robot-design']),
    'core-values': scores['core-values'] * (divisionAvgCV / roomMetric.avgScores['core-values']),
    total: scores.total * (divisionAvgTotal / roomMetric.avgScores.total)
  };
}

/**
 * Computes ranking for teams based on scores.
 *
 * Teams are ranked by score (descending). Tied teams receive the same rank,
 * and the next rank accounts for the number of tied teams.
 *
 * @param teamScores - The team's raw scores
 * @param allTeamScores - Scores for all teams (used for relative ranking)
 * @returns MetricPerCategory object with ranks for each category and total
 */
export function computeRank(
  teamScores: MetricPerCategory,
  allTeamScores: MetricPerCategory[],
  category: JudgingCategory | 'total' = 'total'
): number {
  const categoryKey = underscoresToHyphens(category) as
    | 'innovation-project'
    | 'robot-design'
    | 'core-values'
    | 'total';
  // Helper: compute rank by category
  const computeRankByCategory = (category: keyof MetricPerCategory, teamScore: number): number => {
    // Count how many teams have a higher score
    const higherScoreCount = allTeamScores.filter(ts => {
      const score = ts[category];
      return score > teamScore;
    }).length;
    return higherScoreCount + 1;
  };

  // return rank for given category
  return computeRankByCategory(categoryKey, teamScores[categoryKey]);
}

/**
 * Determines if a team is eligible for the picklist.
 *
 * A team is eligible if:
 * 1. It has arrived at the event
 * 2. It is not disqualified
 * 3. Its judging session status is 'completed'
 * 4. It is not already in the picklist
 *
 * @param team - The team to check
 * @param deliberation - The deliberation containing the picklist
 * @returns true if the team is eligible, false otherwise
 */
export function computeEligibility(team: Team, deliberation: JudgingDeliberation | null): boolean {
  if (!team.arrived) return false;

  if (team.disqualified) return false;

  if (!team.judgingSession?.status || team.judgingSession.status !== 'completed') {
    return false;
  }

  if (deliberation?.picklist.includes(team.id)) {
    return false;
  }

  return true;
}
