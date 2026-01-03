import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { scoresheet, ScoresheetClauseValue } from '@lems/shared/scoresheet';
import { Scoresheet } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeScoresheetAccess, assertScoresheetEditable } from './utils';

type ScoresheetMissionClauseUpdatedEvent = {
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  clauseValue: ScoresheetClauseValue;
  score: number;
};

interface UpdateScoresheetMissionClauseArgs {
  divisionId: string;
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  value: ScoresheetClauseValue;
}

/**
 * Resolver for Mutation.updateScoresheetMissionClause
 * Updates a single mission clause value in a scoresheet
 */
export const updateScoresheetMissionClauseResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateScoresheetMissionClauseArgs,
  Promise<ScoresheetMissionClauseUpdatedEvent>
> = async (_root, { divisionId, scoresheetId, missionId, clauseIndex, value }, context) => {
  const { scoresheet: dbScoresheet, scoresheetObjectId } = await authorizeScoresheetAccess(
    context,
    divisionId,
    scoresheetId
  );
  const status = (dbScoresheet.status as string) || 'empty';
  assertScoresheetEditable(status, context.user?.role);

  const mission = scoresheet.missions.find(m => m.id === missionId);
  if (!mission) {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      `Mission ${missionId} not found in scoresheet schema`
    );
  }

  if (clauseIndex < 0 || clauseIndex >= mission.clauses.length) {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      `Invalid clause index ${clauseIndex} for mission ${missionId}`
    );
  }

  const clause = mission.clauses[clauseIndex];

  validateClauseValue(clause, value);

  // Calculate points
  const { data = {} } = dbScoresheet;
  data['missions'] ??= {};
  data['missions'][missionId] ??= {};
  data['missions'][missionId][clauseIndex] = value;
  const points = calculateScore(data['missions']);

  // Determine new status based on completion criteria
  const newStatus = determineScoresheetCompletionStatus(data);

  const updateFields: Record<string, unknown> = {
    [`data.missions.${missionId}.${clauseIndex}`]: value,
    'data.score': points
  };

  // Update status if it has changed
  const statusChanged = newStatus !== status;
  if (statusChanged) {
    updateFields['status'] = newStatus;
  }

  const result = await db.raw.mongo.collection<Scoresheet>('scoresheets').findOneAndUpdate(
    { _id: scoresheetObjectId },
    {
      $set: updateFields
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      `Failed to update scoresheet ${scoresheetId}`
    );
  }

  // Publish the update event
  const pubSub = getRedisPubSub();

  const eventPayload: ScoresheetMissionClauseUpdatedEvent = {
    scoresheetId,
    missionId,
    clauseIndex,
    clauseValue: value,
    score: points
  };

  const publishTasks = [
    pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_UPDATED, eventPayload)
  ];

  if (statusChanged) {
    publishTasks.push(
      pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_STATUS_CHANGED, {
        scoresheetId,
        status: newStatus,
        escalated: result.escalated
      })
    );
  }

  await Promise.all(publishTasks);

  return eventPayload;
};

/**
 * Validates that the provided value matches the clause type requirements
 */
function validateClauseValue(
  clause: (typeof scoresheet.missions)[number]['clauses'][number],
  value: ScoresheetClauseValue
): void {
  if (value === null) {
    return; // null is always valid to clear a value
  }

  switch (clause.type) {
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new MutationError(
          MutationErrorCode.UNAUTHORIZED,
          `Clause expects boolean value, got ${typeof value}`
        );
      }
      break;

    case 'enum':
      // Handle multi-select enums (arrays) vs single-select enums (strings)
      if (clause.multiSelect) {
        if (!Array.isArray(value)) {
          throw new MutationError(
            MutationErrorCode.UNAUTHORIZED,
            `Clause expects array value for multi-select enum, got ${typeof value}`
          );
        }
        // Validate each option in the array
        for (const option of value) {
          if (typeof option !== 'string') {
            throw new MutationError(
              MutationErrorCode.UNAUTHORIZED,
              `Multi-select enum values must be strings, got ${typeof option}`
            );
          }
          if (clause.options && !clause.options.includes(option)) {
            throw new MutationError(
              MutationErrorCode.UNAUTHORIZED,
              `Value "${option}" is not a valid option. Valid options: ${clause.options.join(', ')}`
            );
          }
        }
      } else {
        if (typeof value !== 'string') {
          throw new MutationError(
            MutationErrorCode.UNAUTHORIZED,
            `Clause expects string value, got ${typeof value}`
          );
        }
        if (clause.options && !clause.options.includes(value)) {
          throw new MutationError(
            MutationErrorCode.UNAUTHORIZED,
            `Value "${value}" is not a valid option. Valid options: ${clause.options.join(', ')}`
          );
        }
      }
      break;

    case 'number':
      if (typeof value !== 'number') {
        throw new MutationError(
          MutationErrorCode.UNAUTHORIZED,
          `Clause expects number value, got ${typeof value}`
        );
      }
      if (clause.min !== undefined && value < clause.min) {
        throw new MutationError(
          MutationErrorCode.UNAUTHORIZED,
          `Value ${value} is below minimum ${clause.min}`
        );
      }
      if (clause.max !== undefined && value > clause.max) {
        throw new MutationError(
          MutationErrorCode.UNAUTHORIZED,
          `Value ${value} is above maximum ${clause.max}`
        );
      }
      break;

    default:
      throw new MutationError(
        MutationErrorCode.UNAUTHORIZED,
        `Unknown clause type: ${clause.type}`
      );
  }
}

/**
 * Calculates the total score based on mission values
 */
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
      console.error(`Error calculating score for mission ${mission.id}`);
    }
  });

  return points;
}

/**
 * Determines the completion status of a scoresheet based on whether all missions are complete
 * and if there are no validation or calculation errors
 * Returns 'completed' only if all missions have all clauses filled AND no errors exist
 * Otherwise returns 'draft'
 */
function determineScoresheetCompletionStatus(data: Record<string, unknown>): 'draft' | 'completed' {
  const missionsData = (data['missions'] as Record<string, Record<number, unknown>>) || {};

  // Check if all missions have all their clauses filled
  const allMissionsComplete = scoresheet.missions.every(mission => {
    const missionData = missionsData[mission.id];
    if (!missionData) {
      return false; // Mission has no data
    }

    // Check if all clauses have values (not null)
    return mission.clauses.every(
      (_, index) => missionData[index] !== undefined && missionData[index] !== null
    );
  });

  if (!allMissionsComplete) {
    return 'draft';
  }

  // Check for mission calculation errors
  let hasErrors = false;

  for (const mission of scoresheet.missions) {
    const missionData = missionsData[mission.id];
    if (!missionData) continue;

    const clauseValues = mission.clauses.map(
      (_, index) => (missionData[index] ?? null) as ScoresheetClauseValue
    );
    try {
      mission.calculation(...clauseValues);
    } catch {
      // Mission calculation threw an error - scoresheet is invalid
      hasErrors = true;
      break;
    }
  }

  if (hasErrors) {
    return 'draft';
  }

  // Check for global validator errors
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
    } catch {
      // Validator threw an error - scoresheet is invalid
      hasErrors = true;
      break;
    }
  }

  return hasErrors ? 'draft' : 'completed';
}
