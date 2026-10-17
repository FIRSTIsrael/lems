import type { MissionValues, ScoresheetClauseValue, ScoresheetSchema } from './types';

export type CalculateScoresheetScoreResult = {
  total: number;
  missionScores: Record<string, number>;
  hasCalculationErrors: boolean;
  scoreOverridden: boolean;
  rawTotal: number;
};

function normalizeMissionValues(
  schema: ScoresheetSchema,
  missions: Record<string, Record<number, ScoresheetClauseValue>>
): MissionValues {
  return Object.fromEntries(
    schema.missions.map(mission => {
      const missionData = missions[mission.id];
      const clauseValues = mission.clauses.map(
        (_, index) => (missionData?.[index] ?? null) as ScoresheetClauseValue
      );
      return [mission.id, clauseValues];
    })
  );
}

export function calculateScoresheetScore(
  schema: ScoresheetSchema,
  missions: Record<string, Record<number, ScoresheetClauseValue>>
): CalculateScoresheetScoreResult {
  const missionValues = normalizeMissionValues(schema, missions);
  const missionScores: Record<string, number> = {};
  let rawTotal = 0;
  let hasCalculationErrors = false;

  for (const mission of schema.missions) {
    const missionData = missions[mission.id];
    if (!missionData) {
      continue;
    }
    const clauseValues = mission.clauses.map(
      (_, index) => (missionData[index] ?? null) as ScoresheetClauseValue
    );
    try {
      const score = mission.calculation(...clauseValues);
      missionScores[mission.id] = score;
      rawTotal += score;
    } catch {
      hasCalculationErrors = true;
    }
  }

  if (!hasCalculationErrors) {
    for (const validator of schema.validators) {
      try {
        validator(missionValues);
      } catch {
        // Validators affect completion only; stored score is unchanged.
      }
    }
  }

  let total = rawTotal;
  let scoreOverridden = false;

  // Always apply finalizeScore (e.g. Future 3+ penalties → 0), even on invalid/partial sheets.
  if (schema.finalizeScore) {
    total = schema.finalizeScore({
      missions: missionValues,
      missionScores,
      total: rawTotal
    });
    scoreOverridden = total !== rawTotal;
  }

  return {
    total,
    missionScores,
    hasCalculationErrors,
    scoreOverridden,
    rawTotal
  };
}
