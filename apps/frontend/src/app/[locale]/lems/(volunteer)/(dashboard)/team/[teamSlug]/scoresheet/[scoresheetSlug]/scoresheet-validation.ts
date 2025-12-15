import { ScoresheetClauseValue, scoresheet, ScoresheetError } from '@lems/shared/scoresheet';
import type { ScoresheetData } from './graphql/types';

interface MissionValidationResult {
  missionId: string;
  isComplete: boolean;
  errors: string[];
}

export interface ScoresheetValidationResult {
  isComplete: boolean;
  score: number;
  missionErrors: Map<string, MissionValidationResult>;
  validatorErrors: string[];
  firstIncompleteMissionId?: string;
  firstErrorMissionId?: string;
}

function calculateScore(missions: Record<string, Record<number, ScoresheetClauseValue>>): number {
  let points = 0;

  scoresheet.missions.forEach(mission => {
    const missionData = missions[mission.id];
    if (!missionData) {
      return; // Skip if no data for this mission
    }
    const clauseValues = mission.clauses.map(
      (_, index) => (missionData[index] ?? null) as ScoresheetClauseValue
    );
    try {
      points += mission.calculation(...clauseValues);
    } catch {
      // Silently handle calculation errors, score will be partial
    }
  });

  return points;
}

function validateMission(
  missionId: string,
  missionData: Record<number, ScoresheetClauseValue>
): MissionValidationResult {
  const mission = scoresheet.missions.find(m => m.id === missionId);
  if (!mission) {
    return {
      missionId,
      isComplete: false,
      errors: []
    };
  }

  const errors: string[] = [];

  // Check if all clauses are filled
  const isComplete = mission.clauses.every((_, index) => {
    const value = missionData[index];
    return value !== undefined && value !== null;
  });

  // If not complete, don't run calculation
  if (!isComplete) {
    return {
      missionId,
      isComplete: false,
      errors
    };
  }

  // Try to calculate the score for this mission
  const clauseValues = mission.clauses.map(
    (_, index) => (missionData[index] ?? null) as ScoresheetClauseValue
  );

  try {
    mission.calculation(...clauseValues);
  } catch (error) {
    if (error instanceof ScoresheetError) {
      errors.push(error.id);
    }
  }

  return {
    missionId,
    isComplete,
    errors
  };
}

export function validateScoresheet(data: ScoresheetData): ScoresheetValidationResult {
  const missionsData = data.missions || {};
  const missionErrors = new Map<string, MissionValidationResult>();
  let firstIncompleteMissionId: string | undefined;
  let firstErrorMissionId: string | undefined;

  // Validate each mission
  scoresheet.missions.forEach(mission => {
    const missionData = missionsData[mission.id] || {};
    const result = validateMission(mission.id, missionData);
    missionErrors.set(mission.id, result);

    // Track first incomplete mission
    if (!firstIncompleteMissionId && !result.isComplete) {
      firstIncompleteMissionId = mission.id;
    }

    // Track first mission with errors
    if (!firstErrorMissionId && result.errors.length > 0) {
      firstErrorMissionId = mission.id;
    }
  });

  // Validate with global validators
  const validatorErrors: string[] = [];
  const validatorArgs: Record<string, Array<ScoresheetClauseValue>> = Object.fromEntries(
    scoresheet.missions.map(mission => [
      mission.id,
      mission.clauses.map(
        (_, index) => (missionsData[mission.id]?.[index] ?? null) as ScoresheetClauseValue
      )
    ])
  );

  for (const validator of scoresheet.validators) {
    try {
      validator(validatorArgs);
    } catch (error) {
      if (error instanceof ScoresheetError) {
        validatorErrors.push(error.id);
      }
    }
  }

  const score = calculateScore(missionsData);

  const allMissionsComplete = Array.from(missionErrors.values()).every(m => m.isComplete);
  const hasErrors =
    Array.from(missionErrors.values()).some(m => m.errors.length > 0) || validatorErrors.length > 0;
  const isComplete = allMissionsComplete && !hasErrors;

  return {
    isComplete,
    score,
    missionErrors,
    validatorErrors,
    firstIncompleteMissionId,
    firstErrorMissionId
  };
}
