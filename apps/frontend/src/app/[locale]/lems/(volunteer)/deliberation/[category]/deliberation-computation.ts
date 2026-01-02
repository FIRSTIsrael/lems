import { JudgingCategory } from '@lems/types/judging';
import { rubrics } from '@lems/shared/rubrics';
import { hyphensToUnderscores, underscoresToHyphens } from '@lems/shared/utils';
import type { Team, JudgingDeliberation } from './graphql/types';
import type { MetricPerCategory, RoomMetricsMap, FieldMetadata } from './types';

/**
 * Maximum picklist limit when using default formula.
 * Picklist cannot exceed 12 teams (Enforced only in the UI).
 */
export const MAX_PICKLIST_LIMIT = 12;

/**
 * Default multiplier for calculating picklist limit.
 * Picklist limit = min(12, ceil(teamCount * 0.35))
 */
export const PICKLIST_LIMIT_MULTIPLIER = 0.35;

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
  const cvRubric = team.rubrics.core_values;
  const cvRubricScore = cvRubric?.data?.fields
    ? Object.values(cvRubric.data.fields).reduce((sum, field) => sum + (field.value ?? 0), 0)
    : 0;
  const gpScoresSum = (team.scoresheets ?? []).reduce(
    (sum, scoresheet) => sum + (scoresheet.data?.gp?.value ?? 3),
    0
  );
  const cvScore = cvRubricScore + gpScoresSum;

  const totalScore = ipScore + rdScore + cvScore;

  return {
    'innovation-project': ipScore,
    'robot-design': rdScore,
    'core-values': cvScore,
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
    const avgTotal = scores.reduce((sum, s) => sum + s.total, 0) / scores.length;

    result[roomId] = {
      avgScores: {
        'innovation-project': avgIP,
        'robot-design': avgRD,
        'core-values': avgCV,
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

/**
 * Extracts and flattens rubric field values for grid display.
 *
 * For the current category, returns field values as a flat object.
 * For core-values category, also includes GP scores keyed as 'gp-{round}'.
 *
 * @param team - The team to extract fields from
 * @param categoryKey - The deliberation category (underscore-separated: e.g., 'core_values')
 * @returns Object with field IDs as keys and values as field values
 */
export function getFlattenedRubricFields(
  team: Team,
  categoryKey: 'innovation_project' | 'robot_design' | 'core_values'
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  const categoryMap = {
    innovation_project: team.rubrics.innovation_project,
    robot_design: team.rubrics.robot_design,
    core_values: team.rubrics.core_values
  } as const;

  const rubric = categoryMap[categoryKey];
  if (rubric?.data?.fields) {
    Object.entries(rubric.data.fields).forEach(([fieldId, fieldValue]) => {
      result[fieldId] = (fieldValue as unknown as { value: number | null }).value ?? null;
    });
  }

  // For core-values, add GP scores
  if (categoryKey === 'core_values') {
    (team.scoresheets ?? []).forEach(scoresheet => {
      result[`gp-${scoresheet.round}`] = scoresheet.data?.gp?.value ?? null;
    });
  }

  return result;
}

/**
 * Builds comprehensive field metadata for a given category.
 *
 * Returns an array of field metadata objects with:
 * - Field ID, category, section info
 * - Display label (e.g., 'IP-1', 'RD-5')
 * - Field number within category (1-10)
 *
 * @param category - The judging category (hyphenated: 'innovation-project', 'robot-design', 'core-values')
 * @returns Array of FieldMetadata objects, ordered by field number
 */
export function buildFieldMetadata(category: JudgingCategory): FieldMetadata[] {
  const categoryKey = underscoresToHyphens(category) as JudgingCategory;
  const abbreviation = CATEGORY_ABBREVIATIONS[categoryKey];

  const schema = categoryKey === 'core-values' ? rubrics['core-values'] : rubrics[categoryKey];

  const fields: FieldMetadata[] = [];
  let fieldNumber = 1;

  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      fields.push({
        id: field.id,
        category: categoryKey,
        sectionId: section.id,
        fieldNumber,
        displayLabel: `${abbreviation}-${fieldNumber}`,
        coreValues: field.coreValues ?? false
      });
      fieldNumber++;
    });
  });

  return fields;
}

/**
 * Extracts organized field values with metadata for a team in a specific category.
 *
 * Returns field values mapped by their display labels, ordered by field number.
 * For core-values category, includes both IP and RD fields with their respective prefixes.
 *
 * @param team - The team to extract fields from
 * @param category - The deliberation category (hyphenated)
 * @returns Object mapping display labels (e.g., 'IP-1') to field values
 */
export function getOrganizedRubricFields(
  team: Team,
  category: JudgingCategory
): Record<string, number | null> {
  const fields = buildFieldMetadata(category);
  const result: Record<string, number | null> = {};

  const categoryKey = hyphensToUnderscores(category) as
    | 'innovation_project'
    | 'robot_design'
    | 'core_values';

  const categoryMap = {
    innovation_project: team.rubrics.innovation_project,
    robot_design: team.rubrics.robot_design,
    core_values: team.rubrics.core_values
  } as const;

  if (category === 'core-values') {
    // For core-values, include both IP and RD fields with prefixes
    const ipFields = buildFieldMetadata('innovation-project');
    const rdFields = buildFieldMetadata('robot-design');

    ipFields.forEach(field => {
      const ipRubric = team.rubrics.innovation_project;
      const value = ipRubric?.data?.fields?.[field.id]?.value ?? null;
      result[field.displayLabel] = value;
    });

    rdFields.forEach(field => {
      const rdRubric = team.rubrics.robot_design;
      const value = rdRubric?.data?.fields?.[field.id]?.value ?? null;
      result[field.displayLabel] = value;
    });
  } else {
    // For IP/RD, include only their own fields
    fields.forEach(field => {
      const rubric = categoryMap[categoryKey];
      const value = rubric?.data?.fields?.[field.id]?.value ?? null;
      result[field.displayLabel] = value;
    });
  }

  return result;
}

/**
 * Extracts GP scores with formatted keys for a team.
 *
 * @param team - The team to extract GP scores from
 * @returns Object mapping 'GP-{round}' to score values
 */
export function getGPScores(team: Team): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  (team.scoresheets ?? []).forEach(scoresheet => {
    result[`GP-${scoresheet.round}`] = scoresheet.data?.gp?.value ?? null;
  });

  return result;
}

/**
 * Gets an ordered list of all field display labels for a category.
 *
 * Useful for building table columns in the correct order.
 *
 * @param category - The judging category
 * @returns Array of display labels (e.g., ['IP-1', 'IP-2', ...] or ['IP-1', ..., 'RD-1', ...])
 */
export function getFieldDisplayLabels(category: JudgingCategory): string[] {
  if (category === 'core-values') {
    const ipLabels = buildFieldMetadata('innovation-project').map(f => f.displayLabel);
    const rdLabels = buildFieldMetadata('robot-design').map(f => f.displayLabel);
    return [...ipLabels, ...rdLabels];
  }

  return buildFieldMetadata(category).map(f => f.displayLabel);
}
