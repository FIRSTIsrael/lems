import { JudgingCategory } from '@lems/database';
import { hyphensToUnderscores, underscoresToHyphens } from '@lems/shared/utils';
import { rubrics } from '@lems/shared/rubrics';
import { FieldMetadata, MetricPerCategory, RoomMetricsMap, Team } from './types';

/**
 * Category abbreviations for field display labels.
 */
export const CATEGORY_ABBREVIATIONS = {
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
): Record<string, number> {
  const fields = buildFieldMetadata(category);
  const result: Record<string, number> = {};

  const categoryKey = hyphensToUnderscores(category) as
    | 'innovation_project'
    | 'robot_design'
    | 'core_values';

  const categoryMap = {
    innovation_project: team.rubrics.innovation_project,
    robot_design: team.rubrics.robot_design,
    core_values: team.rubrics.core_values
  } as const;

  if (categoryKey === 'core_values') {
    // For core-values, include both IP and RD fields with prefixes
    const ipFields = buildFieldMetadata('innovation-project').filter(f => f.coreValues);
    const rdFields = buildFieldMetadata('robot-design').filter(f => f.coreValues);

    ipFields.forEach(field => {
      const ipRubric = team.rubrics.innovation_project;
      const value = ipRubric?.data?.fields?.[field.id]?.value ?? 0;
      result[field.displayLabel] = value;
    });

    rdFields.forEach(field => {
      const rdRubric = team.rubrics.robot_design;
      const value = rdRubric?.data?.fields?.[field.id]?.value ?? 0;
      result[field.displayLabel] = value;
    });
  } else {
    // For IP/RD, include only their own fields
    fields.forEach(field => {
      const rubric = categoryMap[categoryKey];
      const value = rubric?.data?.fields?.[field.id]?.value ?? 0;
      result[field.displayLabel] = value;
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
  if ((category as string) === 'core_values') {
    const ipLabels = buildFieldMetadata('innovation-project')
      .filter(f => f.coreValues)
      .map(f => f.displayLabel);
    const rdLabels = buildFieldMetadata('robot-design')
      .filter(f => f.coreValues)
      .map(f => f.displayLabel);
    return [...ipLabels, ...rdLabels];
  }

  return buildFieldMetadata(category).map(f => f.displayLabel);
}
