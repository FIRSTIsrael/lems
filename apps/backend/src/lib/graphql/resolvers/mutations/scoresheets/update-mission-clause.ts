import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { scoresheet } from '@lems/shared/scoresheet';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import { authorizeScoresheetAccess, assertScoresheetEditable } from './utils';

type MissionClauseValueOutput =
  | { type: 'boolean'; value: boolean }
  | { type: 'enum'; value: string }
  | { type: 'number'; value: number };

type ScoresheetMissionClauseUpdatedEvent = {
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  value: MissionClauseValueOutput;
  version: number;
};

type MissionClauseValueInput = {
  type: string;
  value: boolean | string | number;
};

interface UpdateScoresheetMissionClauseArgs {
  divisionId: string;
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  value: MissionClauseValueInput;
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
  const { scoresheet: scoresheetData, scoresheetObjectId } = await authorizeScoresheetAccess(
    context,
    divisionId,
    scoresheetId
  );

  const status = (scoresheetData.status as string) || 'empty';
  assertScoresheetEditable(status, context.user?.role);

  // Find the mission in the schema to validate the clause
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

  // Extract the actual value from the input
  const actualValue = value.value;

  // Validate the value based on clause type
  validateClauseValue(clause, actualValue);

  const result = await db.raw.mongo.collection('scoresheets').findOneAndUpdate(
    { _id: scoresheetObjectId },
    {
      $set: {
        [`data.missions.${missionId}.clauses.${clauseIndex}`]: {
          type: clause.type,
          value: actualValue
        }
      }
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
    value: {
      type: clause.type,
      value: actualValue
    } as MissionClauseValueOutput,
    version: -1
  };

  // TODO: Enable Redis publishing once subscribers are set up
  // pubSub.publish(divisionId, RedisEventTypes.SCORESHEET_MISSION_CLAUSE_UPDATED, eventPayload);

  return eventPayload;
};

/**
 * Validates that the provided value matches the clause type requirements
 */
function validateClauseValue(
  clause: (typeof scoresheet.missions)[number]['clauses'][number],
  value: boolean | string | number | null
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
