import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';
import {
  authorizeRubricAccess,
  assertRubricEditable,
  determineRubricCompletionStatus
} from './utils';

type RubricValueUpdatedEvent = {
  rubricId: string;
  fieldId: string;
  value: {
    value: number;
    notes?: string;
  };
  version: number;
};

interface UpdateRubricValueArgs {
  divisionId: string;
  rubricId: string;
  fieldId: string;
  value: number;
  notes?: string;
}

/**
 * Resolver for Mutation.updateRubricValue
 * Updates a single field value in a rubric
 */
export const updateRubricValueResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateRubricValueArgs,
  Promise<RubricValueUpdatedEvent>
> = async (_root, { divisionId, rubricId, fieldId, value, notes }, context) => {
  const { rubric, rubricObjectId } = await authorizeRubricAccess(context, divisionId, rubricId);

  const status = (rubric.status as string) || 'empty';
  assertRubricEditable(status, context.user?.role);

  // Validate field value is in acceptable range (1-4)
  if (!Number.isInteger(value) || value < 1 || value > 4) {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      'Field value must be an integer between 1 and 4'
    );
  }

  const fieldUpdate = {
    value,
    ...(notes !== undefined && { notes })
  };

  const result = await db.raw.mongo.collection('rubrics').findOneAndUpdate(
    { _id: rubricObjectId },
    {
      $set: {
        [`data.fields.${fieldId}`]: fieldUpdate
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Failed to update rubric ${rubricId}`);
  }

  // Determine new status based on completion criteria
  const rubricData = result.value?.data as Record<string, unknown> | undefined;
  const rubricCategory = (result.value?.category as string) || '';
  const newStatus = determineRubricCompletionStatus(rubricData, rubricCategory);

  // Update status if it has changed
  const statusChanged = newStatus !== status;
  if (statusChanged) {
    await db.raw.mongo
      .collection('rubrics')
      .updateOne({ _id: rubricObjectId }, { $set: { status: newStatus } });
  }

  // Publish the update event
  const pubSub = getRedisPubSub();
  const eventPayload = {
    rubricId,
    fieldId,
    value: fieldUpdate,
    version: -1
  };

  const publishTasks = [pubSub.publish(divisionId, RedisEventTypes.RUBRIC_UPDATED, eventPayload)];

  // Publish status change event if status changed
  if (statusChanged) {
    publishTasks.push(
      pubSub.publish(divisionId, RedisEventTypes.RUBRIC_STATUS_CHANGED, {
        rubricId,
        status: newStatus
      })
    );
  }

  await Promise.all(publishTasks);

  return eventPayload;
};
